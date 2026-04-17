import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/context/AppContext'

export function TloIloPanel() {
  const { state, send } = useApp()
  const { tlos, ilos, trajectories } = state
  const tloIloMappings = ilos.filter(i => i.tloId !== null).map(i => ({ tloId: i.tloId!, iloId: i.id }))
  const trajectoryById = new Map(trajectories.map(t => [t.id, t]))

  // Track which TLO has an open ILO-assign selector
  const [assigningTloId, setAssigningTloId] = useState<number | null>(null)

  const trajectoryNames = [...new Set(tlos.map(t => trajectoryById.get(t.trajectoryId)?.name ?? ""))].sort()

  // Set of iloIds that are already mapped to any TLO
  const mappedIloIds = new Set(tloIloMappings.map(m => m.iloId))

  // ILOs with no parent TLO
  const unmappedIlos = ilos.filter(ilo => !mappedIloIds.has(ilo.id))

  function handleAssignIlo(tloId: number, iloId: string) {
    if (!iloId) return
    send({ type: 'tlo_ilo_mapping:add', tloId, iloId: Number(iloId) })
    setAssigningTloId(null)
  }

  function handleRemoveMapping(tloId: number, iloId: number) {
    send({ type: 'tlo_ilo_mapping:delete', tloId, iloId })
  }

  return (
    <div className="space-y-8">
      {trajectoryNames.length === 0 && (
        <p className="text-center text-muted-foreground">No TLOs defined yet.</p>
      )}
      {trajectoryNames.map(trajectory => {
        const trajectoryTlos = tlos.filter(t => (trajectoryById.get(t.trajectoryId)?.name ?? "") === trajectory)
        return (
          <div key={trajectory} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {trajectory}
            </h3>
            <div className="space-y-4 pl-2">
              {trajectoryTlos.map(tlo => {
                const mappedIlos = tloIloMappings
                  .filter(m => m.tloId === tlo.id)
                  .map(m => ilos.find(i => i.id === m.iloId))
                  .filter(Boolean)

                const isAssigning = assigningTloId === tlo.id

                return (
                  <div key={tlo.id} className="rounded-lg border p-3">
                    <p className="font-medium">{tlo.name}</p>
                    {tlo.description && (
                      <p className="text-sm text-muted-foreground">{tlo.description}</p>
                    )}

                    {/* Mapped ILOs */}
                    <div className="mt-2 space-y-1 pl-3">
                      {mappedIlos.map(ilo => (
                        <div
                          key={ilo!.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="flex-1 truncate">{ilo.description}</span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleRemoveMapping(tlo.id, ilo!.id)}
                          >
                            <X className="size-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}

                      {mappedIlos.length === 0 && (
                        <p className="text-xs text-muted-foreground">No ILOs assigned yet.</p>
                      )}
                    </div>

                    {/* Assign ILO */}
                    <div className="mt-2 pl-3">
                      {isAssigning ? (
                        <div className="flex items-center gap-2">
                          <Select onValueChange={val => handleAssignIlo(tlo.id, val)}>
                            <SelectTrigger className="h-7 w-56 text-xs">
                              <SelectValue placeholder="Select ILO…" />
                            </SelectTrigger>
                            <SelectContent>
                              {unmappedIlos.length === 0 ? (
                                <SelectItem value="__none" disabled>
                                  No unassigned ILOs
                                </SelectItem>
                              ) : (
                                unmappedIlos.map(ilo => (
                                  <SelectItem key={ilo.id} value={String(ilo.id)}>
                                    {ilo.description}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setAssigningTloId(null)}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setAssigningTloId(tlo.id)}
                        >
                          + Assign ILO
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
