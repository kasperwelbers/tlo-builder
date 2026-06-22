import { useState } from "react"
import { Trash2, Link2, MessageSquare, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BloomSelect } from "@/components/ui/bloom-select"
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { OrderBadge } from "@/components/ui/order-badge"
import { IloLinkDialog } from "./IloLinkDialog"
import { IloMoveTloDialog } from "./IloMoveTloDialog"
import { useApp } from "@/context/AppContext"
import { useNav } from "@/context/NavigationContext"
import { cn } from "@/lib/utils"
import type { Ilo } from "@/lib/types"

interface IloItemProps {
  ilo: Ilo
  onDelete: () => void
  variant?: "trajectory" | "course"
  onOpenComments?: () => void
}

export function IloItem({
  ilo,
  onDelete,
  variant = "trajectory",
  onOpenComments,
}: IloItemProps) {
  const { state, send } = useApp()
  const { navigateTo } = useNav()
  const [editingField, setEditingField] = useState<"description" | null>(null)
  const [editValue, setEditValue] = useState("")
  const [linkOpen, setLinkOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)

  const courseById = new Map(state.courses.map((c) => [c.id, c]))
  const sortedCourses = [...state.courses].sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true })
  )
  const courseOrderNum = new Map(sortedCourses.map((c, i) => [c.id, i + 1]))
  const currentIloById = new Map(state.currentIlos.map((c) => [c.id, c]))
  const mappings = state.iloCurrentIloMappings.filter((m) => m.iloId === ilo.id)
  const iloCommentCount = state.comments.filter(
    (c) => c.iloId === ilo.id && c.status !== "done"
  ).length

  const tloById = new Map(state.tlos.map((t) => [t.id, t]))
  const trajectoryById = new Map(state.trajectories.map((t) => [t.id, t]))
  const sortedTrajectories = [...state.trajectories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })
  )
  const trajectoryOrderLabel = new Map(
    sortedTrajectories.map((t, i) => [t.id, String.fromCharCode(65 + i)])
  )

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
      <div className="group flex w-full items-center gap-3 rounded-md px-3 py-1.5 hover:bg-muted/50">
        {/* Bloom level */}
        <div className="shrink-0">
          <BloomSelect
            value={ilo.bloomLevel || ""}
            onValueChange={handleBloomChange}
          />
        </div>

        {/* Description */}
        <div className="min-w-0 flex-1">
          {editingField === "description" ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-6 w-full text-xs"
              autoFocus
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
                if (e.key === "Escape") setEditingField(null)
              }}
            />
          ) : (
            <div
              role="button"
              tabIndex={0}
              className="line-clamp-2 cursor-pointer rounded px-1 py-0.5 text-xs font-medium hover:bg-muted"
              onClick={() => handleStartEdit(ilo.description || "")}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleStartEdit(ilo.description || "")
              }}
            >
              {ilo.description || (
                <span className="font-normal italic opacity-50">
                  The student can…
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side: delete (hover) | badges | link */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Delete (hover only) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete ILO?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this ILO and remove all its
                  mappings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Move button — trajectory only */}
          {variant === "trajectory" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setMoveOpen(true)}
                >
                  <Move className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Move to another TLO</TooltipContent>
            </Tooltip>
          )}

          {/* Comment button */}
          <button
            className={cn(
              "flex items-center gap-0.5 rounded px-1 py-0.5 text-muted-foreground transition-colors hover:bg-muted",
              iloCommentCount === 0 && "opacity-0 group-hover:opacity-100"
            )}
            onClick={() => onOpenComments?.()}
            title="Comments"
          >
            <MessageSquare className="size-3" />
            {iloCommentCount > 0 && (
              <span className="text-xs leading-none">{iloCommentCount}</span>
            )}
          </button>
          {/* Badge: TLO (circle) on course page, course (square) on trajectory page */}
          {variant === "course"
            ? (() => {
                const tlo = ilo.tloId != null ? tloById.get(ilo.tloId) : null
                const trajectory = tlo
                  ? trajectoryById.get(tlo.trajectoryId)
                  : null
                if (!tlo || !trajectory) return null
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="shrink-0 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1 focus:outline-none"
                        onClick={() =>
                          navigateTo({ type: "trajectory", id: trajectory.id })
                        }
                        aria-label={"Go to " + trajectory.name}
                      >
                        <OrderBadge
                          label={trajectoryOrderLabel.get(trajectory.id) ?? "?"}
                          color={trajectory.color}
                          shape="circle"
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-52">
                      <p className="text-xs font-medium">{trajectory.name}</p>
                      <p className="text-xs leading-snug opacity-75">
                        {tlo.name}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )
              })()
            : mappings.map((m) => {
                const course = courseById.get(m.courseId)
                if (!course) return null
                const currentIlo =
                  m.currentIloId != null
                    ? currentIloById.get(m.currentIloId)
                    : null
                return (
                  <Tooltip key={m.courseId}>
                    <TooltipTrigger asChild>
                      <button
                        className="shrink-0 rounded-sm ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1 focus:outline-none"
                        onClick={() =>
                          navigateTo({ type: "course", id: course.id })
                        }
                        aria-label={"Go to " + course.code}
                      >
                        <OrderBadge
                          label={String(courseOrderNum.get(course.id) ?? 0)}
                          color={course.color}
                          shape="square"
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-52">
                      <p className="text-xs font-medium">
                        {course.code}
                        {course.name ? `: ${course.name}` : ""}
                      </p>
                      {currentIlo ? (
                        <p className="text-xs leading-snug opacity-75">
                          {currentIlo.description}
                        </p>
                      ) : (
                        <p className="text-xs italic opacity-60">
                          Course level
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )
              })}

          {/* Link button — workspace only */}
          {variant === "trajectory" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setLinkOpen(true)}
                >
                  <Link2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Manage links</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Move dialog — trajectory only */}
      {variant === "trajectory" && (
        <IloMoveTloDialog
          open={moveOpen}
          onOpenChange={setMoveOpen}
          ilo={ilo}
        />
      )}

      {/* Link dialog — workspace only */}
      {variant === "trajectory" && (
        <IloLinkDialog
          open={linkOpen}
          onOpenChange={setLinkOpen}
          ilo={ilo}
          currentIlos={state.currentIlos}
        />
      )}
    </>
  )
}
