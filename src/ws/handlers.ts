import { type DB } from '../db'
import { trajectories, courses, tlos, ilos, clos, tloIloMappings, iloCloMappings } from '../db/schema'
import { and, eq, inArray } from 'drizzle-orm'

export type SyncTable =
  | 'trajectories' | 'courses' | 'tlos' | 'ilos'
  | 'clos' | 'ilo_clo_mappings'

// -- Trajectories --------------------------------------------------------------

async function createTrajectory(db: DB, data: any) {
  await db.insert(trajectories).values({
    projectId: data.projectId, name: data.name,
    description: data.description ?? '', color: data.color ?? '',
    coordinator: data.coordinator ?? null,
  }).onConflictDoNothing()
}

async function updateTrajectory(db: DB, data: any) {
  await db.update(trajectories)
    .set({ name: data.newName ?? data.name, description: data.description, color: data.color, coordinator: data.coordinator ?? null })
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
    await db.delete(tloIloMappings).where(inArray(tloIloMappings.tloId, ids))
    await db.delete(tlos).where(inArray(tlos.id, ids))
  }
  await db.delete(trajectories).where(eq(trajectories.id, data.trajectoryId))
}

// -- TLOs ---------------------------------------------------------------------

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
  await db.delete(tloIloMappings).where(eq(tloIloMappings.tloId, data.id))
  await db.delete(tlos).where(eq(tlos.id, data.id))
}

// -- ILOs ---------------------------------------------------------------------

async function addIlo(db: DB, data: any) {
  await db.insert(ilos).values({
    projectId: data.projectId,
    description: data.description ?? '', bloomLevel: data.bloomLevel ?? null,
  })
}

async function updateIlo(db: DB, data: any) {
  await db.update(ilos).set({
    description: data.description, bloomLevel: data.bloomLevel ?? null,
  }).where(eq(ilos.id, data.id))
}

async function deleteIlo(db: DB, data: any) {
  await db.delete(tloIloMappings).where(eq(tloIloMappings.iloId, data.id))
  await db.delete(iloCloMappings).where(eq(iloCloMappings.iloId, data.id))
  await db.delete(ilos).where(eq(ilos.id, data.id))
}

// -- Courses ------------------------------------------------------------------

async function createCourse(db: DB, data: any) {
  await db.insert(courses).values({
    projectId: data.projectId, name: data.name,
    description: data.description ?? '', color: data.color ?? '',
    coordinator: data.coordinator ?? null, start: data.start ?? null, end: data.end ?? null,
  }).onConflictDoNothing()
}

async function updateCourse(db: DB, data: any) {
  await db.update(courses)
    .set({ name: data.newName ?? data.name, description: data.description, color: data.color, coordinator: data.coordinator ?? null, start: data.start ?? null, end: data.end ?? null })
    .where(and(eq(courses.id, data.courseId), eq(courses.projectId, data.projectId)))
}

async function renameCourse(db: DB, data: any) {
  await db.update(courses).set({ name: data.newName })
    .where(and(eq(courses.projectId, data.projectId), eq(courses.name, data.oldName)))
}

async function deleteCourse(db: DB, data: any) {
  await db.delete(iloCloMappings).where(
    and(eq(iloCloMappings.projectId, data.projectId), eq(iloCloMappings.courseId, data.courseId))
  )
  const cloRows = await db.select({ id: clos.id }).from(clos)
    .where(and(eq(clos.projectId, data.projectId), eq(clos.courseId, data.courseId)))
  if (cloRows.length) {
    await db.delete(clos).where(inArray(clos.id, cloRows.map(r => r.id)))
  }
  await db.delete(courses).where(eq(courses.id, data.courseId))
}

// -- CLOs (Course Learning Objectives) ----------------------------------------

async function addClo(db: DB, data: any) {
  await db.insert(clos).values({
    projectId: data.projectId, courseId: data.courseId,
    description: data.description ?? '', bloomLevel: data.bloomLevel ?? null,
  })
}

async function updateClo(db: DB, data: any) {
  await db.update(clos).set({
    courseId: data.courseId, description: data.description, bloomLevel: data.bloomLevel ?? null,
  }).where(eq(clos.id, data.id))
}

async function deleteClo(db: DB, data: any) {
  await db.update(iloCloMappings).set({ cloId: null }).where(eq(iloCloMappings.cloId, data.id))
  await db.delete(clos).where(eq(clos.id, data.id))
}

// -- Mappings -----------------------------------------------------------------

async function addTloIloMapping(db: DB, data: any) {
  await db.delete(tloIloMappings).where(eq(tloIloMappings.iloId, data.iloId))
  await db.insert(tloIloMappings).values({ tloId: data.tloId, iloId: data.iloId, projectId: data.projectId })
}

async function deleteTloIloMapping(db: DB, data: any) {
  await db.delete(tloIloMappings).where(
    and(eq(tloIloMappings.tloId, data.tloId), eq(tloIloMappings.iloId, data.iloId)))
}

async function addIloCloMapping(db: DB, data: any) {
  let courseId = data.courseId
  if (!courseId && data.cloId) {
    const [row] = await db.select({ courseId: clos.courseId }).from(clos).where(eq(clos.id, data.cloId))
    courseId = row?.courseId
  }
  if (!courseId) return
  await db.insert(iloCloMappings).values({
    iloId: data.iloId, courseId, cloId: data.cloId ?? null, projectId: data.projectId,
  }).onConflictDoUpdate({
    target: [iloCloMappings.iloId, iloCloMappings.courseId],
    set: { cloId: data.cloId ?? null },
  })
}

