import { useState } from 'react'
import { AppProvider, useApp } from '@/context/AppContext'
import { AppShell, type Page } from '@/components/layout/AppShell'
import { WorkspacePage } from '@/components/workspace/WorkspacePage'
import { CourseObjectivesPage } from '@/components/course-objectives/CourseObjectivesPage'
import { Toaster } from '@/components/ui/sonner'

function getProjectId() {
  let id = localStorage.getItem('lto_project_id')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('lto_project_id', id) }
  return id
}

const PROJECT_ID = getProjectId()

function Inner() {
  const { connected } = useApp()
  const [page, setPage] = useState<Page>('workspace')

  return (
    <AppShell currentPage={page} onNavigate={setPage} connected={connected}>
      {page === 'workspace'         && <WorkspacePage />}
      {page === 'course-objectives' && <CourseObjectivesPage />}
    </AppShell>
  )
}

export default function App() {
  return (
    <AppProvider projectId={PROJECT_ID}>
      <Inner />
      <Toaster richColors position="bottom-right" />
    </AppProvider>
  )
}
