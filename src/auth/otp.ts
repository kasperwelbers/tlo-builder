import type { Env } from '../types'

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function sendOtp(email: string, env: Env): Promise<void> {
  // Rate limit: only one outstanding code at a time
  const existing = await env.DB
    .prepare('SELECT expires_at FROM otp_codes WHERE email = ?')
    .bind(email)
    .first<{ expires_at: number }>()
  if (existing && existing.expires_at > Date.now()) {
    throw new Error('RATE_LIMITED')
  }

  const code = generateCode()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  // Clean up any expired leftover before inserting
  await env.DB.prepare('DELETE FROM otp_codes WHERE email = ?').bind(email).run()
  await env.DB
    .prepare('INSERT INTO otp_codes (email, code, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(email, code, expiresAt, Date.now())
    .run()

  // Always log for local dev convenience (wrangler dev prints this to the console)
  console.log(`\n${'='.repeat(50)}\n  LOGIN CODE for ${email}: ${code}\n${'='.repeat(50)}\n`)

  await env.EMAIL.send({
    to: email,
    from: env.EMAIL_FROM,
    subject: 'Your TLO Builder login code',
    text: `Your login code is: ${code}\n\nThis code expires in 10 minutes. Do not share it.`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px">TLO Builder</h2>
        <p style="margin:0 0 8px;color:#555">Your login code:</p>
        <p style="font-size:40px;font-weight:700;letter-spacing:10px;font-family:monospace;margin:0 0 16px">${code}</p>
        <p style="font-size:13px;color:#888">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}

const MAX_ATTEMPTS = 5

export async function verifyOtp(email: string, code: string, env: Env): Promise<boolean> {
  const row = await env.DB
    .prepare('SELECT code, expires_at, attempts FROM otp_codes WHERE email = ?')
    .bind(email)
    .first<{ code: string; expires_at: number; attempts: number }>()

  if (!row) return false

  if (row.expires_at < Date.now()) {
    await env.DB.prepare('DELETE FROM otp_codes WHERE email = ?').bind(email).run()
    return false
  }

  // Too many wrong guesses — kill the code regardless of what they submitted
  if (row.attempts >= MAX_ATTEMPTS) {
    await env.DB.prepare('DELETE FROM otp_codes WHERE email = ?').bind(email).run()
    return false
  }

  if (row.code !== code) {
    // Increment the attempt counter
    await env.DB
      .prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE email = ?')
      .bind(email)
      .run()
    return false
  }

  // Valid — delete it (one-time use)
  await env.DB.prepare('DELETE FROM otp_codes WHERE email = ?').bind(email).run()
  return true
}
