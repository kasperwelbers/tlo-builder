import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BloomSelect } from '@/components/ui/bloom-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Course, Clo } from '@/lib/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: Course[]
  initialData?: Partial<Clo>
  onSubmit: (data: { courseId: number; description: string; bloomLevel: string | null }) => void
}

export function CloFormDialog({ open, onOpenChange, courses, initialData, onSubmit }: Props) {
  const [courseId, setCourseId] = useState("")
  const [description, setDescription] = useState("")
  const [bloomLevel, setBloomLevel] = useState("")

  useEffect(() => {
    if (open) {
      setCourseId(initialData?.courseId?.toString() ?? "")
      setDescription(initialData?.description ?? "")
      setBloomLevel(initialData?.bloomLevel ?? "")
    }
  }, [open, initialData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!courseId || !description.trim()) return
    onSubmit({ courseId: Number(courseId), description: description.trim(), bloomLevel: bloomLevel || null })
    onOpenChange(false)
  }

  const isEdit = Boolean(initialData?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit CLO" : "Add CLO"}</DialogTitle>
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
            <Label htmlFor="clo-description">Description</Label>
            <Textarea
              id="clo-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bloom Level</Label>
            <BloomSelect value={bloomLevel} onValueChange={setBloomLevel} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!courseId}>{isEdit ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
