import { useMemo, useState } from 'react'
import { Plus, ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ColorPicker } from '@/components/ui/color-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TloSection } from './TloSection'
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

  const [selectedTrajectoryId, setSelectedTrajectoryId] = useState<number | null>(null)

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
        </div>
      </div>

      {selectedTrajectoryId === null ? (
        /* Trajectory overview */
        trajectories.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No trajectories yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setNewTrajName(''); setNewTrajDescription(''); setNewTrajColor(randomColor()); setAddTrajOpen(true) }}>
              <Plus className="mr-1.5 size-4" /> Add your first trajectory
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trajectories.map(t => {
              const tlos = byTrajectory.get(t.id) ?? []
              return (
                <div
                  key={t.id}
                  className="cursor-pointer rounded-xl border border-l-4 bg-card p-4 shadow-sm hover:bg-muted/40 transition-colors"
                  style={{ borderLeftColor: t.color || '#64748b' }}
                  onClick={() => setSelectedTrajectoryId(t.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-base font-semibold">{t.name}</div>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 text-destructive hover:bg-destructive/10">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete trajectory?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete <strong>{t.name}</strong> and all {tlos.length} TLO{tlos.length !== 1 ? 's' : ''} inside it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => send({ type: 'trajectory:delete', trajectoryId: t.id })}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {t.description && <p className="mt-1 truncate text-xs text-muted-foreground">{t.description}</p>}
                  <div className="mt-4 text-sm text-muted-foreground">{tlos.length} TLO{tlos.length !== 1 ? 's' : ''}</div>
                </div>
              )
            })}
            <div
              className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-transparent p-4 text-muted-foreground shadow-sm transition-colors hover:bg-muted/40 hover:text-foreground"
              onClick={() => { setNewTrajName(''); setNewTrajDescription(''); setNewTrajColor(randomColor()); setAddTrajOpen(true) }}
            >
              <Plus className="size-6" />
              <span className="font-medium">Add Trajectory</span>
            </div>
          </div>
        )
      ) : (
        /* Selected trajectory view */
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedTrajectoryId(null)}>
              <ChevronLeft className="size-5" />
            </Button>
            <Select value={selectedTrajectoryId.toString()} onValueChange={v => setSelectedTrajectoryId(Number(v))}>
              <SelectTrigger className="w-fit min-w-[200px] border-0 shadow-none focus:ring-0 px-2 text-xl font-semibold bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {trajectories.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Button onClick={() => openAddTlo(selectedTrajectoryId)} size="sm">
                <Plus className="mr-1.5 size-4" /> Add TLO
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {(byTrajectory.get(selectedTrajectoryId) ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed p-12 text-center">
                <p className="text-muted-foreground">No TLOs yet in this trajectory.</p>
              </div>
            ) : (
              (byTrajectory.get(selectedTrajectoryId) ?? []).map(tlo => (
                <TloSection
                  key={tlo.id}
                  tlo={tlo}
                  ilos={state.ilos.filter(i => i.tloId === tlo.id)}
                  courseObjectives={state.courseObjectives}
                  iloCourseObjectiveMappings={state.iloCourseObjectiveMappings}
                  onEdit={() => { setEditTlo(tlo); setAddTloOpen(true) }}
                  onDelete={() => send({ type: 'tlo:delete', id: tlo.id })}
                />
              ))
            )}
          </div>
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
