import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ColorPicker } from '@/components/ui/color-picker'
import { useApp } from '@/context/AppContext'
import { randomColor } from '@/lib/colorPalette'
import { CsvActions } from './CsvActions'
import { CourseSection } from './CourseSection'
import { CourseObjectiveFormDialog } from './CourseObjectiveFormDialog'
import type { CourseObjective } from '@/lib/types'

export function CourseObjectivesPage() {
  const { state, send } = useApp()
  const { courseObjectives, courses: stateCourses } = state

  const sortedCourses = useMemo(
    () => [...stateCourses].sort((a, b) => a.name.localeCompare(b.name)),
    [stateCourses]
  )

  // Add Course dialog
  const [addCourseOpen, setAddCourseOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseDescription, setNewCourseDescription] = useState('')
  const [newCourseColor, setNewCourseColor] = useState('')

  // Add/Edit CourseObjective dialog
  const [coDialogOpen, setCoDialogOpen] = useState(false)
  const [editingCo, setEditingCo] = useState<Partial<CourseObjective> | undefined>()

  function handleAddCourseSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = newCourseName.trim()
    if (!name) return
    send({ type: 'course:create', name, description: newCourseDescription.trim(), color: newCourseColor })
    setAddCourseOpen(false)
    setNewCourseName('')
    setNewCourseDescription('')
  }

  function handleSubmit(data: { courseId: number; description: string }) {
    if (editingCo?.id) {
      send({ type: 'course_objective:update', id: editingCo.id, ...data })
    } else {
      send({ type: 'course_objective:add', ...data })
    }
    setEditingCo(undefined)
  }

  function handleAddCoForCourse(courseId: number) {
    setEditingCo({ courseId })
    setCoDialogOpen(true)
  }

  function handleEditCo(co: CourseObjective) {
    setEditingCo(co)
    setCoDialogOpen(true)
  }

  function handleDeleteCo(co: CourseObjective) {
    send({ type: 'course_objective:delete', id: co.id })
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Course Objectives</h1>
        <div className="ml-auto flex items-center gap-2">
          <CsvActions courseObjectives={courseObjectives} />
          <Button
            size="sm"
            onClick={() => {
              setNewCourseName('')
              setNewCourseDescription('')
              setNewCourseColor(randomColor())
              setAddCourseOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Course sections */}
      {sortedCourses.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>No courses yet. Add a course to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCourses.map(course => (
            <CourseSection
              key={course.id}
              course={course}
              courseObjectives={courseObjectives.filter(co => co.courseId === course.id)}
              onUpdate={data => send({ type: 'course:update', courseId: course.id, ...data })}
              onDelete={() => send({ type: 'course:delete', courseId: course.id })}
              onAddCourseObjective={() => handleAddCoForCourse(course.id)}
              onEditCourseObjective={handleEditCo}
              onDeleteCourseObjective={handleDeleteCo}
            />
          ))}
        </div>
      )}

      {/* Add Course dialog */}
      <Dialog open={addCourseOpen} onOpenChange={setAddCourseOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCourseSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-course-name">Name</Label>
              <Input
                id="new-course-name"
                value={newCourseName}
                onChange={e => setNewCourseName(e.target.value)}
                placeholder="e.g. Introduction to Programming"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={newCourseDescription}
                onChange={e => setNewCourseDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <ColorPicker value={newCourseColor} onChange={setNewCourseColor} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddCourseOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit CourseObjective dialog */}
      <CourseObjectiveFormDialog
        open={coDialogOpen}
        onOpenChange={open => {
          setCoDialogOpen(open)
          if (!open) setEditingCo(undefined)
        }}
        courses={sortedCourses}
        initialData={editingCo}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
