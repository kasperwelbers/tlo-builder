import { useState } from "react"
import { Plus, Trash2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { useApp } from "@/context/AppContext"
import { useNav } from "@/context/NavigationContext"
import { bloomBadgeClass } from "@/lib/bloomColors"
import { cn } from "@/lib/utils"
import type { ExitQualification, Tlo, Trajectory } from "@/lib/types"
import { EqLinkTloDialog } from "./EqLinkTloDialog"

// ---------------------------------------------------------------------------
// EqCard
// ---------------------------------------------------------------------------

interface EqCardProps {
  eq: ExitQualification
  linkedTlos: Tlo[]
  trajectoryById: Map<number, Trajectory>
  onLinkTlo: () => void
  onNavigate: (trajectoryId: number) => void
}

function EqCard({
  eq,
  linkedTlos,
  trajectoryById,
  onLinkTlo,
  onNavigate,
}: EqCardProps) {
  const { send } = useApp()
  const [editingField, setEditingField] = useState<
    "name" | "description" | null
  >(null)
  const [editValue, setEditValue] = useState("")

  function startEdit(field: "name" | "description", value: string) {
    setEditingField(field)
    setEditValue(value)
  }

  function handleSave() {
    if (!editingField) return
    send({
      type: "eq:update",
      id: eq.id,
      name: editingField === "name" ? editValue : eq.name,
      description: editingField === "description" ? editValue : eq.description,
    })
    setEditingField(null)
  }

  function handleCancel() {
    setEditingField(null)
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* Header */}
      <div className="group flex items-start gap-2 bg-muted/40 px-4 py-3">
        <div className="flex-1 space-y-1">
          {/* Name */}
          {editingField === "name" ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-7 text-base font-semibold"
              autoFocus
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSave()
                }
                if (e.key === "Escape") {
                  e.preventDefault()
                  handleCancel()
                }
              }}
            />
          ) : (
            <span
              role="button"
              className="cursor-pointer rounded px-1 text-base font-semibold hover:bg-black/5"
              onClick={() => startEdit("name", eq.name)}
            >
              {eq.name || <span className="italic opacity-40">Untitled</span>}
            </span>
          )}

          {/* Description */}
          {editingField === "description" ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-sm"
              rows={2}
              autoFocus
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) {
                  e.preventDefault()
                  handleSave()
                }
                if (e.key === "Escape") {
                  e.preventDefault()
                  handleCancel()
                }
              }}
            />
          ) : (
            <div
              role="button"
              className="cursor-pointer rounded px-1 text-sm text-muted-foreground hover:bg-black/5"
              onClick={() => startEdit("description", eq.description)}
            >
              {eq.description || (
                <span className="italic opacity-40">Add a description…</span>
              )}
            </div>
          )}
        </div>

        {/* Delete button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-destructive opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{eq.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                All linked TLOs will be unlinked. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => send({ type: "eq:delete", id: eq.id })}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Linked TLOs */}
      {linkedTlos.length > 0 && (
        <div className="space-y-0.5 border-t px-3 py-2">
          {linkedTlos.map((tlo) => (
            <button
              key={tlo.id}
              className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              onClick={() => onNavigate(tlo.trajectoryId)}
            >
              <GraduationCap className="size-3 shrink-0" />
              <span className="text-foreground/70">
                {trajectoryById.get(tlo.trajectoryId)?.name ?? "—"}
              </span>
              <span className="opacity-40">/</span>
              <span className="flex-1 text-left">{tlo.name}</span>
              {tlo.bloomLevel && (
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-xs",
                    bloomBadgeClass(tlo.bloomLevel)
                  )}
                >
                  {tlo.bloomLevel}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="border-t px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={onLinkTlo}
        >
          <Plus className="mr-1 size-3" /> Link TLO
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ExitQualificationsPage
// ---------------------------------------------------------------------------

export function ExitQualificationsPage() {
  const { state, send } = useApp()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [linkEqId, setLinkEqId] = useState<number | null>(null)

  const eqs = [...state.exitQualifications].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const { navigateTo } = useNav()

  const tlosByEqId = new Map<number, Tlo[]>()
  for (const tlo of state.tlos) {
    if (tlo.eqId != null) {
      const arr = tlosByEqId.get(tlo.eqId) ?? []
      arr.push(tlo)
      tlosByEqId.set(tlo.eqId, arr)
    }
  }

  const trajectoryById = new Map<number, Trajectory>(
    state.trajectories.map((t) => [t.id, t])
  )

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    send({ type: "eq:create", name, description: newDesc.trim() })
    setNewName("")
    setNewDesc("")
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <h2 className="pl-1 font-semibold text-foreground/60">
          Exit Qualifications
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCreating((v) => !v)}
        >
          <Plus className="mr-1 size-3.5" /> New EQ
        </Button>
      </div>

      {/* Create form */}
      {creating && (
        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-lg border p-4"
        >
          <Input
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            required
          />
          <Textarea
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreating(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!newName.trim()}>
              Create
            </Button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {eqs.length === 0 && !creating && (
        <p className="px-1 text-sm text-muted-foreground italic">
          No exit qualifications yet.
        </p>
      )}

      {/* EQ list */}
      <div className="space-y-4">
        {eqs.map((eq) => (
          <EqCard
            key={eq.id}
            eq={eq}
            linkedTlos={[...(tlosByEqId.get(eq.id) ?? [])].sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { numeric: true })
            )}
            trajectoryById={trajectoryById}
            onLinkTlo={() => setLinkEqId(eq.id)}
            onNavigate={(trajectoryId) =>
              navigateTo({ type: "trajectory", id: trajectoryId })
            }
          />
        ))}
      </div>

      {/* Link TLO dialog */}
      {linkEqId != null && (
        <EqLinkTloDialog eqId={linkEqId} onClose={() => setLinkEqId(null)} />
      )}
    </div>
  )
}
