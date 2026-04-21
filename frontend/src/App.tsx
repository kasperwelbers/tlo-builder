import { useEffect, useState } from "react"
import { AppProvider, useApp } from "@/context/AppContext"
import { HelpProvider } from "@/context/HelpContext"
import { NavProvider } from "@/context/NavigationContext"
import { AppShell } from "@/components/layout/AppShell"
import type { Page } from "@/components/layout/AppShell"
import { WorkspacePage } from "@/components/workspace/WorkspacePage"
import { CloPage } from "@/components/clos/CloPage"
import { OverviewPage } from "@/components/overview/OverviewPage"
import { Toaster } from "@/components/ui/sonner"

function getProjectId() {
  let id = localStorage.getItem("lto_project_id")
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("lto_project_id", id) }
  return id
}

const PROJECT_ID = getProjectId()

function Inner() {
  const { state, connected } = useApp()
  const [page, setPage] = useState<Page | null>(null)

  useEffect(() => {
    setPage(prev => {
      // Auto-select first trajectory when none selected
      if (prev === null) {
        if (state.trajectories.length > 0) {
          return { type: "trajectory", id: state.trajectories[0].id }
        }
        return prev
      }
      // Fallback if selected trajectory was deleted
      if (prev.type === "trajectory") {
        const exists = state.trajectories.some(t => t.id === prev.id)
        if (!exists) {
          return state.trajectories.length > 0
            ? { type: "trajectory", id: state.trajectories[0].id }
            : null
        }
      }
      // Fallback if selected course was deleted
      if (prev.type === "course") {
        const exists = state.courses.some(c => c.id === prev.id)
        if (!exists) {
          return state.trajectories.length > 0
            ? { type: "trajectory", id: state.trajectories[0].id }
            : null
        }
      }
      return prev
    })
  }, [state.trajectories, state.courses])

  return (
    <NavProvider onNavigate={setPage}>
      <AppShell currentPage={page} onNavigate={setPage} connected={connected}>
        {page?.type === "trajectory" && <WorkspacePage trajectoryId={page.id} />}
        {page?.type === "course" && <CloPage courseId={page.id} />}
        {page?.type === "overview" && <OverviewPage />}
        {page === null && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Select a trajectory or course from the sidebar to get started.</p>
          </div>
        )}
      </AppShell>
    </NavProvider>
  )
}

export default function App() {
  return (
    <AppProvider projectId={PROJECT_ID}>
      <HelpProvider>
        <Inner />
        <Toaster richColors position="bottom-right" />
      </HelpProvider>
    </AppProvider>
  )
}
