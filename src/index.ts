import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { sendOtp, verifyOtp } from './auth/otp'
import { createSession, getSession, deleteSession } from './auth/session'
import { isServerAdmin, canAccessProject } from './auth/permissions'
import type { Env } from './types'

export { ProjectRoom } from './ws/ProjectRoom'

const app = new Hono<{ Bindings: Env }>()

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

async function requireSession(c: any) {
  const sessionId = getCookie(c, 'session_id')
  if (!sessionId) return null
  return getSession(sessionId, c.env)
}

const SESSION_COOKIE = {
  httpOnly: true,
  secure: true,
  sameSite: 'Lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

// ---------------------------------------------------------------------------
// POST /api/auth/send-code — step 1: email the OTP
// ---------------------------------------------------------------------------
app.post('/api/auth/send-code', async (c) => {
  const body = await c.req.json<{ email?: string }>()
  const email = body.email?.toLowerCase().trim()
  if (!email || !email.includes('@')) return c.json({ error: 'Valid email required' }, 400)

  try {
    await sendOtp(email, c.env)
    return c.json({ ok: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'RATE_LIMITED')
      return c.json({ error: 'A code was already sent — check your email or wait a few minutes.' }, 429)
    console.error('[Auth] Failed to send OTP:', err)
    return c.json({ error: 'Failed to send code' }, 500)
  }
})

// ---------------------------------------------------------------------------
// POST /api/auth/verify-code — step 2: check OTP, issue session cookie
// ---------------------------------------------------------------------------
app.post('/api/auth/verify-code', async (c) => {
  const body = await c.req.json<{ email?: string; code?: string }>()
  const email = body.email?.toLowerCase().trim()
  const code = body.code?.trim()
  if (!email || !code) return c.json({ error: 'Email and code required' }, 400)

  const valid = await verifyOtp(email, code, c.env)
  if (!valid) return c.json({ error: 'Invalid or expired code' }, 401)

  // Find or create user
  let row = await c.env.DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string }>()

  if (!row) {
    const userId = crypto.randomUUID()
    await c.env.DB
      .prepare('INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)')
      .bind(userId, email, Date.now())
      .run()
    row = { id: userId }
  }

  const { n } = (await c.env.DB
    .prepare("SELECT COUNT(*) as n FROM user_roles WHERE project_id = '' AND role = 'admin'")
    .first<{ n: number }>()) ?? { n: 0 }
  if (n === 0) {
    await c.env.DB
      .prepare("INSERT OR IGNORE INTO user_roles (user_id, role, project_id) VALUES (?, 'admin', '')")
      .bind(row.id)
      .run()
  }

  const sessionId = await createSession(row.id, c.env)
  setCookie(c, 'session_id', sessionId, SESSION_COOKIE)
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
app.post('/api/auth/logout', async (c) => {
  const sessionId = getCookie(c, 'session_id')
  if (sessionId) await deleteSession(sessionId, c.env)
  deleteCookie(c, 'session_id', { path: '/' })
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// GET /api/me — return the current user or 401
// ---------------------------------------------------------------------------
app.get('/api/me', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const admin = await isServerAdmin(user.userId, c.env)
  return c.json({ ...user, isServerAdmin: admin })
})

// ---------------------------------------------------------------------------
// POST /api/ws-ticket — one-time WebSocket ticket (30 s)
// ---------------------------------------------------------------------------
app.post('/api/ws-ticket', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const body = await c.req.json<{ projectId?: string }>()
  const projectId = body.projectId
  if (!projectId) return c.json({ error: 'projectId required' }, 400)
  const allowed = await canAccessProject(user.userId, projectId, c.env)
  if (!allowed) return c.json({ error: 'Forbidden' }, 403)
  const ticket = crypto.randomUUID()
  const expiresAt = Date.now() + 30_000
  await c.env.DB
    .prepare('INSERT INTO ws_tickets (ticket, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(ticket, user.userId, expiresAt)
    .run()
  return c.json({ ticket })
})

// ---------------------------------------------------------------------------
// POST /api/projects — create a project (server admin only)
// ---------------------------------------------------------------------------
app.post('/api/projects', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  if (!await isServerAdmin(user.userId, c.env)) return c.json({ error: 'Forbidden' }, 403)
  const { name } = await c.req.json<{ name?: string }>()
  if (!name?.trim()) return c.json({ error: 'Project name required' }, 400)
  const id = crypto.randomUUID()
  await c.env.DB
    .prepare('INSERT INTO projects (id, name, created_at) VALUES (?, ?, ?)')
    .bind(id, name.trim(), Date.now())
    .run()
  // Grant creator project admin
  await c.env.DB
    .prepare("INSERT OR IGNORE INTO user_roles (user_id, role, project_id) VALUES (?, 'admin', ?)")
    .bind(user.userId, id)
    .run()
  return c.json({ id, name: name.trim() })
})

// ---------------------------------------------------------------------------
// PATCH /api/projects/:id — rename a project (project admin or server admin)
app.patch('/api/projects/:id', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const projectId = c.req.param('id')
  if (!await canAccessProject(user.userId, projectId, c.env)) return c.json({ error: 'Forbidden' }, 403)
  const body = await c.req.json<{ name?: string }>()
  const name = body.name?.trim()
  if (!name) return c.json({ error: 'Name required' }, 400)
  await c.env.DB.prepare('UPDATE projects SET name = ? WHERE id = ?').bind(name, projectId).run()
  return c.json({ ok: true })
})

// GET /api/projects — list projects accessible to the user
// ---------------------------------------------------------------------------
app.get('/api/projects', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const admin = await isServerAdmin(user.userId, c.env)
  let rows: { id: string; name: string; created_at: number }[]
  if (admin) {
    // Server admins see all projects
    rows = await c.env.DB
      .prepare('SELECT id, name, created_at FROM projects ORDER BY created_at DESC')
      .all<{ id: string; name: string; created_at: number }>()
      .then(r => r.results)
  } else {
    rows = await c.env.DB
      .prepare(`
        SELECT p.id, p.name, p.created_at
        FROM projects p
        JOIN user_roles ur ON ur.project_id = p.id
        WHERE ur.user_id = ? AND ur.role = 'admin'
        ORDER BY p.created_at DESC
      `)
      .bind(user.userId)
      .all<{ id: string; name: string; created_at: number }>()
      .then(r => r.results)
  }
  return c.json(rows)
})

// ---------------------------------------------------------------------------
// GET /api/projects/:id/members — list project members
// ---------------------------------------------------------------------------
app.get('/api/projects/:id/members', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const projectId = c.req.param('id')
  if (!await canAccessProject(user.userId, projectId, c.env)) return c.json({ error: 'Forbidden' }, 403)
  const rows = await c.env.DB
    .prepare(`
      SELECT u.id as user_id, u.email, ur.role
      FROM user_roles ur
      JOIN users u ON u.id = ur.user_id
      WHERE ur.project_id = ?
    `)
    .bind(projectId)
    .all<{ user_id: string; email: string; role: string }>()
    .then(r => r.results)
  return c.json(rows)
})

