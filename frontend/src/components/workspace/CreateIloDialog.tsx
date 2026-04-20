import { useEffect, useMemo, useState } from "react"
import { Search, ArrowLeft } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BloomSelect } from "@/components/ui/bloom-select"
import { OrderBadge } from "@/components/ui/order-badge"
import { useApp } from "@/context/AppContext"
import { useHelp } from "@/context/HelpContext"
import type { Clo, Course, Tlo } from "@/lib/types"

interface CreateIloDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tlo: Tlo
  clos: Clo[]
}

type Step = "browse" | "configure"

interface CourseGroup {
  course: Course
  orderNum: number
  visibleClos: Clo[]
}

export function CreateIloDialog({ open, onOpenChange, tlo, clos }: CreateIloDialogProps) {
  const { send, state } = useApp()
  const { openHelp } = useHelp()
  const courseById = new Map(state.courses.map(c => [c.id, c]))

  const [search, setSearch] = useState("")
  const [step, setStep] = useState<Step>("browse")
  const [selectedClo, setSelectedClo] = useState<Clo | null>(null)
  const [iloDescription, setIloDescription] = useState("")
  const [bloomLevel, setBloomLevel] = useState("")

  useEffect(() => {
    if (!open) {
      setSearch("")
      setStep("browse")
      setSelectedClo(null)
      setIloDescription("")
      setBloomLevel("")
    }
  }, [open])

  // Build hierarchical groups per course.
  // A group is visible when: the course name matches the query,
  // OR at least one of its CLOs matches.
  // When the course name matches, all CLOs are shown.
  // When only CLOs match, show only those CLOs (but still show the course row as a link).
  const groups = useMemo<CourseGroup[]>(() => {
    const q = search.toLowerCase()
    return [...state.courses].sort((a, b) => a.name.localeCompare(b.name)).map((course, i) => {
        const courseNameMatches = !q || course.name.toLowerCase().includes(q)
        const courseClos = clos.filter(co => co.courseId === course.id)
        const visibleClos = courseNameMatches
          ? courseClos
          : courseClos.filter(co => co.description.toLowerCase().includes(q))
        const visible = courseNameMatches || visibleClos.length > 0
        return { course, orderNum: i + 1, visibleClos, visible }
      })
      .filter(g => g.visible)
  }, [search, state.courses, clos])

  const hasAnything = state.courses.length > 0
  const hasResults = groups.length > 0

  function handleSelectCourse(course: Course) {
    send({ type: "ilo:create", tloId: tlo.id, description: "", bloomLevel: null, courseId: course.id })
    onOpenChange(false)
  }

  function handleSelectClo(clo: Clo) {
    setSelectedClo(clo)
    setIloDescription(clo.description)
    setBloomLevel(clo.bloomLevel ?? "")
    setStep("configure")
  }

  function handleCreate() {
    if (!selectedClo || !iloDescription.trim()) return
    send({
      type: "ilo:create",
      tloId: tlo.id,
      description: iloDescription.trim(),
      bloomLevel: bloomLevel || null,
      cloId: selectedClo.id,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base sr-only">
            {step === "browse" ? "ILO from CLO" : "Configure ILO"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground sr-only">
            For TLO: <span className="font-medium text-foreground">{tlo.name}</span>
          </p>
        </DialogHeader>

        {step === "browse" && (
          <>
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

            {/* Fixed height — no layout shift when results change */}
            <div className="h-72 overflow-y-auto rounded-md border">
              {!hasAnything ? (
                <div className="flex h-full items-center justify-center px-4">
                  <p className="text-sm text-muted-foreground text-center">
                    No courses yet. Add one in the sidebar.
                  </p>
                </div>
              ) : !hasResults ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No results.</p>
                </div>
              ) : (
                <div>
                  {groups.map(({ course, orderNum, visibleClos }) => (
                    <div key={course.id} className="border-b last:border-b-0">
                      {/* Course row — click to link at course level */}
                      <div
                        className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectCourse(course)}
                      >
                        <OrderBadge num={orderNum} color={course.color} shape="square" />
                        <span className="flex-1 text-sm font-medium">{course.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">course level</span>
                      </div>

                      {/* CLO rows — indented to show membership */}
                      {visibleClos.map(clo => (
                        <div
                          key={clo.id}
                          className="flex items-start gap-2 pl-7 pr-3 py-1.5 hover:bg-accent cursor-pointer border-t border-border/40"
                          onClick={() => handleSelectClo(clo)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-foreground/80 line-clamp-2 leading-snug">
                              {clo.description || "No description"}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 mt-0.5">use</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            </DialogFooter>
          </>
        )}

        {step === "configure" && selectedClo && (
          <>
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 space-y-1.5">
              <p className="text-sm text-blue-900 leading-relaxed">
                Create an <strong>ILO</strong> that matches (a part of) the <strong>CLO</strong>
             </p>
              <button
                type="button"
                className="text-xs text-blue-700 underline underline-offset-2 hover:text-blue-900 transition-colors"
                onClick={() => openHelp("concepts")}
              >
                What is the difference between TLOs, ILOs and CLOs?
              </button>
            </div>

            <div>
                <p className="font-light text-sm text-blue-600"><strong>CLO: </strong>{selectedClo.description}</p>
            </div>

            <div className="space-y-1.5">
              <Label className='text-muted-foreground'>Intended Learning Outcome (ILO)</Label>
              <Textarea
                value={iloDescription}
                onChange={e => setIloDescription(e.target.value)}
                placeholder="Describe the specific, assessable outcome..."
                className='text-sm'
                rows={3}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label>Bloom Level</Label>
              <BloomSelect value={bloomLevel} onValueChange={setBloomLevel} />
            </div>

            <DialogFooter>
              <Button variant="ghost" size="sm" className="mr-auto gap-1" onClick={() => setStep("browse")}>
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!iloDescription.trim()}>Create ILO</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
