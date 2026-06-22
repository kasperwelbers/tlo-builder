import { useEffect, useRef, useState } from "react"
import {
  Check,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { useAuth } from "@/context/AuthContext"
import { bloomSortKey } from "@/lib/bloomLevels"
import type { Comment as _Comment } from "@/lib/types"

// Augmented Comment — matches planned schema update in @/lib/types
type Comment = _Comment & {
  parentId: number | null
  status: "open" | "done"
  tloId: number | null
  iloId: number | null
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  open: boolean
  onClose: () => void
  context: "trajectory" | "course"
  contextId: number
  focusTloId?: number | null
  focusIloId?: number | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(ms: number): string {
  const diffSec = Math.floor((Date.now() - ms) / 1000)
  if (diffSec < 60) return "just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

// ---------------------------------------------------------------------------
// CommentItem
// ---------------------------------------------------------------------------

interface CommentItemProps {
  comment: Comment
  /** Direct replies: parentId === comment.id */
  replies: Comment[]
  currentUserEmail: string | null
  isReply?: boolean
  onEdit: (id: number, text: string) => void
  onDelete: (id: number) => void
  onToggleDone: (id: number) => void
  onReply: (parentId: number, text: string) => void
}

function CommentItem({
  comment,
  replies,
  currentUserEmail,
  isReply = false,
  onEdit,
  onDelete,
  onToggleDone,
  onReply,
}: CommentItemProps) {
  const [expanded, setExpanded] = useState(comment.status !== "done")
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(comment.comment)
  const [showReply, setShowReply] = useState(false)
  const [replyValue, setReplyValue] = useState("")

  // Collapse when marked done, expand when reopened
  useEffect(() => {
    if (comment.status === "done") setExpanded(false)
    else setExpanded(true)
  }, [comment.status])

  const username = comment.userEmail.split("@")[0]
  const isOwn = currentUserEmail === comment.userEmail

  function handleSaveEdit() {
    const text = editValue.trim()
    if (text) onEdit(comment.id, text)
    setEditing(false)
  }

  function handleSubmitReply() {
    const text = replyValue.trim()
    if (!text) return
    onReply(comment.id, text)
    setReplyValue("")
    setShowReply(false)
  }

  const node = (
    <div className="group py-2">
      {/* Header row */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold">{username}</span>
        <span className="text-xs text-muted-foreground">
          {relativeTime(comment.createdAt)}
        </span>
        {comment.updatedAt && (
          <span className="text-xs text-muted-foreground">(edited)</span>
        )}
        {comment.status === "done" && (
          <CheckCircle2 className="size-3.5 text-green-600" />
        )}
        <button
          className="ml-auto text-muted-foreground hover:text-foreground"
          style={{
            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s ease",
          }}
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      {/* Body — only when expanded */}
      {expanded &&
        (editing ? (
          <div className="mt-1.5 flex flex-col gap-1.5">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[60px] text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                  handleSaveEdit()
              }}
            />
            <div className="flex gap-1.5">
              <Button size="xs" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setEditing(false)
                  setEditValue(comment.comment)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-0.5 pb-1 text-xs whitespace-pre-wrap">
              {comment.comment}
            </p>

            {/* Action row */}
            <div className="flex items-center gap-2 pb-1.5">
              {/* Done / Reopen */}
              <button
                onClick={() => onToggleDone(comment.id)}
                className={cn(
                  "flex items-center gap-1 rounded px-1 py-0.5 text-xs transition-colors",
                  comment.status === "done"
                    ? "bg-green-50 text-green-700"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Check className="size-3" />
                {comment.status === "done" ? "Reopen" : "Done"}
              </button>

              {/* Reply — top-level only */}
              {!isReply && (
                <button
                  onClick={() => setShowReply((r) => !r)}
                  className="rounded px-1 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reply
                </button>
              )}

              {/* Edit & Delete — own comments */}
              {isOwn && (
                <>
                  <button
                    onClick={() => {
                      setEditing(true)
                      setEditValue(comment.comment)
                    }}
                    className="ml-auto text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
                    title="Edit"
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60 hover:!text-destructive hover:!opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </>
              )}
            </div>

            {/* Reply compose box */}
            {showReply && (
              <div className="mb-2 ml-4 border-l-2 border-border/40 pl-3">
                <Textarea
                  value={replyValue}
                  onChange={(e) => setReplyValue(e.target.value)}
                  className="min-h-[60px] text-xs"
                  placeholder="Write a reply…"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                      handleSubmitReply()
                  }}
                />
                <div className="mt-1.5 flex gap-1.5">
                  <Button
                    size="xs"
                    onClick={handleSubmitReply}
                    disabled={!replyValue.trim()}
                    className="h-6 px-2 text-xs"
                  >
                    Reply
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setShowReply(false)
                      setReplyValue("")
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={[]}
                currentUserEmail={currentUserEmail}
                isReply
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleDone={onToggleDone}
                onReply={onReply}
              />
            ))}
          </>
        ))}
    </div>
  )

  if (isReply) {
    return <div className="ml-4 border-l-2 border-border/40 pl-3">{node}</div>
  }
  return node
}

// ---------------------------------------------------------------------------
// Section definition
// ---------------------------------------------------------------------------

interface SectionDef {
  key: string
  label: string
  sublabel?: string
  tloId?: number
  iloId?: number
  isIndented?: boolean
  /** Comments matching this section (top-level and any co-located replies) */
  comments: Comment[]
}

// ---------------------------------------------------------------------------
// Section component
// ---------------------------------------------------------------------------

interface SectionProps {
  section: SectionDef
  /** All context-scoped comments — used to look up replies by parentId */
  allComments: Comment[]
  isFocused: boolean
  showDone: boolean
  currentUserEmail: string | null
  onAddComment: (section: SectionDef, text: string) => void
  onEdit: (id: number, text: string) => void
  onDelete: (id: number) => void
  onToggleDone: (id: number) => void
  onReply: (parentId: number, text: string) => void
  sectionRef: (el: HTMLDivElement | null) => void
}

function Section({
  section,
  allComments,
  isFocused,
  showDone,
  currentUserEmail,
  onAddComment,
  onEdit,
  onDelete,
  onToggleDone,
  onReply,
  sectionRef,
}: SectionProps) {
  const [composeOpen, setComposeOpen] = useState(false)
  const [draft, setDraft] = useState("")

  const topLevel = section.comments
    .filter((c) => c.parentId === null)
    .filter((c) => showDone || c.status !== "done")
  // Look up replies from allComments so they are found regardless of tloId/iloId
  const repliesFor = (parentId: number) =>
    allComments.filter((c) => c.parentId === parentId)

  function handleAdd() {
    const text = draft.trim()
    if (!text) return
    onAddComment(section, text)
    setDraft("")
    setComposeOpen(false)
  }

  return (
    <div
      ref={sectionRef}
      className={cn("border-b", section.isIndented && "ml-5 border-l")}
    >
      {/* Section header */}
      <div className="bg-muted/30 px-4 py-2">
        <p className="text-xs font-semibold">{section.label}</p>
        {section.sublabel && (
          <p className="line-clamp-1 text-xs text-muted-foreground italic">
            {section.sublabel}
          </p>
        )}
      </div>

      {/* Comment list */}
      <div className="divide-y divide-border/40 px-4">
        {topLevel.length === 0 && !composeOpen ? (
          <p className="py-3 text-xs text-muted-foreground italic">
            No comments yet.
          </p>
        ) : (
          topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={repliesFor(comment.id)}
              currentUserEmail={currentUserEmail}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleDone={onToggleDone}
              onReply={onReply}
            />
          ))
        )}
      </div>

      {/* Compose area */}
      <div className="px-4 pb-3">
        {composeOpen ? (
          <div className="flex flex-col gap-1.5 pt-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[60px] text-xs"
              placeholder="Write a comment…"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd()
              }}
            />
            <div className="flex gap-1.5">
              <Button
                size="xs"
                onClick={handleAdd}
                disabled={!draft.trim()}
                className="h-6 px-2 text-xs"
              >
                Add
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setComposeOpen(false)
                  setDraft("")
                }}
                className="h-6 px-2 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setComposeOpen(true)}
            className="flex items-center gap-1 pt-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="size-3" />
            Add comment
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CommentsPanel
// ---------------------------------------------------------------------------

