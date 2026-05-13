import {
  BookMarked,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Layers,
  Map,
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { BLOOM_LEVELS, BLOOM_CATEGORIES } from "@/lib/bloomLevels"
import { bloomBadgeClass } from "@/lib/bloomColors"

export type HelpPage =
  | "overview"
  | "trajectories"
  | "courses"
  | "concepts"
  | "bloom"

interface HelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: HelpPage
  onPageChange: (page: HelpPage) => void
}

const NAV_ITEMS: { id: HelpPage; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <BookOpen className="size-3.5 shrink-0" />,
  },
  {
    id: "trajectories",
    label: "Trajectories",
    icon: <Map className="size-3.5 shrink-0" />,
  },
  {
    id: "courses",
    label: "Courses",
    icon: <BookMarked className="size-3.5 shrink-0" />,
  },
  {
    id: "concepts",
    label: "TLOs, ILOs & CLOs",
    icon: <Layers className="size-3.5 shrink-0" />,
  },
  {
    id: "bloom",
    label: "Bloom's Taxonomy",
    icon: <GraduationCap className="size-3.5 shrink-0" />,
  },
]

function Section({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-6">
      {title && <h2 className="mb-2 text-base font-semibold">{title}</h2>}
      {children}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-sm leading-relaxed text-foreground/80 last:mb-0">
      {children}
    </p>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-2 rounded-md border bg-muted/50 px-3 py-2 text-sm leading-relaxed text-muted-foreground italic">
      {children}
    </div>
  )
}

