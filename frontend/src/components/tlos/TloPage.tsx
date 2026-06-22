import { useMemo, useState } from "react"
import { HelpCircle, MessageSquare, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { TloSection } from "./TloSection"
import { TloFormDialog } from "@/components/tlos/TloFormDialog"
import { CommentsPanel } from "@/components/CommentsPanel"
import { useApp } from "@/context/AppContext"
import { useHelp } from "@/context/HelpContext"
import type { Tlo } from "@/lib/types"
import { bloomSortKey } from "@/lib/bloomLevels"

interface Props {
  trajectoryId: number
}

export function TrajectoryPage({ trajectoryId }: Props) {
  const { state, send } = useApp()

  const trajectory = state.trajectories.find((t) => t.id === trajectoryId)
  const tlosForTrajectory = useMemo(
    () =>
      [...state.tlos]
        .filter((t) => t.trajectoryId === trajectoryId)
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        ),
    [state.tlos, trajectoryId]
  )
  const trajectories = useMemo(
    () =>
      [...state.trajectories].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      ),
    [state.trajectories]
  )

  const { openHelp } = useHelp()

  const [editingField, setEditingField] = useState<
    "name" | "description" | null
  >(null)
  const [editValue, setEditValue] = useState("")
  const [addTloOpen, setAddTloOpen] = useState(false)
  const [editTlo, setEditTlo] = useState<Tlo | null>(null)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentsFocusTloId, setCommentsFocusTloId] = useState<number | null>(
    null
  )
  const [commentsFocusIloId, setCommentsFocusIloId] = useState<number | null>(
    null
  )

  function openComments(tloId?: number, iloId?: number) {
    setCommentsFocusTloId(tloId ?? null)
    setCommentsFocusIloId(iloId ?? null)
    setCommentsOpen(true)
  }

  const iloById = useMemo(
    () => new Map(state.ilos.map((i) => [i.id, i])),
    [state.ilos]
  )

  if (!trajectory) return null

  function handleStartEdit(field: "name" | "description", value: string) {
    setEditingField(field)
    setEditValue(value)
  }

  function handleSave() {
    if (!editingField) return
    send({
      type: "trajectory:update",
      trajectoryId: trajectory!.id,
      name: editingField === "name" ? editValue : trajectory!.name,
      description:
        editingField === "description" ? editValue : trajectory!.description,
      color: trajectory!.color,
    })
    setEditingField(null)
  }

  function handleColorChange(color: string) {
    send({
      type: "trajectory:update",
      trajectoryId: trajectory!.id,
      name: trajectory!.name,
      description: trajectory!.description,
      color,
    })
  }

  return (
    <div className="">
      <div className="flex items-center gap-3">
        <h2 className="pl-1 font-bold text-foreground/60">Trajectory</h2>
        {/* Comments button */}
        {(() => {
          const count = state.comments.filter(
            (c) =>
              c.context === "trajectory" &&
              c.contextId === trajectory.id &&
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
          onClick={() => openHelp("trajectories")}
          aria-label="Help: trajectory page"
        >
          <HelpCircle className="size-4" />
        </Button>

        {/* Action row */}
        <div className="flex items-center justify-end gap-2">
          <ColorPicker value={trajectory.color} onChange={handleColorChange} />

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
                <AlertDialogTitle>Delete trajectory?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete <strong>{trajectory.name}</strong> and all{" "}
                  {tlosForTrajectory.length} TLO
                  {tlosForTrajectory.length !== 1 ? "s" : ""} inside it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    send({
                      type: "trajectory:delete",
                      trajectoryId: trajectory.id,
                    })
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {/* Trajectory header */}
      <div className="space-y-6 pt-1">
        {/* Title and description */}
        <div>
          {editingField === "name" ? (
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
              onClick={() => handleStartEdit("name", trajectory.name)}
            >
              {trajectory.name}
            </h1>
          )}

          {editingField === "description" ? (
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
              onClick={() =>
                handleStartEdit("description", trajectory.description || "")
              }
            >
              {trajectory.description || (
                <span className="italic opacity-50">
                  A brief description of this trajectory
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* TLO list */}
      <div className="space-y-4 pt-6">
        {tlosForTrajectory.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              No TLOs yet in this trajectory.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setEditTlo(null)
                setAddTloOpen(true)
              }}
            >
              <Plus className="mr-1.5 size-4" /> Add your first TLO
            </Button>
          </div>
        ) : (
          <>
            {tlosForTrajectory.map((tlo) => (
              <TloSection
                key={tlo.id}
                tlo={tlo}
                ilos={state.ilos
                  .filter((i) => i.tloId === tlo.id)
                  .sort(
                    (a, b) =>
                      bloomSortKey(a.bloomLevel) - bloomSortKey(b.bloomLevel)
                  )}
                currentIlos={state.currentIlos}
                onEdit={() => {
                  setEditTlo(tlo)
                  setAddTloOpen(true)
                }}
                onDelete={() => send({ type: "tlo:delete", id: tlo.id })}
                onOpenComments={(opts) => openComments(opts.tloId, opts.iloId)}
              />
            ))}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditTlo(null)
                  setAddTloOpen(true)
                }}
                size="sm"
              >
                <Plus className="mr-1.5 size-4" /> Add TLO
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Add / edit TLO dialog */}
      <TloFormDialog
        open={addTloOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddTloOpen(false)
            setEditTlo(null)
          }
        }}
        initialData={editTlo ?? { trajectoryId }}
        onSubmit={(data) => {
          if (editTlo) {
            send({ type: "tlo:update", id: editTlo.id, ...data })
          } else {
            send({ type: "tlo:add", ...data })
          }
          setEditTlo(null)
        }}
      />
      <CommentsPanel
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        context="trajectory"
        contextId={trajectory.id}
        focusTloId={commentsFocusTloId}
        focusIloId={commentsFocusIloId}
      />
    </div>
  )
}
