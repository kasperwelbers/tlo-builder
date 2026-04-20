import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BloomSelect } from '@/components/ui/bloom-select'
import { cn } from '@/lib/utils'
import type { Course, Clo, Ilo } from '@/lib/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<Ilo>
  initialCloIds?: number[]
  courses?: Course[]
  clos?: Clo[]
  onSubmit: (data: {
    description: string
    bloomLevel: string | null
    cloIds: number[]
  }) => void
}

export function IloFormDialog({
  open, onOpenChange, initialData, initialCloIds = [], courses = [], clos = [], onSubmit,
}: Props) {
  const [description, setDescription] = useState("")
  const [bloomLevel, setBloomLevel] = useState("")
  const [selectedCloIds, setSelectedCloIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (open) {
      setDescription(initialData?.description ?? "")
      setBloomLevel(initialData?.bloomLevel ?? "")
      setSelectedCloIds(new Set(initialCloIds))
    }
  }, [open]) // intentionally only on open change

  function toggleClo(id: number) {
    setSelectedCloIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return
    onSubmit({
      description: description.trim(),
      bloomLevel: bloomLevel || null,
      cloIds: Array.from(selectedCloIds),
    })
    onOpenChange(false)
  }

  const courseById = new Map(courses.map(c => [c.id, c]))
  const courseGroups = clos.reduce<Record<string, Clo[]>>((acc, co) => {
    const name = courseById.get(co.courseId)?.name ?? String(co.courseId)
    ;(acc[name] ??= []).push(co)
    return acc
  }, {})
  const courseNames = Object.keys(courseGroups).sort()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit ILO" : "Add ILO"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Intended Learning Outcome</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="The student can…" rows={3} required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Bloom Level</Label>
            <BloomSelect value={bloomLevel} onValueChange={setBloomLevel} />
          </div>

          {clos.length > 0 && (
            <div className="space-y-1.5">
              <Label>CLOs</Label>
              <div className="max-h-48 overflow-y-auto rounded-md border">
                {courseNames.map((course, ci) => (
                  <div key={course}>
                    {ci > 0 && <div className="border-t" />}
                    <div className="sticky top-0 bg-muted/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
                      {course}
                    </div>
                    {courseGroups[course].map(co => (
                      <button
                        key={co.id}
                        type="button"
                        onClick={() => toggleClo(co.id)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                          selectedCloIds.has(co.id) && "bg-accent/50"
                        )}
                      >
                        <div className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border",
                          selectedCloIds.has(co.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        )}>
                          {selectedCloIds.has(co.id) && <Check className="size-3" />}
                        </div>
                        <span className="min-w-0 flex-1 leading-snug">{co.description}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initialData?.id ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
