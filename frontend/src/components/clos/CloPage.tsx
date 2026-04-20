import { useState } from "react"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DndContext, DragOverlay, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { CloSection } from "./CloSection"
import { CloFormDialog } from "./CloFormDialog"
import { IloItem } from "@/components/workspace/IloItem"
import { useApp } from "@/context/AppContext"
import { bloomSortKey } from "@/lib/bloomLevels"
import { cn } from "@/lib/utils"
import type { Ilo } from "@/lib/types"

interface Props {
  courseId: number
}

// ── Draggable ILO row (used in the unlinked/course-level area) ──────────────
function DraggableIloRow({ ilo }: { ilo: Ilo }) {
  const { send } = useApp()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: ilo.id })
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex items-center", isDragging && "opacity-40")}
    >
      <button
        {...listeners}
        {...attributes}
        className="px-1 py-1.5 cursor-grab text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="flex-1 min-w-0">
        <IloItem
          ilo={ilo}
          variant="course"
          onDelete={() => send({ type: "ilo:delete", id: ilo.id })}
        />
      </div>
    </div>
  )
}

// ── Drop zone for course-level (unlinked) ILOs ──────────────────────────────
function CourseLevelDropZone({ children, isEmpty }: { children: React.ReactNode; isEmpty: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: "course-level" })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border border-dashed transition-all",
        isOver && "border-primary/60 bg-primary/5 ring-2 ring-primary/30 ring-offset-1",
        isEmpty ? "p-4 min-h-16 flex items-center justify-center" : "p-2"
      )}
    >
      {isEmpty ? (
        <p className={cn("text-xs text-muted-foreground italic", isOver && "text-primary")}>
        </p>
      ) : (
        children
      )}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export function CloPage({ courseId }: Props) {
  const { state, send } = useApp()

  const course = state.courses.find(c => c.id === courseId)
  const courseClos = state.clos.filter(c => c.courseId === courseId)

  // Build mapping views
  const courseMappings = state.iloCloMappings.filter(m => m.courseId === courseId)
  const iloById = new Map(state.ilos.map(i => [i.id, i]))

  // ILOs linked at course level (cloId === null)
  const unlinkedIlos = courseMappings
    .filter(m => m.cloId === null)
    .map(m => iloById.get(m.iloId))
    .filter((i): i is Ilo => i !== undefined)
    .sort((a, b) => bloomSortKey(a.bloomLevel) - bloomSortKey(b.bloomLevel))

  // ILOs grouped by CLO id
  const ilosByCloId = new Map<number, Ilo[]>()
  for (const m of courseMappings) {
    if (m.cloId === null) continue
    const ilo = iloById.get(m.iloId)
    if (!ilo) continue
    const arr = ilosByCloId.get(m.cloId) ?? []
    arr.push(ilo)
    ilosByCloId.set(m.cloId, arr)
  }
  for (const [cloId, arr] of ilosByCloId) {
    ilosByCloId.set(cloId, arr.sort((a, b) => bloomSortKey(a.bloomLevel) - bloomSortKey(b.bloomLevel)))
  }

  // Header inline-editing state
  const [editingField, setEditingField] = useState<"name" | "description" | null>(null)
  const [editValue, setEditValue] = useState("")

  // CLO dialog
  const [cloDialogOpen, setCloDialogOpen] = useState(false)

  // DnD active item
  const [activeIloId, setActiveIloId] = useState<number | null>(null)
  const activeIlo = activeIloId != null ? iloById.get(activeIloId) : null

  if (!course) return null

  function handleStartEdit(field: "name" | "description", value: string) {
    setEditingField(field)
    setEditValue(value)
  }

  function handleSave() {
    if (!editingField) return
    send({
      type: "course:update",
      courseId: course!.id,
      name: editingField === "name" ? editValue : course!.name,
      description: editingField === "description" ? editValue : course!.description,
      color: course!.color,
    })
    setEditingField(null)
  }

  function handleColorChange(color: string) {
    send({ type: "course:update", courseId: course!.id, name: course!.name, description: course!.description, color })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const iloId = active.id as number
    const targetCloId = over.id === "course-level" ? null : (over.id as number)
    send({ type: "ilo_clo_mapping:add", iloId, courseId: course!.id, cloId: targetCloId })
  }

  return (
    <div className="space-y-6">
      {/* ── Course header ─────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* Action row */}
        <div className="flex items-center justify-end gap-2">
          <ColorPicker value={course.color} onChange={handleColorChange} shape="square" />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete course "{course.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all {courseClos.length} CLO{courseClos.length !== 1 ? "s" : ""} in this course and their mappings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => send({ type: "course:delete", courseId: course.id })}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Title and description */}
        <div>
          {editingField === "name" ? (
            <Input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="text-2xl font-bold h-auto border-0 shadow-none focus-visible:ring-0 px-1"
              autoFocus
              onBlur={handleSave}
              onKeyDown={e => {
                if (e.key === "Enter") handleSave()
                if (e.key === "Escape") setEditingField(null)
              }}
            />
          ) : (
            <h1
              role="button"
              tabIndex={0}
              className="text-2xl font-bold cursor-pointer rounded px-1 hover:bg-muted/50"
              onClick={() => handleStartEdit("name", course.name)}
            >
              {course.name}
            </h1>
          )}

          {editingField === "description" ? (
            <Input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="mt-1 text-sm text-muted-foreground"
              autoFocus
              onBlur={handleSave}
              onKeyDown={e => {
                if (e.key === "Enter") handleSave()
                if (e.key === "Escape") setEditingField(null)
              }}
            />
          ) : (
            <p
              role="button"
              tabIndex={0}
              className="mt-1 text-sm text-muted-foreground cursor-pointer rounded px-1 hover:bg-muted/50"
              onClick={() => handleStartEdit("description", course.description || "")}
            >
              {course.description || <span className="italic opacity-50">A brief description of this course</span>}
            </p>
          )}
        </div>
      </div>

      {/* ── DnD context ───────────────────────────────────────────────────── */}
      <DndContext
        onDragStart={({ active }) => setActiveIloId(active.id as number)}
        onDragEnd={e => { handleDragEnd(e); setActiveIloId(null) }}
        onDragCancel={() => setActiveIloId(null)}
      >
        <div className="space-y-4">
          {/* Course-level (unlinked) ILOs */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground px-1">
              ILOs without CLOs
            </h3>
            <CourseLevelDropZone isEmpty={unlinkedIlos.length === 0}>
              <div className="py-1">
                {unlinkedIlos.map(ilo => (
                  <DraggableIloRow key={ilo.id} ilo={ilo} />
                ))}
              </div>
            </CourseLevelDropZone>
          </div>

          {/* One CloSection per CLO */}
          {courseClos.length > 0 && (
            <div className="space-y-3">
              {courseClos.map(clo => (
                <CloSection
                  key={clo.id}
                  clo={clo}
                  ilos={ilosByCloId.get(clo.id) ?? []}
                  onDelete={() => send({ type: "clo:delete", id: clo.id })}
                />
              ))}
            </div>
          )}

          {/* Add CLO */}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed text-muted-foreground hover:text-foreground"
            onClick={() => setCloDialogOpen(true)}
          >
            <Plus className="size-4 mr-1" />
            Add CLO
          </Button>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeIlo && (
            <div className="rounded-md border bg-background shadow-lg px-3 py-2 text-sm font-medium opacity-90 max-w-xs truncate">
              {activeIlo.description || <span className="italic opacity-50">No description</span>}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* CLO form dialog */}
      <CloFormDialog
        open={cloDialogOpen}
        onOpenChange={open => setCloDialogOpen(open)}
        initialData={{ courseId }}
        onSubmit={data => {
          send({ type: "clo:add", ...data })
          setCloDialogOpen(false)
        }}
      />
    </div>
  )
}
