import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createBunWebSocket } from 'hono/bun'
import { db } from './db'
import { handleMessage } from './ws/handlers'
import { eq } from 'drizzle-orm'
import { projects, trajectories, courses } from './db/schema'

const { upgradeWebSocket, websocket } = createBunWebSocket()

const app = new Hono()

app.use('*', cors())

// Healthcheck endpoint
app.get('/', (c) => c.text('LTO Builder API - WebSocket Mode Active'))

// In-memory client tracker for WebSockets by projectId
const projectClients = new Map<string, Set<any>>()

// Helper to fetch the entire state of the application
async function getFullState(projectId: string) {
  // Ensure the project exists
  await db.insert(projects).values({ id: projectId, name: 'Untitled Project' }).onConflictDoNothing()

  const [allTrajectories, allCourses, allMappings] = await Promise.all([
    db.query.trajectories.findMany({
      where: eq(trajectories.projectId, projectId),
      with: {
        ltos: true
      }
    }),
    db.query.courses.findMany({
      where: eq(courses.projectId, projectId),
      with: {
        ilos: true
      }
    }),
    db.query.mappings.findMany()
  ])

  return {
    trajectories: allTrajectories,
    courses: allCourses,
    mappings: allMappings
  }
}

// Helper to broadcast the current state to all connected clients
async function broadcastState(projectId: string) {
  const state = await getFullState(projectId)
  const message = JSON.stringify({ type: 'sync', data: state })

  const clients = projectClients.get(projectId) || new Set()
  for (const client of clients) {
    client.send(message)
  }
}

app.get(
  '/ws/:projectId',
  upgradeWebSocket((c) => {
    const projectId = c.req.param('projectId') as string
    return {
      async onOpen(evt, ws) {
        if (!projectClients.has(projectId)) {
          projectClients.set(projectId, new Set())
        }
        projectClients.get(projectId)!.add(ws)
        console.log(`Client connected to project ${projectId}`)

        // Push initial state immediately upon connection
        const state = await getFullState(projectId)
        ws.send(JSON.stringify({ type: 'sync', data: state }))
      },
      async onMessage(evt, ws) {
        try {
          const data = JSON.parse(evt.data.toString())
          // Inject projectId into the mutation payload
          data.projectId = projectId

          // Route the mutation to the appropriate handler
          await handleMessage(data)

          // Broadcast full updated state to all clients in this project
          await broadcastState(projectId)
        } catch (error: any) {
          console.error('WebSocket message error:', error)
          ws.send(JSON.stringify({ type: 'error', message: error?.message || 'Unknown error' }))
        }
      },
      onClose(evt, ws) {
        const clients = projectClients.get(projectId)
        if (clients) {
          clients.delete(ws)
          if (clients.size === 0) projectClients.delete(projectId)
        }
        console.log(`Client disconnected from project ${projectId}`)
      },
      onError(evt, ws) {
        const clients = projectClients.get(projectId)
        if (clients) {
          clients.delete(ws)
          if (clients.size === 0) projectClients.delete(projectId)
        }
        console.error('WebSocket error:', evt)
      }
    }
  })
)

const port = 8787;
console.log(`Server is running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
  websocket
}
