import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ColorPicker } from '@/components/ui/color-picker'
import { TloSection } from './TloSection'
import { cn } from '@/lib/utils'
import type { CourseObjective, Ilo, IloCourseObjectiveMapping, Tlo, TloIloMapping, Trajectory } from '@/lib/types'

interface TrajectoryAccordionProps {
  trajectory: Trajectory
  tlos: Tlo[]
  ilos: Ilo[]

  iloCourseObjectiveMappings: IloCourseObjectiveMapping[]
  courseObjectives: CourseObjective[]
  collapsed: boolean
  onToggle: () => void
  onUpdate: (data: { name: string; description: string; color: string }) => void
  onDelete: () => void
  onAddTlo: () => void
  onEditTlo: (tlo: Tlo) => void
  onDeleteTlo: (tlo: Tlo) => void
}

export function TrajectoryAccordion({
  trajectory, tlos, ilos, iloCourseObjectiveMappings, courseObjectives,
  collapsed, onToggle, onUpdate, onDelete, onAddTlo, onEditTlo, onDeleteTlo,
}: TrajectoryAccordionProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editColor, setEditColor] = useState('')

  function openEdit() {
    setEditName(trajectory.name)
    setEditDescription(trajectory.description)
    setEditColor(trajectory.color)
    setEditOpen(true)
  }

  function submitEdit() {
    const name = editName.trim()
    if (!name) return
    onUpdate({ name, description: editDescription.trim(), color: editColor })
    setEditOpen(false)
  }

  function getIlosForTlo(tloId: number) {
    return ilos.filter(i => i.tloId === tloId)
  }

  const accentColor = trajectory.color || '#64748b'

  return (
    <div
      className="rounded-xl border border-l-4 bg-background shadow-sm"
      style={{ borderLeftColor: accentColor }}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center gap-2 rounded-r-xl px-4 py-3 hover:bg-muted/40 select-none"
        onClick={onToggle}
      >
        {collapsed
          ? <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        }
        <div className="min-w-0 flex-1">
          <span className="text-base font-semibold">{trajectory.name}</span>
          {trajectory.description && (
            <p className="truncate text-xs text-muted-foreground">{trajectory.description}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{tlos.length} TLO{tlos.length !== 1 ? 's' : ''}</span>

        <div className="flex items-center gap-1 pl-2" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="size-7" onClick={openEdit} title="Edit trajectory">
            <Pencil className="size-3.5" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" title="Delete trajectory">
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete trajectory?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete <strong>{trajectory.name}</strong> and all {tlos.length} TLO{tlos.length !== 1 ? 's' : ''} inside it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" size="sm" className="ml-1 h-7 text-xs" onClick={onAddTlo}>
            <Plus className="mr-1 size-3" /> Add TLO
          </Button>
        </div>
      </div>

      {/* TLO list */}
      <div className={cn('overflow-hidden transition-all', collapsed ? 'max-h-0' : 'max-h-[9999px]')}>
        {tlos.length === 0 ? (
          <p className="px-6 pb-4 text-sm text-muted-foreground">No TLOs yet. Add one above.</p>
        ) : (
          <div className="space-y-2 px-4 pb-4 pt-1">
            {tlos.map(tlo => (
              <TloSection
                key={tlo.id}
                tlo={tlo}
                ilos={getIlosForTlo(tlo.id)}
                courseObjectives={courseObjectives}
                iloCourseObjectiveMappings={iloCourseObjectiveMappings}
                onEdit={() => onEditTlo(tlo)}
                onDelete={() => onDeleteTlo(tlo)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit trajectory</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitEdit() }} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} placeholder="Optional description" />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <ColorPicker value={editColor} onChange={setEditColor} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={submitEdit} disabled={!editName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
