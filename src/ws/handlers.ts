import { type DB } from '../db'
import { trajectories, courses, tlos, ilos, courseObjectives, iloCourseObjectiveMappings } from '../db/schema'
import { and, eq, inArray } from 'drizzle-orm'

export type SyncTable =
  | 'trajectories' | 'courses' | 'tlos' | 'ilos'
  | 'course_objectives' | 'ilo_course_objective_mappings'

// ── Trajectories ──────────────────────────────────────────────────────────────

async function createTrajectory(db: DB, data: any) {
  await db.insert(trajectories).values({
    projectId: data.projectId, name: data.name,
    description: data.description ?? '', color: data.color ?? '',
  }).onConflictDoNothing()
}

async function updateTrajectory(db: DB, data: any) {
  await db.update(trajectories)
    .set({ name: data.newName, description: data.description, color: data.color })
    .where(and(eq(trajectories.id, data.trajectoryId), eq(trajectories.projectId, data.projectId)))
}

async function renameTrajectory(db: DB, data: any) {
  await db.update(trajectories).set({ name: data.newName })
    .where(and(eq(trajectories.projectId, data.projectId), eq(trajectories.name, data.oldName)))
}

async function deleteTrajectory(db: DB, data: any) {
  const tloRows = await db.select({ id: tlos.id }).from(tlos)
    .where(and(eq(tlos.projectId, data.projectId), eq(tlos.trajectoryId, data.trajectoryId)))
  if (tloRows.length) {
    const ids = tloRows.map(r => r.id)
    await db.update(ilos).set({ tloId: null }).where(inArray(ilos.tloId, ids))
    await db.delete(tlos).where(inArray(tlos.id, ids))
  }
  await db.delete(trajectories).where(eq(trajectories.id, data.trajectoryId))
}

// ── TLOs ─────────────────────────────────────────────────────────────────────

async function addTlo(db: DB, data: any) {
  await db.insert(tlos).values({
    projectId: data.projectId, trajectoryId: data.trajectoryId,
    name: data.name, description: data.description ?? '', bloomLevel: data.bloomLevel ?? null,
  })
}

async function updateTlo(db: DB, data: any) {
  await db.update(tlos).set({
    trajectoryId: data.trajectoryId, name: data.name,
    description: data.description, bloomLevel: data.bloomLevel ?? null,
  }).where(eq(tlos.id, data.id))
}

async function deleteTlo(db: DB, data: any) {
  await db.update(ilos).set({ tloId: null }).where(eq(ilos.tloId, data.id))
  await db.delete(tlos).where(eq(tlos.id, data.id))
}

// ── ILOs ─────────────────────────────────────────────────────────────────────

async function addIlo(db: DB, data: any) {
  await db.insert(ilos).values({
    projectId: data.projectId, name: data.name, tloId: data.tloId ?? null,
    description: data.description ?? '', bloomLevel: data.bloomLevel ?? null,
  })
}

async function updateIlo(db: DB, data: any) {
  await db.update(ilos).set({
    name: data.name, description: data.description, bloomLevel: data.bloomLevel ?? null,
    ...(data.tloId !== undefined ? { tloId: data.tloId } : {})
  }).where(eq(ilos.id, data.id))
}

async function deleteIlo(db: DB, data: any) {
  await db.delete(iloCourseObjectiveMappings).where(eq(iloCourseObjectiveMappings.iloId, data.id))
  await db.delete(ilos).where(eq(ilos.id, data.id))
}

// ── Courses ───────────────────────────────────────────────────────────────────

async function createCourse(db: DB, data: any) {
  await db.insert(courses).values({
    projectId: data.projectId, name: data.name,
    description: data.description ?? '', color: data.color ?? '',
  }).onConflictDoNothing()
}

async function updateCourse(db: DB, data: any) {
  await db.update(courses)
    .set({ name: data.newName, description: data.description, color: data.color })
    .where(and(eq(courses.id, data.courseId), eq(courses.projectId, data.projectId)))
}

