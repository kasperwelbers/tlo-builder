import { useEffect, useMemo, useState } from "react"
import { Search, ArrowLeft, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BloomSelect } from "@/components/ui/bloom-select"
import { OrderBadge } from "@/components/ui/order-badge"
import { bloomBadgeClass } from "@/lib/bloomColors"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { useHelp } from "@/context/HelpContext"
import type { CurrentIlo, Course, Tlo } from "@/lib/types"

interface CreateIloDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tlo: Tlo
  currentIlos: CurrentIlo[]
}

type Step = "browse" | "configure"

interface CourseGroup {
  course: Course
  orderNum: number
  visibleCurrentIlos: CurrentIlo[]
}

export function CreateIloDialog({
  open,
  onOpenChange,
  tlo,
  currentIlos,
}: CreateIloDialogProps) {
  const { send, state } = useApp()
  const { openHelp } = useHelp()

  const [search, setSearch] = useState("")
  const [step, setStep] = useState<Step>("browse")
  const [selectedCurrentIlo, setSelectedCurrentIlo] =
    useState<CurrentIlo | null>(null)
  const [iloDescription, setIloDescription] = useState("")
  const [bloomLevel, setBloomLevel] = useState("")

  useEffect(() => {
    if (!open) {
      setSearch("")
      setStep("browse")
      setSelectedCurrentIlo(null)
      setIloDescription("")
      setBloomLevel("")
    }
  }, [open])

  // Build hierarchical groups per course.
  // A group is visible when: the course name matches the query,
  // OR at least one of its Current ILOs matches.
  // When the course name matches, all Current ILOs are shown.
  // When only Current ILOs match, show only those (but still show the course row as a link).
  const groups = useMemo<CourseGroup[]>(() => {
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

  const hasAnything = state.courses.length > 0
  const hasResults = groups.length > 0

  function handleSelectCurrentIlo(currentIlo: CurrentIlo) {
    setSelectedCurrentIlo(currentIlo)
    setIloDescription(currentIlo.description)
    setBloomLevel(currentIlo.bloomLevel ?? "")
    setStep("configure")
  }

  function handleCreate() {
    if (!selectedCurrentIlo || !iloDescription.trim()) return
    send({
      type: "ilo:create",
      tloId: tlo.id,
      description: iloDescription.trim(),
      bloomLevel: bloomLevel || null,
      currentIloId: selectedCurrentIlo.id,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only text-base">Configure ILO</DialogTitle>
          <p className="sr-only text-sm text-muted-foreground">
            For TLO:{" "}
            <span className="font-medium text-foreground">{tlo.name}</span>
          </p>
        </DialogHeader>

        {step === "browse" && (
          <>
            <p className="-mt-2 text-xs leading-snug text-muted-foreground">
              Choose a Current ILO to base this ILO on, or add it directly to a
              course and link a Current ILO later.
            </p>
            {tlo.description && (
              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground italic">
                {tlo.description}
              </p>
            )}

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

            {/* Fixed height -- no layout shift when results change */}
            <div className="h-72 overflow-y-auto rounded-md border">
              {!hasAnything ? (
                <div className="flex h-full items-center justify-center px-4">
                  <p className="text-center text-sm text-muted-foreground">
                    No courses yet. Add one in the sidebar.
                  </p>
                </div>
              ) : !hasResults ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No results.</p>
                </div>
              ) : (
                <div>
                  {groups.map(({ course, orderNum, visibleCurrentIlos }) => (
                    <div
                      key={course.id}
                      className="border-b last:border-b-0"
                      style={{ backgroundColor: course.color + "15" }}
                    >
                      {/* Course row -- non-interactive header */}
                      <div
                        className="flex items-center gap-2 px-3 py-2"
                        style={{ backgroundColor: course.color + "28" }}
                      >
                        <OrderBadge
                          label={String(orderNum)}
                          color={course.color}
                          shape="square"
                        />
                        <span className="text-xs font-semibold">
                          {course.code}
                        </span>
                        {course.name && (
                          <span className="truncate text-xs font-normal text-muted-foreground">
                            {course.name}
                          </span>
                        )}
                      </div>

                      {/* Current ILO rows -- indented to show membership */}
                      {visibleCurrentIlos.map((currentIlo) => (
                        <div
                          key={currentIlo.id}
                          className="flex cursor-pointer items-start gap-2 border-t border-border/40 py-1.5 pr-3 pl-10 hover:bg-accent"
                          onClick={() => handleSelectCurrentIlo(currentIlo)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs leading-snug text-foreground/80">
                              {currentIlo.description || "No description"}
                            </p>
                          </div>
                          {currentIlo.bloomLevel && (
                            <span
                              className={cn(
                                "shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-xs",
                                bloomBadgeClass(currentIlo.bloomLevel)
                              )}
                            >
                              {currentIlo.bloomLevel}
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Add ILO at course level */}
                      <div
                        className="flex cursor-pointer items-center gap-2 border-t border-border/40 py-1.5 pr-3 pl-10 hover:bg-accent"
                        onClick={() => {
                          send({
                            type: "ilo:create",
                            tloId: tlo.id,
                            description: "",
                            bloomLevel: null,
                            courseId: course.id,
                          })
                          onOpenChange(false)
                        }}
                      >
                        <Plus className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          <strong>Add ILO to course</strong> (assign Current ILO
                          later)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "configure" && selectedCurrentIlo && (
          <>
            <div className="space-y-1.5 rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm leading-relaxed text-blue-900">
                Create an <strong>ILO</strong> that matches (a part of) the{" "}
                <strong>Current ILO</strong>
              </p>
              <button
                type="button"
                className="text-xs text-blue-700 underline underline-offset-2 transition-colors hover:text-blue-900"
                onClick={() => openHelp("concepts")}
              >
                What is the difference between TLOs, ILOs and Current ILOs?
              </button>
            </div>

            <div>
              <p className="text-sm font-light text-blue-600">
                <strong>Current ILO: </strong>
                {selectedCurrentIlo.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground">
                Intended Learning Outcome (ILO)
              </Label>
              <Textarea
                value={iloDescription}
                onChange={(e) => setIloDescription(e.target.value)}
                placeholder="Describe the specific, assessable outcome..."
                className="text-sm"
                rows={3}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label>Bloom Level</Label>
              <BloomSelect value={bloomLevel} onValueChange={setBloomLevel} />
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                size="sm"
                className="mr-auto gap-1"
                onClick={() => setStep("browse")}
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!iloDescription.trim()}>
                Create new ILO
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
