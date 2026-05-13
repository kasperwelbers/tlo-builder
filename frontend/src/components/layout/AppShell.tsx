import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  Sheet,
  LayoutGrid,
  ArrowLeft,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ColorPicker } from "@/components/ui/color-picker"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { OrderBadge } from "@/components/ui/order-badge"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { useHelp } from "@/context/HelpContext"
import { randomColor } from "@/lib/colorPalette"
import { YamlActions } from "@/components/YamlActions"
import { BulkImportCoursesDialog } from "@/components/BulkImportCoursesDialog"
import { ProjectSettingsDialog } from "@/components/ProjectSettingsDialog"

export type Page =
  | { type: "trajectory"; id: number }
  | { type: "course"; id: number }
  | { type: "overview" }

interface AppShellProps {
  currentPage: Page | null
  onNavigate: (page: Page) => void
  connected: boolean
  children: ReactNode
  projectId: string
  projectName: string
  onGoHome: () => void
  onRename: (name: string) => void
}

export function AppShell({
  currentPage,
  onNavigate,
  connected,
  children,
  projectId,
  projectName,
  onGoHome,
  onRename,
}: AppShellProps) {
  const { state, send } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const { openHelp } = useHelp()
  const [settingsOpen, setSettingsOpen] = useState(false)

  function handleNavigateOverview() {
    onNavigate({ type: "overview" })
    if (window.innerWidth < 768) setCollapsed(true)
  }

  const trajectories = useMemo(
    () => [...state.trajectories].sort((a, b) => a.name.localeCompare(b.name)),
    [state.trajectories]
  )
  const courses = useMemo(
    () => [...state.courses].sort((a, b) => a.code.localeCompare(b.code)),
    [state.courses]
  )

  function handleNavigate(page: Page) {
    onNavigate(page)
    // Auto-collapse on small screens (< 768px)
    if (window.innerWidth < 768) {
      setCollapsed(true)
    }
  }

  // Add Trajectory dialog
  const [addTrajOpen, setAddTrajOpen] = useState(false)
  const [newTrajName, setNewTrajName] = useState("")
  const [newTrajDescription, setNewTrajDescription] = useState("")
  const [newTrajColor, setNewTrajColor] = useState("")
  const [newTrajCoordinator, setNewTrajCoordinator] = useState("")

  function openAddTrajectory() {
    setNewTrajName("")
    setNewTrajDescription("")
    setNewTrajColor(randomColor())
    setNewTrajCoordinator("")
    setAddTrajOpen(true)
  }

  function submitAddTrajectory() {
    const name = newTrajName.trim()
    if (!name) return
    send({
      type: "trajectory:create",
      name,
      description: newTrajDescription.trim(),
      color: newTrajColor,
      coordinator: newTrajCoordinator.trim() || null,
    })
    setAddTrajOpen(false)
  }

  // Bulk import courses dialog
  const [bulkImportOpen, setBulkImportOpen] = useState(false)

  // Add Course dialog
  const [addCourseOpen, setAddCourseOpen] = useState(false)
  const [newCourseCode, setNewCourseCode] = useState("")
  const [newCourseName, setNewCourseName] = useState("")
  const [newCourseColor, setNewCourseColor] = useState("")
  const [newCourseCoordinator, setNewCourseCoordinator] = useState("")
  const [newCourseStart, setNewCourseStart] = useState("")
  const [newCourseEnd, setNewCourseEnd] = useState("")

  function openAddCourse() {
    setNewCourseCode("")
    setNewCourseName("")
    setNewCourseColor(randomColor())
    setNewCourseCoordinator("")
    setNewCourseStart("")
    setNewCourseEnd("")
    setAddCourseOpen(true)
  }

  function submitAddCourse() {
    const code = newCourseCode.trim()
    if (!code) return
    send({
      type: "course:create",
      code,
      name: newCourseName.trim(),
      color: newCourseColor,
      coordinator: newCourseCoordinator.trim() || null,
      start: newCourseStart.trim() || null,
      end: newCourseEnd.trim() || null,
    })
    setAddCourseOpen(false)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "flex shrink-0 flex-col overflow-hidden border-r bg-card transition-[width] duration-200",
            collapsed ? "w-12" : "w-56"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex h-14 shrink-0 items-center border-b",
              collapsed ? "justify-center px-2" : "gap-2 px-4"
            )}
          >
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-sm font-semibold">
                  {projectName || "…"}
                </span>
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    connected ? "bg-green-500" : "bg-red-500"
                  )}
                  title={connected ? "Connected" : "Disconnected"}
                />
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-x-hidden overflow-y-auto">
            {/* Back to projects + Settings + Help */}
            <div
              className={cn(
                "ml-1 flex gap-0.5 border-b",
                collapsed
                  ? "flex-col items-center px-1.5 py-1.5"
                  : "items-center px-2 py-1.5"
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onGoHome}
                    className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side={collapsed ? "right" : "bottom"}>
                  All projects
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Settings className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side={collapsed ? "right" : "bottom"}>
                  Project settings
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => openHelp("overview")}
                    className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <HelpCircle className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side={collapsed ? "right" : "bottom"}>
                  Help
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Overview */}
            <div className={cn("pt-3 pb-1", collapsed ? "px-1.5" : "px-3")}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleNavigateOverview}
                      className={cn(
                        "flex w-full items-center justify-center rounded-md py-2 transition-colors",
                        currentPage?.type === "overview"
                          ? "bg-black text-white"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <LayoutGrid className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Overview</TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={handleNavigateOverview}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                    currentPage?.type === "overview"
                      ? "bg-black font-medium text-white"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <LayoutGrid className="size-3.5 shrink-0" />
                  Overview
                </button>
              )}
            </div>

            {collapsed ? (
              <div className="mx-1.5 my-1 border-t" />
            ) : (
              <Separator className="my-2" />
            )}

            {/* Trajectories */}
            <div
              className={cn("pb-1", collapsed ? "px-1.5 pt-2" : "px-3 pt-2")}
            >
              {collapsed ? null : ( // <div className="pb-1 text-center text-muted-foreground">T</div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Trajectories
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 text-muted-foreground hover:text-foreground"
                    onClick={openAddTrajectory}
                    title="Add trajectory"
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              )}
              <div className="space-y-0.5">
                {!collapsed && trajectories.length === 0 && (
                  <p className="px-2 py-1 text-xs text-muted-foreground italic">
                    No trajectories yet
                  </p>
                )}
                {trajectories.map((t, i) => {
                  const isActive =
                    currentPage?.type === "trajectory" &&
                    currentPage.id === t.id
                  const btnClass = cn(
                    "flex w-full items-center rounded-md transition-colors",
                    collapsed
                      ? "justify-center py-2"
                      : "gap-2 px-2 py-1.5 text-left text-xs",
                    isActive
                      ? "bg-black font-medium text-white"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                  const badge = (
                    <OrderBadge num={i + 1} color={t.color} shape="circle" />
                  )
                  if (collapsed) {
                    return (
                      <Tooltip key={t.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() =>
                              handleNavigate({ type: "trajectory", id: t.id })
                            }
                            className={btnClass}
                          >
                            {badge}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">{t.name}</TooltipContent>
                      </Tooltip>
                    )
                  }
                  return (
                    <button
                      key={t.id}
                      onClick={() =>
                        handleNavigate({ type: "trajectory", id: t.id })
                      }
                      className={btnClass}
                    >
                      {badge}
                      <span className="truncate">{t.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {collapsed ? (
              <div className="mx-1.5 my-2 border-t" />
            ) : (
              <Separator className="my-3" />
            )}

            {/* Courses */}
            <div className={cn("pb-4", collapsed ? "px-1.5" : "px-3")}>
              {collapsed ? // </div> //   C // <div className="text-center font-semibold text-muted-foreground">
              null : (
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Courses
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5 text-muted-foreground hover:text-foreground"
                      onClick={() => setBulkImportOpen(true)}
                      title="Bulk import courses"
                    >
                      <Sheet className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5 text-muted-foreground hover:text-foreground"
                      onClick={openAddCourse}
                      title="Add course"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-0.5">
                {!collapsed && courses.length === 0 && (
                  <p className="px-2 py-1 text-xs text-muted-foreground italic">
                    No courses yet
                  </p>
                )}
                {courses.map((c, i) => {
                  const isActive =
                    currentPage?.type === "course" && currentPage.id === c.id
                  const btnClass = cn(
                    "flex w-full items-center rounded-md transition-colors",
                    collapsed
                      ? "justify-center py-2"
                      : "gap-2 px-2 py-1.5 text-left text-xs",
                    isActive
                      ? "bg-black font-medium text-white"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                  const badge = (
                    <OrderBadge num={i + 1} color={c.color} shape="square" />
                  )
                  if (collapsed) {
                    return (
                      <Tooltip key={c.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() =>
                              handleNavigate({ type: "course", id: c.id })
                            }
                            className={btnClass}
                          >
                            {badge}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {c.code}
                          {c.name ? `: ${c.name}` : ""}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }
                  return (
                    <button
                      key={c.id}
                      onClick={() =>
                        handleNavigate({ type: "course", id: c.id })
                      }
                      className={btnClass}
                    >
                      {badge}
                      <span className="truncate">{c.code}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Bottom: Import / Export */}
          <div className={cn("border-t", collapsed ? "p-1.5" : "p-3")}>
            <YamlActions collapsed={collapsed} projectName={projectName} />
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6 pt-8">{children}</main>

        {/* Add Trajectory Dialog */}
        <Dialog open={addTrajOpen} onOpenChange={setAddTrajOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>New trajectory</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={newTrajName}
                  onChange={(e) => setNewTrajName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitAddTrajectory()
                  }}
                  placeholder="Trajectory name"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={newTrajDescription}
                  onChange={(e) => setNewTrajDescription(e.target.value)}
                  placeholder="A brief description of this trajectory"
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Coordinator{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  value={newTrajCoordinator}
                  onChange={(e) => setNewTrajCoordinator(e.target.value)}
                  placeholder="e.g. Dr. Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <ColorPicker value={newTrajColor} onChange={setNewTrajColor} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTrajOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitAddTrajectory}
                disabled={!newTrajName.trim()}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Import Courses Dialog */}
        <BulkImportCoursesDialog
          open={bulkImportOpen}
          onOpenChange={setBulkImportOpen}
        />

        <ProjectSettingsDialog
          projectId={projectId}
          projectName={projectName}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onRename={onRename}
        />

        {/* Add Course Dialog */}
        <Dialog open={addCourseOpen} onOpenChange={setAddCourseOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>New course</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>
                  Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitAddCourse()
                  }}
                  placeholder="e.g. CS101"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Name{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Full course name"
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Coordinator{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  value={newCourseCoordinator}
                  onChange={(e) => setNewCourseCoordinator(e.target.value)}
                  placeholder="e.g. Dr. Smith"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    Start{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    value={newCourseStart}
                    onChange={(e) => setNewCourseStart(e.target.value)}
                    placeholder="e.g. 2-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    End{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    value={newCourseEnd}
                    onChange={(e) => setNewCourseEnd(e.target.value)}
                    placeholder="e.g. 2-4"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <ColorPicker
                  value={newCourseColor}
                  onChange={setNewCourseColor}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCourseOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitAddCourse}
                disabled={!newCourseCode.trim()}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
