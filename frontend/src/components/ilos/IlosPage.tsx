import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { CsvActions } from './CsvActions'
import { IloCard } from './IloCard'
import { IloFormDialog } from './IloFormDialog'
import type { Ilo } from '@/lib/types'

export function IlosPage() {
  const { state, send } = useApp()
  const { ilos } = state

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIlo, setEditingIlo] = useState<Partial<Ilo> | undefined>()

  function handleAddClick() {
    setEditingIlo(undefined)
    setDialogOpen(true)
  }

  function handleEditIlo(ilo: Ilo) {
    setEditingIlo(ilo)
    setDialogOpen(true)
  }

  function handleDeleteIlo(ilo: Ilo) {
    send({ type: 'ilo:delete', id: ilo.id })
  }

  function handleSubmit(data: { description: string; bloomLevel: string | null }) {
    if (editingIlo?.id) {
      send({ type: 'ilo:update', id: editingIlo.id, ...data })
    } else {
      send({ type: 'ilo:add', ...data })
    }
    setEditingIlo(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">ILOs</h1>
        <div className="ml-auto flex items-center gap-2">
          <CsvActions ilos={ilos} />
          <Button size="sm" onClick={handleAddClick}>
            <Plus className="size-4" />
            Add ILO
          </Button>
        </div>
      </div>

      {/* ILO list */}
      {ilos.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>No ILOs yet. Add an ILO to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ilos.map(ilo => (
            <IloCard
              key={ilo.id}
              ilo={ilo}
              onEdit={() => handleEditIlo(ilo)}
              onDelete={() => handleDeleteIlo(ilo)}
            />
          ))}
        </div>
      )}

      <IloFormDialog
        open={dialogOpen}
        onOpenChange={open => {
          setDialogOpen(open)
          if (!open) setEditingIlo(undefined)
        }}
        initialData={editingIlo}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
