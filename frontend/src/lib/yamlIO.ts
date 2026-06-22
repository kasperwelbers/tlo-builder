import yaml from "js-yaml"
import type { AppState } from "@/lib/types"

// -- Export -------------------------------------------------------------------

export function exportToYaml(state: AppState, projectName: string): void {
  const {
    tlos,
    ilos,
    currentIlos,
    iloCurrentIloMappings,
    trajectories,
    courses,
    comments,
  } = state
  const tloIloMappings = ilos
    .filter((i) => i.tloId !== null)
    .map((i) => ({ tloId: i.tloId!, iloId: i.id }))

  const courseById = new Map(courses.map((c) => [c.id, c]))
  const coById = new Map(currentIlos.map((co) => [co.id, co]))

  const iloCoMap = new Map<number, { course: string; description: string }[]>()
  for (const mapping of iloCurrentIloMappings) {
    if (mapping.currentIloId === null) continue // course-level links have no Current ILO
    const co = coById.get(mapping.currentIloId)
    if (!co) continue
    const courseCode = courseById.get(co.courseId)?.code ?? ""
    if (!courseCode) continue
    const arr = iloCoMap.get(mapping.iloId) ?? []
    arr.push({ course: courseCode, description: co.description })
    iloCoMap.set(mapping.iloId, arr)
  }

  const tloIloMap = new Map<number, number[]>()
  for (const mapping of tloIloMappings) {
    const arr = tloIloMap.get(mapping.tloId) ?? []
    arr.push(mapping.iloId)
    tloIloMap.set(mapping.tloId, arr)
  }

  const iloById = new Map(ilos.map((i) => [i.id, i]))

  const tlosByTrajectory = new Map<number, typeof tlos>()
  for (const tlo of tlos) {
    const arr = tlosByTrajectory.get(tlo.trajectoryId) ?? []
    arr.push(tlo)
    tlosByTrajectory.set(tlo.trajectoryId, arr)
  }

  const trajectoryOutput = [...trajectories]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((traj) => {
      const tloEntries = (tlosByTrajectory.get(traj.id) ?? []).map((tlo) => {
        const iloIds = tloIloMap.get(tlo.id) ?? []
        const iloEntries = iloIds
          .map((id) => iloById.get(id))
          .filter((i): i is NonNullable<typeof i> => i !== undefined)
          .map((ilo) => {
            const coRefs = iloCoMap.get(ilo.id)
            const entry: Record<string, unknown> = {
              description: ilo.description,
              bloom_level: ilo.bloomLevel ?? null,
            }
            if (coRefs?.length) entry.current_ilos = coRefs
            return entry
          })
        const tloEntry: Record<string, unknown> = {
          name: tlo.name,
          description: tlo.description,
          bloom_level: tlo.bloomLevel ?? null,
        }
        if (iloEntries.length) tloEntry.ilos = iloEntries
        return tloEntry
      })
      const out: Record<string, unknown> = { name: traj.name }
      if (traj.description) out.description = traj.description
      if (traj.color) out.color = traj.color
      if (traj.coordinator) out.coordinator = traj.coordinator
      out.tlos = tloEntries
      return out
    })

  const coursesOutput = [...courses]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((c) => {
      const entry: Record<string, unknown> = { code: c.code }
      if (c.name) entry.name = c.name
      if (c.color) entry.color = c.color
      if (c.coordinator) entry.coordinator = c.coordinator
      if (c.start) entry.start = c.start
      if (c.end) entry.end = c.end
      if (c.type) entry.type = c.type
      if (c.owner) entry.owner = c.owner
      return entry
    })

  // ── Comments ──────────────────────────────────────────────────────────────
  const trajectoryNameById = new Map(trajectories.map((t) => [t.id, t.name]))
  const tloNameById = new Map(tlos.map((t) => [t.id, t.name]))
  const iloDescById = new Map(ilos.map((i) => [i.id, i.description]))
  const courseCodeById = new Map(courses.map((c) => [c.id, c.code]))

  // Build a map from parent comment id to its replies
  const repliesByParentId = new Map<number, typeof comments>()
  for (const c of comments) {
    if (c.parentId != null && !c.deleted) {
      const arr = repliesByParentId.get(c.parentId) ?? []
      arr.push(c)
      repliesByParentId.set(c.parentId, arr)
    }
  }

  const commentsOutput = comments
    .filter((c) => c.parentId === null && !c.deleted)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((c) => {
      const entry: Record<string, unknown> = {
        user: c.userEmail,
        text: c.comment,
        status: c.status ?? "open",
        created_at: new Date(c.createdAt).toISOString(),
      }

      if (c.context === "trajectory") {
        entry.context = "trajectory"
        entry.trajectory = trajectoryNameById.get(c.contextId) ?? null
        if (c.tloId != null) entry.tlo = tloNameById.get(c.tloId) ?? null
        if (c.iloId != null) entry.ilo = iloDescById.get(c.iloId) ?? null
      } else {
        entry.context = "course"
        entry.course = courseCodeById.get(c.contextId) ?? null
        if (c.iloId != null) entry.ilo = iloDescById.get(c.iloId) ?? null
      }

      const replies = (repliesByParentId.get(c.id) ?? [])
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((r) => ({
          user: r.userEmail,
          text: r.comment,
          status: r.status ?? "open",
          created_at: new Date(r.createdAt).toISOString(),
        }))
      if (replies.length > 0) entry.replies = replies

      return entry
    })
    .filter((e) => e.trajectory != null || e.course != null)

  const doc = {
    exported: new Date().toISOString(),
    courses: coursesOutput,
    current_ilos: currentIlos.map((co) => ({
      course: courseById.get(co.courseId)?.code ?? "",
      description: co.description,
      bloom_level: co.bloomLevel ?? null,
    })),
    trajectories: trajectoryOutput,
    comments: commentsOutput,
  }

  const yamlStr = yaml.dump(doc, { lineWidth: 120, noRefs: true })
  const date = new Date().toISOString().slice(0, 10)
  const safeName =
    (projectName || "project")
      .replace(/[^a-zA-Z0-9-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") || "project"
  const filename = `TLOs_${safeName}_${date}.yaml`
  const blob = new Blob([yamlStr], { type: "text/yaml;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// -- Import -------------------------------------------------------------------

export function parseYamlForImport(text: string): object {
  const parsed = yaml.load(text)
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Invalid YAML: expected an object at the top level")
  }
  return parsed as object
}
