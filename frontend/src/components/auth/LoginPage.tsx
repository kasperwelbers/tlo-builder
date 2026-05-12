import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Step = 'email' | 'code'

export function LoginPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed to send code')
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Invalid or expired code')
      // Session cookie is now set — reload so AuthContext re-checks /api/me
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col gap-6 w-full max-w-sm px-6">

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">TLO Builder</h1>
          <p className="text-sm text-muted-foreground">
            {step === 'email'
              ? "Enter your email to receive a sign-in code."
              : <>We sent a 6-digit code to <strong>{email}</strong>.</>}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? 'Verifying…' : 'Sign in'}
            </Button>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              onClick={() => { setStep('email'); setCode(''); setError(null) }}
            >
              Use a different email
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
