import React, { createContext, useContext } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { AppState } from '@/lib/types'

interface AppContextValue {
  state: AppState
  connected: boolean
  ready: boolean
  send: (data: object) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({
  projectId,
  children,
}: {
  projectId: string
  children: React.ReactNode
}) {
  const { state, connected, ready, send } = useWebSocket(projectId)

  return (
    <AppContext.Provider value={{ state, connected, ready, send }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
