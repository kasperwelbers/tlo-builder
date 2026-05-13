import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useApp } from "@/context/AppContext"
import { useAuth } from "@/context/AuthContext"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: "trajectory" | "course"
  contextId: number
}

export function CommentsDialog({
  open,
  onOpenChange,
  context,
  contextId,
}: Props) {
  const { state, send } = useApp()
  const auth = useAuth()
  const currentUserEmail =
    auth.status === "authenticated" ? auth.user.email : null

  const comments = [...state.comments]
    .filter((c) => c.context === context && c.contextId === contextId)
    .sort((a, b) => a.createdAt - b.createdAt)

  const [draft, setDraft] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")

  function handleSubmit() {
    const text = draft.trim()
    if (!text) return
    send({ type: "comment:create", context, contextId, comment: text })
    setDraft("")
  }

  function startEdit(id: number, currentText: string) {
    setEditingId(id)
    setEditValue(currentText)
  }

  function submitEdit() {
    if (editingId == null) return
    const text = editValue.trim()
    if (text) send({ type: "comment:update", id: editingId, comment: text })
    setEditingId(null)
    setEditValue("")
  }

  function handleDelete(id: number) {
    send({ type: "comment:delete", id })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-full max-w-lg flex-col gap-0 p-4 sm:max-w-lg">
        <DialogHeader className="mb-3">
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <div className="max-h-[55vh] divide-y overflow-y-auto">
          {comments.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No comments yet.
            </p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="group px-1 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {c.userEmail}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
                    {c.updatedAt ? " (edited)" : ""}
                  </span>
                </div>
                {currentUserEmail === c.userEmail && editingId !== c.id && (
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(c.id, c.comment)}
                      className="text-muted-foreground hover:text-foreground"
                      title="Edit"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {editingId === c.id ? (
                <div className="mt-2 flex flex-col gap-1.5">
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={submitEdit}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm whitespace-pre-wrap">{c.comment}</p>
              )}
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Write a comment…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[80px] text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSubmit} disabled={!draft.trim()}>
              Add comment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
