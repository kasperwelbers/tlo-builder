import { DurableObject } from 'cloudflare:workers'
import { type Env } from '../types'
import { getDb } from '../db'
import { eq } from 'drizzle-orm'
import { projects, trajectories, tlos, ilos, courseObjectives, tloIloMappings, iloCourseObjectiveMappings, courses } from '../db/schema'
import { handleMessage, type SyncTable } from './handlers'

export class ProjectRoom extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade')
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    const projectId = url.pathname.replace('/ws/', '')
    const { 0: client, 1: server } = new WebSocketPair()

    // Tag the socket with the projectId for per-project filtering
    this.ctx.acceptWebSocket(server, [projectId])

    // Send full state immediately on connect
    const state = await this.getFullState(projectId)
    server.send(JSON.stringify({ type: 'sync:all', data: state }))

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const [projectId] = this.ctx.getTags(ws)
    if (!projectId) return

    try {
      const data = JSON.parse(typeof message === 'string' ? message : new TextDecoder().decode(message))
      data.projectId = projectId

      const db = getDb(this.env.DB)
      const affectedTables = await handleMessage(db, data)

      // Broadcast only the tables that changed
      for (const table of affectedTables) {
        await this.broadcastTable(projectId, table)
      }
    } catch (error: any) {
      ws.send(JSON.stringify({ type: 'error', message: error?.message ?? 'Unknown error' }))
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    ws.close(code, reason)
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    console.error('WebSocket error:', error)
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async broadcastTable(projectId: string, table: SyncTable): Promise<void> {
    const db = getDb(this.env.DB)
    const data = await this.getTableData(db, projectId, table)
    const message = JSON.stringify({ type: `sync:${table}`, data })
    for (const ws of this.ctx.getWebSockets(projectId)) {
      try { ws.send(message) } catch {}
    }
  }

  private async getTableData(db: ReturnType<typeof getDb>, projectId: string, table: SyncTable) {
    switch (table) {
      case 'trajectories':
        return db.select().from(trajectories).where(eq(trajectories.projectId, projectId))
      case 'courses':
        return db.select().from(courses).where(eq(courses.projectId, projectId))
      case 'tlos':
        return db.select().from(tlos).where(eq(tlos.projectId, projectId))
      case 'ilos':
        return db.select().from(ilos).where(eq(ilos.projectId, projectId))
      case 'course_objectives':
        return db.select().from(courseObjectives).where(eq(courseObjectives.projectId, projectId))
      case 'tlo_ilo_mappings':
        return db.select().from(tloIloMappings).where(eq(tloIloMappings.projectId, projectId))
      case 'ilo_course_objective_mappings':
        return db.select().from(iloCourseObjectiveMappings).where(eq(iloCourseObjectiveMappings.projectId, projectId))
    }
  }

  private async getFullState(projectId: string) {
    const db = getDb(this.env.DB)

    // Ensure the project row exists
    await db.insert(projects).values({ id: projectId, name: 'Untitled Project' }).onConflictDoNothing()

    const [allTrajectories, allCourses, allTlos, allIlos, allCourseObjectives, allTloIloMappings, allIloCourseObjectiveMappings] = await Promise.all([
      db.select().from(trajectories).where(eq(trajectories.projectId, projectId)),
      db.select().from(courses).where(eq(courses.projectId, projectId)),
      db.select().from(tlos).where(eq(tlos.projectId, projectId)),
      db.select().from(ilos).where(eq(ilos.projectId, projectId)),
      db.select().from(courseObjectives).where(eq(courseObjectives.projectId, projectId)),
      db.select().from(tloIloMappings).where(eq(tloIloMappings.projectId, projectId)),
      db.select().from(iloCourseObjectiveMappings).where(eq(iloCourseObjectiveMappings.projectId, projectId)),
    ])

    return {
      trajectories:                allTrajectories,
      courses:                     allCourses,
      tlos:                        allTlos,
      ilos:                        allIlos,
      courseObjectives:            allCourseObjectives,
      tloIloMappings:              allTloIloMappings,
      iloCourseObjectiveMappings:  allIloCourseObjectiveMappings,
    }
  }
}
