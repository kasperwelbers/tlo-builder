import { useMemo, useState } from "react"
import { Check, Plus, Search } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { bloomBadgeClass } from "@/lib/bloomColors"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import type { Clo, Ilo, Tlo, Trajectory } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  clo: Clo
}

interface FlatGroup {
  label: string
  trajectory: Trajectory
  tlo: Tlo
  ilos: Ilo[]
}

export function CloLinkTloDialog({ open, onOpenChange, clo }: Props) {
  const { state, send } = useApp()
  const [q, setQ] = useState("")

  const linkedIloIds = useMemo(() => new Set(
    state.iloCloMappings
      .filter(m => m.courseId === clo.courseId && m.cloId === clo.id)
      .map(m => m.iloId)
  ), [state.iloCloMappings, clo.courseId, clo.id])

  function toggleIlo(iloId: number) {
    if (linkedIloIds.has(iloId)) {
      send({ type: "ilo_clo_mapping:delete", iloId, courseId: clo.courseId })
    } else {
      send({ type: "ilo_clo_mapping:add", iloId, courseId: clo.courseId, cloId: clo.id })
    }
  }

  function createIlo(tloId: number) {
    send({ type: "ilo:create", tloId, description: "", bloomLevel: null, cloId: clo.id, courseId: clo.courseId })
    onOpenChange(false)
  }

  // Flat list: one entry per trajectory-TLO combination.
  // When a query is active:
  //   - Show the group if its label (trajectory + TLO) matches, OR at least one ILO matches.
  //   - Only show ILOs that match the query (never all ILOs just because the label matched).
  const groups = useMemo<FlatGroup[]>(() => {
    const ql = q.toLowerCase()
    const sortedTrajectories = [...state.trajectories].sort((a, b) => a.name.localeCompare(b.name))

    return sortedTrajectories.flatMap(trajectory => {
      const tlos = state.tlos.filter(t => t.trajectoryId === trajectory.id)
      return tlos.flatMap(tlo => {
        const label = trajectory.name + ": " + tlo.name
        const labelMatch = !q || label.toLowerCase().includes(ql)
        const allIlos = state.ilos.filter(i => i.tloId === tlo.id)
        const filteredIlos = !q
          ? allIlos
          : allIlos.filter(i => i.description?.toLowerCase().includes(ql))
        const visible = labelMatch || filteredIlos.length > 0
        if (!visible) return []
        return [{ label, trajectory, tlo, ilos: filteredIlos }]
      })
    })
  }, [q, state.trajectories, state.tlos, state.ilos])

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) setQ(""); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Link ILOs to CLO</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground leading-snug line-clamp-2 italic">
          {clo.description || "The student can…"}
        </p>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search trajectories, TLOs or ILOs…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="h-80 overflow-y-auto rounded-md border">
          {groups.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground italic">No results.</p>
            </div>
          )}
          {groups.map(({ label, trajectory, tlo, ilos }) => (
            <div key={tlo.id} className="border-b last:border-b-0" style={{ backgroundColor: trajectory.color + '15' }}>
              {/* Flat header: Trajectory: TLO */}
              <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: trajectory.color + '28' }}>
                <span className="size-3.5 rounded-full shrink-0" style={{ backgroundColor: trajectory.color }} />
                <span className="text-xs font-semibold flex-1 leading-snug">{label}</span>
                {tlo.bloomLevel && (
                  <span className={cn("shrink-0 text-xs font-mono px-1.5 py-0.5 rounded-full border", bloomBadgeClass(tlo.bloomLevel))}>
                    {tlo.bloomLevel}
                  </span>
                )}
              </div>

              {/* ILOs */}
              {ilos.map(ilo => {
                const linked = linkedIloIds.has(ilo.id)
                return (
                  <button
                    key={ilo.id}
                    onClick={() => toggleIlo(ilo.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-1.5 text-left border-t transition-colors hover:bg-accent",

                    )}
                  >
                    <div className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded border",
                      linked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                    )}>
                      {linked && <Check className="size-2.5" />}
                    </div>
                    <span className="flex-1 min-w-0 text-xs leading-snug">
                      {ilo.description || <span className="italic opacity-50">The student can…</span>}
                    </span>
                    {ilo.bloomLevel && (
                      <span className={cn("shrink-0 text-xs font-mono px-1.5 py-0.5 rounded-full border", bloomBadgeClass(ilo.bloomLevel))}>
                        {ilo.bloomLevel}
                      </span>
                    )}
                  </button>
                )
              })}

              {/* New ILO */}
              <button
                onClick={() => createIlo(tlo.id)}
                className="flex w-full items-center gap-2.5 px-3 pl- font-bold py-1.5 text-xs text-muted-foreground hover:bg-accent border-t transition-colors"
              >
                <Plus className="size-3.5 shrink-0" />
                <span className="">Add new ILO</span>
              </button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
