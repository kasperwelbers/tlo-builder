import { type DB } from "../db"
import {
  trajectories,
  courses,
  tlos,
  ilos,
  currentIlos,
  tloIloMappings,
  iloCurrentIloMappings,
  comments,
  users,
} from "../db/schema"
import { and, eq, inArray } from "drizzle-orm"

export type SyncTable =
  | "trajectories"
  | "courses"
  | "tlos"
  | "ilos"
  | "current_ilos"
  | "ilo_current_ilo_mappings"
  | "comments"

// -- Trajectories --------------------------------------------------------------

async function createTrajectory(db: DB, data: any) {
  await db
    .insert(trajectories)
    .values({
      projectId: data.projectId,
      name: data.name,
      description: data.description ?? "",
      color: data.color ?? "",
      coordinator: data.coordinator ?? null,
    })
    .onConflictDoNothing()
}

async function updateTrajectory(db: DB, data: any) {
  await db
    .update(trajectories)
    .set({
      name: data.newName ?? data.name,
      description: data.description,
      color: data.color,
      coordinator: data.coordinator ?? null,
    })
    .where(
      and(
        eq(trajectories.id, data.trajectoryId),
        eq(trajectories.projectId, data.projectId)
      )
    )
}

async function renameTrajectory(db: DB, data: any) {
  await db
    .update(trajectories)
    .set({ name: data.newName })
    .where(
      and(
        eq(trajectories.projectId, data.projectId),
        eq(trajectories.name, data.oldName)
      )
    )
}

async function deleteTrajectory(db: DB, data: any) {
  const tloRows = await db
    .select({ id: tlos.id })
    .from(tlos)
    .where(
      and(
        eq(tlos.projectId, data.projectId),
        eq(tlos.trajectoryId, data.trajectoryId)
      )
    )
  if (tloRows.length) {
    const ids = tloRows.map((r) => r.id)
    await db.delete(tloIloMappings).where(inArray(tloIloMappings.tloId, ids))
    await db.delete(tlos).where(inArray(tlos.id, ids))
  }
  await db.delete(trajectories).where(eq(trajectories.id, data.trajectoryId))
}

// -- TLOs ---------------------------------------------------------------------

async function addTlo(db: DB, data: any) {
  await db.insert(tlos).values({
    projectId: data.projectId,
    trajectoryId: data.trajectoryId,
    name: data.name,
    description: data.description ?? "",
    bloomLevel: data.bloomLevel ?? null,
  })
}

async function updateTlo(db: DB, data: any) {
  await db
    .update(tlos)
    .set({
      trajectoryId: data.trajectoryId,
      name: data.name,
      description: data.description,
      bloomLevel: data.bloomLevel ?? null,
    })
    .where(eq(tlos.id, data.id))
}

async function deleteTlo(db: DB, data: any) {
  await db.delete(tloIloMappings).where(eq(tloIloMappings.tloId, data.id))
  await db.delete(tlos).where(eq(tlos.id, data.id))
}

// -- ILOs ---------------------------------------------------------------------

async function addIlo(db: DB, data: any) {
  await db.insert(ilos).values({
    projectId: data.projectId,
    description: data.description ?? "",
    bloomLevel: data.bloomLevel ?? null,
  })
}

async function updateIlo(db: DB, data: any) {
  await db
    .update(ilos)
    .set({
      description: data.description,
      bloomLevel: data.bloomLevel ?? null,
    })
    .where(eq(ilos.id, data.id))
}

async function deleteIlo(db: DB, data: any) {
  await db.delete(tloIloMappings).where(eq(tloIloMappings.iloId, data.id))
  await db
    .delete(iloCurrentIloMappings)
    .where(eq(iloCurrentIloMappings.iloId, data.id))
  await db.delete(ilos).where(eq(ilos.id, data.id))
}

// -- Courses ------------------------------------------------------------------

async function createCourse(db: DB, data: any) {
  await db
    .insert(courses)
    .values({
      projectId: data.projectId,
      code: data.code,
      name: data.name ?? "",
      color: data.color ?? "",
      coordinator: data.coordinator ?? null,
      start: data.start ?? null,
      end: data.end ?? null,
    })
    .onConflictDoNothing()
}

