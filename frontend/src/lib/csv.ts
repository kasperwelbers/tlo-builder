import Papa from 'papaparse'
import type { Tlo, Ilo, CourseObjective, Trajectory, Course } from '@/lib/types'

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

export function exportTlos(tlos: Tlo[], trajectories: Trajectory[]) {
  const trajectoryById = new Map(trajectories.map(t => [t.id, t]))
  const csv = Papa.unparse(
    tlos.map(t => ({
      trajectory: trajectoryById.get(t.trajectoryId)?.name ?? '',
      name: t.name,
      description: t.description,
      bloomLevel: t.bloomLevel ?? '',
    }))
  )
  downloadCsv(csv, 'tlos.csv')
}

export function exportIlos(ilos: Ilo[]) {
  const csv = Papa.unparse(
    ilos.map(i => ({
      name: i.name,
      description: i.description,
      bloomLevel: i.bloomLevel ?? '',
    }))
  )
  downloadCsv(csv, 'ilos.csv')
}

export function exportCourseObjectives(cos: CourseObjective[], courses: Course[]) {
  const courseById = new Map(courses.map(c => [c.id, c]))
  const csv = Papa.unparse(
    cos.map(c => ({
      course: courseById.get(c.courseId)?.name ?? '',
      name: c.name,
      description: c.description,
    }))
  )
  downloadCsv(csv, 'course_objectives.csv')
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
