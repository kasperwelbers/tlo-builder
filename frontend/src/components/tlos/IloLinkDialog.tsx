import { useEffect, useMemo, useState } from "react"
import { Search, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderBadge } from "@/components/ui/order-badge"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import type { CurrentIlo, Ilo } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  ilo: Ilo
  currentIlos: CurrentIlo[]
}

export function IloLinkDialog({ open, onOpenChange, ilo, currentIlos }: Props) {
  const { state, send } = useApp()
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const mappings = state.iloCurrentIloMappings.filter((m) => m.iloId === ilo.id)

  const groups = useMemo(() => {
    const q = search.toLowerCase()
    return [...state.courses]
      .sort((a, b) =>
        a.code.localeCompare(b.code, undefined, { numeric: true })
      )
      .map((course, i) => {
        const courseNameMatches =
          !q ||
          course.code.toLowerCase().includes(q) ||
          course.name.toLowerCase().includes(q)
        const courseCurrentIlos = currentIlos
          .filter((co) => co.courseId === course.id)
          .sort((a, b) =>
            a.description.localeCompare(b.description, undefined, {
              numeric: true,
            })
          )
        const visibleCurrentIlos = courseNameMatches
          ? courseCurrentIlos
          : courseCurrentIlos.filter((co) =>
              co.description.toLowerCase().includes(q)
            )
        const visible = courseNameMatches || visibleCurrentIlos.length > 0
        return { course, orderNum: i + 1, visibleCurrentIlos, visible }
      })
      .filter((g) => g.visible)
  }, [search, state.courses, currentIlos])

  function toggleCourse(courseId: number) {
    const existing = mappings.find((m) => m.courseId === courseId)
    if (existing && existing.currentIloId === null) {
      send({ type: "ilo_current_ilo_mapping:delete", iloId: ilo.id, courseId })
    } else {
      send({
        type: "ilo_current_ilo_mapping:add",
        iloId: ilo.id,
        courseId,
        currentIloId: null,
      })
    }
  }

  function toggleCurrentIlo(courseId: number, currentIloId: number) {
    const existing = mappings.find((m) => m.courseId === courseId)
    if (existing && existing.currentIloId === currentIloId) {
      send({ type: "ilo_current_ilo_mapping:delete", iloId: ilo.id, courseId })
    } else {
      send({
        type: "ilo_current_ilo_mapping:add",
        iloId: ilo.id,
        courseId,
        currentIloId,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Manage links</DialogTitle>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {ilo.description || <span className="italic">No description</span>}
          </p>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search courses or Current ILOs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="h-72 overflow-y-auto rounded-md border">
          {state.courses.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4">
              <p className="text-center text-sm text-muted-foreground">
                No courses yet. Add one in the sidebar.
              </p>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No results.</p>
            </div>
          ) : (
            <div>
              {groups.map(({ course, orderNum, visibleCurrentIlos }) => {
                const mapping = mappings.find((m) => m.courseId === course.id)
                const isCourseLevelLinked =
                  mapping != null && mapping.currentIloId === null

                return (
                  <div key={course.id} className="border-b last:border-b-0">
                    {/* Course row */}
                    <div
                      className={cn(
                        "flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors",
                        isCourseLevelLinked
                          ? "bg-accent/60 hover:bg-accent"
                          : "hover:bg-accent"
                      )}
                      onClick={() => toggleCourse(course.id)}
                    >
                      <Check
                        className={cn(
                          "size-3.5 shrink-0 transition-opacity",
                          isCourseLevelLinked ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <OrderBadge
                        label={String(orderNum)}
                        color={course.color}
                        shape="square"
                      />
                      <span className="flex-1 text-sm font-medium">
                        {course.code}
                      </span>
                      {course.name && (
                        <span className="mr-1 max-w-32 truncate text-xs text-muted-foreground">
                          {course.name}
                        </span>
                      )}
                      <span className="shrink-0 text-xs text-muted-foreground">
                        course level
                      </span>
                    </div>

                    {/* Current ILO rows -- indented */}
                    {visibleCurrentIlos.map((currentIlo) => {
                      const isCurrentIloLinked =
                        mapping?.currentIloId === currentIlo.id
                      return (
                        <div
                          key={currentIlo.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-2 border-t border-border/40 py-1.5 pr-3 pl-8 transition-colors",
                            isCurrentIloLinked
                              ? "bg-accent/60 hover:bg-accent"
                              : "hover:bg-accent"
                          )}
                          onClick={() =>
                            toggleCurrentIlo(course.id, currentIlo.id)
                          }
                        >
                          <Check
                            className={cn(
                              "mt-0.5 size-3.5 shrink-0 transition-opacity",
                              isCurrentIloLinked ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <p className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug text-foreground/80">
                            {currentIlo.description || "No description"}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
