import { Pencil, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { bloomBadgeClass } from "@/lib/bloomColors"
import type { CourseObjective, Ilo } from "@/lib/types"

interface IloItemProps {
  ilo: Ilo
  linkedCo: CourseObjective | undefined
  linkedCourseName?: string
  onEdit: () => void
  onDelete: () => void
  onUnlinkCo: () => void
}

export function IloItem({ ilo, linkedCo, linkedCourseName, onEdit, onDelete, onUnlinkCo }: IloItemProps) {
  return (
    <div className="flex items-start gap-2 rounded-md px-3 py-2 hover:bg-muted/50 group">
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40" />

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium">{ilo.name}</span>
          {ilo.bloomLevel && (
            <Badge variant="outline" className={bloomBadgeClass(ilo.bloomLevel)}>
              {ilo.bloomLevel}
            </Badge>
          )}
        </div>

        {ilo.description && (
          <p className="text-xs text-muted-foreground">{ilo.description}</p>
        )}

        {linkedCo && (
          <div className="flex items-center gap-1 pt-0.5">
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
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

      <Button
        variant="ghost" size="icon"
        className="size-7 shrink-0 opacity-0 group-hover:opacity-100"
        onClick={onEdit}
      >
        <Pencil className="size-4" />
      </Button>

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