// ---------------------------------------------------------------------------
// POST /api/projects/:id/members — add a user by email
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/members', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const projectId = c.req.param('id')
  if (!await canAccessProject(user.userId, projectId, c.env)) return c.json({ error: 'Forbidden' }, 403)
  const { email } = await c.req.json<{ email?: string }>()
  if (!email?.trim()) return c.json({ error: 'Email required' }, 400)
  const target = await c.env.DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first<{ id: string }>()
  if (!target) return c.json({ error: 'No user with that email' }, 404)
  await c.env.DB
    .prepare("INSERT OR IGNORE INTO user_roles (user_id, role, project_id) VALUES (?, 'admin', ?)")
    .bind(target.id, projectId)
    .run()
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// DELETE /api/projects/:id/members/:userId — remove a user from project
// ---------------------------------------------------------------------------
app.delete('/api/projects/:id/members/:userId', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const projectId = c.req.param('id')
  if (!await canAccessProject(user.userId, projectId, c.env)) return c.json({ error: 'Forbidden' }, 403)
  const targetId = c.req.param('userId')
  await c.env.DB
    .prepare("DELETE FROM user_roles WHERE user_id = ? AND project_id = ? AND role = 'admin'")
    .bind(targetId, projectId)
    .run()
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// GET /api/admin/users — list all users with server role status (server admin only)
// ---------------------------------------------------------------------------
app.get('/api/admin/users', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  if (!await isServerAdmin(user.userId, c.env)) return c.json({ error: 'Forbidden' }, 403)
  const rows = await c.env.DB
    .prepare(`
      SELECT u.id, u.email,
        EXISTS(
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = u.id AND ur.role = 'admin' AND ur.project_id = ''
        ) as is_server_admin
      FROM users u
      ORDER BY u.created_at ASC
    `)
    .all<{ id: string; email: string; is_server_admin: number }>()
    .then(r => r.results)
  return c.json(rows.map(r => ({ ...r, is_server_admin: !!r.is_server_admin })))
})

