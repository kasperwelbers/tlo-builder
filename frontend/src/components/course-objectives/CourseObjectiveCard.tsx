import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import type { CourseObjective } from '@/lib/types'

interface Props {
  co: CourseObjective
  onEdit: () => void
  onDelete: () => void
}

export function CourseObjectiveCard({ co, onEdit, onDelete }: Props) {
  return (
    <Card className="py-3">
      <CardContent className="px-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{co.description || <span className="italic opacity-50">No description</span>}</p>
          </div>

          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem variant="destructive">
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Course Objective?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this course objective and all its mappings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
