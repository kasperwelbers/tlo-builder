import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export interface AuthUser {
  userId: string
  email: string
  isServerAdmin: boolean
}

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' }
  | { status: 'error' }

type AuthContextValue = AuthState & { retry: () => void }

const AuthContext = createContext<AuthContextValue>({ status: 'loading', retry: () => {} })

// Delays between automatic retries before showing the error page
const AUTO_RETRY_DELAYS = [500, 1500]

type MeResult =
  | { kind: 'ok'; user: AuthUser }
  | { kind: 'unauthorized' }
  | { kind: 'error' }

async function fetchMe(): Promise<MeResult> {
  try {
    const r = await fetch('/api/me')
    if (r.status === 401) return { kind: 'unauthorized' }
    if (!r.ok) return { kind: 'error' }
    return { kind: 'ok', user: (await r.json()) as AuthUser }
  } catch {
    return { kind: 'error' }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      for (let i = 0; ; i++) {
        const result = await fetchMe()
        if (cancelled) return
        if (result.kind === 'ok') return setState({ status: 'authenticated', user: result.user })
        if (result.kind === 'unauthorized') return setState({ status: 'unauthenticated' })
        if (i >= AUTO_RETRY_DELAYS.length) return setState({ status: 'error' })
        await new Promise(r => setTimeout(r, AUTO_RETRY_DELAYS[i]))
        if (cancelled) return
      }
    }
    load()
    return () => { cancelled = true }
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt(a => a + 1)
  }, [])

  return <AuthContext.Provider value={{ ...state, retry }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
