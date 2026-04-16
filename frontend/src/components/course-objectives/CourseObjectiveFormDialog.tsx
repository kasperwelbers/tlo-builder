import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Course, CourseObjective } from '@/lib/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: Course[]
  initialData?: Partial<CourseObjective>
  onSubmit: (data: { courseId: number; name: string; description: string }) => void
}

export function CourseObjectiveFormDialog({
  open,
  onOpenChange,
  courses,
  initialData,
  onSubmit,
}: Props) {
  const [courseId, setCourseId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (open) {
      setCourseId(initialData?.courseId?.toString() ?? '')
      setName(initialData?.name ?? '')
      setDescription(initialData?.description ?? '')
    }
  }, [open, initialData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!courseId || !name.trim()) return
    onSubmit({ courseId: Number(courseId), name: name.trim(), description: description.trim() })
    onOpenChange(false)
  }

  const isEdit = Boolean(initialData?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Course Objective' : 'Add Course Objective'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="co-name">Name</Label>
            <Input
              id="co-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Objective name"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="co-description">Description</Label>
            <Textarea
              id="co-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!courseId}>{isEdit ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
