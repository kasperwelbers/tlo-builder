import Papa from "papaparse"
import type { CurrentIlo, Course } from "@/lib/types"

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportCurrentIlos(
  currentIlos: CurrentIlo[],
  courses: Course[]
) {
  const courseById = new Map(courses.map((c) => [c.id, c]))
  const csv = Papa.unparse(
    currentIlos.map((c) => ({
      course: courseById.get(c.courseId)?.code ?? "",
      description: c.description,
    }))
  )
  downloadCsv(csv, "current_ilos.csv")
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
