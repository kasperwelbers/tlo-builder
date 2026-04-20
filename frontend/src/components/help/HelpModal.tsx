import { BookOpen, GraduationCap, Layers } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { BLOOM_LEVELS, BLOOM_CATEGORIES } from "@/lib/bloomLevels"
import { bloomBadgeClass } from "@/lib/bloomColors"

export type HelpPage = "overview" | "concepts" | "bloom"

interface HelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: HelpPage
  onPageChange: (page: HelpPage) => void
}

const NAV_ITEMS: { id: HelpPage; label: string; icon: React.ReactNode }[] = [
  { id: "overview",  label: "Overview",         icon: <BookOpen      className="size-3.5 shrink-0" /> },
  { id: "concepts",  label: "TLOs, ILOs & CLOs", icon: <Layers        className="size-3.5 shrink-0" /> },
  { id: "bloom",     label: "Bloom's Taxonomy",  icon: <GraduationCap className="size-3.5 shrink-0" /> },
]

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      {title && <h2 className="text-base font-semibold mb-2">{title}</h2>}
      {children}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground/80 leading-relaxed mb-2 last:mb-0">{children}</p>
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-muted/50 px-3 py-2 my-2 text-sm text-muted-foreground italic leading-relaxed">
      {children}
    </div>
  )
}

function OverviewPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">TLO Builder</h1>

      <Section>
        <P>
          TLO Builder helps you design, organize, and align learning outcomes across learning
          trajectories and courses — from high-level program goals down to specific, assessable activities.
        </P>
      </Section>

      <Section title="Getting started">
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-foreground/80">
          <li>Add a <strong>trajectory</strong> (a learning path or program) in the sidebar.</li>
          <li>Add <strong>TLOs</strong> (Trajectory Learning Outcomes) to that trajectory.</li>
          <li>Add <strong>courses</strong> and define their <strong>CLOs</strong> (Course Learning Outcomes).</li>
          <li>
            Create <strong>ILOs</strong> (Intended Learning Outcomes) that link each TLO to relevant
            CLOs — these are the specific, assessable outcomes students work toward.
          </li>
        </ol>
      </Section>

      <Section title="Tips">
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/80">
          <li>Use the <strong>Bloom's Taxonomy</strong> levels to indicate cognitive depth for each outcome.</li>
          <li>Drag ILOs between CLO buckets on the course page to reassign them.</li>
          <li>Use <strong>Import / Export</strong> at the bottom of the sidebar to save or load your work as YAML.</li>
        </ul>
      </Section>
    </div>
  )
}

function ConceptsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-1">TLOs, ILOs &amp; CLOs</h1>
      <p className="text-sm text-muted-foreground mb-5">
        How the three levels of learning outcomes relate to each other.
      </p>

      <Section title="TLO — Trajectory Learning Outcome">
        <P>
          A TLO is a broad, program-level statement of what students should achieve by the end of a
          trajectory (a degree program, specialization, or learning path). TLOs span multiple courses
          and describe graduate-level competencies.
        </P>
        <Callout>
          Example: &quot;Students can design, implement, and evaluate software systems for real-world problems.&quot;
        </Callout>
      </Section>

      <Section title="CLO — Course Learning Outcome">
        <P>
          A CLO is a course-scoped outcome describing what students should achieve by the end of a
          particular course. CLOs are more specific than TLOs but still broad enough to be addressed by
          many different assignments and activities within the course.
        </P>
        <Callout>
          Example: &quot;Students can apply object-oriented design patterns to structure maintainable software.&quot;
        </Callout>
      </Section>

      <Section title="ILO — Intended Learning Outcome">
        <P>
          An ILO is a specific, assessable outcome that sits at the intersection of a TLO and a CLO.
          ILOs are the most granular level — they pin down exactly what students will demonstrate, in
          what context, and at what level of cognitive depth.
        </P>
        <P>
          Each ILO belongs to one TLO (its trajectory context) and is linked to one CLO (its course
          context). This dual link creates an alignment map: you can trace any ILO upward to a program
          goal and sideways to a course expectation.
        </P>
        <Callout>
          Example: &quot;Students can implement the Factory and Observer design patterns to build a modular,
          event-driven system in Java, justifying the trade-offs of each pattern.&quot;
        </Callout>
      </Section>

      <Section title="Why are ILOs more specific than CLOs?">
        <P>
          A CLO defines what a course broadly aims to achieve — it could be satisfied by many different
          activities. An ILO narrows that down to a <em>single, concrete demonstration</em>: it specifies
          the method, the artifact, the context, and often the standard of quality.
        </P>
        <P>
          Think of it this way: a CLO is a destination, and an ILO is the specific route you take to
          reach it within a particular trajectory.
        </P>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1.5 pr-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide"></th>
                <th className="text-left py-1.5 pr-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">TLO</th>
                <th className="text-left py-1.5 pr-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">CLO</th>
                <th className="text-left py-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">ILO</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr><td className="py-1.5 pr-4 text-muted-foreground font-medium">Level</td><td className="py-1.5 pr-4">Trajectory</td><td className="py-1.5 pr-4">Course</td><td className="py-1.5">Activity / Assessment</td></tr>
              <tr><td className="py-1.5 pr-4 text-muted-foreground font-medium">Specificity</td><td className="py-1.5 pr-4">Low</td><td className="py-1.5 pr-4">Medium</td><td className="py-1.5">High</td></tr>
              <tr><td className="py-1.5 pr-4 text-muted-foreground font-medium">Directly assessable</td><td className="py-1.5 pr-4">No</td><td className="py-1.5 pr-4">Partially</td><td className="py-1.5">Yes</td></tr>
              <tr><td className="py-1.5 pr-4 text-muted-foreground font-medium">Set by</td><td className="py-1.5 pr-4">Program designers</td><td className="py-1.5 pr-4">Course instructors</td><td className="py-1.5">Both, in alignment</td></tr>
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
      <h1 className="text-xl font-bold mb-1">Bloom's Taxonomy</h1>
      <p className="text-sm text-muted-foreground mb-5">
        A framework for categorizing the cognitive, affective, and psychomotor depth of learning outcomes.
        Assign a Bloom level to TLOs, ILOs, and CLOs to make the expected depth explicit.
      </p>

      {BLOOM_CATEGORIES.map(cat => (
        <Section key={cat.key} title={cat.label}>
          <div className="space-y-2">
            {BLOOM_LEVELS.filter(l => l.category === cat.key).map(level => (
              <div key={level.code} className="flex items-start gap-3">
                <span className={cn(
                  "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  bloomBadgeClass(level.code)
                )}>
                  {level.code}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{level.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  )
}

export function HelpModal({ open, onOpenChange, page, onPageChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-2xl">
        <div className="flex" style={{ height: "min(600px, 85vh)" }}>
          <div className="w-44 border-r bg-muted/30 flex flex-col shrink-0">
            <div className="px-3 pt-4 pb-3 border-b">
              <DialogTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Help
              </DialogTitle>
            </div>
            <nav className="flex-1 p-2 space-y-0.5">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors",
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
            {page === "overview"  && <OverviewPage />}
            {page === "concepts"  && <ConceptsPage />}
            {page === "bloom"     && <BloomPage />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
