import type { Env } from '../types'

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function createSession(userId: string, env: Env): Promise<string> {
  const id = crypto.randomUUID()
  const expiresAt = Date.now() + SESSION_DURATION_MS
  await env.DB
    .prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(id, userId, expiresAt, Date.now())
    .run()
  return id
}

export async function getSession(
  sessionId: string,
  env: Env,
): Promise<{ userId: string; email: string } | null> {
  const row = await env.DB
    .prepare(`
      SELECT s.user_id, u.email, s.expires_at
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
    `)
    .bind(sessionId)
    .first<{ user_id: string; email: string; expires_at: number }>()

  if (!row) return null
  if (row.expires_at < Date.now()) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
    return null
  }
  return { userId: row.user_id, email: row.email }
}

export async function deleteSession(sessionId: string, env: Env): Promise<void> {
  await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
}
