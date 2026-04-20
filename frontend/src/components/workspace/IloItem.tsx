import { useState } from "react"
import { Trash2, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BloomSelect } from "@/components/ui/bloom-select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { OrderBadge } from "@/components/ui/order-badge"
import { IloLinkDialog } from "./IloLinkDialog"
import { useApp } from "@/context/AppContext"
import { useNav } from "@/context/NavigationContext"
import type { Ilo } from "@/lib/types"

interface IloItemProps {
  ilo: Ilo
  onDelete: () => void
}

export function IloItem({ ilo, onDelete }: IloItemProps) {
  const { state, send } = useApp()
  const { navigateTo } = useNav()
  const [editingField, setEditingField] = useState<"description" | null>(null)
  const [editValue, setEditValue] = useState("")
  const [linkOpen, setLinkOpen] = useState(false)

  const courseById = new Map(state.courses.map(c => [c.id, c]))
  const sortedCourses = [...state.courses].sort((a, b) => a.name.localeCompare(b.name))
  const courseOrderNum = new Map(sortedCourses.map((c, i) => [c.id, i + 1]))
  const cloById = new Map(state.clos.map(c => [c.id, c]))
  const mappings = state.iloCloMappings.filter(m => m.iloId === ilo.id)

  function handleStartEdit(value: string) {
    setEditingField("description")
    setEditValue(value)
  }

  function handleSave() {
    if (!editingField) return
    if (editValue !== (ilo.description || "")) {
      send({
        type: "ilo:update",
        id: ilo.id,
        description: editValue,
        bloomLevel: ilo.bloomLevel,
        tloId: ilo.tloId,
      })
    }
    setEditingField(null)
  }

  function handleBloomChange(val: string) {
    send({
      type: "ilo:update",
      id: ilo.id,
      description: ilo.description,
      bloomLevel: val || null,
      tloId: ilo.tloId,
    })
  }

  return (
    <>
      <div className="flex items-start gap-3 rounded-md px-3 py-1.5 hover:bg-muted/50 group w-full">
        {/* Description */}
        <div className="flex-1 min-w-0">
          {editingField === "description" ? (
            <Input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="h-6 text-xs w-full"
              autoFocus
              onBlur={handleSave}
              onKeyDown={e => {
                if (e.key === "Enter") handleSave()
                if (e.key === "Escape") setEditingField(null)
              }}
            />
          ) : (
            <div
              role="button"
              tabIndex={0}
              className="text-xs font-medium cursor-pointer px-1 py-0.5 rounded hover:bg-muted line-clamp-2"
              onClick={() => handleStartEdit(ilo.description || "")}
              onKeyDown={e => { if (e.key === "Enter") handleStartEdit(ilo.description || "") }}
            >
              {ilo.description || <span className="italic opacity-50 font-normal">No description</span>}
            </div>
          )}
        </div>

        {/* Right side: bloom + course dots + link button + delete */}
        <div className="shrink-0 flex items-center gap-1.5">
          <BloomSelect value={ilo.bloomLevel || ""} onValueChange={handleBloomChange} />
          {/* One colored badge per linked course */}
          {mappings.map(m => {
            const course = courseById.get(m.courseId)
            if (!course) return null
            const clo = m.cloId != null ? cloById.get(m.cloId) : null
            return (
              <Tooltip key={m.courseId}>
                <TooltipTrigger asChild>
                  <button
                    className="shrink-0 rounded-sm ring-offset-background hover:ring-2 hover:ring-ring hover:ring-offset-1 transition-all focus:outline-none"
                    onClick={() => navigateTo({ type: "course", id: course.id })}
                    aria-label={"Go to " + course.name}
                  >
                    <OrderBadge num={courseOrderNum.get(course.id) ?? 0} color={course.color} shape="square" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-52">
                  <p className="font-medium text-xs">{course.name}</p>
                  {clo
                    ? <p className="text-xs opacity-75 leading-snug">{clo.description}</p>
                    : <p className="text-xs opacity-60 italic">Course level</p>
                  }
                </TooltipContent>
              </Tooltip>
            )
          })}

          {/* Link button -- opens link dialog */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setLinkOpen(true)}
              >
                <Link2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Manage links</TooltipContent>
          </Tooltip>

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete ILO?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this ILO and remove all its mappings.
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

      {/* Link dialog rendered outside the row to avoid event conflicts */}
      <IloLinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        ilo={ilo}
        clos={state.clos}
      />
    </>
  )
}
