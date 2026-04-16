import { useState } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { TloCard } from './TloCard'
import type { Tlo } from '@/lib/types'

interface Props {
  trajectory: string
  tlos: Tlo[]
  onRename: (newName: string) => void
  onDelete: () => void
  onAddTlo: () => void
  onEditTlo: (tlo: Tlo) => void
  onDeleteTlo: (tlo: Tlo) => void
}

export function TrajectorySection({
  trajectory,
  tlos,
  onRename,
  onDelete,
  onAddTlo,
  onEditTlo,
  onDeleteTlo,
}: Props) {
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(trajectory)

  function startRename() {
    setNewName(trajectory)
    setRenaming(true)
  }

  function commitRename() {
    const trimmed = newName.trim()
    if (trimmed && trimmed !== trajectory) {
      onRename(trimmed)
    }
    setRenaming(false)
  }

  function cancelRename() {
    setRenaming(false)
    setNewName(trajectory)
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        {renaming ? (
          <>
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') cancelRename()
              }}
              className="h-7 w-48 text-sm font-semibold"
              autoFocus
            />
            <Button variant="ghost" size="icon-xs" onClick={commitRename}>
              <Check className="size-3" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={cancelRename}>
              <X className="size-3" />
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {trajectory}
            </h3>
            <Button variant="ghost" size="icon-xs" onClick={startRename}>
              <Pencil className="size-3" />
              <span className="sr-only">Rename trajectory</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                  <Trash2 className="size-3" />
                  <span className="sr-only">Delete trajectory</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete trajectory "{trajectory}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all {tlos.length} TLO{tlos.length !== 1 ? 's' : ''} in this
                    trajectory and all their mappings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      {/* TLO cards */}
      <div className="space-y-2 pl-2">
        {tlos.map(tlo => (
          <TloCard
            key={tlo.id}
            tlo={tlo}
            onEdit={() => onEditTlo(tlo)}
            onDelete={() => onDeleteTlo(tlo)}
          />
        ))}
      </div>

      {/* Add TLO button */}
      <div className="pl-2">
        <Button variant="ghost" size="sm" onClick={onAddTlo}>
          <Plus className="size-4" />
          Add TLO
        </Button>
      </div>
    </div>
  )
}
