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
  exitQualifications: [],
}

/** Either a logged-in user's project, or a public read-only share link. */
export type WsAccess = { projectId: string } | { shareToken: string }

type TicketResult =
  | { kind: "ok"; ticket: string; projectId: string }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "error" }

async function fetchTicket(access: WsAccess): Promise<TicketResult> {
  try {
    const res = await fetch("/api/ws-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(access),
    })
    // 401: session gone; 403/404: no access or share link revoked
    if (res.status === 401) return { kind: "unauthorized" }
    if (res.status === 403 || res.status === 404) return { kind: "forbidden" }
    if (!res.ok) return { kind: "error" }
    const { ticket, projectId } = (await res.json()) as {
      ticket: string
      projectId: string
    }
    return { kind: "ok", ticket, projectId }
  } catch {
    return { kind: "error" }
  }
}

// After this many consecutive failed attempts, surface a connection error
const FAILURES_BEFORE_ERROR = 2
const MAX_BACKOFF_MS = 30_000

export function useWebSocket(access: WsAccess) {
  const accessKey =
    "shareToken" in access ? `share:${access.shareToken}` : access.projectId
  const readOnly = "shareToken" in access
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  const [connected, setConnected] = useState(false)
  const [ready, setReady] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [authLost, setAuthLost] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const mountedRef = useRef(true)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const projectIdRef = useRef<string>("")

  const send = useCallback(
    (data: object) => {
      if (readOnly) return
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ ...data, projectId: projectIdRef.current })
        )
      }
    },
    [readOnly]
  )

  useEffect(() => {
    mountedRef.current = true
    let failures = 0
    // Restore the access object from the key so the effect only depends on it
    const currentAccess: WsAccess = accessKey.startsWith("share:")
      ? { shareToken: accessKey.slice("share:".length) }
      : { projectId: accessKey }

    function scheduleReconnect() {
      if (!mountedRef.current) return
      failures++
      if (failures >= FAILURES_BEFORE_ERROR) setConnectionError(true)
      const delay = Math.min(3000 * 2 ** (failures - 1), MAX_BACKOFF_MS)
      reconnectTimer.current = setTimeout(() => {
        if (mountedRef.current) connect()
      }, delay)
    }

    async function connect() {
      if (!mountedRef.current) return

      const result = await fetchTicket(currentAccess)
      if (!mountedRef.current) return
      if (result.kind === "unauthorized") {
        setAuthLost(true)
        return
      }
      if (result.kind === "forbidden") {
        setAccessDenied(true)
        return
      }
      if (result.kind === "error") {
        scheduleReconnect()
        return
      }
      projectIdRef.current = result.projectId

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const ws = new WebSocket(
        `${protocol}//${window.location.host}/ws/${result.projectId}?ticket=${result.ticket}`
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
                exitQualifications: d.exitQualifications ?? [],
              })
              setReady(true)
              setConnectionError(false)
              failures = 0
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
            case "sync:exit_qualifications":
              setState((s) => ({
                ...s,
                exitQualifications: msg.data as AppState["exitQualifications"],
              }))
              break
            case "sync:revoked":
              // Share link was regenerated or turned off
              ws.onclose = null
              ws.close()
              setConnected(false)
              setAccessDenied(true)
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
        scheduleReconnect()
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
  }, [accessKey])

  return {
    state,
    connected,
    ready,
    connectionError,
    authLost,
    accessDenied,
    send,
  }
}
