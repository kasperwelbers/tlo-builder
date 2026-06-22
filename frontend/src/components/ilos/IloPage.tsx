import { useState } from "react"
import {
  GripVertical,
  HelpCircle,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { IloSection } from "./IloSection"
import { CurrentIloFormDialog } from "./CurrentIloFormDialog"
import { CommentsPanel } from "@/components/CommentsPanel"
import { IloItem } from "@/components/tlos/IloItem"
import { useApp } from "@/context/AppContext"
import { useHelp } from "@/context/HelpContext"
import { bloomSortKey } from "@/lib/bloomLevels"
import { cn } from "@/lib/utils"
import type { Ilo } from "@/lib/types"

interface Props {
  courseId: number
}

// ── Draggable ILO row (used in the unlinked/course-level area) ──────────────
function DraggableIloRow({
  ilo,
  onOpenComments,
}: {
  ilo: Ilo
  onOpenComments?: () => void
}) {
  const { send } = useApp()
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: ilo.id })
  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex items-center", isDragging && "opacity-40")}
    >
      <button
        {...listeners}
        {...attributes}
        className="shrink-0 cursor-grab px-1 py-1.5 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <IloItem
          ilo={ilo}
          variant="course"
          onDelete={() => send({ type: "ilo:delete", id: ilo.id })}
          onOpenComments={onOpenComments}
        />
      </div>
    </div>
  )
}

