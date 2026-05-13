import { useEffect, useRef, useState, useCallback } from "react"
import type { AppState } from "@/lib/types"

const INITIAL_STATE: AppState = {
  trajectories: [],
  tlos: [],
  ilos: [],
  currentIlos: [],
  iloCurrentIloMappings: [],
  courses: [],
  comments: [],
}

async function fetchTicket(projectId: string): Promise<string | null> {
  try {
    const res = await fetch("/api/ws-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    })
    if (res.status === 401) {
      window.location.reload()
      return null
    }
    if (!res.ok) return null
    const { ticket } = (await res.json()) as { ticket: string }
    return ticket
  } catch {
    return null
  }
}

export function useWebSocket(projectId: string) {
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  const [connected, setConnected] = useState(false)
  const [ready, setReady] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const mountedRef = useRef(true)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const send = useCallback(
    (data: object) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ ...data, projectId }))
      }
    },
    [projectId]
  )

  useEffect(() => {
    mountedRef.current = true

    async function connect() {
      if (!mountedRef.current) return

      const ticket = await fetchTicket(projectId)
      if (!ticket || !mountedRef.current) return

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const ws = new WebSocket(
        `${protocol}//${window.location.host}/ws/${projectId}?ticket=${ticket}`
      )
      wsRef.current = ws

      ws.onopen = () => {
        if (mountedRef.current) setConnected(true)
      }

      ws.onmessage = (event: MessageEvent) => {
        if (!mountedRef.current) return
        try {
          const msg = JSON.parse(event.data as string) as {
            type: string
            data?: unknown
            message?: string
          }
          switch (msg.type) {
            case "sync:all": {
              const d = msg.data as AppState
              setState({
                trajectories: d.trajectories ?? [],
                tlos: d.tlos ?? [],
                ilos: d.ilos ?? [],
                currentIlos: d.currentIlos ?? [],
                iloCurrentIloMappings: d.iloCurrentIloMappings ?? [],
                courses: d.courses ?? [],
                comments: d.comments ?? [],
              })
              setReady(true)
              break
            }
            case "sync:trajectories":
              setState((s) => ({
                ...s,
                trajectories: msg.data as AppState["trajectories"],
              }))
              break
            case "sync:tlos":
              setState((s) => ({ ...s, tlos: msg.data as AppState["tlos"] }))
              break
            case "sync:ilos":
              setState((s) => ({ ...s, ilos: msg.data as AppState["ilos"] }))
              break
            case "sync:current_ilos":
              setState((s) => ({
                ...s,
                currentIlos: msg.data as AppState["currentIlos"],
              }))
              break
            case "sync:ilo_current_ilo_mappings":
              setState((s) => ({
                ...s,
                iloCurrentIloMappings:
                  msg.data as AppState["iloCurrentIloMappings"],
              }))
              break
            case "sync:courses":
              setState((s) => ({
                ...s,
                courses: msg.data as AppState["courses"],
              }))
              break
            case "sync:comments":
              setState((s) => ({
                ...s,
                comments: msg.data as AppState["comments"],
              }))
              break
            case "sync:error":
              console.error("Server error:", msg.message)
              break
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message", e)
        }
      }

      ws.onclose = () => {
        if (!mountedRef.current) return
        setConnected(false)
        setReady(false)
        reconnectTimer.current = setTimeout(() => {
          if (mountedRef.current) connect()
        }, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      mountedRef.current = false
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  }, [projectId])

  return { state, connected, ready, send }
}
