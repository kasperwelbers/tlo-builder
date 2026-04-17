import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { ColorPicker } from '@/components/ui/color-picker'
import { TrajectoryAccordion } from './TrajectoryAccordion'
import { TloFormDialog } from '@/components/tlos/TloFormDialog'
import { YamlActions } from '@/components/YamlActions'
import { useApp } from '@/context/AppContext'
import { randomColor } from '@/lib/colorPalette'
import type { Tlo } from '@/lib/types'

export function WorkspacePage() {
  const { state, send } = useApp()

  // Group TLOs by trajectory
  const byTrajectory = useMemo(() => {
    const map = new Map<number, Tlo[]>()
    for (const tlo of state.tlos) {
      const arr = map.get(tlo.trajectoryId) ?? []
      arr.push(tlo)
      map.set(tlo.trajectoryId, arr)
    }
    return map
  }, [state.tlos])

  const trajectories = useMemo(
    () => [...state.trajectories].sort((a, b) => a.name.localeCompare(b.name)),
    [state.trajectories]
  )

  // Collapsed state
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  function toggleCollapsed(id: number) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Add trajectory dialog
  const [addTrajOpen, setAddTrajOpen] = useState(false)
  const [newTrajName, setNewTrajName] = useState('')
  const [newTrajDescription, setNewTrajDescription] = useState('')
  const [newTrajColor, setNewTrajColor] = useState('')

  function submitAddTrajectory() {
    const name = newTrajName.trim()
    if (!name) return
    send({ type: 'trajectory:create', name, description: newTrajDescription.trim(), color: newTrajColor })
    setNewTrajName('')
    setNewTrajDescription('')
    setAddTrajOpen(false)
  }

  // Add / edit TLO dialog
  const [addTloOpen, setAddTloOpen] = useState(false)
  const [addTloForTrajectoryId, setAddTloForTrajectoryId] = useState<number | null>(null)
  const [editTlo, setEditTlo] = useState<Tlo | null>(null)

  function openAddTlo(trajectoryId: number) {
    setAddTloForTrajectoryId(trajectoryId)
    setEditTlo(null)
    setAddTloOpen(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workspace</h1>
        <div className="flex items-center gap-2">
          <YamlActions />
          <Button onClick={() => { setNewTrajName(''); setNewTrajDescription(''); setNewTrajColor(randomColor()); setAddTrajOpen(true) }}>
            <Plus className="mr-1.5 size-4" /> Add Trajectory
          </Button>
        </div>
      </div>

      {/* Trajectory list */}
      {trajectories.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No trajectories yet.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setNewTrajName(''); setNewTrajDescription(''); setNewTrajColor(randomColor()); setAddTrajOpen(true) }}>
            <Plus className="mr-1.5 size-4" /> Add your first trajectory
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {trajectories.map(t => (
            <TrajectoryAccordion
              key={t.id}
              trajectory={t}
              tlos={byTrajectory.get(t.id) ?? []}
              ilos={state.ilos}

              iloCourseObjectiveMappings={state.iloCourseObjectiveMappings}
              courseObjectives={state.courseObjectives}
              collapsed={collapsed.has(t.id)}
              onToggle={() => toggleCollapsed(t.id)}
              onUpdate={data => send({ type: 'trajectory:update', trajectoryId: t.id, ...data })}
              onDelete={() => send({ type: 'trajectory:delete', trajectoryId: t.id })}
              onAddTlo={() => openAddTlo(t.id)}
              onEditTlo={tlo => { setEditTlo(tlo); setAddTloOpen(true) }}
              onDeleteTlo={tlo => send({ type: 'tlo:delete', id: tlo.id })}
            />
          ))}
        </div>
      )}

      {/* Add trajectory dialog */}
      <Dialog open={addTrajOpen} onOpenChange={setAddTrajOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New trajectory</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={newTrajName}
                onChange={e => setNewTrajName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitAddTrajectory() }}
                placeholder="Trajectory name"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={newTrajDescription}
                onChange={e => setNewTrajDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <ColorPicker value={newTrajColor} onChange={setNewTrajColor} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTrajOpen(false)}>Cancel</Button>
            <Button onClick={submitAddTrajectory} disabled={!newTrajName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / edit TLO dialog */}
      <TloFormDialog
        open={addTloOpen}
        onOpenChange={open => { if (!open) { setAddTloOpen(false); setEditTlo(null) } }}
        trajectories={trajectories}
        initialData={editTlo ?? (addTloForTrajectoryId !== null ? { trajectoryId: addTloForTrajectoryId } : undefined)}
        onSubmit={data => {
          if (editTlo) {
            send({ type: 'tlo:update', id: editTlo.id, ...data })
          } else {
            send({ type: 'tlo:add', ...data })
          }
          setEditTlo(null)
        }}
      />
    </div>
  )
}
