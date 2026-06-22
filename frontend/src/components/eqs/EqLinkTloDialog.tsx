import { useMemo } from "react"
import { Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"

interface Props {
  eqId: number
  onClose: () => void
}

export function EqLinkTloDialog({ eqId, onClose }: Props) {
  const { state, send } = useApp()

  const eq = state.exitQualifications.find((e) => e.id === eqId)

  // Group TLOs by trajectory, sorted by trajectory name then TLO name
  const groupedTlos = useMemo(() => {
    const trajectoryById = new Map(state.trajectories.map((t) => [t.id, t]))

    const sorted = [...state.tlos].sort((a, b) => {
      const tA = trajectoryById.get(a.trajectoryId)?.name ?? ""
      const tB = trajectoryById.get(b.trajectoryId)?.name ?? ""
      const tc = tA.localeCompare(tB)
      if (tc !== 0) return tc
      return a.name.localeCompare(b.name)
    })

    const groups: Array<{ trajectory: { id: number; name: string }; tlos: typeof sorted }> = []
    for (const tlo of sorted) {
      const traj = trajectoryById.get(tlo.trajectoryId)
      if (!traj) continue
      const existing = groups.find((g) => g.trajectory.id === traj.id)
      if (existing) {
        existing.tlos.push(tlo)
      } else {
        groups.push({ trajectory: { id: traj.id, name: traj.name }, tlos: [tlo] })
      }
    }
    return groups
  }, [state.tlos, state.trajectories])

  function handleToggle(tlo: (typeof state.tlos)[number]) {
    const linked = tlo.eqId === eqId
    send({
      type: "tlo:update",
      id: tlo.id,
      trajectoryId: tlo.trajectoryId,
      name: tlo.name,
      description: tlo.description,
      bloomLevel: tlo.bloomLevel,
      eqId: linked ? null : eqId,
    })
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link TLOs to {eq?.name}</DialogTitle>
          <p className="text-xs text-muted-foreground italic">
            Select which TLOs should be linked to this exit qualification.
          </p>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {groupedTlos.map(({ trajectory, tlos }) => (
            <div key={trajectory.id}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 py-1.5">
                {trajectory.name}
              </p>
              <div className="space-y-0.5">
                {tlos.map((tlo) => {
                  const linked = tlo.eqId === eqId
                  return (
                    <button
                      key={tlo.id}
                      onClick={() => handleToggle(tlo)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent text-left"
                    >
                      <span
                        className={cn(
                          "size-4 rounded border flex items-center justify-center shrink-0",
                          linked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {linked && <Check className="size-3" />}
                      </span>
                      <span className="flex-1">
                        <span className="font-medium">{tlo.name}</span>
                        {tlo.description && (
                          <span className="ml-2 text-xs text-muted-foreground line-clamp-1">
                            {tlo.description}
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {groupedTlos.length === 0 && (
            <p className="text-sm text-muted-foreground italic px-1">No TLOs found.</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
