import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Member {
  user_id: string
  email: string
  role: string
}

interface Props {
  projectId: string
  projectName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRename: (newName: string) => void
}

export function ProjectSettingsDialog({ projectId, projectName, open, onOpenChange, onRename }: Props) {
  const [name, setName] = useState(projectName)
  const [members, setMembers] = useState<Member[]>([])
  const [addEmail, setAddEmail] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [shareBusy, setShareBusy] = useState(false)

  useEffect(() => { setName(projectName) }, [projectName])

  useEffect(() => {
    if (!open) return
    fetch(`/api/projects/${projectId}/members`)
      .then(r => r.json() as Promise<Member[]>)
      .then(setMembers)
    fetch(`/api/projects/${projectId}/share`)
      .then(r => r.json() as Promise<{ token: string | null }>)
      .then(d => setShareToken(d.token ?? null))
      .catch(() => {})
  }, [open, projectId])

  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : ''

  async function handleCreateLink() {
    setShareBusy(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, { method: 'POST' })
      if (!res.ok) throw new Error()
      const d = await res.json() as { token: string }
      setShareToken(d.token)
    } catch {
      toast.error('Failed to create link')
    } finally {
      setShareBusy(false)
    }
  }

  async function handleDisableLink() {
    setShareBusy(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setShareToken(null)
    } catch {
      toast.error('Failed to turn off link')
    } finally {
      setShareBusy(false)
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === projectName) return
    setSaving(true)
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
    setSaving(false)
    onRename(trimmed)
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    setAddError(null)
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: addEmail }),
    })
    if (!res.ok) {
      const d = await res.json() as { error?: string }
      setAddError(d.error ?? 'Failed to add member')
      return
    }
    setAddEmail('')
    setMembers(await fetch(`/api/projects/${projectId}/members`).then(r => r.json() as Promise<Member[]>))
  }

  async function handleRemoveMember(userId: string) {
    await fetch(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' })
    setMembers(m => m.filter(x => x.user_id !== userId))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Project settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* Rename */}
          <div className="space-y-2">
            <Label>Project name</Label>
            <form onSubmit={handleSaveName} className="flex gap-2">
              <Input value={name} onChange={e => setName(e.target.value)} required />
              <Button
                type="submit"
                variant="outline"
                disabled={saving || !name.trim() || name.trim() === projectName}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </form>
          </div>

          <Separator />

          {/* Members */}
          <div className="space-y-2">
            <Label>Members</Label>
            {members.length > 0 && (
              <div className="space-y-1">
                {members.map(m => (
                  <div key={m.user_id} className="flex items-center gap-2 py-0.5">
                    <span className="flex-1 truncate text-sm text-muted-foreground">{m.email}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleRemoveMember(m.user_id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleAddMember} className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={addEmail}
                onChange={e => setAddEmail(e.target.value)}
                className="h-8 text-sm"
                required
              />
              <Button type="submit" size="sm" variant="outline">Add</Button>
            </form>
            {addError && <p className="text-xs text-destructive">{addError}</p>}
          </div>

          <Separator />

          {/* Public read-only link */}
          <div className="space-y-2">
            <Label>Public link</Label>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view the project without logging in. They
              can't make changes and can't see comments.
            </p>
            {shareToken ? (
              <>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="h-8 text-xs"
                    onFocus={e => e.target.select()}
                  />
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>Copy</Button>
                </div>
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={shareBusy}>
                        Regenerate
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate public link?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The current link will stop working immediately. Anyone
                          using it will need the new link.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCreateLink}>Regenerate</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    disabled={shareBusy}
                    onClick={handleDisableLink}
                  >
                    Turn off
                  </Button>
                </div>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={handleCreateLink} disabled={shareBusy}>
                {shareBusy ? 'Creating…' : 'Create link'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
