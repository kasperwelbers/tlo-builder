import Papa from 'papaparse'
import type { Clo, Course } from '@/lib/types'

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportClos(clos: Clo[], courses: Course[]) {
  const courseById = new Map(courses.map(c => [c.id, c]))
  const csv = Papa.unparse(
    clos.map(c => ({
      course: courseById.get(c.courseId)?.code ?? '',
      description: c.description,
    }))
  )
  downloadCsv(csv, 'clos.csv')
}

export function parseCsvFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}
