import { useMemo, useState } from "react"
import { Search } from "lucide-react"
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
import type { CurrentIlo } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentIlo: CurrentIlo
}

export function NewIloDialog({ open, onOpenChange, currentIlo }: Props) {
  const { state, send } = useApp()
  const [q, setQ] = useState("")

  function handleSelect(tloId: number) {
    send({
      type: "ilo:create",
      tloId,
      description: "",
      bloomLevel: null,
      currentIloId: currentIlo.id,
      courseId: currentIlo.courseId,
    })
    onOpenChange(false)
  }

  const groups = useMemo(() => {
    const ql = q.toLowerCase()
    return [...state.trajectories]
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map((trajectory) => {
        const tlos = state.tlos
          .filter((t) => t.trajectoryId === trajectory.id)
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

        if (!ql) return { trajectory, tlos }

        // When searching: keep trajectory if its name/description matches,
        // otherwise keep only TLOs whose name or description matches.
        const trajectoryMatches =
          trajectory.name.toLowerCase().includes(ql) ||
          trajectory.description?.toLowerCase().includes(ql)

        const filteredTlos = trajectoryMatches
          ? tlos
          : tlos.filter(
              (t) =>
                t.name.toLowerCase().includes(ql) ||
                t.description?.toLowerCase().includes(ql)
            )

        return { trajectory, tlos: filteredTlos }
      })
      .filter((g) => g.tlos.length > 0)
  }, [q, state.trajectories, state.tlos])

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
          <DialogTitle>New ILO</DialogTitle>
        </DialogHeader>

        {/* Context reminder */}
        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground italic">
          Linked to: {currentIlo.description || "The student can…"}
        </p>

        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search trajectories or TLOs…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="h-80 overflow-y-auto rounded-md border">
          {groups.length === 0 && (
            <div className="flex h-full items-center justify-center px-4">
              <p className="text-center text-sm text-muted-foreground italic">
                {state.trajectories.length === 0
                  ? "No trajectories yet. Add one in the sidebar."
                  : "No results."}
              </p>
            </div>
          )}

          {groups.map(({ trajectory, tlos }) => (
            <div
              key={trajectory.id}
              className="border-b last:border-b-0"
              style={{ backgroundColor: trajectory.color + "15" }}
            >
              {/* Trajectory header — name + description */}
              <div
                className="flex items-start gap-2.5 px-3 py-2.5"
                style={{ backgroundColor: trajectory.color + "28" }}
              >
                <span
                  className="mt-0.5 size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: trajectory.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-snug">
                    {trajectory.name}
                  </p>
                  {trajectory.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-muted-foreground">
                      {trajectory.description}
                    </p>
                  )}
                </div>
              </div>

              {/* TLO rows */}
              {tlos.map((tlo) => (
                <button
                  key={tlo.id}
                  onClick={() => handleSelect(tlo.id)}
                  className="flex w-full items-start gap-2.5 border-t px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <div className="min-w-0 flex-1 pl-4">
                    <p className="text-xs font-medium leading-snug">
                      {tlo.name || (
                        <span className="italic opacity-50">Unnamed TLO</span>
                      )}
                    </p>
                    {tlo.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                        {tlo.description}
                      </p>
                    )}
                  </div>
                  {tlo.bloomLevel && (
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-xs",
                        bloomBadgeClass(tlo.bloomLevel)
                      )}
                    >
                      {tlo.bloomLevel}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
