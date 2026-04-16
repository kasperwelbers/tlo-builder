import { useEffect, useRef, useState, useCallback } from "react"
import type { AppState } from "@/lib/types"

const INITIAL_STATE: AppState = {
  trajectories: [],
  tlos: [],
  ilos: [],
  courseObjectives: [],
  tloIloMappings: [],
  iloCourseObjectiveMappings: [],
  courses: [],
}

export function useWebSocket(projectId: string) {
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  const [connected, setConnected] = useState(false)
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

    function connect() {
      if (!mountedRef.current) return

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/${projectId}`)
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
                courseObjectives: d.courseObjectives ?? [],
                tloIloMappings: d.tloIloMappings ?? [],
                iloCourseObjectiveMappings: d.iloCourseObjectiveMappings ?? [],
                courses: d.courses ?? [],
              })
              break
            }
            case "sync:trajectories":
              setState(s => ({ ...s, trajectories: msg.data as AppState["trajectories"] }))
              break
            case "sync:tlos":
              setState(s => ({ ...s, tlos: msg.data as AppState["tlos"] }))
              break
            case "sync:ilos":
              setState(s => ({ ...s, ilos: msg.data as AppState["ilos"] }))
              break
            case "sync:course_objectives":
              setState(s => ({ ...s, courseObjectives: msg.data as AppState["courseObjectives"] }))
              break
            case "sync:tlo_ilo_mappings":
              setState(s => ({ ...s, tloIloMappings: msg.data as AppState["tloIloMappings"] }))
              break
            case "sync:ilo_course_objective_mappings":
              setState(s => ({
                ...s,
                iloCourseObjectiveMappings: msg.data as AppState["iloCourseObjectiveMappings"],
              }))
              break
            case "sync:courses":
              setState(s => ({ ...s, courses: msg.data as AppState["courses"] }))
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

  return { state, connected, send }
}
