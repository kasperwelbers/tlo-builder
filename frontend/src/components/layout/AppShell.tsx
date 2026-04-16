import { Layers, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Page = 'workspace' | 'course-objectives'

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'workspace',         label: 'Workspace',         icon: <Layers className="size-4" /> },
  { id: 'course-objectives', label: 'Course Objectives', icon: <BookOpen className="size-4" /> },
]

interface AppShellProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  connected: boolean
  children: React.ReactNode
}

export function AppShell({ currentPage, onNavigate, connected, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-52 flex-col border-r bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <span className="text-lg font-bold">LTO Builder</span>
          <span
            className={cn('ml-auto size-2 rounded-full', connected ? 'bg-green-500' : 'bg-red-500')}
            title={connected ? 'Connected' : 'Disconnected'}
          />
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                currentPage === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
