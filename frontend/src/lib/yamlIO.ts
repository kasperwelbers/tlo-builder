import yaml from 'js-yaml'
import type { AppState } from '@/lib/types'

// -- Export -------------------------------------------------------------------

export function exportToYaml(state: AppState): void {
  const { tlos, ilos, clos, iloCloMappings, trajectories, courses } = state
  const tloIloMappings = ilos.filter(i => i.tloId !== null).map(i => ({ tloId: i.tloId!, iloId: i.id }))

  const courseById = new Map(courses.map(c => [c.id, c]))
  const coById = new Map(clos.map(co => [co.id, co]))

  const iloCoMap = new Map<number, { course: string; description: string }[]>()
  for (const mapping of iloCloMappings) {
    if (mapping.cloId === null) continue  // course-level links have no CLO
    const co = coById.get(mapping.cloId)
    if (!co) continue
    const courseName = courseById.get(co.courseId)?.name ?? ''
    if (!courseName) continue
    const arr = iloCoMap.get(mapping.iloId) ?? []
    arr.push({ course: courseName, description: co.description })
    iloCoMap.set(mapping.iloId, arr)
  }

  const tloIloMap = new Map<number, number[]>()
  for (const mapping of tloIloMappings) {
    const arr = tloIloMap.get(mapping.tloId) ?? []
    arr.push(mapping.iloId)
    tloIloMap.set(mapping.tloId, arr)
  }

  const iloById = new Map(ilos.map(i => [i.id, i]))

  const tlosByTrajectory = new Map<number, typeof tlos>()
  for (const tlo of tlos) {
    const arr = tlosByTrajectory.get(tlo.trajectoryId) ?? []
    arr.push(tlo)
    tlosByTrajectory.set(tlo.trajectoryId, arr)
  }

  const trajectoryOutput = [...trajectories]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(traj => {
      const tloEntries = (tlosByTrajectory.get(traj.id) ?? []).map(tlo => {
        const iloIds = tloIloMap.get(tlo.id) ?? []
        const iloEntries = iloIds
          .map(id => iloById.get(id))
          .filter((i): i is NonNullable<typeof i> => i !== undefined)
          .map(ilo => {
            const coRefs = iloCoMap.get(ilo.id)
            const entry: Record<string, unknown> = {
              description: ilo.description, bloom_level: ilo.bloomLevel ?? null,
            }
            if (coRefs?.length) entry.course_objectives = coRefs
            return entry
          })
        const tloEntry: Record<string, unknown> = {
          name: tlo.name, description: tlo.description, bloom_level: tlo.bloomLevel ?? null,
        }
        if (iloEntries.length) tloEntry.ilos = iloEntries
        return tloEntry
      })
      const out: Record<string, unknown> = { name: traj.name }
      if (traj.description) out.description = traj.description
      if (traj.color) out.color = traj.color
      out.tlos = tloEntries
      return out
    })

  const doc = {
    exported: new Date().toISOString(),
    course_objectives: clos.map(co => ({
      course: courseById.get(co.courseId)?.name ?? '',
      description: co.description,
    })),
    trajectories: trajectoryOutput,
  }

  const yamlStr = yaml.dump(doc, { lineWidth: 120, noRefs: true })
  const date = new Date().toISOString().slice(0, 10)
  const filename = `lto-export-${date}.yaml`
  const blob = new Blob([yamlStr], { type: 'text/yaml;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// -- Import -------------------------------------------------------------------

export function parseYamlForImport(text: string): object {
  const parsed = yaml.load(text)
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid YAML: expected an object at the top level')
  }
  return parsed as object
}
