import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { OrderBadge } from '@/components/ui/order-badge'
import { cn } from '@/lib/utils'
import type { Ilo, Trajectory, Course } from '@/lib/types'

interface CellKey {
  courseId: number
  trajectoryId: number
}

function cellKey(courseId: number, trajectoryId: number) {
  return `${courseId}:${trajectoryId}`
}

export function OverviewPage() {
  const { state } = useApp()
  const [selectedCell, setSelectedCell] = useState<CellKey | null>(null)

  const trajectories = useMemo(
    () => [...state.trajectories].sort((a, b) => a.name.localeCompare(b.name)),
    [state.trajectories],
  )
  const courses = useMemo(
    () => [...state.courses].sort((a, b) => a.code.localeCompare(b.code)),
    [state.courses],
  )

  // trajectoryId → Set of TLO ids
  const tloIdsByTrajectory = useMemo(() => {
    const map = new Map<number, Set<number>>()
    for (const tlo of state.tlos) {
      const s = map.get(tlo.trajectoryId) ?? new Set<number>()
      s.add(tlo.id)
      map.set(tlo.trajectoryId, s)
    }
    return map
  }, [state.tlos])

  // courseId → Set of ILO ids
  const iloIdsByCourse = useMemo(() => {
    const map = new Map<number, Set<number>>()
    for (const m of state.iloCloMappings) {
      const s = map.get(m.courseId) ?? new Set<number>()
      s.add(m.iloId)
      map.set(m.courseId, s)
    }
    return map
  }, [state.iloCloMappings])

  // Pre-compute cell ILOs for every (course, trajectory) pair
  const cellIlos = useMemo(() => {
    const result = new Map<string, Ilo[]>()
    for (const course of courses) {
      const courseIloIds = iloIdsByCourse.get(course.id) ?? new Set<number>()
      for (const traj of trajectories) {
        const tloIds = tloIdsByTrajectory.get(traj.id) ?? new Set<number>()
        const ilos = state.ilos.filter(
          ilo => ilo.tloId !== null && tloIds.has(ilo.tloId) && courseIloIds.has(ilo.id),
        )
        result.set(cellKey(course.id, traj.id), ilos)
      }
    }
    return result
  }, [courses, trajectories, state.ilos, iloIdsByCourse, tloIdsByTrajectory])

  const selectedIlos = selectedCell
    ? (cellIlos.get(cellKey(selectedCell.courseId, selectedCell.trajectoryId)) ?? [])
    : []
  const selectedTrajectory: Trajectory | undefined = selectedCell
    ? trajectories.find(t => t.id === selectedCell.trajectoryId)
    : undefined
  const selectedCourse: Course | undefined = selectedCell
    ? courses.find(c => c.id === selectedCell.courseId)
    : undefined

  function handleCellClick(courseId: number, trajectoryId: number) {
    if (
      selectedCell?.courseId === courseId &&
      selectedCell?.trajectoryId === trajectoryId
    ) {
      setSelectedCell(null)
    } else {
      setSelectedCell({ courseId, trajectoryId })
    }
  }

  const empty = trajectories.length === 0 || courses.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Matrix of courses vs. trajectories — cells show how many ILOs from each trajectory are
          covered by each course.
        </p>
      </div>

      {empty ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground italic">
            Add trajectories and courses to see the overview matrix.
          </p>
        </div>
      ) : (
        <>
          {/* Matrix table */}
          <div className="overflow-auto rounded-md border">
            <table className="border-collapse text-sm" style={{ minWidth: '100%' }}>
              <thead>
                <tr>
                  {/* Top-left corner cell */}
                  <th className="sticky left-0 z-20 min-w-44 border-b border-r bg-card px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Course
                  </th>
                  {trajectories.map((traj, i) => (
                    <th
                      key={traj.id}
                      className="min-w-28 border-b border-r bg-card px-4 py-3 text-center text-xs font-semibold"
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <OrderBadge num={i + 1} color={traj.color} shape="circle" />
                        <span className="leading-tight">{traj.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {courses.map((course, ci) => (
                  <tr key={course.id} className="group">
                    {/* Course name — sticky */}
                    <td className="sticky left-0 z-10 border-r bg-card px-4 py-3 group-hover:bg-muted/40">
                      <div className="flex items-center gap-2">
                        <OrderBadge num={ci + 1} color={course.color} shape="square" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{course.code}</p>
                          {course.name && (
                            <p className="truncate text-[10px] text-muted-foreground">{course.name}</p>
                          )}
                          {(course.start || course.end) && (
                            <p className="text-[10px] text-muted-foreground">
                              {[course.start, course.end].filter(Boolean).join(' → ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* One cell per trajectory */}
                    {trajectories.map(traj => {
                      const ilos = cellIlos.get(cellKey(course.id, traj.id)) ?? []
                      const count = ilos.length
                      const isSelected =
                        selectedCell?.courseId === course.id &&
                        selectedCell?.trajectoryId === traj.id

                      return (
                        <td
                          key={traj.id}
                          className={cn(
                            'border-r px-3 py-3 text-center transition-colors',
                            isSelected && 'bg-muted/60',
                            !isSelected && 'group-hover:bg-muted/20',
                          )}
                        >
                          {count > 0 ? (
                            <button
                              onClick={() => handleCellClick(course.id, traj.id)}
                              className={cn(
                                'mx-auto inline-flex size-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm transition-all hover:scale-110 hover:shadow-md',
                                isSelected && 'ring-2 ring-offset-2 scale-110',
                              )}
                              style={{
                                backgroundColor: traj.color,
                                // @ts-ignore
                                '--tw-ring-color': traj.color,
                              }}
                              title={`${count} ILO${count !== 1 ? 's' : ''} — click to expand`}
                            >
                              {count}
                            </button>
                          ) : (
                            <span className="text-muted-foreground/25 text-base select-none">
                              ·
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ILO detail panel */}
          {selectedCell && selectedIlos.length > 0 && (
            <div className="rounded-lg border bg-muted/20 p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    ILOs covered by{' '}
                    <span
                      className="font-bold"
                      style={{ color: selectedTrajectory?.color }}
                    >
                      {selectedTrajectory?.name}
                    </span>{' '}
                    in{' '}
                    <span className="font-bold">{selectedCourse?.name}</span>
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedIlos.length} ILO{selectedIlos.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <ul className="space-y-2">
                {selectedIlos.map(ilo => (
                  <li key={ilo.id} className="flex gap-2 text-sm">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: selectedTrajectory?.color ?? '#64748b' }}
                    />
                    <span className={cn(!ilo.description && 'italic text-muted-foreground')}>
                      {ilo.description || 'No description'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
