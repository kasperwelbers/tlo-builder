import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BloomSelect } from "@/components/ui/bloom-select"
import type { CurrentIlo } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<CurrentIlo>
  onSubmit: (data: {
    courseId: number
    description: string
    bloomLevel: string | null
  }) => void
}

export function CurrentIloFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: Props) {
  const [description, setDescription] = useState("")
  const [bloomLevel, setBloomLevel] = useState("")

  useEffect(() => {
    if (open) {
      setDescription(initialData?.description ?? "")
      setBloomLevel(initialData?.bloomLevel ?? "")
    }
  }, [open, initialData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return
    onSubmit({
      courseId: initialData?.courseId!,
      description: description.trim(),
      bloomLevel: bloomLevel || null,
    })
    onOpenChange(false)
  }

  const isEdit = Boolean(initialData?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Current ILO" : "Add Current ILO"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-ilo-description">Description</Label>
            <Textarea
              id="current-ilo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The student can…"
              rows={3}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bloom Level</Label>
            <BloomSelect value={bloomLevel} onValueChange={setBloomLevel} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
