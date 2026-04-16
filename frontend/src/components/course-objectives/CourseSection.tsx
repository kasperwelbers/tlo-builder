import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
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
import { CourseObjectiveCard } from './CourseObjectiveCard'
import type { Course, CourseObjective } from '@/lib/types'

interface Props {
  course: Course
  courseObjectives: CourseObjective[]
  onUpdate: (data: { name: string; description: string; color: string }) => void
  onDelete: () => void
  onAddCourseObjective: () => void
  onEditCourseObjective: (co: CourseObjective) => void
  onDeleteCourseObjective: (co: CourseObjective) => void
}

export function CourseSection({
  course, courseObjectives, onUpdate, onDelete,
  onAddCourseObjective, onEditCourseObjective, onDeleteCourseObjective,
}: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editColor, setEditColor] = useState('')

  function openEdit() {
    setEditName(course.name)
    setEditDescription(course.description)
    setEditColor(course.color)
    setEditOpen(true)
  }

  function submitEdit() {
    const name = editName.trim()
    if (!name) return
    onUpdate({ name, description: editDescription.trim(), color: editColor })
    setEditOpen(false)
  }

  const accentColor = course.color || '#64748b'

  return (
    <div className="rounded-xl border border-l-4 bg-background shadow-sm" style={{ borderLeftColor: accentColor }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">{course.name}</h3>
          {course.description && (
            <p className="text-xs text-muted-foreground">{course.description}</p>
          )}
        </div>

        <Button variant="ghost" size="icon" className="size-7" onClick={openEdit}>
          <Pencil className="size-3.5" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive">
              <Trash2 className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete course "{course.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all {courseObjectives.length} objective{courseObjectives.length !== 1 ? 's' : ''} in this course and their mappings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Course objective cards */}
      <div className="space-y-2 px-4 pb-3">
        {courseObjectives.map(co => (
          <CourseObjectiveCard
            key={co.id}
            co={co}
            onEdit={() => onEditCourseObjective(co)}
            onDelete={() => onDeleteCourseObjective(co)}
          />
        ))}
        <Button variant="ghost" size="sm" onClick={onAddCourseObjective}>
          <Plus className="size-4" /> Add Course Objective
        </Button>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit course</DialogTitle></DialogHeader>
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
