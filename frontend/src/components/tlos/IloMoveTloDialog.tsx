import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import type { Ilo } from "@/lib/types"

interface Props {
  ilo: Ilo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IloMoveTloDialog({ ilo, open, onOpenChange }: Props) {
  const { state, send } = useApp()

  const sortedTrajectories = [...state.trajectories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })
  )

  const tlosByTrajectory = new Map(
    sortedTrajectories.map((t) => [
      t.id,
      [...state.tlos]
        .filter((tlo) => tlo.trajectoryId === t.id)
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        ),
    ])
  )

  function handleMove(tloId: number) {
    send({ type: "tlo_ilo_mapping:add", tloId, iloId: ilo.id })
    onOpenChange(false)
  }

  const hasTlos = sortedTrajectories.some(
    (t) => (tlosByTrajectory.get(t.id)?.length ?? 0) > 0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Move ILO to other TLO</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {ilo.description || <span className="italic">No description</span>}
          </DialogDescription>
        </DialogHeader>

        {!hasTlos ? (
          <p className="py-4 text-center text-sm text-muted-foreground italic">
            No TLOs available.
          </p>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {sortedTrajectories.map((traj) => {
              const tlos = tlosByTrajectory.get(traj.id) ?? []
              if (tlos.length === 0) return null
              return (
                <div key={traj.id}>
                  {/* Trajectory label */}
                  <div className="mb-1 flex items-center gap-1.5 px-1">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: traj.color }}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {traj.name}
                    </span>
                  </div>

                  {/* TLO list */}
                  <div className="space-y-0.5">
                    {tlos.map((tlo) => {
                      const isCurrent = tlo.id === ilo.tloId
                      return (
                        <button
                          key={tlo.id}
                          disabled={isCurrent}
                          onClick={() => handleMove(tlo.id)}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors",
                            isCurrent
                              ? "cursor-default opacity-40"
                              : "hover:bg-accent"
                          )}
                        >
                          <span className="flex-1 leading-snug">
                            {tlo.name}
                          </span>
                          {isCurrent && (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              current
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