async function deleteIloCloMapping(db: DB, data: any) {
  await db.delete(iloCloMappings).where(
    and(eq(iloCloMappings.iloId, data.iloId), eq(iloCloMappings.courseId, data.courseId))
  )
}

// -- Dispatcher ---------------------------------------------------------------

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
    case 'ilo:delete': await deleteIlo(db, data); return ['ilos', 'ilo_clo_mappings']

    case 'course:create': await createCourse(db, data); return ['courses']
    case 'course:update': await updateCourse(db, data); return ['courses']
    case 'course:rename': await renameCourse(db, data); return ['courses']
    case 'course:delete': await deleteCourse(db, data); return ['courses', 'clos', 'ilo_clo_mappings']

    case 'clo:add':    await addClo(db, data);    return ['clos']
    case 'clo:update': await updateClo(db, data); return ['clos']
    case 'clo:delete': await deleteClo(db, data); return ['clos', 'ilo_clo_mappings']

    case 'tlo_ilo_mapping:add':    await addTloIloMapping(db, data);    return ['ilos']
    case 'tlo_ilo_mapping:delete': await deleteTloIloMapping(db, data); return ['ilos']

    case 'ilo_clo_mapping:add':    await addIloCloMapping(db, data);    return ['ilo_clo_mappings']
    case 'ilo_clo_mapping:delete': await deleteIloCloMapping(db, data); return ['ilo_clo_mappings']

    case 'import:all': return importAll(db, data)

    default:
      console.warn('Unknown message type:', data.type)
      return []
  }
}

// -- Atomic ILO creation ------------------------------------------------------

export async function addIloWithLinks(db: DB, data: any): Promise<SyncTable[]> {
  const [newIlo] = await db.insert(ilos).values({
    projectId: data.projectId,
    description: data.description ?? '', bloomLevel: data.bloomLevel ?? null,
  }).returning()

  await db.delete(tloIloMappings).where(eq(tloIloMappings.iloId, newIlo.id))
  await db.insert(tloIloMappings).values({ tloId: data.tloId, iloId: newIlo.id, projectId: data.projectId })

  const tables: SyncTable[] = ['ilos']

  if (data.cloId) {
    // Link to a specific CLO (courseId is resolved from the CLO row)
    const [cloRow] = await db.select({ courseId: clos.courseId }).from(clos).where(eq(clos.id, data.cloId))
    if (cloRow) {
      await db.insert(iloCloMappings).values({
        iloId: newIlo.id, courseId: cloRow.courseId, cloId: data.cloId, projectId: data.projectId,
      }).onConflictDoNothing()
      tables.push('ilo_clo_mappings')
    }
  } else if (data.courseId) {
    // Link at course level only (no specific CLO)
    await db.insert(iloCloMappings).values({
      iloId: newIlo.id, courseId: data.courseId, cloId: null, projectId: data.projectId,
    }).onConflictDoNothing()
    tables.push('ilo_clo_mappings')
  }

  return tables
}

// -- Bulk import --------------------------------------------------------------

async function importAll(db: DB, data: any): Promise<SyncTable[]> {
  const projectId = data.projectId
  const payload = data.data as any

  async function upsertTrajectory(name: string, description = '', color = ''): Promise<number> {
    await db.insert(trajectories).values({ projectId, name, description, color }).onConflictDoNothing()
    const [row] = await db.select({ id: trajectories.id }).from(trajectories)
      .where(and(eq(trajectories.projectId, projectId), eq(trajectories.name, name)))
    return row.id
  }

  async function upsertCourse(name: string, description = '', color = '', coordinator?: string, start?: string, end?: string): Promise<number> {
    await db.insert(courses).values({ projectId, name, description, color, coordinator: coordinator ?? null, start: start ?? null, end: end ?? null }).onConflictDoNothing()
    const [row] = await db.select({ id: courses.id }).from(courses)
      .where(and(eq(courses.projectId, projectId), eq(courses.name, name)))
    return row.id
  }

  const uniqueCourseNames = [...new Set<string>((payload.course_objectives ?? []).map((c: any) => c.course as string))]
  const courseNameToId = new Map<string, number>()
  for (const name of uniqueCourseNames) courseNameToId.set(name, await upsertCourse(name))

  // Key CLOs by course+description since there is no name field
  const coMap = new Map<string, number>()
  for (const co of payload.course_objectives ?? []) {
    const courseId = courseNameToId.get(co.course)
    if (courseId === undefined) continue
    const [inserted] = await db.insert(clos)
      .values({ projectId, courseId, description: co.description ?? '' }).returning()
    coMap.set(`${co.course}::${co.description}`, inserted.id)
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
          projectId,
          description: iloData.description ?? '', bloomLevel: iloData.bloom_level ?? null,
        }).returning()
        await db.insert(tloIloMappings).values({ tloId: newTlo.id, iloId: newIlo.id, projectId })
        for (const coRef of iloData.course_objectives ?? []) {
          const cloId = coMap.get(`${coRef.course}::${coRef.description}`)
          const courseId = courseNameToId.get(coRef.course)
          if (cloId !== undefined && courseId !== undefined)
            await db.insert(iloCloMappings)
              .values({ iloId: newIlo.id, courseId, cloId, projectId }).onConflictDoNothing()
        }
      }
    }
  }

  return ['trajectories', 'courses', 'tlos', 'ilos', 'clos', 'ilo_clo_mappings']
}