// Small numbered annotation badge used in mockups
function Ann({ n, floating }: { n: number; floating?: boolean }) {
  if (floating)
    return (
      <div className="relative h-0">
        <sup
          className={`absolute -top-1 -left-3 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 align-super text-[9px] leading-none font-bold text-white`}
        >
          {n}
        </sup>
      </div>
    )
  return (
    <sup
      className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 align-super text-[9px] leading-none font-bold text-white`}
    >
      {n}
    </sup>
  )
}

function TloSectionMockup() {
  return (
    <div className="pointer-events-none my-4 overflow-hidden rounded-lg border bg-card text-sm select-none">
      {/* TLO header — blue bg like Cognitive */}
      <div className="bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <ChevronDown className="size-4 shrink-0 text-muted-foreground/60" />
          <span className="flex-1 text-base font-semibold">
            <Ann n={1} floating />
            Empirical social research
          </span>
          <span
            className={cn(
              "inline-flex h-6 items-center justify-center rounded border px-2 text-xs font-semibold",
              bloomBadgeClass("C3")
            )}
          >
            <Ann n={2} floating />
            C3
          </span>
        </div>
        <div className="mt-1 ml-6 px-1 text-sm text-black/70">
          <Ann n={3} floating />
          The student can design and conduct empirical research to investigate
          social phenomena.
        </div>
      </div>

      {/* Separator */}
      <div className="border-t" />

      {/* ILO rows */}
      <div className="py-1">
        {/* ILO 1 */}
        <div className="flex items-center gap-3 rounded-md px-3 py-1.5">
          <span
            className={cn(
              "inline-flex h-6 items-center justify-center rounded border px-2 text-xs font-semibold",
              bloomBadgeClass("C2")
            )}
          >
            <Ann n={4} floating />
            C2
          </span>
          <span className="flex-1 text-xs font-medium">
            <Ann n={5} floating />
            Distinguish between quantitative and qualitative research designs
          </span>
          {/* Course badge — colored square */}
          <span
            className="inline-flex size-5 items-center justify-center rounded-sm text-xs font-bold text-white"
            style={{ background: "#6366f1" }}
          >
            <Ann n={6} floating />1
          </span>
        </div>
        {/* ILO 2 */}
        <div className="flex items-center gap-3 rounded-md px-3 py-1.5">
          <span
            className={cn(
              "inline-flex h-6 items-center justify-center rounded border px-2 text-xs font-semibold",
              bloomBadgeClass("C3")
            )}
          >
            C3
          </span>
          <span className="flex-1 text-xs font-medium">
            Design a survey instrument to measure public attitudes toward a
            social issue
          </span>
          <span
            className="inline-flex size-5 items-center justify-center rounded-sm text-xs font-bold text-white"
            style={{ background: "#6366f1" }}
          >
            1
          </span>
          <span
            className="inline-flex size-5 items-center justify-center rounded-sm text-xs font-bold text-white"
            style={{ background: "#f59e0b" }}
          >
            2
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pt-1 pb-2">
        <span className="text-xs text-muted-foreground">+ New ILO</span>
      </div>
    </div>
  )
}

function CloSectionMockup() {
  return (
    <div className="pointer-events-none my-4 space-y-3 text-sm select-none">
      {/* "ILOs without CLOs" bucket */}
      <div>
        <p className="mb-1 px-1 text-xs font-semibold tracking-wide text-muted-foreground">
          <Ann n={1} floating />
          ILOs without CLOs
        </p>
        <div className="rounded-lg border border-dashed p-2">
          <div className="flex items-center gap-3 rounded-md px-3 py-1.5">
            <span
              className={cn(
                "inline-flex h-6 items-center justify-center rounded border px-2 text-xs font-semibold",
                bloomBadgeClass("C1")
              )}
            >
              C1
            </span>
            <span className="flex-1 text-xs font-medium">
              Identify the core ethical principles in social research
            </span>
            <span
              className="inline-flex size-5 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "#10b981" }}
            >
              1
            </span>
          </div>
        </div>
      </div>

      {/* CLO section */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center gap-2 bg-muted/40 px-4 py-2">
          <div className="flex w-full items-center gap-3 text-xs">
            <ChevronDown className="size-4 shrink-0 text-muted-foreground/60" />
            <Ann n={2} floating />
            The student can conduct qualitative research
          </div>
          <span
            className={cn(
              "inline-flex h-6 items-center justify-center rounded border px-2 text-xs font-semibold",
              bloomBadgeClass("C3")
            )}
          >
            <Ann n={3} floating />
            C3
          </span>
        </div>

        <div className="bg-muted/40 px-1 pb-2 pl-4 text-xs text-black/60 italic"></div>
        <div className="border-t" />
        <div className="py-1">
          <div className="flex items-center gap-3 rounded-md px-3 py-1.5">
            <span
              className={cn(
                "inline-flex h-6 items-center justify-center rounded border px-2 text-xs font-semibold",
                bloomBadgeClass("C3")
              )}
            >
              <Ann n={4} floating />
              C3
            </span>
            <span className="flex-1 text-xs font-medium">
              <Ann n={5} floating />
              Conduct and analyse a semi-structured interview
            </span>
            {/* Trajectory badge — colored circle */}
            <span
              className="inline-flex size-5 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "#10b981" }}
            >
              <Ann n={6} floating />1
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TrajectoriesHelpPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Trajectory Page</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Define high-level curriculum outcomes and trace them to specific,
        assessable activities in courses.
      </p>

      <Section title="What is a trajectory?">
        <P>
          A <strong>trajectory</strong> represents a learning path — a degree
          program, specialization, or study theme. On this page you define{" "}
          <strong>Trajectory Learning Outcomes (TLOs)</strong>: the broad,
          program-spanning competencies that graduates should possess.
        </P>
        <P>
          TLOs are intentionally high-level and are not directly assessable on
          their own. To show <em>how</em> the trajectory achieves each TLO,
          every TLO must be broken down into{" "}
          <strong>Intended Learning Outcomes (ILOs)</strong> — specific,
          assessable outcome statements — and each ILO must be linked to at
          least one course where it is taught and assessed.
        </P>
      </Section>

      <Section title="Anatomy of a TLO section">
        <TloSectionMockup />
        <ol className="mt-2 space-y-1.5 text-sm text-foreground/80">
          <li>
            <Ann n={1} /> <strong>TLO name</strong> — A short, high-level
            competency label spanning multiple courses.
          </li>
          <li>
            <Ann n={2} /> <strong>TLO Bloom level</strong> — The highest
            cognitive depth required to achieve this TLO overall.
          </li>
          <li>
            <Ann n={3} /> <strong>TLO description</strong> — Write as{" "}
            <em>"The student can…"</em> for consistency. This is the
            graduate-level capability statement.
          </li>
          <li>
            <Ann n={4} /> <strong>ILO Bloom level</strong> — The cognitive depth
            of this specific, assessable outcome.
          </li>
          <li>
            <Ann n={5} /> <strong>ILO description</strong> — A concrete,
            testable statement. Write as <em>"The student can…"</em>.
          </li>
          <li>
            <Ann n={6} /> <strong>Course badge</strong> — Colored square
            indicating the course where this ILO is addressed. Click to navigate
            to that course.
          </li>
        </ol>
      </Section>

      <Section title="Workflow tips">
        <ul className="list-inside list-disc space-y-1.5 text-sm text-foreground/80">
          <li>
            Every TLO should have at least one ILO — a TLO with no ILOs is not
            justified by the curriculum.
          </li>
          <li>
            Every ILO should be linked to at least one course — use the link
            icon (<strong>⛓</strong>) on hover, or create ILOs directly from an
            existing CLO.
          </li>
          <li>ILOs can be dragged between TLOs to reorganize.</li>
          <li>
            Use consistent Bloom levels: ILO levels should collectively add up
            to or exceed the TLO level.
          </li>
        </ul>
      </Section>
    </div>
  )
}

function CourseHelpPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Course Page</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        See which trajectory ILOs are addressed in this course, optionally
        organized under Course Learning Outcomes.
      </p>

      <Section title="What is the course page for?">
        <P>
          The course page is the <em>course-side view</em> of the alignment map.
          ILOs are created on the trajectory page and linked to courses — the
          course page shows which ILOs land in your course and lets you organize
          them using <strong>Course Learning Outcomes (CLOs)</strong>.
        </P>
        <P>
          CLOs are <strong>optional</strong> but recommended. Without CLOs, all
          ILOs for this course sit in a single "ILOs without CLOs" bucket. By
          creating CLOs and grouping ILOs into them, course coordinators can
          communicate outcomes to students in their own terms — without exposing
          the trajectory structure.
        </P>
      </Section>

      <Section title="Anatomy of the course page">
        <CloSectionMockup />
        <ol className="mt-2 space-y-1.5 text-sm text-foreground/80">
          <li>
            <Ann n={1} /> <strong>ILOs without CLOs</strong> — ILOs linked to
            this course but not yet placed under a CLO. Drag them into a CLO
            section below.
          </li>
          <li>
            <Ann n={2} /> <strong>CLO</strong> — A course-scoped learning
            objective
          </li>
          <li>
            <Ann n={3} /> <strong>CLO Bloom level</strong> — The cognitive depth
            of this CLO as a whole.
          </li>
          <li>
            <Ann n={4} /> <strong>ILO Bloom level</strong> — The cognitive depth
            of this specific, assessable outcome.
          </li>
          <li>
            <Ann n={5} /> <strong>ILO description</strong> — A concrete,
            testable statement. Write as <em>"The student can…"</em>.
          </li>
          <li>
            <Ann n={6} /> <strong>Trajectory badge</strong> — Colored circle
            showing which trajectory this ILO belongs to. Click to navigate to
            that trajectory.
          </li>
        </ol>
      </Section>

      <Section title="Workflow tips">
        <ul className="list-inside list-disc space-y-1.5 text-sm text-foreground/80">
          <li>
            ILOs appear here automatically once they are linked to this course
            on the trajectory page.
          </li>
          <li>
            Drag ILOs between CLO sections (or back to the top bucket) to
            reorganize them.
          </li>
          <li>
            CLOs are course-local: they are not shared across courses or visible
            in the trajectory view.
          </li>
          <li>
            If you don't use CLOs, the overview matrix still shows the full
            TLO→ILO→course alignment.
          </li>
        </ul>
      </Section>
    </div>
  )
}

function OverviewPage({
  onPageChange,
}: {
  onPageChange: (page: HelpPage) => void
}) {
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Where do I start?</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Your first steps depend on your role. Both roles collaborate on{" "}
        <strong>ILOs</strong> — the specific, assessable outcomes that connect
        trajectories to courses.
      </p>

      {/* Trajectory Coordinator */}
      <div className="mb-4 rounded-lg border-2 border-blue-200 bg-blue-50/60 p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <Map className="size-4 shrink-0 text-blue-600" />
          <h2 className="font-semibold text-blue-900">
            Trajectory Coordinator
          </h2>
        </div>
        <p className="mb-3 text-sm text-blue-800/80">
          You define the high-level outcomes of a learning program and ensure
          they are covered and justified across courses.
        </p>
        <ol className="space-y-2">
          {(
            [
              [
                "Add a trajectory",
                "Use the sidebar to create a learning path or degree program.",
              ],
              [
                "Add TLOs",
                'Trajectory Learning Outcomes: broad, program-level competency statements written as "The student can\u2026"',
              ],
              [
                "Break TLOs into ILOs",
                "Intended Learning Outcomes: specific, assessable outcomes that justify how each TLO is achieved in practice.",
              ],
              [
                "Link ILOs to courses",
                "Collaborate with course coordinators to assign each ILO to the course where it is taught and assessed.",
              ],
            ] as [string, string][]
          ).map(([title, desc], i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700">
                {i + 1}
              </span>
              <span className="text-sm text-blue-900/80">
                <strong>{title}</strong> — {desc}
              </span>
            </li>
          ))}
        </ol>
        <button
          onClick={() => onPageChange("trajectories")}
          className="mt-3 text-xs font-medium text-blue-600 hover:underline"
        >
          See the Trajectories help page →
        </button>
      </div>

      {/* Course Coordinator */}
      <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/60 p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <BookMarked className="size-4 shrink-0 text-emerald-600" />
          <h2 className="font-semibold text-emerald-900">Course Coordinator</h2>
        </div>
        <p className="mb-3 text-sm text-emerald-800/80">
          You define how your course contributes to the curriculum and how its
          outcomes are communicated to students.
        </p>
        <ol className="space-y-2">
          {(
            [
              [
                "Go to your course",
                "Find your course in the sidebar, or ask a project admin to add it.",
              ],
              [
                "Add CLOs",
                'Course Learning Outcomes: outcome groupings that describe what students achieve in your course, written as "The student can\u2026"',
              ],
              [
                "Collaborate on ILOs",
                "Work with the trajectory coordinator to create ILOs that link your CLOs to the broader curriculum goals.",
              ],
              [
                "Organise ILOs under CLOs",
                "Drag ILOs into CLO sections to present outcomes clearly to students, using your own course terminology.",
              ],
            ] as [string, string][]
          ).map(([title, desc], i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-700">
                {i + 1}
              </span>
              <span className="text-sm text-emerald-900/80">
                <strong>{title}</strong> — {desc}
              </span>
            </li>
          ))}
        </ol>
        <button
          onClick={() => onPageChange("courses")}
          className="mt-3 text-xs font-medium text-emerald-600 hover:underline"
        >
          See the Courses help page →
        </button>
      </div>
    </div>
  )
}

function ConceptsPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">TLOs, ILOs &amp; CLOs</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        How the three levels of learning outcomes relate to each other.
      </p>

      <Section title="TLO — Trajectory Learning Outcome">
        <P>
          A TLO is a broad, program-level statement of what students should
          achieve by the end of a trajectory (a degree program, specialization,
          or learning path). TLOs span multiple courses and describe
          graduate-level competencies.
        </P>
        <Callout>
          Example: &quot;The student can critically evaluate social research and
          apply appropriate methods to investigate social issues.&quot;
        </Callout>
      </Section>

      <Section title="CLO — Course Learning Outcome">
        <P>
          A CLO is a course-scoped outcome describing what students should
          achieve by the end of a particular course. CLOs are more specific than
          TLOs but still broad enough to be addressed by many different
          assignments and activities within the course.
        </P>
        <Callout>
          Example: &quot;The student can apply qualitative research methods to
          investigate lived experiences of social inequality.&quot;
        </Callout>
      </Section>

      <Section title="ILO — Intended Learning Outcome">
        <P>
          An ILO is a specific, assessable outcome that sits at the intersection
          of a TLO and a CLO. ILOs are the most granular level — they pin down
          exactly what students will demonstrate, in what context, and at what
          level of cognitive depth.
        </P>
        <P>
          Each ILO belongs to one TLO (its trajectory context) and is linked to
          one CLO (its course context). This dual link creates an alignment map:
          you can trace any ILO upward to a program goal and sideways to a
          course expectation.
        </P>
        <Callout>
          Example: &quot;The student can conduct a semi-structured interview,
          transcribe and thematically code the data, and interpret findings in
          relation to a theoretical framework on social inequality.&quot;
        </Callout>
      </Section>

      <Section title="Why are ILOs more specific than CLOs?">
        <P>
          A CLO defines what a course broadly aims to achieve — it could be
          satisfied by many different activities. An ILO narrows that down to a{" "}
          <em>single, concrete demonstration</em>: it specifies the method, the
          artifact, the context, and often the standard of quality.
        </P>
        <P>
          Think of it this way: a CLO is a destination, and an ILO is the
          specific route you take to reach it within a particular trajectory.
        </P>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-1.5 pr-4 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase"></th>
                <th className="py-1.5 pr-4 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  TLO
                </th>
                <th className="py-1.5 pr-4 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  CLO
                </th>
                <th className="py-1.5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  ILO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-1.5 pr-4 font-medium text-muted-foreground">
                  Level
                </td>
                <td className="py-1.5 pr-4">Trajectory</td>
                <td className="py-1.5 pr-4">Course</td>
                <td className="py-1.5">Activity / Assessment</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-muted-foreground">
                  Specificity
                </td>
                <td className="py-1.5 pr-4">Low</td>
                <td className="py-1.5 pr-4">Medium</td>
                <td className="py-1.5">High</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-muted-foreground">
                  Directly assessable
                </td>
                <td className="py-1.5 pr-4">No</td>
                <td className="py-1.5 pr-4">Partially</td>
                <td className="py-1.5">Yes</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-muted-foreground">
                  Set by
                </td>
                <td className="py-1.5 pr-4">Program designers</td>
                <td className="py-1.5 pr-4">Course instructors</td>
                <td className="py-1.5">Both, in alignment</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}

function BloomPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Bloom's Taxonomy</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        A framework for categorizing the cognitive, affective, and psychomotor
        depth of learning outcomes. Assign a Bloom level to TLOs, ILOs, and CLOs
        to make the expected depth explicit.
      </p>

      {BLOOM_CATEGORIES.map((cat) => (
        <Section key={cat.key} title={cat.label}>
          <div className="space-y-2">
            {BLOOM_LEVELS.filter((l) => l.category === cat.key).map((level) => (
              <div key={level.code} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    bloomBadgeClass(level.code)
                  )}
                >
                  {level.code}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{level.name}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {level.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  )
}

export function HelpModal({
  open,
  onOpenChange,
  page,
  onPageChange,
}: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="flex" style={{ height: "min(600px, 85vh)" }}>
          <div className="flex w-44 shrink-0 flex-col border-r bg-muted/30">
            <div className="border-b px-3 pt-4 pb-3">
              <DialogTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Help
              </DialogTitle>
            </div>
            <nav className="flex-1 space-y-0.5 p-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    page === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pr-10">
            {page === "overview" && (
              <OverviewPage onPageChange={onPageChange} />
            )}
            {page === "trajectories" && <TrajectoriesHelpPage />}
            {page === "courses" && <CourseHelpPage />}
            {page === "concepts" && <ConceptsPage />}
            {page === "bloom" && <BloomPage />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
