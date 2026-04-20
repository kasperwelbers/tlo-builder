import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BloomSelect } from '@/components/ui/bloom-select'
import type { Tlo } from '@/lib/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<Tlo>
  onSubmit: (data: { trajectoryId: number; name: string; description: string; bloomLevel: string | null }) => void
}

export function TloFormDialog({ open, onOpenChange, initialData, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [bloomLevel, setBloomLevel] = useState('')

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setDescription(initialData?.description ?? '')
      setBloomLevel(initialData?.bloomLevel ?? '')
    }
  }, [open, initialData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      trajectoryId: initialData?.trajectoryId!,
      name: name.trim(),
      description: description.trim(),
      bloomLevel: bloomLevel || null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Edit TLO' : 'Add TLO'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
<div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="TLO name" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Outcome statement</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="The student can…" rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Bloom Level</Label>
            <BloomSelect value={bloomLevel} onValueChange={setBloomLevel} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initialData?.id ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