// ── Drop zone for course-level (unlinked) ILOs ──────────────────────────────
function CourseLevelDropZone({
  children,
  isEmpty,
}: {
  children: React.ReactNode
  isEmpty: boolean
}) {
  const { isOver, setNodeRef } = useDroppable({ id: "course-level" })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border border-dashed transition-all",
        isOver &&
          "border-primary/60 bg-primary/5 ring-2 ring-primary/30 ring-offset-1",
        isEmpty ? "flex min-h-16 items-center justify-center p-4" : "p-2"
      )}
    >
      {isEmpty ? (
        <p
          className={cn(
            "text-xs text-muted-foreground italic",
            isOver && "text-primary"
          )}
        ></p>
      ) : (
        children
      )}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export function IloPage({ courseId }: Props) {
  const { state, send } = useApp()
  const { openHelp } = useHelp()

  const course = state.courses.find((c) => c.id === courseId)
  const courseCurrentIlos = state.currentIlos
    .filter((c) => c.courseId === courseId)
    .sort((a, b) =>
      a.description.localeCompare(b.description, undefined, { numeric: true })
    )

  // Build mapping views
  const courseMappings = state.iloCurrentIloMappings.filter(
    (m) => m.courseId === courseId
  )
  const iloById = new Map(state.ilos.map((i) => [i.id, i]))

  // ILOs linked at course level (cloId === null)
  const unlinkedIlos = courseMappings
    .filter((m) => m.currentIloId === null)
    .map((m) => iloById.get(m.iloId))
    .filter((i): i is Ilo => i !== undefined)
    .sort((a, b) => bloomSortKey(a.bloomLevel) - bloomSortKey(b.bloomLevel))

  // ILOs grouped by Current ILO id
  const ilosByCurrentIloId = new Map<number, Ilo[]>()
  for (const m of courseMappings) {
    if (m.currentIloId === null) continue
    const ilo = iloById.get(m.iloId)
    if (!ilo) continue
    const arr = ilosByCurrentIloId.get(m.currentIloId) ?? []
    arr.push(ilo)
    ilosByCurrentIloId.set(m.currentIloId, arr)
  }
  for (const [currentIloId, arr] of ilosByCurrentIloId) {
    ilosByCurrentIloId.set(
      currentIloId,
      arr.sort(
        (a, b) => bloomSortKey(a.bloomLevel) - bloomSortKey(b.bloomLevel)
      )
    )
  }

  // Header inline-editing state
  const [editingField, setEditingField] = useState<
    "code" | "name" | "coordinator" | "start" | "end" | "type" | "owner" | null
  >(null)
  const [editValue, setEditValue] = useState("")

  // Current ILO dialog
  const [cloDialogOpen, setCloDialogOpen] = useState(false)

  // Comments panel
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentsFocusIloId, setCommentsFocusIloId] = useState<number | null>(
    null
  )

  function openComments(iloId?: number) {
    setCommentsFocusIloId(iloId ?? null)
    setCommentsOpen(true)
  }

  // DnD active item
  const [activeIloId, setActiveIloId] = useState<number | null>(null)
  const activeIlo = activeIloId != null ? iloById.get(activeIloId) : null

  if (!course) return null

  function handleStartEdit(
    field: "code" | "name" | "coordinator" | "start" | "end" | "type" | "owner",
    value: string
  ) {
    setEditingField(field)
    setEditValue(value)
  }

  function handleSave() {
    if (!editingField) return
    send({
      type: "course:update",
      courseId: course!.id,
      code: editingField === "code" ? editValue : course!.code,
      name: editingField === "name" ? editValue : course!.name,
      color: course!.color,
      coordinator:
        editingField === "coordinator"
          ? editValue.trim() || null
          : course!.coordinator,
      start:
        editingField === "start" ? editValue.trim() || null : course!.start,
      end: editingField === "end" ? editValue.trim() || null : course!.end,
      courseType: editingField === "type" ? editValue.trim() : course!.type,
      owner:
        editingField === "owner" ? editValue.trim() || null : course!.owner,
    })
    setEditingField(null)
  }

  function handleColorChange(color: string) {
    send({
      type: "course:update",
      courseId: course!.id,
      code: course!.code,
      name: course!.name,
      color,
      coordinator: course!.coordinator,
      start: course!.start,
      end: course!.end,
      courseType: course!.type,
      owner: course!.owner,
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const iloId = active.id as number
    const targetCurrentIloId =
      over.id === "course-level" ? null : (over.id as number)
    send({
      type: "ilo_current_ilo_mapping:add",
      iloId,
      courseId: course!.id,
      currentIloId: targetCurrentIloId,
    })
  }

  return (
    <div className="">
      <div className="flex items-center gap-3">
        <h2 className="pl-1 font-semibold text-foreground/60">Course</h2>
        {/* Comments button */}
        {(() => {
          const count = state.comments.filter(
            (c) =>
              c.context === "course" &&
              c.contextId === courseId &&
              c.status !== "done"
          ).length
          return (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => openComments()}
            >
              <MessageSquare className="size-4" />
              {count > 0 && <span className="text-xs">{count}</span>}
            </Button>
          )
        })()}
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground/50 hover:text-muted-foreground"
          onClick={() => openHelp("courses")}
          aria-label="Help: course page"
        >
          <HelpCircle className="size-4" />
        </Button>
        {/* Action row */}
        <div className="flex items-center justify-end gap-2">
          <ColorPicker
            value={course.color}
            onChange={handleColorChange}
            shape="square"
          />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete course "{course.code}"?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all {courseCurrentIlos.length} Current ILO
                  {courseCurrentIlos.length !== 1 ? "s" : ""} in this course and
                  their mappings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    send({ type: "course:delete", courseId: course.id })
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {/* ── Course header ─────────────────────────────────────────────────── */}
      <div className="space-y-6 pt-1">
        {/* Title and description */}
        <div>
          {editingField === "code" ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-auto border-0 px-1 text-2xl font-bold shadow-none focus-visible:ring-0"
              autoFocus
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
                if (e.key === "Escape") setEditingField(null)
              }}
            />
          ) : (
            <h1
              role="button"
              tabIndex={0}
              className="cursor-pointer rounded px-1 text-2xl font-bold hover:bg-muted/50"
              onClick={() => handleStartEdit("code", course.code)}
            >
              {course.code}
            </h1>
          )}

          {editingField === "name" ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="mt-1 text-sm text-muted-foreground"
              autoFocus
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
                if (e.key === "Escape") setEditingField(null)
              }}
            />
          ) : (
            <p
              role="button"
              tabIndex={0}
              className="mt-1 cursor-pointer rounded px-1 text-sm text-muted-foreground hover:bg-muted/50"
              onClick={() => handleStartEdit("name", course.name || "")}
            >
              {course.name || (
                <span className="italic opacity-50">Full course name</span>
              )}
            </p>
          )}

          {/* Coordinator / Start / End meta row */}
          <div className="mt-2 ml-1 flex flex-wrap gap-4">
            {/* Coordinator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="shrink-0 font-medium">Coordinator:</span>
              {editingField === "coordinator" ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-6 w-40 border-0 px-1 text-xs focus-visible:ring-1"
                  autoFocus
                  onBlur={handleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave()
                    if (e.key === "Escape") setEditingField(null)
                  }}
                />
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer rounded px-1 hover:bg-muted/50"
                  onClick={() =>
                    handleStartEdit("coordinator", course.coordinator || "")
                  }
                >
                  {course.coordinator || (
                    <span className="italic opacity-50">—</span>
                  )}
                </span>
              )}
            </div>

            {/* Start */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="shrink-0 font-medium">Start:</span>
              {editingField === "start" ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-6 w-20 border-0 px-1 text-xs focus-visible:ring-1"
                  autoFocus
                  placeholder="e.g. 2-1"
                  onBlur={handleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave()
                    if (e.key === "Escape") setEditingField(null)
                  }}
                />
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer rounded px-1 hover:bg-muted/50"
                  onClick={() => handleStartEdit("start", course.start || "")}
                >
                  {course.start || <span className="italic opacity-50">—</span>}
                </span>
              )}
            </div>

            {/* End */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="shrink-0 font-medium">End:</span>
              {editingField === "end" ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-6 w-20 border-0 px-1 text-xs focus-visible:ring-1"
                  autoFocus
                  placeholder="e.g. 2-4"
                  onBlur={handleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave()
                    if (e.key === "Escape") setEditingField(null)
                  }}
                />
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer rounded px-1 hover:bg-muted/50"
                  onClick={() => handleStartEdit("end", course.end || "")}
                >
                  {course.end || <span className="italic opacity-50">—</span>}
                </span>
              )}
            </div>

            {/* Type */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="shrink-0 font-medium">Type:</span>
              {editingField === "type" ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-6 w-32 border-0 px-1 text-xs focus-visible:ring-1"
                  autoFocus
                  placeholder="e.g. elective"
                  onBlur={handleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave()
                    if (e.key === "Escape") setEditingField(null)
                  }}
                />
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer rounded px-1 hover:bg-muted/50"
                  onClick={() => handleStartEdit("type", course.type || "")}
                >
                  {course.type || <span className="italic opacity-50">—</span>}
                </span>
              )}
            </div>

            {/* Owner */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="shrink-0 font-medium">Owner:</span>
              {editingField === "owner" ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-6 w-40 border-0 px-1 text-xs focus-visible:ring-1"
                  autoFocus
                  placeholder="department or faculty"
                  onBlur={handleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave()
                    if (e.key === "Escape") setEditingField(null)
                  }}
                />
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer rounded px-1 hover:bg-muted/50"
                  onClick={() => handleStartEdit("owner", course.owner || "")}
                >
                  {course.owner || <span className="italic opacity-50">—</span>}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── DnD context ───────────────────────────────────────────────────── */}
      <DndContext
        onDragStart={({ active }) => setActiveIloId(active.id as number)}
        onDragEnd={(e) => {
          handleDragEnd(e)
          setActiveIloId(null)
        }}
        onDragCancel={() => setActiveIloId(null)}
      >
        <div className="space-y-4 pt-6">
          {/* Course-level (unlinked) ILOs */}
          <div className="space-y-1.5">
            <h3 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground">
              ILOs without current course objective
            </h3>
            <CourseLevelDropZone isEmpty={unlinkedIlos.length === 0}>
              <div className="py-1">
                {unlinkedIlos.map((ilo) => (
                  <DraggableIloRow
                    key={ilo.id}
                    ilo={ilo}
                    onOpenComments={() => openComments(ilo.id)}
                  />
                ))}
              </div>
            </CourseLevelDropZone>
          </div>

          {/* One CurrentIloSection per Current ILO */}
          {courseCurrentIlos.length > 0 && (
            <div className="space-y-3">
              {courseCurrentIlos.map((currentIlo) => (
                <IloSection
                  key={currentIlo.id}
                  currentIlo={currentIlo}
                  ilos={ilosByCurrentIloId.get(currentIlo.id) ?? []}
                  onDelete={() =>
                    send({ type: "current_ilo:delete", id: currentIlo.id })
                  }
                  onOpenComments={(iloId) => openComments(iloId)}
                />
              ))}
            </div>
          )}

          {/* Add Current ILO */}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed text-muted-foreground hover:text-foreground"
            onClick={() => setCloDialogOpen(true)}
          >
            <Plus className="mr-1 size-4" />
            Add Current ILO
          </Button>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeIlo && (
            <div className="max-w-xs truncate rounded-md border bg-background px-3 py-2 text-sm font-medium opacity-90 shadow-lg">
              {activeIlo.description || (
                <span className="italic opacity-50">No description</span>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Current ILO form dialog */}
      <CurrentIloFormDialog
        open={cloDialogOpen}
        onOpenChange={(open) => setCloDialogOpen(open)}
        initialData={{ courseId }}
        onSubmit={(data) => {
          send({ type: "current_ilo:add", ...data })
          setCloDialogOpen(false)
        }}
      />
      <CommentsPanel
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        context="course"
        contextId={courseId}
        focusIloId={commentsFocusIloId}
      />
    </div>
  )
}