async function renameCourse(db: DB, data: any) {
  await db.update(courses).set({ name: data.newName })
    .where(and(eq(courses.projectId, data.projectId), eq(courses.name, data.oldName)))
}

async function deleteCourse(db: DB, data: any) {
  const coRows = await db.select({ id: courseObjectives.id }).from(courseObjectives)
    .where(and(eq(courseObjectives.projectId, data.projectId), eq(courseObjectives.courseId, data.courseId)))
  if (coRows.length) {
    const ids = coRows.map(r => r.id)
    await db.delete(iloCourseObjectiveMappings).where(inArray(iloCourseObjectiveMappings.courseObjectiveId, ids))
    await db.delete(courseObjectives).where(inArray(courseObjectives.id, ids))
  }
  await db.delete(courses).where(eq(courses.id, data.courseId))
}

// ── Course Objectives ─────────────────────────────────────────────────────────

async function addCourseObjective(db: DB, data: any) {
  await db.insert(courseObjectives).values({
    projectId: data.projectId, courseId: data.courseId,
    name: data.name, description: data.description ?? '',
  })
}

async function updateCourseObjective(db: DB, data: any) {
  await db.update(courseObjectives).set({
    courseId: data.courseId, name: data.name, description: data.description,
  }).where(eq(courseObjectives.id, data.id))
}

async function deleteCourseObjective(db: DB, data: any) {
  await db.delete(iloCourseObjectiveMappings).where(eq(iloCourseObjectiveMappings.courseObjectiveId, data.id))
  await db.delete(courseObjectives).where(eq(courseObjectives.id, data.id))
}

// ── Mappings ──────────────────────────────────────────────────────────────────

async function addIloCourseObjectiveMapping(db: DB, data: any) {
  await db.insert(iloCourseObjectiveMappings).values({
    iloId: data.iloId, courseObjectiveId: data.courseObjectiveId, projectId: data.projectId,
  }).onConflictDoNothing()
}