async function updateCourse(db: DB, data: any) {
  await db
    .update(courses)
    .set({
      code: data.newCode ?? data.code,
      name: data.name,
      color: data.color,
      coordinator: data.coordinator ?? null,
      start: data.start ?? null,
      end: data.end ?? null,
    })
    .where(
      and(eq(courses.id, data.courseId), eq(courses.projectId, data.projectId))
    )
}

async function renameCourse(db: DB, data: any) {
  await db
    .update(courses)
    .set({ code: data.newCode })
    .where(
      and(eq(courses.projectId, data.projectId), eq(courses.code, data.oldCode))
    )
}

async function deleteCourse(db: DB, data: any) {
  await db
    .delete(iloCurrentIloMappings)
    .where(
      and(
        eq(iloCurrentIloMappings.projectId, data.projectId),
        eq(iloCurrentIloMappings.courseId, data.courseId)
      )
    )
  const currentIloRows = await db
    .select({ id: currentIlos.id })
    .from(currentIlos)
    .where(
      and(
        eq(currentIlos.projectId, data.projectId),
        eq(currentIlos.courseId, data.courseId)
      )
    )
  if (currentIloRows.length) {
    await db.delete(currentIlos).where(
      inArray(
        currentIlos.id,
        currentIloRows.map((r) => r.id)
      )
    )
  }
  await db.delete(courses).where(eq(courses.id, data.courseId))
}

// -- Current ILOs (Course Learning Objectives) ----------------------------------------

async function addCurrentIlo(db: DB, data: any) {
  await db.insert(currentIlos).values({
    projectId: data.projectId,
    courseId: data.courseId,
    description: data.description ?? "",
    bloomLevel: data.bloomLevel ?? null,
  })
}

async function updateCurrentIlo(db: DB, data: any) {
  await db
    .update(currentIlos)
    .set({
      ...(data.description !== undefined && { description: data.description }),
      ...(data.courseId !== undefined && { courseId: data.courseId }),
      bloomLevel: data.bloomLevel ?? null,
    })
    .where(eq(currentIlos.id, data.id))
}

async function deleteCurrentIlo(db: DB, data: any) {
  await db
    .update(iloCurrentIloMappings)
    .set({ currentIloId: null })
    .where(eq(iloCurrentIloMappings.currentIloId, data.id))
  await db.delete(currentIlos).where(eq(currentIlos.id, data.id))
}

// -- Mappings -----------------------------------------------------------------

async function addTloIloMapping(db: DB, data: any) {
  await db.delete(tloIloMappings).where(eq(tloIloMappings.iloId, data.iloId))
  await db
    .insert(tloIloMappings)
    .values({ tloId: data.tloId, iloId: data.iloId, projectId: data.projectId })
}

async function deleteTloIloMapping(db: DB, data: any) {
  await db
    .delete(tloIloMappings)
    .where(
      and(
        eq(tloIloMappings.tloId, data.tloId),
        eq(tloIloMappings.iloId, data.iloId)
      )
    )
}

async function addIloCurrentIloMapping(db: DB, data: any) {
  let courseId = data.courseId
  if (!courseId && data.currentIloId) {
    const [row] = await db
      .select({ courseId: currentIlos.courseId })
      .from(currentIlos)
      .where(eq(currentIlos.id, data.currentIloId))
    courseId = row?.courseId
  }
  if (!courseId) return
  await db
    .insert(iloCurrentIloMappings)
    .values({
      iloId: data.iloId,
      courseId,
      currentIloId: data.currentIloId ?? null,
      projectId: data.projectId,
    })
    .onConflictDoUpdate({
      target: [iloCurrentIloMappings.iloId, iloCurrentIloMappings.courseId],
      set: { currentIloId: data.currentIloId ?? null },
    })
}

async function deleteIloCurrentIloMapping(db: DB, data: any) {
  await db
    .delete(iloCurrentIloMappings)
    .where(
      and(
        eq(iloCurrentIloMappings.iloId, data.iloId),
        eq(iloCurrentIloMappings.courseId, data.courseId)
      )
    )
}

// -- Comments ----------------------------------------------------------------

