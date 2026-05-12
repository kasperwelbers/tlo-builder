import type { Env } from '../types'

export async function isServerAdmin(userId: string, env: Env): Promise<boolean> {
  const row = await env.DB
    .prepare("SELECT 1 FROM user_roles WHERE user_id = ? AND role = 'admin' AND project_id = ''")
    .bind(userId)
    .first()
  return !!row
}

// Server admins can access ALL projects
export async function canAccessProject(userId: string, projectId: string, env: Env): Promise<boolean> {
  const row = await env.DB
    .prepare(`
      SELECT 1 FROM user_roles
      WHERE user_id = ? AND role = 'admin'
        AND (project_id = ? OR project_id = '')
    `)
    .bind(userId, projectId)
    .first()
  return !!row
}