export function CommentsPanel({
  open,
  onClose,
  context,
  contextId,
  focusTloId,
  focusIloId,
}: Props) {
  const { state, send } = useApp()
  const auth = useAuth()
  const currentUserEmail =
    auth.status === "authenticated" ? auth.user.email : null

  const sectionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const [showDone, setShowDone] = useState(false)

  // All non-deleted comments scoped to this context+contextId
  const allComments = (state.comments as unknown as Comment[]).filter(
    (c) => c.context === context && c.contextId === contextId && !c.deleted
  )

  // Scroll to the focused section when the panel opens or focus changes
  useEffect(() => {
    if (!open) return
    const focusKey = focusIloId
      ? `ilo-${focusIloId}`
      : focusTloId
        ? `tlo-${focusTloId}`
        : null
    if (!focusKey) return
    setTimeout(() => {
      const el = sectionRefs.current.get(focusKey)
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 150)
  }, [open, focusTloId, focusIloId])

  // Null guard — must come after all hooks
  if (!open) return null

  // -------------------------------------------------------------------------
  // Build section list
  // -------------------------------------------------------------------------
  const sections: SectionDef[] = []

  if (context === "trajectory") {
    // Root trajectory section
    sections.push({
      key: "root",
      label: "Trajectory",
      comments: allComments.filter((c) => !c.tloId && !c.iloId),
    })

    // TLOs sorted numerically by name
    const tlos = [...state.tlos]
      .filter((t) => t.trajectoryId === contextId)
      .sort((a, b) => {
        const na = parseFloat(a.name)
        const nb = parseFloat(b.name)
        if (!isNaN(na) && !isNaN(nb)) return na - nb
        return a.name.localeCompare(b.name)
      })

    for (const tlo of tlos) {
      sections.push({
        key: `tlo-${tlo.id}`,
        label: `TLO: ${tlo.name}`,
        tloId: tlo.id,
        comments: allComments.filter((c) => c.tloId === tlo.id && !c.iloId),
      })

      // ILOs for this TLO, sorted by bloomSortKey descending
      const ilos = [...state.ilos]
        .filter((i) => i.tloId === tlo.id)
        .sort((a, b) => bloomSortKey(b.bloomLevel) - bloomSortKey(a.bloomLevel))

      for (const ilo of ilos) {
        sections.push({
          key: `ilo-${ilo.id}`,
          label: "ILO",
          sublabel: ilo.description || "The student can…",
          tloId: tlo.id,
          iloId: ilo.id,
          isIndented: true,
          comments: allComments.filter((c) => c.iloId === ilo.id),
        })
      }
    }
  } else {
    // Root course section
    sections.push({
      key: "root",
      label: "Course",
      comments: allComments.filter((c) => !c.iloId),
    })

    // ILOs linked to this course via mappings, deduplicated, sorted by description
    const seenIloIds = new Set<number>()
    const linkedIloIds: number[] = []
    for (const m of state.iloCurrentIloMappings) {
      if (m.courseId === contextId && !seenIloIds.has(m.iloId)) {
        seenIloIds.add(m.iloId)
        linkedIloIds.push(m.iloId)
      }
    }

    const linkedIlos = linkedIloIds
      .map((id) => state.ilos.find((i) => i.id === id))
      .filter((i): i is NonNullable<typeof i> => i != null)
      .sort((a, b) => (a.description || "").localeCompare(b.description || ""))

    for (const ilo of linkedIlos) {
      sections.push({
        key: `ilo-${ilo.id}`,
        label: "ILO",
        sublabel: ilo.description || "The student can…",
        iloId: ilo.id,
        comments: allComments.filter((c) => c.iloId === ilo.id),
      })
    }
  }

  const focusKey = focusIloId
    ? `ilo-${focusIloId}`
    : focusTloId
      ? `tlo-${focusTloId}`
      : null

  // When opened via a TLO/ILO button, show only that section.
  // When opened from the top-level button (no focus), show all non-empty sections.
  const visibleSections = focusKey
    ? sections.filter((s) => s.key === focusKey)
    : sections.filter((s) => {
        if (s.key === "root") return true
        const visibleComments = showDone
          ? s.comments
          : s.comments.filter((c) => c.parentId === null && c.status !== "done")
        return visibleComments.length > 0
      })

  // -------------------------------------------------------------------------
  // Send helpers
  // -------------------------------------------------------------------------

  function handleAddComment(section: SectionDef, text: string) {
    send({
      type: "comment:create",
      context,
      contextId,
      comment: text,
      tloId: section.tloId ?? null,
      iloId: section.iloId ?? null,
    })
  }

  function handleEdit(id: number, text: string) {
    send({ type: "comment:update", id, comment: text })
  }

  function handleDelete(id: number) {
    send({ type: "comment:delete", id })
  }

  function handleToggleDone(id: number) {
    send({ type: "comment:toggle_done", id })
  }

  function handleReply(parentId: number, text: string) {
    send({
      type: "comment:create",
      context,
      contextId,
      comment: text,
      parentId,
    })
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-50 flex w-[360px] flex-col border-l bg-background shadow-xl"
      aria-label="Comments panel"
    >
      {/* Fixed header */}
      <div className="flex shrink-0 items-center border-b px-4 py-3">
        <span className="text-sm font-semibold">Comments</span>
        <button
          onClick={() => setShowDone((v) => !v)}
          className={cn(
            "mr-2 ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors",
            showDone
              ? "text-muted-foreground hover:text-foreground"
              : "bg-muted font-medium text-foreground"
          )}
          title={showDone ? "Hide done comments" : "Show done comments"}
        >
          <CheckCircle2 className="size-3" />
          show done
        </button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="size-7"
          onClick={onClose}
          aria-label="Close comments"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {visibleSections.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-muted-foreground italic">
            No comments yet.
          </p>
        ) : (
          visibleSections.map((section) => (
            <Section
              key={section.key}
              section={section}
              allComments={allComments}
              isFocused={section.key === focusKey}
              showDone={showDone}
              currentUserEmail={currentUserEmail}
              onAddComment={handleAddComment}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleDone={handleToggleDone}
              onReply={handleReply}
              sectionRef={(el) => sectionRefs.current.set(section.key, el)}
            />
          ))
        )}
      </div>
    </div>
  )
}