async function createComment(db: DB, data: any): Promise<void> {
  // Look up the user's email from their userId
  const [userRow] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, data.userId))
  const userEmail = userRow?.email ?? "unknown"

  await db.insert(comments).values({
    projectId: data.projectId,
    userEmail,
    context: data.context, // 'trajectory' | 'course'
    contextId: data.contextId, // the trajectory or course id
    comment: data.comment ?? "",
    deleted: false,
    createdAt: Date.now(),
    updatedAt: null,
  })
}

async function updateComment(db: DB, data: any): Promise<void> {
  // Only the comment's author may edit
  const [userRow] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, data.userId))
  const userEmail = userRow?.email ?? ""

  await db
    .update(comments)
    .set({ comment: data.comment, updatedAt: Date.now() })
    .where(
      and(
        eq(comments.id, data.id),
        eq(comments.userEmail, userEmail),
        eq(comments.projectId, data.projectId)
      )
    )
}

async function deleteComment(db: DB, data: any): Promise<void> {
  // Hard delete — only the comment's author may delete
  const [userRow] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, data.userId))
  const userEmail = userRow?.email ?? ""

  await db
    .delete(comments)
    .where(
      and(
        eq(comments.id, data.id),
        eq(comments.userEmail, userEmail),
        eq(comments.projectId, data.projectId)
      )
    )
}

// -- Dispatcher ---------------------------------------------------------------

export async function handleMessage(db: DB, data: any): Promise<SyncTable[]> {
  switch (data.type) {
    case "trajectory:create":
      await createTrajectory(db, data)
      return ["trajectories"]
    case "trajectory:update":
      await updateTrajectory(db, data)
      return ["trajectories"]
    case "trajectory:rename":
      await renameTrajectory(db, data)
      return ["trajectories"]
    case "trajectory:delete":
      await deleteTrajectory(db, data)
      return ["trajectories", "tlos", "ilos"]

    case "tlo:add":
      await addTlo(db, data)
      return ["tlos"]
    case "tlo:update":
      await updateTlo(db, data)
      return ["tlos"]
    case "tlo:delete":
      await deleteTlo(db, data)
      return ["tlos", "ilos"]

    case "ilo:create":
      return addIloWithLinks(db, data)
    case "ilo:add":
      await addIlo(db, data)
      return ["ilos"]
    case "ilo:update":
      await updateIlo(db, data)
      return ["ilos"]
    case "ilo:delete":
      await deleteIlo(db, data)
      return ["ilos", "ilo_current_ilo_mappings"]

    case "course:create":
      await createCourse(db, data)
      return ["courses"]
    case "course:update":
      await updateCourse(db, data)
      return ["courses"]
    case "course:rename":
      await renameCourse(db, data)
      return ["courses"]
    case "course:delete":
      await deleteCourse(db, data)
      return ["courses", "current_ilos", "ilo_current_ilo_mappings"]

    case "current_ilo:add":
      await addCurrentIlo(db, data)
      return ["current_ilos"]
    case "current_ilo:update":
      await updateCurrentIlo(db, data)
      return ["current_ilos"]
    case "current_ilo:delete":
      await deleteCurrentIlo(db, data)
      return ["current_ilos", "ilo_current_ilo_mappings"]

    case "tlo_ilo_mapping:add":
      await addTloIloMapping(db, data)
      return ["ilos"]
    case "tlo_ilo_mapping:delete":
      await deleteTloIloMapping(db, data)
      return ["ilos"]

    case "ilo_current_ilo_mapping:add":
      await addIloCurrentIloMapping(db, data)
      return ["ilo_current_ilo_mappings"]
    case "ilo_current_ilo_mapping:delete":
      await deleteIloCurrentIloMapping(db, data)
      return ["ilo_current_ilo_mappings"]

    case "course:bulk_create":
      return bulkCreateCourses(db, data)

    case "import:all":
      return importAll(db, data)

    case "comment:create":
      await createComment(db, data)
      return ["comments"]
    case "comment:update":
      await updateComment(db, data)
      return ["comments"]
    case "comment:delete":
      await deleteComment(db, data)
      return ["comments"]

    default:
      console.warn("Unknown message type:", data.type)
      return []
  }
}

// -- Atomic ILO creation ------------------------------------------------------

