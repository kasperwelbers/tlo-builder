import { DurableObject } from "cloudflare:workers"
import { type Env } from "../types"
import { getDb } from "../db"
import { eq } from "drizzle-orm"
import {
  projects,
  trajectories,
  tlos,
  ilos,
  currentIlos,
  iloCurrentIloMappings,
  courses,
  tloIloMappings,
  comments,
  users,
} from "../db/schema"
import { handleMessage, type SyncTable } from "./handlers"

export class ProjectRoom extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // WebSocket upgrade
    const upgradeHeader = request.headers.get("Upgrade")
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 })
    }

    const projectId = url.pathname.replace("/ws/", "")
    const { 0: client, 1: server } = new WebSocketPair()

    // Tag the socket with the projectId for per-project filtering
    const userId = request.headers.get("X-User-Id") ?? ""
    this.ctx.acceptWebSocket(server, [projectId, userId])

    // Send full state immediately on connect
    const state = await this.getFullState(projectId)
    server.send(JSON.stringify({ type: "sync:all", data: state }))

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer
  ): Promise<void> {
    const tags = this.ctx.getTags(ws)
    const projectId = tags[0]
    const userId = tags[1] ?? ""
    if (!projectId) return

    try {
      const data = JSON.parse(
        typeof message === "string"
          ? message
          : new TextDecoder().decode(message)
      )
      data.projectId = projectId
      data.userId = userId

      const db = getDb(this.env.DB)
      const affectedTables = await handleMessage(db, data)

      // Broadcast only the tables that changed
      for (const table of affectedTables) {
        await this.broadcastTable(projectId, table)
      }
    } catch (error: any) {
      try {
        ws.send(
          JSON.stringify({
            type: "sync:error",
            message: error?.message ?? "Unknown error",
          })
        )
      } catch (e) {}
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string
  ): Promise<void> {
    try {
      ws.close(code, reason)
    } catch (e) {}
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    console.error("WebSocket error:", error)
  }

  // -- Private helpers --------------------------------------------------------

  private async broadcastTable(
    projectId: string,
    table: SyncTable
  ): Promise<void> {
    const db = getDb(this.env.DB)
    const data = await this.getTableData(db, projectId, table)
    const message = JSON.stringify({ type: `sync:${table}`, data })
    for (const ws of this.ctx.getWebSockets(projectId)) {
      try {
        ws.send(message)
      } catch {}
    }
  }

  private async getTableData(
    db: ReturnType<typeof getDb>,
    projectId: string,
    table: SyncTable
  ) {
    switch (table) {
      case "trajectories":
        return db
          .select()
          .from(trajectories)
          .where(eq(trajectories.projectId, projectId))
      case "courses":
        return db.select().from(courses).where(eq(courses.projectId, projectId))
      case "tlos":
        return db.select().from(tlos).where(eq(tlos.projectId, projectId))
      case "ilos":
        return db
          .select({
            id: ilos.id,
            projectId: ilos.projectId,
            description: ilos.description,
            bloomLevel: ilos.bloomLevel,
            tloId: tloIloMappings.tloId,
          })
          .from(ilos)
          .leftJoin(tloIloMappings, eq(tloIloMappings.iloId, ilos.id))
          .where(eq(ilos.projectId, projectId))
      case "current_ilos":
        return db
          .select()
          .from(currentIlos)
          .where(eq(currentIlos.projectId, projectId))
      case "ilo_current_ilo_mappings":
        return db
          .select()
          .from(iloCurrentIloMappings)
          .where(eq(iloCurrentIloMappings.projectId, projectId))
      case "comments":
        return db
          .select()
          .from(comments)
          .where(eq(comments.projectId, projectId))
    }
  }

  private async getFullState(projectId: string) {
    const db = getDb(this.env.DB)

    // Ensure the project row exists
    await db
      .insert(projects)
      .values({ id: projectId, name: "Untitled Project" })
      .onConflictDoNothing()

    const [
      allTrajectories,
      allCourses,
      allTlos,
      allIlos,
      allCurrentIlos,
      allIloCurrentIloMappings,
      allComments,
    ] = await Promise.all([
      db
        .select()
        .from(trajectories)
        .where(eq(trajectories.projectId, projectId)),
      db.select().from(courses).where(eq(courses.projectId, projectId)),
      db.select().from(tlos).where(eq(tlos.projectId, projectId)),
      db
        .select({
          id: ilos.id,
          projectId: ilos.projectId,
          description: ilos.description,
          bloomLevel: ilos.bloomLevel,
          tloId: tloIloMappings.tloId,
        })
        .from(ilos)
        .leftJoin(tloIloMappings, eq(tloIloMappings.iloId, ilos.id))
        .where(eq(ilos.projectId, projectId)),
      db.select().from(currentIlos).where(eq(currentIlos.projectId, projectId)),
      db
        .select()
        .from(iloCurrentIloMappings)
        .where(eq(iloCurrentIloMappings.projectId, projectId)),
      db.select().from(comments).where(eq(comments.projectId, projectId)),
    ])

    return {
      trajectories: allTrajectories,
      courses: allCourses,
      tlos: allTlos,
      ilos: allIlos,
      currentIlos: allCurrentIlos,
      iloCurrentIloMappings: allIloCurrentIloMappings,
      comments: allComments,
    }
  }
}
