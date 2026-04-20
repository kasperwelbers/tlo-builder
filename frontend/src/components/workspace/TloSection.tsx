import { useState } from "react"
import { ChevronDown, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BloomSelect } from "@/components/ui/bloom-select"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { IloItem } from "./IloItem"
import { CreateIloDialog } from "./CreateIloDialog"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import type { Clo, Ilo, Tlo } from "@/lib/types"

interface TloSectionProps {
  tlo: Tlo
  ilos: Ilo[]
  clos: Clo[]
  onEdit: () => void
  onDelete: () => void
}

export function TloSection({ tlo, ilos, clos, onEdit, onDelete }: TloSectionProps) {
  const { send } = useApp()

  const [collapsed, setCollapsed] = useState(false)
  const [createFromCloOpen, setCreateFromCloOpen] = useState(false)

  const [editingField, setEditingField] = useState<"name" | "description" | null>(null)
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
        description: editingField === "description" ? editValue : tlo.description,
        bloomLevel: tlo.bloomLevel,
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
    })
  }

  const bgClass = tlo.bloomLevel?.startsWith("C") ? "bg-blue-50" :
                  tlo.bloomLevel?.startsWith("A") ? "bg-green-50" :
                  tlo.bloomLevel?.startsWith("P") ? "bg-amber-50" : "bg-muted/50"

  return (
    <div className="rounded-lg border bg-card overflow-hidden">

      {/* TLO header */}
      <div className={"px-4 py-3 group " + bgClass}>

        {/* Row 1: collapse toggle + name + bloom select + delete button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="shrink-0 p-1.5 -m-1.5 rounded hover:bg-black/5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronDown className={cn("size-4 transition-transform", collapsed && "-rotate-90")} />
          </button>

          <div className="flex-1 min-w-0">
            {editingField === "name" ? (
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="text-base font-semibold bg-white/60 h-7 py-0"
                autoFocus
                onBlur={handleSave}
                onKeyDown={e => {
                  if (e.key === "Enter") handleSave()
                  if (e.key === "Escape") setEditingField(null)
                }}
              />
            ) : (
              <span
                role="button"
                tabIndex={0}
                className="text-base font-semibold cursor-pointer rounded px-1 hover:bg-black/5"
                onClick={() => handleStartEdit("name", tlo.name)}
              >
                {tlo.name}
              </span>
            )}
          </div>

          <div className="shrink-0">
            <BloomSelect value={tlo.bloomLevel || ""} onValueChange={handleBloomChange} />
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost" size="icon"
                className="size-7 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:bg-black/5"
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete TLO?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{tlo.name}</strong> and all its ILO mappings.
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
              onChange={e => setEditValue(e.target.value)}
              className="text-sm bg-white/60 h-7 py-0"
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
              className="text-sm  px-1 text-black/70 cursor-pointer rounded  hover:bg-black/5"
              onClick={() => handleStartEdit("description", tlo.description || "")}
            >
              {tlo.description || <span className="italic  opacity-40">The student can…</span>}
            </div>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          {/* ILOs */}
          {ilos.length > 0 && (
            <>
              <Separator />
              <div className="py-1">
                {ilos.map(ilo => (
                  <IloItem
                    key={ilo.id}
                    ilo={ilo}
                    onDelete={() => send({ type: "ilo:delete", id: ilo.id })}
                  />
                ))}
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-2 px-3 pb-3 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => send({ type: "ilo:create", tloId: tlo.id, description: "", bloomLevel: null })}
            >
              <Plus className="mr-1 size-3.5" /> Create ILO
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setCreateFromCloOpen(true)}>
              <Plus className="mr-1 size-3.5" /> ILO from CLO
            </Button>
          </div>
        </>
      )}

      {/* Create ILO from CLO */}
      <CreateIloDialog
        open={createFromCloOpen}
        onOpenChange={setCreateFromCloOpen}
        tlo={tlo}
        clos={clos}
      />
    </div>
  )
}
