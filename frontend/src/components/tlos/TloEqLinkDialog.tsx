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
import type { Tlo } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  tlo: Tlo
}

export function TloEqLinkDialog({ open, onOpenChange, tlo }: Props) {
  const { state, send } = useApp()

  const eqs = [...state.exitQualifications].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  function handleSelect(newEqId: number | null) {
    send({
      type: "tlo:update",
      id: tlo.id,
      trajectoryId: tlo.trajectoryId,
      name: tlo.name,
      description: tlo.description,
      bloomLevel: tlo.bloomLevel,
      eqId: newEqId,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link to Exit Qualification</DialogTitle>
          <p className="text-xs text-muted-foreground italic">{tlo.name}</p>
        </DialogHeader>

        <div className="space-y-0.5">
          {/* None / clear link */}
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent text-left",
              tlo.eqId === null && "bg-accent/50"
            )}
          >
            <Check
              className={cn(
                "size-4 shrink-0",
                tlo.eqId === null ? "opacity-100" : "opacity-0"
              )}
            />
            <span className="text-muted-foreground">None (clear link)</span>
          </button>

          {/* EQ options */}
          {eqs.map((eq) => (
            <button
              key={eq.id}
              onClick={() => handleSelect(eq.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent text-left",
                tlo.eqId === eq.id && "bg-accent/50"
              )}
            >
              <Check
                className={cn(
                  "size-4 shrink-0",
                  tlo.eqId === eq.id ? "opacity-100" : "opacity-0"
                )}
              />
              <div>
                <p className="font-medium">{eq.name}</p>
                {eq.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {eq.description}
                  </p>
                )}
              </div>
            </button>
          ))}

          {eqs.length === 0 && (
            <p className="text-sm text-muted-foreground italic px-3 py-2">
              No exit qualifications defined yet.
            </p>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
