import { useEffect, useState } from 'react'
import { Plus, Users, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'

interface Project {
  id: string
  name: string
  created_at: number
}

interface Member {
  user_id: string
  email: string
  role: string
}

interface AdminUser {
  id: string
  email: string
  is_server_admin: boolean
}

interface Props {
  onOpen: (projectId: string) => void
}

export function LandingPage({ onOpen }: Props) {
  const auth = useAuth()
  const isServerAdmin = auth.status === 'authenticated' && auth.user.isServerAdmin

  const [projects, setProjects] = useState<Project[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Members panel state
  const [membersProjectId, setMembersProjectId] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [addEmail, setAddEmail] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  // Server admin panel
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [grantEmail, setGrantEmail] = useState('')
  const [grantError, setGrantError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json() as Promise<Project[]>)
      .then(setProjects)
      .catch(console.error)
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newProjectName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() }),
      })
      const project = await res.json() as Project
      setProjects(p => [project, ...p])
      setNewProjectName('')
      setShowCreateForm(false)
      onOpen(project.id)
    } finally {
      setCreating(false)
    }
  }

  async function openMembers(projectId: string) {
    if (membersProjectId === projectId) { setMembersProjectId(null); return }
    setMembersProjectId(projectId)
    setAddEmail('')
    setAddError(null)
    const res = await fetch(`/api/projects/${projectId}/members`)
    setMembers(await res.json() as Member[])
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    setAddError(null)
    const res = await fetch(`/api/projects/${membersProjectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: addEmail }),
    })
    if (!res.ok) {
      const d = await res.json() as { error?: string }
      setAddError(d.error ?? 'Failed')
      return
    }
    setAddEmail('')
    const r2 = await fetch(`/api/projects/${membersProjectId}/members`)
    setMembers(await r2.json() as Member[])
  }

  async function handleRemoveMember(userId: string) {
    await fetch(`/api/projects/${membersProjectId}/members/${userId}`, { method: 'DELETE' })
    setMembers(m => m.filter(x => x.user_id !== userId))
  }

  async function openAdminPanel() {
    setShowAdminPanel(v => !v)
    if (!showAdminPanel) {
      const res = await fetch('/api/admin/users')
      setAdminUsers(await res.json() as AdminUser[])
      setGrantEmail('')
      setGrantError(null)
    }
  }

  async function handleGrantAdmin(e: React.FormEvent) {
    e.preventDefault()
    setGrantError(null)
    const res = await fetch('/api/admin/server-roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: grantEmail }),
    })
    if (!res.ok) {
      const d = await res.json() as { error?: string }
      setGrantError(d.error ?? 'Failed')
      return
    }
    setGrantEmail('')
    const r2 = await fetch('/api/admin/users')
    setAdminUsers(await r2.json() as AdminUser[])
  }

  async function handleRevokeAdmin(userId: string) {
    await fetch(`/api/admin/server-roles/${userId}`, { method: 'DELETE' })
    setAdminUsers(u => u.map(x => x.id === userId ? { ...x, is_server_admin: false } : x))
  }

  const membersProject = projects.find(p => p.id === membersProjectId)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 pt-14">
      <div className="w-full max-w-lg space-y-8">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-foreground text-background text-xl font-bold select-none">T</div>
          <h1 className="text-3xl font-bold tracking-tight">TLO Builder</h1>
        </div>

        {/* Projects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Projects</h2>
            {isServerAdmin && (
              <Button size="sm" variant="outline" onClick={() => setShowCreateForm(v => !v)} className="gap-1.5">
                <Plus className="size-3.5" />New project
              </Button>
            )}
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreate} className="flex gap-2">
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                autoFocus
                required
              />
              <Button type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create'}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </form>
          )}

          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {isServerAdmin ? 'No projects yet. Create one above.' : 'You have not been added to any projects yet.'}
            </p>
          )}

          <div className="divide-y rounded-lg border">
            {projects.map(project => (
              <div key={project.id}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="flex-1 font-medium text-sm">{project.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => openMembers(project.id)} className="gap-1.5 text-muted-foreground">
                    <Users className="size-3.5" />
                  </Button>
                  <Button size="sm" onClick={() => onOpen(project.id)} className="gap-1.5">
                    <LogIn className="size-3.5" />Open
                  </Button>
                </div>

                {/* Inline members panel */}
                {membersProjectId === project.id && (
                  <div className="border-t bg-muted/30 px-4 py-3 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Members — {membersProject?.name}</p>
                    <div className="space-y-1">
                      {members.map(m => (
                        <div key={m.user_id} className="flex items-center gap-2 text-sm">
                          <span className="flex-1">{m.email}</span>
                          <Button size="sm" variant="ghost" className="text-destructive h-6 px-2 text-xs"
                            onClick={() => handleRemoveMember(m.user_id)}>Remove</Button>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleAddMember} className="flex gap-2">
                      <Input placeholder="email@example.com" type="email" value={addEmail}
                        onChange={e => setAddEmail(e.target.value)} className="h-8 text-sm" required />
                      <Button type="submit" size="sm">Add</Button>
                    </form>
                    {addError && <p className="text-xs text-destructive">{addError}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Server admin panel */}
        {isServerAdmin && (
          <div className="space-y-3">
            <button
              onClick={openAdminPanel}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              {showAdminPanel ? 'Hide' : 'Show'} server admin management
            </button>

            {showAdminPanel && (
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Server admins</p>
                <div className="space-y-1">
                  {adminUsers.filter(u => u.is_server_admin).map(u => (
                    <div key={u.id} className="flex items-center gap-2 text-sm">
                      <span className="flex-1">{u.email}</span>
                      <Button size="sm" variant="ghost" className="text-destructive h-6 px-2 text-xs"
                        onClick={() => handleRevokeAdmin(u.id)}>Revoke</Button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleGrantAdmin} className="flex gap-2">
                  <Input placeholder="email@example.com" type="email" value={grantEmail}
                    onChange={e => setGrantEmail(e.target.value)} className="h-8 text-sm" required />
                  <Button type="submit" size="sm">Grant admin</Button>
                </form>
                {grantError && <p className="text-xs text-destructive">{grantError}</p>}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
