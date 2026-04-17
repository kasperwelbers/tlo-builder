import { useState } from "react"
import { Check, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useApp } from "@/context/AppContext"
import type { CourseObjective, Ilo } from "@/lib/types"

const BLOOM_LEVELS = [
  "Remembering", "Understanding", "Applying", "Analyzing", "Evaluating", "Creating"
]

interface IloItemProps {
  ilo: Ilo
  linkedCo: CourseObjective | undefined
  linkedCourseName?: string
  onEdit: () => void
  onDelete: () => void
  onUnlinkCo: () => void
}

export function IloItem({ ilo, linkedCo, linkedCourseName, onDelete, onUnlinkCo }: IloItemProps) {
  const { send } = useApp()
  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleStartEdit = (field: 'name' | 'description', value: string) => {
    setEditingField(field)
    setEditValue(value)
  }

  const handleSave = () => {
    if (!editingField) return
    send({
      type: "ilo:update",
      id: ilo.id,
      name: editingField === 'name' ? editValue : ilo.name,
      description: editingField === 'description' ? editValue : ilo.description,
      bloomLevel: ilo.bloomLevel,
      tloId: ilo.tloId
    })
    setEditingField(null)
  }

  const handleBloomChange = (val: string) => {
    send({
      type: "ilo:update",
      id: ilo.id,
      name: ilo.name,
      description: ilo.description,
      bloomLevel: val,
      tloId: ilo.tloId
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-1.5 hover:bg-muted/50 group w-full text-sm">
      <div className="w-32 shrink-0">
        <Select value={ilo.bloomLevel || ""} onValueChange={handleBloomChange}>
          <SelectTrigger className="h-7 text-xs font-mono border-transparent group-hover:border-border px-2">
            <SelectValue placeholder="Bloom" />
          </SelectTrigger>
          <SelectContent>
            {BLOOM_LEVELS.map(level => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-1/3 min-w-[150px]">
        {editingField === 'name' ? (
          <div className="flex items-center gap-1">
            <Input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="h-7 text-sm font-medium"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditingField(null); }}
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleSave}><Check className="size-4" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingField(null)}><X className="size-4" /></Button>
          </div>
        ) : (
          <div
            className="font-medium cursor-pointer px-2 py-1 rounded hover:bg-muted truncate"
            onClick={() => handleStartEdit('name', ilo.name)}
          >
            {ilo.name}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-[200px] flex items-center gap-2">
        {editingField === 'description' ? (
          <div className="flex items-center gap-1 w-full">
            <Input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="h-7 text-sm w-full"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditingField(null); }}
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 shrink-0" onClick={handleSave}><Check className="size-4" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground shrink-0" onClick={() => setEditingField(null)}><X className="size-4" /></Button>
          </div>
        ) : (
          <div
            className="text-muted-foreground cursor-pointer px-2 py-1 rounded hover:bg-muted truncate flex-1"
            onClick={() => handleStartEdit('description', ilo.description || '')}
          >
            {ilo.description || <span className="italic opacity-50">No description</span>}
          </div>
        )}

        {linkedCo && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground truncate max-w-[120px]">
              📎 {linkedCourseName ?? ""}: {linkedCo.name}
            </span>
            <button
              onClick={onUnlinkCo}
              className="text-muted-foreground/60 hover:text-muted-foreground"
              title="Unlink course objective"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost" size="icon"
            className="size-7 shrink-0 opacity-0 group-hover:opacity-100 text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ILO?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{ilo.name}</strong> and remove all its mappings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
