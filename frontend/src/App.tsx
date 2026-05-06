import { useEffect, useState } from "react"
import { AppProvider, useApp } from "@/context/AppContext"
import { HelpProvider } from "@/context/HelpContext"
import { NavProvider } from "@/context/NavigationContext"
import { AppShell } from "@/components/layout/AppShell"
import type { Page } from "@/components/layout/AppShell"
import { WorkspacePage } from "@/components/workspace/WorkspacePage"
import { CloPage } from "@/components/clos/CloPage"
import { OverviewPage } from "@/components/overview/OverviewPage"
import { LandingPage } from "@/components/LandingPage"
import { Toaster } from "@/components/ui/sonner"

// ---------------------------------------------------------------------------
// URL routing helpers
// ---------------------------------------------------------------------------

function getProjectIdFromUrl(): string | null {
  const match = window.location.pathname.match(/^\/project\/([^/]+)\/?$/)
  return match ? match[1] : null
}

function navigateTo(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// ---------------------------------------------------------------------------
// Project app (shown when a project ID is present in the URL)
// ---------------------------------------------------------------------------

function Inner() {
  const { state, connected } = useApp()
  const [page, setPage] = useState<Page | null>(null)

  useEffect(() => {
    setPage(prev => {
      if (prev === null) {
        if (state.trajectories.length > 0) {
          return { type: "trajectory", id: state.trajectories[0].id }
        }
        return prev
      }
      if (prev.type === "trajectory") {
        const exists = state.trajectories.some(t => t.id === prev.id)
        if (!exists) {
          return state.trajectories.length > 0
            ? { type: "trajectory", id: state.trajectories[0].id }
            : null
        }
      }
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

function ProjectApp({ projectId }: { projectId: string }) {
  return (
    <AppProvider projectId={projectId}>
      <HelpProvider>
        <Inner />
        <Toaster richColors position="bottom-right" />
      </HelpProvider>
    </AppProvider>
  )
}

// ---------------------------------------------------------------------------
// Root — routes between landing page and project app based on URL
// ---------------------------------------------------------------------------

export default function App() {
  const [projectId, setProjectId] = useState<string | null>(getProjectIdFromUrl)

  useEffect(() => {
    function onPopState() {
      setProjectId(getProjectIdFromUrl())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function handleCreate() {
    const id = crypto.randomUUID()
    navigateTo(`/project/${id}`)
  }

  if (!projectId) {
    return (
      <>
        <LandingPage onCreate={handleCreate} />
        <Toaster richColors position="bottom-right" />
      </>
    )
  }

  return <ProjectApp projectId={projectId} />
}
