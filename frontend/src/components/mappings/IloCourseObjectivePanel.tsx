import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/context/AppContext'

export function IloCourseObjectivePanel() {
  const { state, send } = useApp()
  const { ilos, courseObjectives, iloCourseObjectiveMappings, courses } = state
  const courseById = new Map(courses.map(c => [c.id, c]))

  // Track which courseObjective has an open ILO-map selector
  const [mappingCoId, setMappingCoId] = useState<number | null>(null)

  const courseNames = [...new Set(courseObjectives.map(c => courseById.get(c.courseId)?.name ?? ""))].sort()

  function handleMapIlo(courseObjectiveId: number, iloId: string) {
    if (!iloId) return
    send({ type: 'ilo_course_objective_mapping:add', iloId: Number(iloId), courseObjectiveId })
    setMappingCoId(null)
  }

  function handleRemoveMapping(iloId: number, courseObjectiveId: number) {
    send({ type: 'ilo_course_objective_mapping:delete', iloId, courseObjectiveId })
  }

  return (
    <div className="space-y-8">
      {courseNames.length === 0 && (
        <p className="text-center text-muted-foreground">No courses defined yet.</p>
      )}
      {courseNames.map(course => {
        const courseCos = courseObjectives.filter(c => (courseById.get(c.courseId)?.name ?? "") === course)
        return (
          <div key={course} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {course}
            </h3>
            <div className="space-y-4 pl-2">
              {courseCos.map(co => {
                const mappedIlos = iloCourseObjectiveMappings
                  .filter(m => m.courseObjectiveId === co.id)
                  .map(m => ilos.find(i => i.id === m.iloId))
                  .filter(Boolean)

                const isMappingThis = mappingCoId === co.id

                // All ILOs can be mapped (ILOs can map to multiple COs)
                // But we filter out ones already mapped to this CO
                const alreadyMappedIds = new Set(
                  iloCourseObjectiveMappings
                    .filter(m => m.courseObjectiveId === co.id)
                    .map(m => m.iloId)
                )
                const availableIlos = ilos.filter(ilo => !alreadyMappedIds.has(ilo.id))

                return (
                  <div key={co.id} className="rounded-lg border p-3">
                    <p className="font-medium">{co.name}</p>
                    {co.description && (
                      <p className="text-sm text-muted-foreground">{co.description}</p>
                    )}

                    {/* Mapped ILOs */}
                    <div className="mt-2 space-y-1 pl-3">
                      {mappedIlos.map(ilo => (
                        <div key={ilo!.id} className="flex items-center gap-2 text-sm">
                          <span className="flex-1 truncate">{ilo!.description}</span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleRemoveMapping(ilo!.id, co.id)}
                          >
                            <X className="size-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}

                      {mappedIlos.length === 0 && (
                        <p className="text-xs text-muted-foreground">No ILOs mapped yet.</p>
                      )}
                    </div>

                    {/* Map ILO */}
                    <div className="mt-2 pl-3">
                      {isMappingThis ? (
                        <div className="flex items-center gap-2">
                          <Select onValueChange={val => handleMapIlo(co.id, val)}>
                            <SelectTrigger className="h-7 w-56 text-xs">
                              <SelectValue placeholder="Select ILO…" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableIlos.length === 0 ? (
                                <SelectItem value="__none" disabled>
                                  All ILOs already mapped
                                </SelectItem>
                              ) : (
                                availableIlos.map(ilo => (
                                  <SelectItem key={ilo.id} value={String(ilo.id)}>
                                    {ilo.description}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setMappingCoId(null)}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setMappingCoId(co.id)}
                        >
                          + Map ILO
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
