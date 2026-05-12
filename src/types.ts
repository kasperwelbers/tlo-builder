export interface Env {
  DB: D1Database
  PROJECT_ROOM: DurableObjectNamespace
  ASSETS: Fetcher
  EMAIL: { send(msg: { to: string; from: string; subject: string; text?: string; html?: string }): Promise<{ messageId: string }> }
  EMAIL_FROM: string
}
