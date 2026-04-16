import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'
import { CsvActions } from './CsvActions'
import { TrajectorySection } from './TrajectorySection'
import { TloFormDialog } from './TloFormDialog'
import type { Tlo, Trajectory } from '@/lib/types'

export function TlosPage() {
  const { state, send } = useApp()
  const { tlos, trajectories } = state

  // Sort trajectories alphabetically
  const sortedTrajectories = [...trajectories].sort((a, b) => a.name.localeCompare(b.name))

  // Add Trajectory dialog
  const [addTrajectoryOpen, setAddTrajectoryOpen] = useState(false)
  const [newTrajectoryName, setNewTrajectoryName] = useState('')

  // Add/Edit TLO dialog
  const [tloDialogOpen, setTloDialogOpen] = useState(false)
  const [editingTlo, setEditingTlo] = useState<Partial<Tlo> | undefined>()

  function handleAddTrajectorySubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = newTrajectoryName.trim()
    if (!name) return
    setAddTrajectoryOpen(false)
    setNewTrajectoryName('')
    // Open TLO form without pre-selection
    setTloDialogOpen(true)
  }

  function handleTloSubmit(data: {
    trajectoryId: number
    name: string
    description: string
    bloomLevel: string | null
  }) {
    if (editingTlo?.id) {
      send({ type: 'tlo:update', id: editingTlo.id, ...data })
    } else {
      send({ type: 'tlo:add', ...data })
    }
    setEditingTlo(undefined)
  }

  function handleAddTloForTrajectory(traj: Trajectory) {
    setEditingTlo({ trajectoryId: traj.id })
    setTloDialogOpen(true)
  }

  function handleEditTlo(tlo: Tlo) {
    setEditingTlo(tlo)
    setTloDialogOpen(true)
  }

  function handleDeleteTlo(tlo: Tlo) {
    send({ type: 'tlo:delete', id: tlo.id })
  }

  function handleRenameTrajectory(oldName: string, newName: string) {
    send({ type: 'trajectory:rename', oldName, newName })
  }

  function handleDeleteTrajectory(name: string) {
    send({ type: 'trajectory:delete', name })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">TLOs</h1>
        <div className="ml-auto flex items-center gap-2">
          <CsvActions tlos={tlos} />
          <Button
            size="sm"
            onClick={() => {
              setNewTrajectoryName('')
              setAddTrajectoryOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add Trajectory
          </Button>
        </div>
      </div>

      {/* Trajectory sections */}
      {sortedTrajectories.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>No trajectories yet. Add a trajectory to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedTrajectories.map(trajectory => (
            <TrajectorySection
              key={trajectory.id}
              trajectory={trajectory.name}
              tlos={tlos.filter(t => t.trajectoryId === trajectory.id)}
              onRename={newName => handleRenameTrajectory(trajectory.name, newName)}
              onDelete={() => handleDeleteTrajectory(trajectory.name)}
              onAddTlo={() => handleAddTloForTrajectory(trajectory)}
              onEditTlo={handleEditTlo}
              onDeleteTlo={handleDeleteTlo}
            />
          ))}
        </div>
      )}

      {/* Add Trajectory dialog */}
      <Dialog open={addTrajectoryOpen} onOpenChange={setAddTrajectoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trajectory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTrajectorySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-trajectory-name">Trajectory Name</Label>
              <Input
                id="new-trajectory-name"
                value={newTrajectoryName}
                onChange={e => setNewTrajectoryName(e.target.value)}
                placeholder="e.g. Software Engineering"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddTrajectoryOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Next: Add TLO</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit TLO dialog */}
      <TloFormDialog
        open={tloDialogOpen}
        onOpenChange={open => {
          setTloDialogOpen(open)
          if (!open) setEditingTlo(undefined)
        }}
        trajectories={sortedTrajectories}
        initialData={editingTlo}
        onSubmit={handleTloSubmit}
      />
    </div>
  )
}