export async function addIloWithLinks(db: DB, data: any): Promise<SyncTable[]> {
  const [newIlo] = await db
    .insert(ilos)
    .values({
      projectId: data.projectId,
      description: data.description ?? "",
      bloomLevel: data.bloomLevel ?? null,
    })
    .returning()

  await db.delete(tloIloMappings).where(eq(tloIloMappings.iloId, newIlo.id))
  await db
    .insert(tloIloMappings)
    .values({ tloId: data.tloId, iloId: newIlo.id, projectId: data.projectId })

  const tables: SyncTable[] = ["ilos"]

  if (data.currentIloId) {
    // Link to a specific current ILO (courseId is resolved from the current ILO row)
    const [currentIloRow] = await db
      .select({ courseId: currentIlos.courseId })
      .from(currentIlos)
      .where(eq(currentIlos.id, data.currentIloId))
    if (currentIloRow) {
      await db
        .insert(iloCurrentIloMappings)
        .values({
          iloId: newIlo.id,
          courseId: currentIloRow.courseId,
          currentIloId: data.currentIloId,
          projectId: data.projectId,
        })
        .onConflictDoNothing()
      tables.push("ilo_current_ilo_mappings")
    }
  } else if (data.courseId) {
    // Link at course level only (no specific current ILO)
    await db
      .insert(iloCurrentIloMappings)
      .values({
        iloId: newIlo.id,
        courseId: data.courseId,
        currentIloId: null,
        projectId: data.projectId,
      })
      .onConflictDoNothing()
    tables.push("ilo_current_ilo_mappings")
  }

  return tables
}

// -- Bulk import --------------------------------------------------------------

async function bulkCreateCourses(db: DB, data: any): Promise<SyncTable[]> {
  const projectId = data.projectId
  const courseList = (
    data.courses as Array<{
      code: string
      name?: string
      color?: string
      coordinator?: string | null
      start?: string | null
      end?: string | null
      current_ilos?: string[]
      clos?: string[]
    }>
  ).filter((c) => (c.code ?? "").trim() !== "")

  // Upsert each incoming course and add any new objectives
  for (const courseData of courseList) {
    const code = courseData.code.trim()

    // Upsert — preserves the row ID for existing courses
    await db
      .insert(courses)
      .values({
        projectId,
        code,
        name: courseData.name ?? "",
        color: courseData.color ?? "",
        coordinator: courseData.coordinator ?? null,
        start: courseData.start ?? null,
        end: courseData.end ?? null,
      })
      .onConflictDoUpdate({
        target: [courses.projectId, courses.code],
        set: {
          name: courseData.name ?? "",
          color: courseData.color ?? "",
          coordinator: courseData.coordinator ?? null,
          start: courseData.start ?? null,
          end: courseData.end ?? null,
        },
      })

    // Resolve the course ID after upsert
    const [courseRow] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.projectId, projectId), eq(courses.code, code)))

    if (!courseRow) continue

    const courseId = courseRow.id

    // Fetch existing objective texts for this course
    const existingIlos = await db
      .select({ description: currentIlos.description })
      .from(currentIlos)
      .where(eq(currentIlos.courseId, courseId))
    const existingTexts = new Set(existingIlos.map((r) => r.description))

    // Only insert objectives whose text isn't already present — never delete
    const incomingTexts = (courseData.current_ilos ?? courseData.clos ?? [])
      .map((t) => (t ?? "").trim())
      .filter((t) => t !== "")
    for (const text of incomingTexts) {
      if (!existingTexts.has(text)) {
        await db.insert(currentIlos).values({
          projectId,
          courseId,
          description: text,
          bloomLevel: null,
        })
      }
    }
  }

  return ["courses", "current_ilos"]
}

