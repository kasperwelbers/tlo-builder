import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { IloFormDialog } from "@/components/ilos/IloFormDialog"
import { useApp } from "@/context/AppContext"
import type { CourseObjective, Ilo, IloCourseObjectiveMapping, Tlo } from "@/lib/types"

interface TloSectionProps {
  tlo: Tlo
  ilos: Ilo[]
  courseObjectives: CourseObjective[]
  iloCourseObjectiveMappings: IloCourseObjectiveMapping[]
  onEdit: () => void
  onDelete: () => void
}

export function TloSection({
  tlo, ilos, courseObjectives, iloCourseObjectiveMappings, onEdit, onDelete,
}: TloSectionProps) {
  const { send, state } = useApp()
  const courseById = new Map(state.courses.map(c => [c.id, c]))
  const [createOpen, setCreateOpen] = useState(false)
  const [editIlo, setEditIlo] = useState<Ilo | null>(null)

  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleStartEdit = (field: 'name' | 'description', value: string) => {
    setEditingField(field)
    setEditValue(value)
  }

  const handleSave = () => {
    if (!editingField) return

    const isUnchanged =
      (editingField === 'name' && editValue === tlo.name) ||
      (editingField === 'description' && editValue === (tlo.description || ''))

    if (!isUnchanged) {
      send({
        type: "tlo:update",
        id: tlo.id,
        trajectoryId: tlo.trajectoryId,
        name: editingField === 'name' ? editValue : tlo.name,
        description: editingField === 'description' ? editValue : tlo.description,
        bloomLevel: tlo.bloomLevel
      })
    }
    setEditingField(null)
  }

  const handleBloomChange = (val: string) => {
    send({
      type: "tlo:update",
      id: tlo.id,
      trajectoryId: tlo.trajectoryId,
      name: tlo.name,
      description: tlo.description,
      bloomLevel: val
    })
  }

  const bgClass = tlo.bloomLevel?.startsWith('C') ? 'bg-blue-50' :
                  tlo.bloomLevel?.startsWith('A') ? 'bg-green-50' :
                  tlo.bloomLevel?.startsWith('P') ? 'bg-amber-50' : 'bg-muted/50'

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* TLO header */}
      <div className={`flex items-start gap-3 px-4 py-3 group w-full text-black ${bgClass}`}>


        {editingField === 'name' ? (
          <Input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="text-base font-semibold w-full text-black bg-white/50"
            autoFocus
            onBlur={handleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditingField(null); }}
          />
        ) : (
          <div
            role="button"
            tabIndex={0}
            className="text-base font-semibold cursor-pointer px-1.5 py-0.5 rounded hover:bg-black/5"
            onClick={() => handleStartEdit('name', tlo.name)}
          >
            {tlo.name}
          </div>
        )}
        <div className="shrink-0 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center mt-1">
          <BloomSelect value={tlo.bloomLevel || ""} onValueChange={handleBloomChange} fullLabel />
        </div>

        <div className="shrink-0 flex items-center gap-1 mt-1">
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
      </div>
      <div className="flex-1 flex flex-col min-w-[200px] justify-center gap-1">

        {editingField === 'description' ? (
          <Input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="text-sm w-full text-black bg-white/50"
            autoFocus
            onBlur={handleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditingField(null); }}
          />
        ) : (
          <div
            role="button"
            tabIndex={0}
            className="text-sm text-black/80 cursor-pointer px-1.5 py-0.5 rounded hover:bg-black/5"
            onClick={() => handleStartEdit('description', tlo.description || '')}
          >
            {tlo.description || <span className="italic opacity-50">No description</span>}
          </div>
        )}
      </div>

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

      {/* Add ILO button */}
      <div className="flex flex-wrap gap-2 px-3 pb-3 pt-1">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => send({ type: 'ilo:create', tloId: tlo.id, description: 'The student can ...', bloomLevel: null })}>
          <Plus className="mr-1 size-3.5" /> Create ILO
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 size-3.5" /> Create ILO from Course Objective
        </Button>
      </div>

      <CreateIloDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        tlo={tlo}
        courseObjectives={courseObjectives}
      />

      <IloFormDialog
        open={editIlo !== null}
        onOpenChange={open => { if (!open) setEditIlo(null) }}
        initialData={editIlo ?? undefined}
        initialCoIds={
          editIlo
            ? iloCourseObjectiveMappings
                .filter(m => m.iloId === editIlo.id)
                .map(m => m.courseObjectiveId)
            : []
        }
        courses={state.courses}
        courseObjectives={courseObjectives}
        onSubmit={data => {
          if (!editIlo) return
          send({ type: "ilo:update", id: editIlo.id, description: data.description, bloomLevel: data.bloomLevel })

          // Sync CO mappings: diff old vs new
          const oldIds = iloCourseObjectiveMappings
            .filter(m => m.iloId === editIlo.id)
            .map(m => m.courseObjectiveId)
          const newIds = data.courseObjectiveIds

          for (const coId of newIds.filter(id => !oldIds.includes(id))) {
            send({ type: "ilo_course_objective_mapping:add", iloId: editIlo.id, courseObjectiveId: coId })
          }
          for (const coId of oldIds.filter(id => !newIds.includes(id))) {
            send({ type: "ilo_course_objective_mapping:delete", iloId: editIlo.id, courseObjectiveId: coId })
          }
        }}
      />
    </div>
  )
}
