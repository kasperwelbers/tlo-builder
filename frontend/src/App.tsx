import { useEffect, useState } from "react"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { AppProvider, useApp } from "@/context/AppContext"
import { HelpProvider } from "@/context/HelpContext"
import { NavProvider } from "@/context/NavigationContext"
import { AppShell } from "@/components/layout/AppShell"
import type { Page } from "@/components/layout/AppShell"
import { TrajectoryPage } from "@/components/tlos/TloPage"
import { IloPage } from "@/components/ilos/IloPage"
import { OverviewPage } from "@/components/overview/OverviewPage"
import { ExitQualificationsPage } from "@/components/eqs/ExitQualificationsPage"
import { LandingPage } from "@/components/LandingPage"
import { LoginPage } from "@/components/auth/LoginPage"
import { ErrorPage } from "@/components/ErrorPage"
import { UserMenu } from "@/components/UserMenu"
import { Toaster } from "@/components/ui/sonner"

// ---------------------------------------------------------------------------
// URL routing helpers
// ---------------------------------------------------------------------------

function getProjectIdFromUrl(): string | null {
  const match = window.location.pathname.match(/^\/project\/([^/]+)\/?$/)
  return match ? match[1] : null
}

function getShareTokenFromUrl(): string | null {
  const match = window.location.pathname.match(/^\/share\/([^/]+)\/?$/)
  return match ? match[1] : null
}

function navigateTo(path: string) {
  window.history.pushState({}, "", path)
  window.dispatchEvent(new PopStateEvent("popstate"))
}

// ---------------------------------------------------------------------------
// Project app
// ---------------------------------------------------------------------------

interface InnerProps {
  projectId: string
  projectName: string
  onGoHome: () => void
  onRename: (name: string) => void
}

function Inner({ projectId, projectName, onGoHome, onRename }: InnerProps) {
  const {
    state,
    connected,
    ready,
    connectionError,
    authLost,
    accessDenied,
    readOnly,
  } = useApp()
  const [page, setPage] = useState<Page | null>(null)

  useEffect(() => {
    setPage((prev) => {
      if (prev === null) {
        if (state.trajectories.length > 0) {
          return { type: "trajectory", id: state.trajectories[0].id }
        }
        return prev
      }
      if (prev.type === "trajectory") {
        const exists = state.trajectories.some((t) => t.id === prev.id)
        if (!exists) {
          return state.trajectories.length > 0
            ? { type: "trajectory", id: state.trajectories[0].id }
            : null
        }
      }
      if (prev.type === "course") {
        const exists = state.courses.some((c) => c.id === prev.id)
        if (!exists) {
          return state.trajectories.length > 0
            ? { type: "trajectory", id: state.trajectories[0].id }
            : null
        }
      }
      return prev
    })
  }, [state.trajectories, state.courses])

  if (accessDenied && readOnly) return <InvalidShareLink />
  if (accessDenied) {
    return (
      <ErrorPage
        title="No access"
        message="You don't have access to this project, or it no longer exists."
      />
    )
  }
  if (authLost) return <LoginPage />

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        <p className="text-sm text-muted-foreground">
          {connectionError
            ? "Can't reach the server, retrying…"
            : "Connecting to project…"}
        </p>
      </div>
    )
  }

  return (
    <NavProvider onNavigate={setPage}>
      <AppShell
        currentPage={page}
        onNavigate={setPage}
        connected={connected}
        projectId={projectId}
        projectName={projectName}
        onGoHome={onGoHome}
        onRename={onRename}
      >
        {page?.type === "trajectory" && (
          <TrajectoryPage trajectoryId={page.id} />
        )}
        {page?.type === "course" && <IloPage courseId={page.id} />}
        {page?.type === "overview" && <OverviewPage />}
        {page?.type === "exit_qualifications" && <ExitQualificationsPage />}
        {page === null && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>
              Select a trajectory or course from the sidebar to get started.
            </p>
          </div>
        )}
      </AppShell>
    </NavProvider>
  )
}

function ProjectApp({
  projectId,
  email,
}: {
  projectId: string
  email: string
}) {
  const [projectName, setProjectName] = useState("")

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<{ id: string; name: string }[]>
      })
      .then((list) => {
        const found = list.find((p) => p.id === projectId)
        if (found) setProjectName(found.name)
      })
      .catch(() => setProjectName(""))
  }, [projectId])

  return (
    <AppProvider access={{ projectId }}>
      <HelpProvider>
        <Inner
          projectId={projectId}
          projectName={projectName}
          onGoHome={() => navigateTo("/")}
          onRename={setProjectName}
        />
        <Toaster richColors position="bottom-right" />
      </HelpProvider>
    </AppProvider>
  )
}

// ---------------------------------------------------------------------------
// Public read-only share link
// ---------------------------------------------------------------------------

function InvalidShareLink() {
  return (
    <ErrorPage
      title="Link not available"
      message="This link is invalid or has been turned off."
    />
  )
}

function SharedProjectApp({ shareToken }: { shareToken: string }) {
  const [project, setProject] = useState<
    | { status: "loading" }
    | { status: "ok"; projectId: string; name: string }
    | { status: "invalid" }
    | { status: "error" }
  >({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/share/${encodeURIComponent(shareToken)}`)
      .then(async (r) => {
        if (cancelled) return
        if (r.status === 404) return setProject({ status: "invalid" })
        if (!r.ok) return setProject({ status: "error" })
        const d = (await r.json()) as { projectId: string; name: string }
        if (!cancelled) setProject({ status: "ok", ...d })
      })
      .catch(() => !cancelled && setProject({ status: "error" }))
    return () => {
      cancelled = true
    }
  }, [shareToken, attempt])

  if (project.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    )
  }
  if (project.status === "invalid") return <InvalidShareLink />
  if (project.status === "error") {
    return (
      <ErrorPage
        message="Something went wrong on the server. Please try again."
        onRetry={() => {
          setProject({ status: "loading" })
          setAttempt((a) => a + 1)
        }}
      />
    )
  }

  return (
    <AppProvider access={{ shareToken }}>
      <HelpProvider>
        <Inner
          projectId={project.projectId}
          projectName={project.name}
          onGoHome={() => {}}
          onRename={() => {}}
        />
        <Toaster richColors position="bottom-right" />
      </HelpProvider>
    </AppProvider>
  )
}

// ---------------------------------------------------------------------------
// Authenticated shell
// ---------------------------------------------------------------------------

function AuthenticatedApp() {
  const auth = useAuth()
  const [projectId, setProjectId] = useState<string | null>(getProjectIdFromUrl)

  useEffect(() => {
    function onPopState() {
      setProjectId(getProjectIdFromUrl())
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    )
  }

  if (auth.status === "error") {
    return <ErrorPage onRetry={auth.retry} />
  }

  if (auth.status === "unauthenticated") {
    return (
      <>
        <LoginPage />
        <Toaster richColors position="bottom-right" />
      </>
    )
  }

  const { user } = auth

  if (!projectId) {
    return (
      <>
        <UserMenu email={user.email} />
        <LandingPage onOpen={(id) => navigateTo("/project/" + id)} />
        <Toaster richColors position="bottom-right" />
      </>
    )
  }

  return (
    <>
      <UserMenu email={user.email} />
      <ProjectApp projectId={projectId} email={user.email} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export default function App() {
  const shareToken = getShareTokenFromUrl()
  if (shareToken) return <SharedProjectApp shareToken={shareToken} />

  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}