async function importAll(db: DB, data: any): Promise<SyncTable[]> {
  const projectId = data.projectId
  const payload = data.data as any

  // Full overwrite: delete all existing content for this project in dependency order
  await db
    .delete(iloCurrentIloMappings)
    .where(eq(iloCurrentIloMappings.projectId, projectId))
  await db.delete(tloIloMappings).where(eq(tloIloMappings.projectId, projectId))
  await db.delete(currentIlos).where(eq(currentIlos.projectId, projectId))
  await db.delete(ilos).where(eq(ilos.projectId, projectId))
  await db.delete(tlos).where(eq(tlos.projectId, projectId))
  await db.delete(trajectories).where(eq(trajectories.projectId, projectId))
  await db.delete(courses).where(eq(courses.projectId, projectId))

  async function upsertTrajectory(
    name: string,
    description = "",
    color = "",
    coordinator?: string
  ): Promise<number> {
    await db
      .insert(trajectories)
      .values({
        projectId,
        name,
        description,
        color,
        coordinator: coordinator ?? null,
      })
      .onConflictDoNothing()
    const [row] = await db
      .select({ id: trajectories.id })
      .from(trajectories)
      .where(
        and(eq(trajectories.projectId, projectId), eq(trajectories.name, name))
      )
    return row.id
  }

  async function upsertCourse(
    code: string,
    name = "",
    color = "",
    coordinator?: string,
    start?: string,
    end?: string
  ): Promise<number> {
    await db
      .insert(courses)
      .values({
        projectId,
        code,
        name,
        color,
        coordinator: coordinator ?? null,
        start: start ?? null,
        end: end ?? null,
      })
      .onConflictDoNothing()
    const [row] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.projectId, projectId), eq(courses.code, code)))
    return row.id
  }

  // 1. Upsert courses from the dedicated courses section (preserves color, coordinator, etc.)
  const courseCodeToId = new Map<string, number>()
  for (const courseData of payload.courses ?? []) {
    // Support both new format (code+name) and old format (name+description) for backward compat
    const code = (courseData.code ?? courseData.name ?? "").trim()
    const name = courseData.code
      ? (courseData.name ?? "")
      : (courseData.description ?? "")
    if (!code) continue
    courseCodeToId.set(
      code,
      await upsertCourse(
        code,
        name,
        courseData.color,
        courseData.coordinator,
        courseData.start,
        courseData.end
      )
    )
  }

  // 2. Also create any courses referenced only in current_ilos / course_objectives (code-only fallback)
  const courseObjectives =
    payload.current_ilos ?? payload.course_objectives ?? []
  const uniqueCourseCodes = [
    ...new Set<string>(courseObjectives.map((c: any) => c.course as string)),
  ]
  for (const code of uniqueCourseCodes) {
    if (!courseCodeToId.has(code))
      courseCodeToId.set(code, await upsertCourse(code))
  }

  // Key current ILOs by course+description since there is no name field
  const coMap = new Map<string, number>()
  for (const co of courseObjectives) {
    const courseId = courseCodeToId.get(co.course)
    if (courseId === undefined) continue
    const [inserted] = await db
      .insert(currentIlos)
      .values({
        projectId,
        courseId,
        description: co.description ?? "",
        bloomLevel: co.bloom_level ?? null,
      })
      .returning()
    coMap.set(`${co.course}::${co.description}`, inserted.id)
  }

  for (const traj of payload.trajectories ?? []) {
    const trajectoryId = await upsertTrajectory(
      traj.name,
      traj.description,
      traj.color,
      traj.coordinator
    )
    for (const tloData of traj.tlos ?? []) {
      const [newTlo] = await db
        .insert(tlos)
        .values({
          projectId,
          trajectoryId,
          name: tloData.name,
          description: tloData.description ?? "",
          bloomLevel: tloData.bloom_level ?? null,
        })
        .returning()
      for (const iloData of tloData.ilos ?? []) {
        const [newIlo] = await db
          .insert(ilos)
          .values({
            projectId,
            description: iloData.description ?? "",
            bloomLevel: iloData.bloom_level ?? null,
          })
          .returning()
        await db
          .insert(tloIloMappings)
          .values({ tloId: newTlo.id, iloId: newIlo.id, projectId })
        for (const coRef of iloData.current_ilos ??
          iloData.course_objectives ??
          []) {
          const currentIloId = coMap.get(
            `${coRef.course}::${coRef.description}`
          )
          const courseId = courseCodeToId.get(coRef.course)
          if (currentIloId !== undefined && courseId !== undefined)
            await db
              .insert(iloCurrentIloMappings)
              .values({ iloId: newIlo.id, courseId, currentIloId, projectId })
              .onConflictDoNothing()
        }
      }
    }
  }

  return [
    "trajectories",
    "courses",
    "tlos",
    "ilos",
    "current_ilos",
    "ilo_current_ilo_mappings",
  ]
}
