import { useEffect, useState } from 'react'
import { Search, X, ArrowLeft, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BloomSelect } from '@/components/ui/bloom-select'
import { useApp } from '@/context/AppContext'
import type { CourseObjective, Tlo } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CreateIloDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tlo: Tlo
  courseObjectives: CourseObjective[]
}



export function CreateIloDialog({ open, onOpenChange, tlo, courseObjectives }: CreateIloDialogProps) {
  const { send, state } = useApp()
  const courseById = new Map(state.courses.map(c => [c.id, c]))
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState<string>('all')

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch('')
      setCourseFilter('all')
    }
  }, [open])

  const courses = Array.from(new Set(courseObjectives.map(co => courseById.get(co.courseId)?.name ?? ""))).sort()

  const filtered = courseObjectives.filter(co => {
    const matchesCourse = courseFilter === 'all' || (courseById.get(co.courseId)?.name ?? '') === courseFilter
    const q = search.toLowerCase()
    const matchesSearch = !q || co.name.toLowerCase().includes(q) || co.description.toLowerCase().includes(q)
    return matchesCourse && matchesSearch
  })

  function handleCreateFromCo(co: CourseObjective) {
    send({
      type: 'ilo:create',
      tloId: tlo.id,
      description: co.description,
      bloomLevel: null,
      courseObjectiveId: co.id,
      courseId: co.courseId,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">
            Create ILO from Course Objective
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            For TLO: <span className="font-medium text-foreground">{tlo.name}</span>
          </p>
        </DialogHeader>

        <>
          {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search course objectives…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Course filter pills */}
            {courses.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCourseFilter('all')}
                  className={cn(
                    'rounded-full px-3 py-0.5 text-xs font-medium transition-colors',
                    courseFilter === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  All
                </button>
                {courses.map(c => (
                  <button
                    key={c}
                    onClick={() => setCourseFilter(c)}
                    className={cn(
                      'rounded-full px-3 py-0.5 text-xs font-medium transition-colors',
                      courseFilter === c
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* CO list */}
            <div className="max-h-64 overflow-y-auto space-y-1 rounded-md border p-1">
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {courseObjectives.length === 0 ? 'No course objectives yet.' : 'No results.'}
                </p>
              ) : (
                filtered.map(co => (
                  <div
                    key={co.id}
                    className="flex items-start gap-3 rounded-md p-2 hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">{courseById.get(co.courseId)?.name ?? ""}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-foreground">
                        {co.description}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0" onClick={() => handleCreateFromCo(co)}>
                      Create ILO →
                    </Button>
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
        </>
      </DialogContent>
    </Dialog>
  )
}
