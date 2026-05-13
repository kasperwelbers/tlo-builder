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
    label: "TLOs & ILOs",
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

function CourseSectionMockup() {
  return (
    <div className="pointer-events-none my-4 space-y-3 text-sm select-none">
      {/* Unlinked ILOs bucket */}
      <div>
        <p className="mb-1 px-1 text-xs font-semibold tracking-wide text-muted-foreground">
          <Ann n={1} floating />
          ILOs without current course objective
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

      {/* Course objective section */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center gap-2 bg-muted/40 px-4 py-2">
          <div className="flex w-full items-center gap-3 text-xs">
            <ChevronDown className="size-4 shrink-0 text-muted-foreground/60" />
            <Ann n={2} floating />
            The student can conduct qualitative research
          </div>
          <span
            className={cn(
              "inline-flex h-6 items-center justify-center rounded border px-2 text-xs font-semibold opacity-50",
              bloomBadgeClass("C3")
            )}
          >
            <Ann n={3} floating />
            C3
          </span>
        </div>
        <div className="border-t" />
        <div className="py-1">
          <div className="flex items-center gap-3 rounded-md px-3 py-1.5">
            <Ann n={4} floating />
            <span
              className={cn(
                "inline-flex h-6 items-center justify-center rounded border px-2 text-xs font-semibold",
                bloomBadgeClass("C3")
              )}
            >
              C3
            </span>
            <span className="flex-1 text-xs font-medium">
              Conduct and analyse a semi-structured interview
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
    </div>
  )
}

function TrajectoriesHelpPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Trajectory Page</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Define high-level curriculum outcomes and break them down into specific,
        assessable learning outcomes linked to courses.
      </p>

      <Section title="What is a trajectory?">
        <P>
          A <strong>trajectory</strong> represents a cross-cutting learning
          theme — a degree program, specialization, or competency area. On this
          page you define <strong>Trajectory Learning Outcomes (TLOs)</strong>:
          broad, program-spanning statements of what graduates should be able to
          do.
        </P>
        <P>
          TLOs are intentionally high-level. To show concretely how the
          trajectory is achieved, each TLO is broken down into{" "}
          <strong>Intended Learning Outcomes (ILOs)</strong> — specific,
          assessable outcome statements, each linked to a course where it is
          taught and assessed.
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
            cognitive depth required across all ILOs in this TLO.
          </li>
          <li>
            <Ann n={3} /> <strong>TLO description</strong> — Written as{" "}
            <em>&quot;The student can…&quot;</em>. This is the graduate-level
            capability statement.
          </li>
          <li>
            <Ann n={4} /> <strong>ILO Bloom level</strong> — The cognitive depth
            required for this specific outcome.
          </li>
          <li>
            <Ann n={5} /> <strong>ILO description</strong> — A concrete,
            assessable statement, also written as{" "}
            <em>&quot;The student can…&quot;</em>.
          </li>
          <li>
            <Ann n={6} /> <strong>Course badge</strong> — Colored square showing
            the course where this ILO is addressed. Click to navigate there.
          </li>
        </ol>
      </Section>

      <Section title="Tips">
        <ul className="list-inside list-disc space-y-1.5 text-sm text-foreground/80">
          <li>
            Every TLO should have at least one ILO — a TLO with no ILOs is not
            substantiated by the curriculum.
          </li>
          <li>
            Every ILO should be linked to at least one course — use the link
            icon on hover to manage links.
          </li>
          <li>ILOs can be dragged between TLOs to reorganize them.</li>
          <li>
            ILO Bloom levels should collectively meet or exceed the TLO's Bloom
            level.
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
        See which ILOs are linked to your course and how they map to existing
        course objectives.
      </p>

      <Section title="What is the course page for?">
        <P>
          The course page shows the <strong>ILOs</strong> that have been linked
          to this course from trajectories. These are specific, assessable
          outcome statements that demonstrate how the course contributes to
          broader curriculum goals.
        </P>
        <P>
          You can import your course&apos;s existing objectives from the course
          manual as a reference point. ILOs can then be placed under the
          relevant objective to make explicit which parts of the course cover
          which trajectory outcomes.
        </P>
      </Section>

      <Section title="Anatomy of the course page">
        <CourseSectionMockup />
        <ol className="mt-2 space-y-1.5 text-sm text-foreground/80">
          <li>
            <Ann n={1} /> <strong>Unplaced ILOs</strong> — ILOs linked to this
            course that have not yet been placed under a course objective.
          </li>
          <li>
            <Ann n={2} /> <strong>Course objective</strong> — An existing
            outcome from the course manual, used as an organisational reference
            (read-only).
          </li>
          <li>
            <Ann n={3} /> <strong>Bloom level</strong> — The Bloom level of the
            course objective, if specified.
          </li>
          <li>
            <Ann n={4} /> <strong>Linked ILO</strong> — An ILO (created on the
            trajectory page) placed under this course objective.
          </li>
        </ol>
      </Section>

      <Section title="Tips">
        <ul className="list-inside list-disc space-y-1.5 text-sm text-foreground/80">
          <li>
            Course objectives are read-only — they come from the course manual.
            Delete and re-add if there is a mistake.
          </li>
          <li>
            Drag ILOs between course objective sections to reorganize them, or
            drag them back to the unplaced bucket at the top.
          </li>
          <li>
            Use the bulk importer to paste course objectives from a spreadsheet
            or course manual in one go.
          </li>
          <li>
            The Overview matrix shows trajectory coverage for this course based
            on the ILOs linked to it.
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
          they are covered and substantiated across courses.
        </p>
        <ol className="space-y-2">
          {(
            [
              [
                "Create a trajectory and define its TLOs",
                "A trajectory is a cross-cutting learning theme. TLOs describe the broad competencies students should have by the end of it.",
              ],
              [
                "Break each TLO into ILOs and link them to courses",
                "ILOs are specific, assessable outcomes. Each ILO belongs to one TLO and is linked to the course where it is taught.",
              ],
              [
                "Use the Overview matrix to check coverage",
                "The matrix shows which courses cover which trajectories, based on the ILOs linked to each course.",
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
          You review which ILOs have been linked to your course and organise
          them against your existing course objectives.
        </p>
        <ol className="space-y-2">
          {(
            [
              [
                "Import your course objectives",
                "Paste the existing outcomes from your course manual via the bulk importer. These act as an organisational reference on the course page.",
              ],
              [
                "Review ILOs with the trajectory coordinator",
                "The trajectory coordinator creates ILOs and links them to your course. Review and discuss them together.",
              ],
              [
                "Organise ILOs under course objectives",
                "Drag ILOs into the relevant course objective section to show which part of your course covers each trajectory outcome.",
              ],
              [
                "Check the Overview matrix",
                "See which trajectories your course contributes to, based on the ILOs linked to it.",
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
      <h1 className="mb-1 text-xl font-bold">TLOs &amp; ILOs</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        The two levels of learning outcomes and how they work together.
      </p>

      <Section title="TLO — Trajectory Learning Outcome">
        <P>
          A <strong>TLO</strong> is a broad, program-level statement of what
          students should be able to do by the end of a trajectory. TLOs span
          multiple courses and describe graduate-level competencies — they are
          not directly assessable on their own.
        </P>
        <Callout>
          Example: &quot;The student can critically evaluate social research and
          apply appropriate methods to investigate social issues.&quot;
        </Callout>
        <P>
          Think of a TLO as the <em>destination</em>: it states the end goal of
          the trajectory without prescribing exactly how courses get there.
        </P>
      </Section>

      <Section title="ILO — Intended Learning Outcome">
        <P>
          An <strong>ILO</strong> is a specific, assessable outcome that
          contributes to a TLO. Each ILO belongs to one TLO and is linked to the
          course where it is taught and assessed. ILOs are the concrete,
          testable steps that together justify and substantiate the TLO.
        </P>
        <Callout>
          Example: &quot;The student can conduct a semi-structured interview,
          transcribe and thematically code the data, and interpret findings in
          relation to a theoretical framework.&quot;
        </Callout>
        <P>
          ILOs should be written as <em>&quot;The student can…&quot;</em> and
          carry a Bloom level to make the expected cognitive depth explicit.
        </P>
      </Section>

      <Section title="How they align">
        <P>
          The relationship between TLOs and ILOs is one of justification: every
          TLO must be substantiated by at least one ILO, and every ILO must be
          linked to a course. Together they form a chain from graduate-level
          goal down to a concrete, teachable activity.
        </P>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-1.5 pr-4 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase"></th>
                <th className="py-1.5 pr-4 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  TLO
                </th>
                <th className="py-1.5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  ILO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-1.5 pr-4 font-medium text-muted-foreground">
                  Scope
                </td>
                <td className="py-1.5 pr-4">Trajectory-wide</td>
                <td className="py-1.5">Single course</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-muted-foreground">
                  Specificity
                </td>
                <td className="py-1.5 pr-4">Broad</td>
                <td className="py-1.5">Specific &amp; assessable</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-muted-foreground">
                  Directly assessable
                </td>
                <td className="py-1.5 pr-4">No</td>
                <td className="py-1.5">Yes</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-muted-foreground">
                  Set by
                </td>
                <td className="py-1.5 pr-4">Trajectory coordinator</td>
                <td className="py-1.5">Trajectory + course coordinator</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="The role of existing course objectives">
        <P>
          Most courses already have learning objectives in their course manual.
          The purpose of this tool is to determine whether those objectives
          connect to the trajectory goals — and, where needed, to reformulate
          them as proper ILOs with a clear Bloom level and standardised wording.
        </P>
        <P>
          You can import your course objectives into the course page (or they
          may already have been imported for you). They act as an organisational
          scaffold: once ILOs are created, drag them under the relevant
          objective to make the link explicit. Objectives that are not yet
          covered by any ILO are a signal that trajectory alignment work is
          still needed. Also, if an ILO is not placed under any objective, it
          indicates that either this ILO is not yet covered by the course, or
          the previous objectives simply didn't capture it well.
        </P>
        <P>
          If an existing objective is already well-formulated, you can base an
          ILO directly on it — the ILO text may even be identical. The
          distinction is that ILOs carry a verified Bloom level and are formally
          linked to a TLO; the course objective is just the reference it came
          from.
        </P>
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
