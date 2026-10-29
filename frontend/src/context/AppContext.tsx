import React, { createContext, useContext } from 'react'
import { useWebSocket, type WsAccess } from '@/hooks/useWebSocket'
import type { AppState } from '@/lib/types'

interface AppContextValue {
  state: AppState
  connected: boolean
  ready: boolean
  connectionError: boolean
  authLost: boolean
  accessDenied: boolean
  readOnly: boolean
  send: (data: object) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({
  access,
  children,
}: {
  access: WsAccess
  children: React.ReactNode
}) {
  const ws = useWebSocket(access)

  return (
    <AppContext.Provider value={{ ...ws, readOnly: 'shareToken' in access }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useReadOnly(): boolean {
  return useContext(AppContext)?.readOnly ?? false
}
