import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { type Env } from './types'

export { ProjectRoom } from './ws/ProjectRoom'

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

app.get('/ws/:projectId', async (c) => {
  const projectId = c.req.param('projectId')
  const id = c.env.PROJECT_ROOM.idFromName(projectId)
  const room = c.env.PROJECT_ROOM.get(id)
  return room.fetch(c.req.raw)
})

// SPA fallback — serve index.html for any unmatched path so that
// client-side routes like /project/:id work on hard reload
app.get('*', async (c) => {
  if (!c.env.ASSETS) return c.notFound()
  const url = new URL(c.req.url)
  url.pathname = '/index.html'
  return c.env.ASSETS.fetch(new Request(url.toString()))
})

export default app
