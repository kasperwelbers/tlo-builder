import { useState } from "react"
import {
  ChevronDown,
  GripVertical,
  Link2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useDroppable, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { IloItem } from "@/components/tlos/IloItem"
import { useApp } from "@/context/AppContext"
import { CurrentIloLinkTloDialog } from "./CurrentIloLinkTloDialog"
import { bloomBadgeClass } from "@/lib/bloomColors"
import { cn } from "@/lib/utils"
import type { CurrentIlo, Ilo } from "@/lib/types"

const BLOOM_LEVELS = [
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "A1",
  "A2",
  "A3",
  "A4",
  "A5",
  "P1",
  "P2",
  "P3",
  "P4",
  "P5",
]

interface Props {
  currentIlo: CurrentIlo
  ilos: Ilo[]
  onDelete: () => void
}

// Internal draggable wrapper for ILO rows inside a Current ILO section
function DraggableIlo({ ilo }: { ilo: Ilo }) {
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
        />
      </div>
    </div>
  )
}

export function IloSection({ currentIlo, ilos, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: currentIlo.id })
  const { send, state } = useApp()

  const [collapsed, setCollapsed] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editDescription, setEditDescription] = useState("")
  const [editBloom, setEditBloom] = useState("")

  function openEdit() {
    setEditDescription(currentIlo.description)
    setEditBloom(currentIlo.bloomLevel ?? "")
    setEditOpen(true)
  }

  function handleEditSave() {
    send({
      type: "current_ilo:update",
      id: currentIlo.id,
      description: editDescription.trim(),
      bloomLevel: editBloom || null,
    })
    setEditOpen(false)
  }

  // TLOs grouped by trajectory for the "New ILO" popover
  const trajectoryGroups = [...state.trajectories]
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map((traj) => ({
      trajectory: traj,
      tlos: state.tlos.filter((t) => t.trajectoryId === traj.id),
    }))
    .filter((g) => g.tlos.length > 0)

  function handleCreateIlo(tloId: number) {
    send({
      type: "ilo:create",
      tloId,
      description: "",
      bloomLevel: null,
      currentIloId: currentIlo.id,
      courseId: currentIlo.courseId,
    })
  }

  // Bloom level background -- same palette as TLO sections
  const bgClass = currentIlo.bloomLevel?.startsWith("C")
    ? "bg-blue-50"
    : currentIlo.bloomLevel?.startsWith("A")
      ? "bg-green-50"
      : currentIlo.bloomLevel?.startsWith("P")
        ? "bg-amber-50"
        : ""

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "overflow-hidden rounded-lg border bg-card transition-all",
        isOver && "ring-2 ring-primary/50 ring-offset-1"
      )}
    >
      {/* Current ILO header */}
      <div className={cn("group px-4 py-3", bgClass)}>
        <div className="flex items-center gap-2">
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="-m-1.5 shrink-0 rounded p-1.5 text-muted-foreground/60 transition-colors hover:bg-black/5 hover:text-muted-foreground"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                collapsed && "-rotate-90"
              )}
            />
          </button>

          {/* Description - read-only, left side */}
          <p className="line-clamp-2 min-w-0 flex-1 text-xs leading-snug font-medium">
            {currentIlo.description || (
              <span className="italic opacity-40">The student can…</span>
            )}
          </p>

          {/* Bloom badge + edit button - right side */}
          <div className="flex shrink-0 items-center gap-1">
            {currentIlo.bloomLevel && (
              <span
                className={cn(
                  "rounded-full border px-1.5 py-0.5 font-mono text-xs",
                  bloomBadgeClass(currentIlo.bloomLevel)
                )}
              >
                {currentIlo.bloomLevel}
              </span>
            )}
            <button
              onClick={openEdit}
              className="rounded p-1 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/40 hover:!text-muted-foreground"
              title="Edit course objective"
            >
              <Pencil className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ILO list */}
      {!collapsed &&
        (ilos.length > 0 ? (
          <>
            <Separator />
            <div className="py-1">
              {ilos.map((ilo) => (
                <DraggableIlo key={ilo.id} ilo={ilo} />
              ))}
            </div>
          </>
        ) : (
          <div
            className={cn(
              "px-4 py-3 text-center text-xs text-muted-foreground italic transition-colors",
              isOver && "text-primary"
            )}
          >
            {/*Drop ILOs here*/}
          </div>
        ))}

      {/* Action buttons */}
      {!collapsed && (
        <div className="flex flex-wrap gap-2 px-3 pt-1 pb-3">
          {/* Existing ILO — opens the link dialog */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setLinkOpen(true)}
          >
            <Link2 className="mr-1 size-3.5" /> Existing ILO
          </Button>

          {/* New ILO — dropdown with TLO list */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none">
              <Plus className="size-3.5" /> New ILO
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-72 w-64 overflow-y-auto"
            >
              {trajectoryGroups.length === 0 ? (
                <DropdownMenuItem disabled>
                  No trajectories yet.
                </DropdownMenuItem>
              ) : (
                trajectoryGroups.map(({ trajectory, tlos }) => (
                  <div key={trajectory.id}>
                    <DropdownMenuLabel className="flex items-center gap-2 py-1.5">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: trajectory.color }}
                      />
                      <span className="text-xs">{trajectory.name}</span>
                    </DropdownMenuLabel>
                    {tlos.map((tlo) => (
                      <DropdownMenuItem
                        key={tlo.id}
                        onSelect={() => handleCreateIlo(tlo.id)}
                        className="pl-6 text-xs"
                      >
                        {tlo.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <CurrentIloLinkTloDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        currentIlo={currentIlo}
      />

      {/* Edit course objective dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit course objective</DialogTitle>
            <DialogDescription className="space-y-2 text-xs">
              <span className="bg-amber-20 bg- block rounded-md border border-amber-600 px-3 py-2 text-amber-600">
                <strong>Warning</strong> — Do not use this to update the old
                course objectives to better match the TLOs. The old course
                objectives are only meant to be used as a starting point for
                creating the new ILOs. Only change it in case of mistakes, or if
                you think it helps you better organize the new ILOs.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-1">
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="min-h-[100px] text-sm"
              placeholder="The student can…"
            />
            <div className="flex items-center gap-3">
              <span className="text-sm whitespace-nowrap text-muted-foreground">
                Bloom level
              </span>
              <Select
                value={editBloom || "none"}
                onValueChange={(v) => setEditBloom(v === "none" ? "" : v)}
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    None
                  </SelectItem>
                  {BLOOM_LEVELS.map((l) => (
                    <SelectItem key={l} value={l} className="text-xs">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEditSave}
              disabled={!editDescription.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
