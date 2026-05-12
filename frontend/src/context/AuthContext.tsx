import React, { createContext, useContext, useEffect, useState } from 'react'

export interface AuthUser {
  userId: string
  email: string
  isServerAdmin: boolean
}

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' }

const AuthContext = createContext<AuthState>({ status: 'loading' })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    fetch('/api/me')
      .then(r => {
        if (r.ok) return r.json() as Promise<AuthUser>
        throw new Error('Unauthenticated')
      })
      .then(user => setState({ status: 'authenticated', user }))
      .catch(() => setState({ status: 'unauthenticated' }))
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
