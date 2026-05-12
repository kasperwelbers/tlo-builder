import { useState } from "react"
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { BloomSelect } from "@/components/ui/bloom-select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { IloItem } from "@/components/tlos/IloItem"
import { useApp } from "@/context/AppContext"
import { CloLinkTloDialog } from "./CloLinkTloDialog"
import { cn } from "@/lib/utils"
import type { Clo, Ilo } from "@/lib/types"

interface Props {
  clo: Clo
  ilos: Ilo[]
  onDelete: () => void
}

// Internal draggable wrapper for ILO rows inside a CLO section
function DraggableIlo({ ilo }: { ilo: Ilo }) {
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

export function CloSection({ clo, ilos, onDelete }: Props) {
  const { send } = useApp()
  const { isOver, setNodeRef } = useDroppable({ id: clo.id })

  const [collapsed, setCollapsed] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [editValue, setEditValue] = useState("")

  // Bloom level background -- same palette as TLO sections
  const bgClass =
    clo.bloomLevel?.startsWith("C") ? "bg-blue-50" :
    clo.bloomLevel?.startsWith("A") ? "bg-green-50" :
    clo.bloomLevel?.startsWith("P") ? "bg-amber-50" : ""

  function startEditDesc() {
    setEditValue(clo.description)
    setEditingDesc(true)
  }

  function saveDesc() {
    const trimmed = editValue.trim()
    if (trimmed !== clo.description) {
      send({ type: "clo:update", id: clo.id, courseId: clo.courseId, description: trimmed, bloomLevel: clo.bloomLevel ?? null })
    }
    setEditingDesc(false)
  }

  function handleBloomChange(val: string) {
    send({ type: "clo:update", id: clo.id, courseId: clo.courseId, description: clo.description, bloomLevel: val || null })
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border bg-card overflow-hidden transition-all",
        isOver && "ring-2 ring-primary/50 ring-offset-1"
      )}
    >
      {/* CLO header */}
      <div
        className={cn("px-4 py-3 group", bgClass)}
      >
        <div className="flex items-center gap-2">
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="shrink-0 p-1.5 -m-1.5 rounded hover:bg-black/5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronDown className={cn("size-3.5 transition-transform", collapsed && "-rotate-90")} />
          </button>

          {/* Description - left side, takes remaining space */}
          <div className="flex-1 min-w-0">
            {editingDesc ? (
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="text-xs font-medium bg-white/60 h-7 py-0"
                autoFocus
                onBlur={saveDesc}
                onKeyDown={e => {
                  if (e.key === "Enter") saveDesc()
                  if (e.key === "Escape") setEditingDesc(false)
                }}
              />
            ) : (
              <p
                role="button"
                tabIndex={0}
                className="text-xs font-medium leading-snug cursor-pointer rounded px-1 -mx-1 hover:bg-black/5 line-clamp-2"
                onClick={startEditDesc}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") startEditDesc() }}
              >
                {clo.description || <span className="italic opacity-40">The student can…</span>}
              </p>
            )}
          </div>

          {/* Bloom select + delete - right side */}
          <div className="flex items-center gap-1 shrink-0">
            <BloomSelect value={clo.bloomLevel ?? ""} onValueChange={handleBloomChange} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-black/5"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete CLO?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this CLO and remove all its ILO mappings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* ILO list */}
      {!collapsed && (ilos.length > 0 ? (
        <>
          <Separator />
          <div className="py-1">
            {ilos.map(ilo => (
              <DraggableIlo key={ilo.id} ilo={ilo} />
            ))}
          </div>
        </>
      ) : (
        <div
          className={cn(
            "px-4 py-3 text-xs text-muted-foreground italic text-center transition-colors",
            isOver && "text-primary"
          )}
        >
          {/*Drop ILOs here*/}
        </div>
      ))}
      {/* Link to TLO button */}
      {!collapsed && (
        <div className="flex flex-wrap gap-2 px-3 pb-3 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setLinkOpen(true)}
          >
            <Plus className="mr-1 size-3.5" /> Link or Create ILO
          </Button>
        </div>
      )}

      <CloLinkTloDialog open={linkOpen} onOpenChange={setLinkOpen} clo={clo} />
    </div>
  )
}
