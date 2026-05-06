import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onCreate: () => void
}

export function LandingPage({ onCreate }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm space-y-10 text-center">
        {/* Brand */}
        <div className="space-y-3">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-foreground text-background text-xl font-bold select-none">
            T
          </div>
          <h1 className="text-3xl font-bold tracking-tight">TLO Builder</h1>
          <p className="text-muted-foreground leading-relaxed">
            Design and align trajectories, course learning objectives, and intended learning outcomes.
          </p>
        </div>

        {/* CTA */}
        <Button size="lg" onClick={onCreate} className="w-full gap-2">
          <Plus className="size-4" />
          New project
        </Button>

        {/* Note */}
        <p className="text-xs text-muted-foreground/70 leading-relaxed">
          Each project gets a unique secret URL — no login required.
          <br />
          Bookmark it to return to your work.
        </p>
      </div>
    </div>
  )
}
