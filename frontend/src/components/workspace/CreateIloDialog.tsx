import { useEffect, useState } from 'react'
import { Search, X, ArrowLeft, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

type Step = 'browse' | 'form'

interface FormState {
  name: string
  description: string
  bloomLevel: string
}

export function CreateIloDialog({ open, onOpenChange, tlo, courseObjectives }: CreateIloDialogProps) {
  const { send, state } = useApp()
  const courseById = new Map(state.courses.map(c => [c.id, c]))
  const [step, setStep] = useState<Step>('browse')
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [linkedCo, setLinkedCo] = useState<CourseObjective | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', description: '', bloomLevel: '' })

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('browse')
      setSearch('')
      setCourseFilter('all')
      setLinkedCo(null)
      setForm({ name: '', description: '', bloomLevel: '' })
    }
  }, [open])

  const courses = Array.from(new Set(courseObjectives.map(co => courseById.get(co.courseId)?.name ?? ""))).sort()

  const filtered = courseObjectives.filter(co => {
    const matchesCourse = courseFilter === 'all' || (courseById.get(co.courseId)?.name ?? '') === courseFilter
    const q = search.toLowerCase()
    const matchesSearch = !q || co.name.toLowerCase().includes(q) || co.description.toLowerCase().includes(q)
    return matchesCourse && matchesSearch
  })

  function handleCopy(co: CourseObjective) {
    setLinkedCo(co)
    setForm({ name: co.name, description: co.description, bloomLevel: '' })
    setStep('form')
  }

  function handleBlank() {
    setLinkedCo(null)
    setForm({ name: '', description: '', bloomLevel: '' })
    setStep('form')
  }

  function handleSubmit() {
    if (!form.name.trim()) return
    send({
      type: 'ilo:create',
      tloId: tlo.id,
      name: form.name.trim(),
      description: form.description.trim(),
      bloomLevel: form.bloomLevel || null,
      ...(linkedCo ? { courseObjectiveId: linkedCo.id } : {}),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">
            {step === 'browse' ? 'Create ILO' : 'New ILO'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            For TLO: <span className="font-medium text-foreground">{tlo.name}</span>
          </p>
        </DialogHeader>

        {step === 'browse' ? (
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
                      <p className="text-sm font-medium leading-tight">{co.name}</p>
                      {co.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {co.description}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0" onClick={() => handleCopy(co)}>
                      Copy →
                    </Button>
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={handleBlank}>
                <Plus className="mr-1.5 size-4" /> Create blank ILO
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Linked CO banner */}
            {linkedCo && (
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                <span className="text-muted-foreground">📎 Based on:</span>
                <span className="font-medium">{linkedCo.name}</span>
                <button
                  className="ml-auto text-muted-foreground hover:text-foreground"
                  onClick={() => setLinkedCo(null)}
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="ILO name"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe what students will be able to do…"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bloom level</Label>
                <BloomSelect value={form.bloomLevel} onValueChange={v => setForm(f => ({ ...f, bloomLevel: v }))} />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setStep('browse')}>
                <ArrowLeft className="mr-1.5 size-4" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={!form.name.trim()}>
                Create ILO
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
