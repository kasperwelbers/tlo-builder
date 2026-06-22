import { useState } from "react"
import {
  ChevronDown,
  GraduationCap,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BloomSelect } from "@/components/ui/bloom-select"
import { Separator } from "@/components/ui/separator"
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
import { IloItem } from "./IloItem"
import { CreateIloDialog } from "./CreateIloDialog"
import { TloEqLinkDialog } from "./TloEqLinkDialog"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import type { CurrentIlo, Ilo, Tlo } from "@/lib/types"

interface TloSectionProps {
  tlo: Tlo
  ilos: Ilo[]
  currentIlos: CurrentIlo[]
  onEdit: () => void
  onDelete: () => void
  onOpenComments?: (opts: { tloId?: number; iloId?: number }) => void
}

// (IloDropZone removed — drag-and-drop replaced by Move dialog)

export function TloSection({
  tlo,
  ilos,
  currentIlos,
  onEdit,
  onDelete,
  onOpenComments,
}: TloSectionProps) {
  const { send, state } = useApp()
  const tloCommentCount = state.comments.filter(
    (c) =>
      c.context === "trajectory" &&
      c.contextId === tlo.trajectoryId &&
      c.tloId === tlo.id &&
      !c.iloId &&
      c.status !== "done"
  ).length

  const linkedEq =
    tlo.eqId != null
      ? (state.exitQualifications?.find((e) => e.id === tlo.eqId) ?? null)
      : null

  const [collapsed, setCollapsed] = useState(true)
  const [createFromCloOpen, setCreateFromCloOpen] = useState(false)
  const [eqLinkOpen, setEqLinkOpen] = useState(false)

  const [editingField, setEditingField] = useState<
    "name" | "description" | null
  >(null)
  const [editValue, setEditValue] = useState("")

  function handleStartEdit(field: "name" | "description", value: string) {
    setEditingField(field)
    setEditValue(value)
  }

  function handleSave() {
    if (!editingField) return
    const unchanged =
      (editingField === "name" && editValue === tlo.name) ||
      (editingField === "description" && editValue === (tlo.description || ""))
    if (!unchanged) {
      send({
        type: "tlo:update",
        id: tlo.id,
        trajectoryId: tlo.trajectoryId,
        name: editingField === "name" ? editValue : tlo.name,
        description:
          editingField === "description" ? editValue : tlo.description,
        bloomLevel: tlo.bloomLevel,
        eqId: tlo.eqId ?? null,
      })
    }
    setEditingField(null)
  }

  function handleBloomChange(val: string) {
    send({
      type: "tlo:update",
      id: tlo.id,
      trajectoryId: tlo.trajectoryId,
      name: tlo.name,
      description: tlo.description,
      bloomLevel: val || null,
      eqId: tlo.eqId ?? null,
    })
  }

  const bgClass = tlo.bloomLevel?.startsWith("C")
    ? "bg-blue-50"
    : tlo.bloomLevel?.startsWith("A")
      ? "bg-green-50"
      : tlo.bloomLevel?.startsWith("P")
        ? "bg-amber-50"
        : "bg-muted/50"

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* TLO header */}
      <div className={"group px-4 py-3 " + bgClass}>
        {/* Row 1: collapse toggle + name + bloom select + delete button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="-m-1.5 shrink-0 rounded p-1.5 text-muted-foreground/60 transition-colors hover:bg-black/5 hover:text-muted-foreground"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                collapsed && "-rotate-90"
              )}
            />
          </button>

          <div className="min-w-0 flex-1">
            {editingField === "name" ? (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-7 bg-white/60 py-0 text-base font-semibold"
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
                className="cursor-pointer rounded px-1 text-base font-semibold hover:bg-black/5"
                onClick={() => handleStartEdit("name", tlo.name)}
              >
                {tlo.name}
              </span>
            )}
          </div>

          <div className="shrink-0">
            <BloomSelect
              value={tlo.bloomLevel || ""}
              onValueChange={handleBloomChange}
            />
          </div>

          {/* EQ link */}
          <button
            className={cn(
              "flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-black/5",
              linkedEq
                ? "text-foreground/70"
                : "text-muted-foreground opacity-0 group-hover:opacity-100"
            )}
            onClick={() => setEqLinkOpen(true)}
            title={
              linkedEq ? `EQ: ${linkedEq.name}` : "Link to Exit Qualification"
            }
          >
            <GraduationCap className="size-3.5 shrink-0" />
          </button>

          <button
            className={cn(
              "flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-muted-foreground transition-colors hover:bg-black/5",
              tloCommentCount === 0 && "opacity-0 group-hover:opacity-100"
            )}
            onClick={() => onOpenComments?.({ tloId: tlo.id })}
            title="Comments"
          >
            <MessageSquare className="size-3.5" />
            {tloCommentCount > 0 && (
              <span className="text-xs">{tloCommentCount}</span>
            )}
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-destructive opacity-0 group-hover:opacity-100 hover:bg-black/5"
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete TLO?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{tlo.name}</strong> and
                  all its ILO mappings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Row 2: editable description */}
        <div className="mt-1">
          {editingField === "description" ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-7 bg-white/60 py-0 text-sm"
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
              className="cursor-pointer rounded px-1 text-sm text-black/70 hover:bg-black/5"
              onClick={() =>
                handleStartEdit("description", tlo.description || "")
              }
            >
              {tlo.description || (
                <span className="italic opacity-40">The student can…</span>
              )}
            </div>
          )}
        </div>
      </div>

      {!collapsed && (
        <div>
          {/* ILOs */}
          {ilos.length > 0 && (
            <>
              <Separator />
              <div className="py-1">
                {ilos.map((ilo) => (
                  <IloItem
                    key={ilo.id}
                    ilo={ilo}
                    onDelete={() => send({ type: "ilo:delete", id: ilo.id })}
                    onOpenComments={() =>
                      onOpenComments?.({ tloId: tlo.id, iloId: ilo.id })
                    }
                  />
                ))}
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-2 px-3 pt-1 pb-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() =>
                send({
                  type: "ilo:create",
                  tloId: tlo.id,
                  description: "",
                  bloomLevel: null,
                })
              }
            >
              <Plus className="mr-1 size-3.5" /> New ILO
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setCreateFromCloOpen(true)}
            >
              <Plus className="mr-1 size-3.5" /> New ILO from current course
              objectives
            </Button>
          </div>
        </div>
      )}

      {/* Create ILO from CLO */}
      <CreateIloDialog
        open={createFromCloOpen}
        onOpenChange={setCreateFromCloOpen}
        tlo={tlo}
        currentIlos={currentIlos}
      />
      <TloEqLinkDialog
        open={eqLinkOpen}
        onOpenChange={setEqLinkOpen}
        tlo={tlo}
      />
    </div>
  )
}