async function deleteIloCourseObjectiveMapping(db: DB, data: any) {
  await db.delete(iloCourseObjectiveMappings).where(
    and(eq(iloCourseObjectiveMappings.iloId, data.iloId),
        eq(iloCourseObjectiveMappings.courseObjectiveId, data.courseObjectiveId)))
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export async function handleMessage(db: DB, data: any): Promise<SyncTable[]> {
  switch (data.type) {
    case 'trajectory:create': await createTrajectory(db, data); return ['trajectories']
    case 'trajectory:update': await updateTrajectory(db, data); return ['trajectories']
    case 'trajectory:rename': await renameTrajectory(db, data); return ['trajectories']
    case 'trajectory:delete': await deleteTrajectory(db, data); return ['trajectories', 'tlos', 'ilos']

    case 'tlo:add':    await addTlo(db, data);    return ['tlos']
    case 'tlo:update': await updateTlo(db, data); return ['tlos']
    case 'tlo:delete': await deleteTlo(db, data); return ['tlos', 'ilos']

    case 'ilo:create': return addIloWithLinks(db, data)
    case 'ilo:add':    await addIlo(db, data);    return ['ilos']
    case 'ilo:update': await updateIlo(db, data); return ['ilos']
    case 'ilo:delete': await deleteIlo(db, data); return ['ilos', 'ilo_course_objective_mappings']

    case 'course:create': await createCourse(db, data); return ['courses']
    case 'course:update': await updateCourse(db, data); return ['courses']
    case 'course:rename': await renameCourse(db, data); return ['courses']
    case 'course:delete': await deleteCourse(db, data); return ['courses', 'course_objectives', 'ilo_course_objective_mappings']

    case 'course_objective:add':    await addCourseObjective(db, data);    return ['course_objectives']
    case 'course_objective:update': await updateCourseObjective(db, data); return ['course_objectives']
    case 'course_objective:delete': await deleteCourseObjective(db, data); return ['course_objectives', 'ilo_course_objective_mappings']

    case 'ilo_course_objective_mapping:add':    await addIloCourseObjectiveMapping(db, data);    return ['ilo_course_objective_mappings']
    case 'ilo_course_objective_mapping:delete': await deleteIloCourseObjectiveMapping(db, data); return ['ilo_course_objective_mappings']

    case 'import:all': return importAll(db, data)

    default:
      console.warn('Unknown message type:', data.type)
      return []
  }
}

// ── Atomic ILO creation ───────────────────────────────────────────────────────

export async function addIloWithLinks(db: DB, data: any): Promise<SyncTable[]> {
  const [newIlo] = await db.insert(ilos).values({
    projectId: data.projectId, name: data.name, tloId: data.tloId ?? null,
    description: data.description ?? '', bloomLevel: data.bloomLevel ?? null,
  }).returning()

  const tables: SyncTable[] = ['ilos']
  if (data.courseObjectiveId) {
    await db.insert(iloCourseObjectiveMappings).values({
      iloId: newIlo.id, courseObjectiveId: data.courseObjectiveId, projectId: data.projectId,
    }).onConflictDoNothing()
    tables.push('ilo_course_objective_mappings')
  }
  return tables
}

// ── Bulk import ───────────────────────────────────────────────────────────────

async function importAll(db: DB, data: any): Promise<SyncTable[]> {
  const projectId = data.projectId
  const payload = data.data as any

  async function upsertTrajectory(name: string, description = '', color = ''): Promise<number> {
    await db.insert(trajectories).values({ projectId, name, description, color }).onConflictDoNothing()
    const [row] = await db.select({ id: trajectories.id }).from(trajectories)
      .where(and(eq(trajectories.projectId, projectId), eq(trajectories.name, name)))
    return row.id
  }

  async function upsertCourse(name: string, description = '', color = ''): Promise<number> {
    await db.insert(courses).values({ projectId, name, description, color }).onConflictDoNothing()
    const [row] = await db.select({ id: courses.id }).from(courses)
      .where(and(eq(courses.projectId, projectId), eq(courses.name, name)))
    return row.id
  }

  const uniqueCourseNames = [...new Set<string>((payload.course_objectives ?? []).map((c: any) => c.course as string))]
  const courseNameToId = new Map<string, number>()
  for (const name of uniqueCourseNames) courseNameToId.set(name, await upsertCourse(name))

  const coMap = new Map<string, number>()
  for (const co of payload.course_objectives ?? []) {
    const courseId = courseNameToId.get(co.course)
    if (courseId === undefined) continue
    const [inserted] = await db.insert(courseObjectives)
      .values({ projectId, courseId, name: co.name, description: co.description ?? '' }).returning()
    coMap.set(`${co.course}::${co.name}`, inserted.id)
  }

  for (const traj of payload.trajectories ?? []) {
    const trajectoryId = await upsertTrajectory(traj.name, traj.description, traj.color)
    for (const tloData of traj.tlos ?? []) {
      const [newTlo] = await db.insert(tlos).values({
        projectId, trajectoryId, name: tloData.name,
        description: tloData.description ?? '', bloomLevel: tloData.bloom_level ?? null,
      }).returning()
      for (const iloData of tloData.ilos ?? []) {
        const [newIlo] = await db.insert(ilos).values({
          projectId, name: iloData.name, tloId: newTlo.id,
          description: iloData.description ?? '', bloomLevel: iloData.bloom_level ?? null,
        }).returning()
        for (const coRef of iloData.course_objectives ?? []) {
          const coId = coMap.get(`${coRef.course}::${coRef.name}`)
          if (coId !== undefined)
            await db.insert(iloCourseObjectiveMappings)
              .values({ iloId: newIlo.id, courseObjectiveId: coId, projectId }).onConflictDoNothing()
        }
      }
    }
  }

  return ['trajectories', 'courses', 'tlos', 'ilos', 'course_objectives', 'ilo_course_objective_mappings']
}
