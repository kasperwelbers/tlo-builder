import { useEffect, useMemo, useState } from "react"
import { Search, Check } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderBadge } from "@/components/ui/order-badge"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import type { Clo, Ilo } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  ilo: Ilo
  clos: Clo[]
}

export function IloLinkDialog({ open, onOpenChange, ilo, clos }: Props) {
  const { state, send } = useApp()
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const mappings = state.iloCloMappings.filter(m => m.iloId === ilo.id)

  const groups = useMemo(() => {
    const q = search.toLowerCase()
    return [...state.courses].sort((a, b) => a.code.localeCompare(b.code)).map((course, i) => {
        const courseNameMatches = !q || course.code.toLowerCase().includes(q) || course.name.toLowerCase().includes(q)
        const courseClos = clos.filter(co => co.courseId === course.id)
        const visibleClos = courseNameMatches
          ? courseClos
          : courseClos.filter(co => co.description.toLowerCase().includes(q))
        const visible = courseNameMatches || visibleClos.length > 0
        return { course, orderNum: i + 1, visibleClos, visible }
      })
      .filter(g => g.visible)
  }, [search, state.courses, clos])

  function toggleCourse(courseId: number) {
    const existing = mappings.find(m => m.courseId === courseId)
    if (existing && existing.cloId === null) {
      send({ type: "ilo_clo_mapping:delete", iloId: ilo.id, courseId })
    } else {
      send({ type: "ilo_clo_mapping:add", iloId: ilo.id, courseId, cloId: null })
    }
  }

  function toggleClo(courseId: number, cloId: number) {
    const existing = mappings.find(m => m.courseId === courseId)
    if (existing && existing.cloId === cloId) {
      send({ type: "ilo_clo_mapping:delete", iloId: ilo.id, courseId })
    } else {
      send({ type: "ilo_clo_mapping:add", iloId: ilo.id, courseId, cloId })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Manage links</DialogTitle>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
            {ilo.description || <span className="italic">No description</span>}
          </p>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search courses or CLOs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="h-72 overflow-y-auto rounded-md border">
          {state.courses.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4">
              <p className="text-sm text-muted-foreground text-center">No courses yet. Add one in the sidebar.</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No results.</p>
            </div>
          ) : (
            <div>
              {groups.map(({ course, orderNum, visibleClos }) => {
                const mapping = mappings.find(m => m.courseId === course.id)
                const isCourseLevelLinked = mapping != null && mapping.cloId === null

                return (
                  <div key={course.id} className="border-b last:border-b-0">
                    {/* Course row */}
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                        isCourseLevelLinked ? "bg-accent/60 hover:bg-accent" : "hover:bg-accent"
                      )}
                      onClick={() => toggleCourse(course.id)}
                    >
                      <Check
                        className={cn(
                          "size-3.5 shrink-0 transition-opacity",
                          isCourseLevelLinked ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <OrderBadge num={orderNum} color={course.color} shape="square" />
                      <span className="flex-1 text-sm font-medium">{course.code}</span>
                      {course.name && <span className="text-xs text-muted-foreground mr-1 truncate max-w-32">{course.name}</span>}
                      <span className="text-xs text-muted-foreground shrink-0">course level</span>
                    </div>

                    {/* CLO rows -- indented */}
                    {visibleClos.map(clo => {
                      const isCloLinked = mapping?.cloId === clo.id
                      return (
                        <div
                          key={clo.id}
                          className={cn(
                            "flex items-start gap-2 pl-8 pr-3 py-1.5 cursor-pointer border-t border-border/40 transition-colors",
                            isCloLinked ? "bg-accent/60 hover:bg-accent" : "hover:bg-accent"
                          )}
                          onClick={() => toggleClo(course.id, clo.id)}
                        >
                          <Check
                            className={cn(
                              "size-3.5 shrink-0 mt-0.5 transition-opacity",
                              isCloLinked ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <p className="flex-1 min-w-0 text-sm text-foreground/80 line-clamp-2 leading-snug">
                            {clo.description || "No description"}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
