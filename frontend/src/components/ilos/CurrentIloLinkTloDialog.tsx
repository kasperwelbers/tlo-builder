import { useMemo, useState } from "react"
import { Check, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { bloomBadgeClass } from "@/lib/bloomColors"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import type { CurrentIlo, Ilo, Tlo, Trajectory } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentIlo: CurrentIlo
}

interface FlatGroup {
  label: string
  trajectory: Trajectory
  tlo: Tlo
  ilos: Ilo[]
}

export function CurrentIloLinkTloDialog({
  open,
  onOpenChange,
  currentIlo,
}: Props) {
  const { state, send } = useApp()
  const [q, setQ] = useState("")

  const linkedIloIds = useMemo(
    () =>
      new Set(
        state.iloCurrentIloMappings
          .filter(
            (m) =>
              m.courseId === currentIlo.courseId &&
              m.currentIloId === currentIlo.id
          )
          .map((m) => m.iloId)
      ),
    [state.iloCurrentIloMappings, currentIlo.courseId, currentIlo.id]
  )

  function toggleIlo(iloId: number) {
    if (linkedIloIds.has(iloId)) {
      send({
        type: "ilo_current_ilo_mapping:delete",
        iloId,
        courseId: currentIlo.courseId,
      })
    } else {
      send({
        type: "ilo_current_ilo_mapping:add",
        iloId,
        courseId: currentIlo.courseId,
        currentIloId: currentIlo.id,
      })
    }
  }

  // Flat list: one entry per trajectory-TLO combination.
  // When a query is active:
  //   - Show the group if its label matches, OR at least one ILO matches.
  //   - Only show ILOs that match the query.
  const groups = useMemo<FlatGroup[]>(() => {
    const ql = q.toLowerCase()
    const sortedTrajectories = [...state.trajectories].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    )

    return sortedTrajectories.flatMap((trajectory) => {
      const tlos = state.tlos.filter((t) => t.trajectoryId === trajectory.id)
      return tlos.flatMap((tlo) => {
        const label = trajectory.name + ": " + tlo.name
        const labelMatch = !q || label.toLowerCase().includes(ql)
        const allIlos = state.ilos.filter((i) => i.tloId === tlo.id)
        const filteredIlos = !q
          ? allIlos
          : allIlos.filter((i) => i.description?.toLowerCase().includes(ql))
        const visible = labelMatch || filteredIlos.length > 0
        if (!visible) return []
        return [{ label, trajectory, tlo, ilos: filteredIlos }]
      })
    })
  }, [q, state.trajectories, state.tlos, state.ilos])

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setQ("")
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Link ILOs to Current ILO
          </DialogTitle>
        </DialogHeader>

        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground italic">
          {currentIlo.description || "The student can…"}
        </p>

        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search trajectories, TLOs or ILOs…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="h-80 overflow-y-auto rounded-md border">
          {groups.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground italic">
                No results.
              </p>
            </div>
          )}
          {groups.map(({ label, trajectory, tlo, ilos }) => (
            <div
              key={tlo.id}
              className="border-b last:border-b-0"
              style={{ backgroundColor: trajectory.color + "15" }}
            >
              {/* Flat header: Trajectory: TLO */}
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{ backgroundColor: trajectory.color + "28" }}
              >
                <span
                  className="size-3.5 shrink-0 rounded-full"
                  style={{ backgroundColor: trajectory.color }}
                />
                <span className="flex-1 text-xs leading-snug font-semibold">
                  {label}
                </span>
                {tlo.bloomLevel && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-xs",
                      bloomBadgeClass(tlo.bloomLevel)
                    )}
                  >
                    {tlo.bloomLevel}
                  </span>
                )}
              </div>

              {/* ILO rows */}
              {ilos.map((ilo) => {
                const linked = linkedIloIds.has(ilo.id)
                return (
                  <button
                    key={ilo.id}
                    onClick={() => toggleIlo(ilo.id)}
                    className="flex w-full items-center gap-2.5 border-t px-3 py-1.5 text-left transition-colors hover:bg-accent"
                  >
                    <div
                      className={cn(
                        "flex size-3.5 shrink-0 items-center justify-center rounded border",
                        linked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {linked && <Check className="size-2.5" />}
                    </div>
                    <span className="min-w-0 flex-1 text-xs leading-snug">
                      {ilo.description || (
                        <span className="italic opacity-50">
                          The student can…
                        </span>
                      )}
                    </span>
                    {ilo.bloomLevel && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-xs",
                          bloomBadgeClass(ilo.bloomLevel)
                        )}
                      >
                        {ilo.bloomLevel}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
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