// ---------------------------------------------------------------------------
// POST /api/admin/server-roles — grant server admin to a user by email
// ---------------------------------------------------------------------------
app.post('/api/admin/server-roles', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  if (!await isServerAdmin(user.userId, c.env)) return c.json({ error: 'Forbidden' }, 403)
  const { email } = await c.req.json<{ email?: string }>()
  if (!email?.trim()) return c.json({ error: 'Email required' }, 400)
  const target = await c.env.DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first<{ id: string }>()
  if (!target) return c.json({ error: 'No user with that email' }, 404)
  await c.env.DB
    .prepare("INSERT OR IGNORE INTO user_roles (user_id, role, project_id) VALUES (?, 'admin', '')")
    .bind(target.id)
    .run()
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// DELETE /api/admin/server-roles/:userId — revoke server admin
// ---------------------------------------------------------------------------
app.delete('/api/admin/server-roles/:userId', async (c) => {
  const user = await requireSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  if (!await isServerAdmin(user.userId, c.env)) return c.json({ error: 'Forbidden' }, 403)
  const targetId = c.req.param('userId')
  if (targetId === user.userId) return c.json({ error: "You can't remove your own admin" }, 400)
  await c.env.DB
    .prepare("DELETE FROM user_roles WHERE user_id = ? AND role = 'admin' AND project_id = ''")
    .bind(targetId)
    .run()
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// GET /ws/:projectId — verify one-time ticket, upgrade to Durable Object
// ---------------------------------------------------------------------------
app.get('/ws/:projectId', async (c) => {
  const ticket = c.req.query('ticket')
  if (!ticket) return c.text('Missing ticket', 401)

  const row = await c.env.DB
    .prepare('SELECT user_id, expires_at FROM ws_tickets WHERE ticket = ?')
    .bind(ticket)
    .first<{ user_id: string; expires_at: number }>()

  // Always delete (one-time use)
  await c.env.DB.prepare('DELETE FROM ws_tickets WHERE ticket = ?').bind(ticket).run()

  if (!row || row.expires_at < Date.now()) {
    return c.text('Invalid or expired ticket', 401)
  }

  const projectId = c.req.param('projectId')
  const id = c.env.PROJECT_ROOM.idFromName(projectId)
  const room = c.env.PROJECT_ROOM.get(id)
  return room.fetch(c.req.raw)
})

// ---------------------------------------------------------------------------
// SPA fallback — serve index.html for everything else
// ---------------------------------------------------------------------------
app.get('*', async (c) => {
  if (!c.env.ASSETS) return c.notFound()
  const url = new URL(c.req.url)
  url.pathname = '/index.html'
  return c.env.ASSETS.fetch(new Request(url.toString()))
})

export default app
