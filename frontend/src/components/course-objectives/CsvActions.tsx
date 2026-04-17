import { useRef } from 'react'
import { Upload, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportCourseObjectives, parseCsvFile } from '@/lib/csv'
import { useApp } from '@/context/AppContext'
import type { CourseObjective } from '@/lib/types'

interface Props {
  courseObjectives: CourseObjective[]
}

export function CsvActions({ courseObjectives }: Props) {
  const { send, state } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    exportCourseObjectives(courseObjectives, state.courses)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    try {
      const rows = await parseCsvFile(file)
      let count = 0
      for (const row of rows) {
        const course = row['course']?.trim()
        const description = row['description']?.trim() ?? ''
        if (!course || !description) continue
        send({ type: 'course_objective:add', course, description })
        count++
      }
      toast.success(`Imported ${count} course objective${count !== 1 ? 's' : ''}`)
    } catch (err) {
      toast.error('Failed to import CSV')
      console.error(err)
    }
  }

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button variant="outline" size="sm" onClick={handleImportClick}>
        <Upload className="size-4" />
        Import CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="size-4" />
        Export CSV
      </Button>
    </div>
  )
}
