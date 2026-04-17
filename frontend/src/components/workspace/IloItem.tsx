import { useState, useMemo } from "react"
import { Trash2, X, Link2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BloomSelect } from "@/components/ui/bloom-select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import { useApp } from "@/context/AppContext"
import type { CourseObjective, Ilo } from "@/lib/types"

interface IloItemProps {
  ilo: Ilo
  linkedCo?: CourseObjective | undefined
  linkedCourseName?: string
  onEdit?: () => void
  onDelete: () => void
  onUnlinkCo?: () => void
}

export function IloItem({ ilo, onDelete }: IloItemProps) {
  const { state, send } = useApp()
  const [editingField, setEditingField] = useState<'description' | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleStartEdit = (field: 'description', value: string) => {
    setEditingField(field)
    setEditValue(value)
  }

  const handleSave = () => {
    if (!editingField) return

    const isUnchanged =
      (editingField === 'description' && editValue === (ilo.description || ''))

    if (!isUnchanged) {
      send({
        type: "ilo:update",
        id: ilo.id,
        description: editingField === 'description' ? editValue : ilo.description,
        bloomLevel: ilo.bloomLevel,
        tloId: ilo.tloId
      })
    }
    setEditingField(null)
  }

  const handleBloomChange = (val: string) => {
    send({
      type: "ilo:update",
      id: ilo.id,
      description: ilo.description,
      bloomLevel: val,
      tloId: ilo.tloId
    })
  }

  const mappings = state.iloCourseObjectiveMappings.filter(m => m.iloId === ilo.id)

  const handleAddLink = (courseId: number, courseObjectiveId: number | null) => {
    send({ type: "ilo_course_objective_mapping:add", iloId: ilo.id, courseId, courseObjectiveId })
  }
  const handleRemoveLink = (courseId: number, courseObjectiveId: number | null) => {
    send({ type: "ilo_course_objective_mapping:delete", iloId: ilo.id, courseId, courseObjectiveId })
  }

  const courseById = useMemo(() => new Map(state.courses.map(c => [c.id, c])), [state.courses])

  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-1.5 hover:bg-muted/50 group w-full text-sm">
      <div className="shrink-0 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center">
        <BloomSelect value={ilo.bloomLevel || ""} onValueChange={handleBloomChange} />
      </div>

      <div className="flex-1 flex flex-col min-w-[200px] justify-center">
        {editingField === 'description' ? (
          <Input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="h-5 text-sm font-medium w-full"
            autoFocus
            onBlur={handleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditingField(null); }}
          />
        ) : (
          <div
            role="button"
            tabIndex={0}
            className="h-5 font-medium cursor-pointer px-1.5 py-0.5 rounded hover:bg-muted truncate"
            onClick={() => handleStartEdit('description', ilo.description || '')}
          >
            {ilo.description || <span className="italic opacity-50">No description</span>}
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={mappings.length > 0 ? "h-7 text-xs px-2 gap-1 rounded-full" : "h-7 text-xs px-2 gap-1 rounded-full border-dashed text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity"}>
              <Link2 className={mappings.length > 0 ? "size-3.5" : "size-3.5 opacity-70"} />
              {mappings.length > 0 ? (
                <span className="font-medium">{mappings.length}</span>
              ) : (
                <span>Link</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search courses or objectives..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {mappings.length > 0 && (
                  <CommandGroup heading="Current Links">
                    {mappings.map(m => {
                      const course = courseById.get(m.courseId)
                      const co = m.courseObjectiveId ? state.courseObjectives.find(c => c.id === m.courseObjectiveId) : null
                      return (
                        <CommandItem
                          key={`${m.courseId}-${m.courseObjectiveId}`}
                          className="flex items-start gap-2 text-xs"
                          onSelect={() => handleRemoveLink(m.courseId, m.courseObjectiveId)}
                        >
                          <Check className="size-3.5 shrink-0 mt-0.5" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium truncate">{course?.name}</span>
                            {co && <span className="text-muted-foreground truncate">{co.name}</span>}
                            {!co && <span className="text-muted-foreground italic text-[10px]">Course Level</span>}
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )}

                <CommandGroup heading="Add Link">
                  {state.courses.map(course => {
                    const isCourseMapped = mappings.some(m => m.courseId === course.id && m.courseObjectiveId === null)
                    const courseObjectives = state.courseObjectives.filter(co => co.courseId === course.id)
                    return (
                      <div key={`c-${course.id}`}>
                        {!isCourseMapped && (
                          <CommandItem
                            className="flex items-start gap-2 text-xs pl-6"
                            onSelect={() => handleAddLink(course.id, null)}
                          >
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium truncate">{course.name}</span>
                              <span className="text-muted-foreground italic text-[10px]">Link at course level</span>
                            </div>
                          </CommandItem>
                        )}
                        {courseObjectives.map(co => {
                          const isCoMapped = mappings.some(m => m.courseObjectiveId === co.id)
                          if (isCoMapped) return null
                          return (
                            <CommandItem
                              key={`co-${co.id}`}
                              className="flex items-start gap-2 text-xs pl-6"
                              onSelect={() => handleAddLink(course.id, co.id)}
                            >
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium truncate">{course.name}</span>
                                <span className="text-muted-foreground truncate">{co.name}</span>
                              </div>
                            </CommandItem>
                          )
                        })}
                      </div>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

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
                This will permanently delete this ILO and remove all its mappings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
