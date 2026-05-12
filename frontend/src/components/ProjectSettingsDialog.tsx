import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

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

  useEffect(() => { setName(projectName) }, [projectName])

  useEffect(() => {
    if (!open) return
    fetch(`/api/projects/${projectId}/members`)
      .then(r => r.json() as Promise<Member[]>)
      .then(setMembers)
  }, [open, projectId])

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
        </div>
      </DialogContent>
    </Dialog>
  )
}
