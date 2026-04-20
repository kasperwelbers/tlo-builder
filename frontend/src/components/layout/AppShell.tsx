import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Plus, PanelLeftClose, PanelLeftOpen, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ColorPicker } from '@/components/ui/color-picker'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { OrderBadge } from '@/components/ui/order-badge'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { useHelp } from '@/context/HelpContext'
import { randomColor } from '@/lib/colorPalette'
import { YamlActions } from '@/components/YamlActions'

export type Page = { type: "trajectory"; id: number } | { type: "course"; id: number }

interface AppShellProps {
  currentPage: Page | null
  onNavigate: (page: Page) => void
  connected: boolean
  children: ReactNode
}

export function AppShell({ currentPage, onNavigate, connected, children }: AppShellProps) {
  const { state, send } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const { openHelp } = useHelp()

  const trajectories = useMemo(
    () => [...state.trajectories].sort((a, b) => a.name.localeCompare(b.name)),
    [state.trajectories]
  )
  const courses = useMemo(
    () => [...state.courses].sort((a, b) => a.name.localeCompare(b.name)),
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

  function openAddTrajectory() {
    setNewTrajName("")
    setNewTrajDescription("")
    setNewTrajColor(randomColor())
    setAddTrajOpen(true)
  }

  function submitAddTrajectory() {
    const name = newTrajName.trim()
    if (!name) return
    send({ type: "trajectory:create", name, description: newTrajDescription.trim(), color: newTrajColor })
    setAddTrajOpen(false)
  }

  // Add Course dialog
  const [addCourseOpen, setAddCourseOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState("")
  const [newCourseDescription, setNewCourseDescription] = useState("")
  const [newCourseColor, setNewCourseColor] = useState("")

  function openAddCourse() {
    setNewCourseName("")
    setNewCourseDescription("")
    setNewCourseColor(randomColor())
    setAddCourseOpen(true)
  }

  function submitAddCourse() {
    const name = newCourseName.trim()
    if (!name) return
    send({ type: "course:create", name, description: newCourseDescription.trim(), color: newCourseColor })
    setAddCourseOpen(false)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "flex flex-col border-r bg-card shrink-0 transition-[width] duration-200 overflow-hidden",
            collapsed ? "w-12" : "w-56"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center border-b h-14 shrink-0",
              collapsed ? "justify-center px-2" : "gap-2 px-4"
            )}
          >
            {!collapsed && (
              <>
                <span className="text-lg font-bold flex-1 truncate">TLO Builder</span>
                <span
                  className={cn("size-2 rounded-full shrink-0", connected ? "bg-green-500" : "bg-red-500")}
                  title={connected ? "Connected" : "Disconnected"}
                />
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Trajectories */}
            <div className={cn("pt-4 pb-1", collapsed ? "px-1.5" : "px-3")}>
              {!collapsed && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                  <p className="px-2 py-1 text-xs text-muted-foreground italic">No trajectories yet</p>
                )}
                {trajectories.map((t, i) => {
                  const isActive = currentPage?.type === "trajectory" && currentPage.id === t.id
                  const btnClass = cn(
                    "flex w-full items-center rounded-md transition-colors",
                    collapsed ? "justify-center py-2" : "gap-2 px-2 py-1.5 text-xs text-left",
                    isActive
                      ? "bg-black text-white font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                  const badge = <OrderBadge num={i + 1} color={t.color} shape="circle" />
                  if (collapsed) {
                    return (
                      <Tooltip key={t.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleNavigate({ type: "trajectory", id: t.id })}
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
                      onClick={() => handleNavigate({ type: "trajectory", id: t.id })}
                      className={btnClass}
                    >
                      {badge}
                      <span className="truncate">{t.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {collapsed
              ? <div className="my-2 mx-1.5 border-t" />
              : <Separator className="my-3" />
            }

            {/* Courses */}
            <div className={cn("pb-4", collapsed ? "px-1.5" : "px-3")}>
              {!collapsed && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Courses
                  </span>
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
              )}
              <div className="space-y-0.5">
                {!collapsed && courses.length === 0 && (
                  <p className="px-2 py-1 text-xs text-muted-foreground italic">No courses yet</p>
                )}
                {courses.map((c, i) => {
                  const isActive = currentPage?.type === "course" && currentPage.id === c.id
                  const btnClass = cn(
                    "flex w-full items-center rounded-md transition-colors",
                    collapsed ? "justify-center py-2" : "gap-2 px-2 py-1.5 text-xs text-left",
                    isActive
                      ? "bg-black text-white font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                  const badge = <OrderBadge num={i + 1} color={c.color} shape="square" />
                  if (collapsed) {
                    return (
                      <Tooltip key={c.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleNavigate({ type: "course", id: c.id })}
                            className={btnClass}
                          >
                            {badge}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">{c.name}</TooltipContent>
                      </Tooltip>
                    )
                  }
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleNavigate({ type: "course", id: c.id })}
                      className={btnClass}
                    >
                      {badge}
                      <span className="truncate">{c.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Bottom: Import / Export + Help */}
          <div className={cn("border-t", collapsed ? "p-1.5" : "p-3")}>
            <YamlActions collapsed={collapsed} />
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 mt-1"
                    onClick={() => openHelp("overview")}
                  >
                    <HelpCircle className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Help</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-1.5 h-7 text-xs text-muted-foreground justify-start gap-1.5"
                onClick={() => openHelp("overview")}
              >
                <HelpCircle className="size-3.5" />
                Help
              </Button>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6">{children}</main>

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
                  onChange={e => setNewTrajName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") submitAddTrajectory() }}
                  placeholder="Trajectory name"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={newTrajDescription}
                  onChange={e => setNewTrajDescription(e.target.value)}
                  placeholder="A brief description of this trajectory"
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <ColorPicker value={newTrajColor} onChange={setNewTrajColor} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTrajOpen(false)}>Cancel</Button>
              <Button onClick={submitAddTrajectory} disabled={!newTrajName.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Course Dialog */}
        <Dialog open={addCourseOpen} onOpenChange={setAddCourseOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>New course</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") submitAddCourse() }}
                  placeholder="Course name"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={newCourseDescription}
                  onChange={e => setNewCourseDescription(e.target.value)}
                  placeholder="A brief description of this course"
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <ColorPicker value={newCourseColor} onChange={setNewCourseColor} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCourseOpen(false)}>Cancel</Button>
              <Button onClick={submitAddCourse} disabled={!newCourseName.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
