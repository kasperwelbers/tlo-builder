import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { IloItem } from "./IloItem"
import { CreateIloDialog } from "./CreateIloDialog"
import { IloFormDialog } from "@/components/ilos/IloFormDialog"
import { bloomBadgeClass } from "@/lib/bloomColors"
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

  return (
    <div className="rounded-lg border bg-card">
      {/* TLO header */}
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{tlo.name}</span>
            {tlo.bloomLevel && (
              <Badge variant="outline" className={bloomBadgeClass(tlo.bloomLevel)}>
                {tlo.bloomLevel}
              </Badge>
            )}
          </div>
          {tlo.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{tlo.description}</p>
          )}
        </div>

        <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={onEdit}>
          <Pencil className="size-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 shrink-0 text-destructive">
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
      <div className="px-3 pb-3 pt-1">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 size-3.5" /> Create ILO
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
          send({ type: "ilo:update", id: editIlo.id, name: data.name, description: data.description, bloomLevel: data.bloomLevel })

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
