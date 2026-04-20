import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CloCard } from './CloCard'
import type { Clo } from '@/lib/types'

interface Props {
  clos: Clo[]
  onAddClo: () => void
  onEditClo: (clo: Clo) => void
  onDeleteClo: (clo: Clo) => void
}

export function CourseSection({ clos, onAddClo, onEditClo, onDeleteClo }: Props) {
  return (
    <div className="space-y-2">
      {clos.length === 0 && (
        <p className="text-sm text-muted-foreground italic px-1">No CLOs yet.</p>
      )}
      {clos.map(clo => (
        <CloCard
          key={clo.id}
          clo={clo}
          onEdit={() => onEditClo(clo)}
          onDelete={() => onDeleteClo(clo)}
        />
      ))}
      <Button variant="ghost" size="sm" onClick={onAddClo}>
        <Plus className="size-4" /> Add CLO
      </Button>
    </div>
  )
}
