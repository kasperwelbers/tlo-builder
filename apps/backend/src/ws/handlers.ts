import { db } from '../db';
import { trajectories, ltos, ilos, mappings, courses } from '../db/schema';
import { and, eq, inArray } from 'drizzle-orm';

export async function handleAddMapping(data: any) {
  await db.insert(mappings).values({
    ltoId: data.ltoId,
    iloId: data.iloId
  }).onConflictDoNothing();
}

export async function handleRemoveMapping(data: any) {
  await db.delete(mappings).where(
    and(
      eq(mappings.ltoId, data.ltoId),
      eq(mappings.iloId, data.iloId)
    )
  );
}

export async function handleAddTrajectory(data: any) {
  await db.insert(trajectories).values({
    projectId: data.projectId,
    name: data.name,
    color: data.color || null
  });
}

export async function handleUpdateTrajectory(data: any) {
  await db.update(trajectories).set({
    name: data.name,
    color: data.color || null
  }).where(eq(trajectories.id, data.id));
}

export async function handleAddLto(data: any) {
  await db.insert(ltos).values({
    trajectoryId: data.trajectoryId,
    name: data.name,
    outcome: data.outcome,
    bloom: data.bloom || ''
  });
}

export async function handleUpdateLto(data: any) {
  await db.update(ltos).set({
    name: data.name,
    outcome: data.outcome,
    bloom: data.bloom
  }).where(eq(ltos.id, data.id));
}

export async function handleRemoveLto(data: any) {
  await db.delete(mappings).where(eq(mappings.ltoId, data.id));
  await db.delete(ltos).where(eq(ltos.id, data.id));
}

export async function handleAddIlo(data: any) {
  const [newIlo] = await db.insert(ilos).values({
    courseId: data.courseId,
    name: data.name,
    outcome: data.outcome,
    bloom: data.bloom || '',
    isNew: data.isNew ?? true,
    derivedFromId: data.derivedFromId || null
  }).returning();

  if (data.mappedLtoIds && data.mappedLtoIds.length > 0) {
    await db.insert(mappings).values(
      data.mappedLtoIds.map((ltoId: number) => ({
        iloId: newIlo.id,
        ltoId
      }))
    );
  }
}

export async function handleUpdateIlo(data: any) {
  await db.update(ilos).set({
    name: data.name,
    outcome: data.outcome,
    bloom: data.bloom
  }).where(eq(ilos.id, data.id));
}

export async function handleRemoveIlo(data: any) {
  await db.delete(mappings).where(eq(mappings.iloId, data.id));
  await db.update(ilos).set({ derivedFromId: null }).where(eq(ilos.derivedFromId, data.id));
  await db.delete(ilos).where(eq(ilos.id, data.id));
}

export async function handleImportData(data: any) {
  const tIds = (await db.select({ id: trajectories.id }).from(trajectories).where(eq(trajectories.projectId, data.projectId))).map(t => t.id);
  const cIds = (await db.select({ id: courses.id }).from(courses).where(eq(courses.projectId, data.projectId))).map(c => c.id);
  const lIds = tIds.length > 0 ? (await db.select({ id: ltos.id }).from(ltos).where(inArray(ltos.trajectoryId, tIds))).map(l => l.id) : [];

  if (data.mappings !== undefined && lIds.length > 0) await db.delete(mappings).where(inArray(mappings.ltoId, lIds));
  if (data.ilos !== undefined && cIds.length > 0) await db.delete(ilos).where(inArray(ilos.courseId, cIds));
  if (data.courses !== undefined) await db.delete(courses).where(eq(courses.projectId, data.projectId));
  if (data.ltos !== undefined && tIds.length > 0) await db.delete(ltos).where(inArray(ltos.trajectoryId, tIds));
  if (data.trajectories !== undefined) await db.delete(trajectories).where(eq(trajectories.projectId, data.projectId));

  const trajNameMap = new Map<string, number>();
  const courseNameMap = new Map<string, number>();
  const ltoNameMap = new Map<string, number>();
  const iloNameMap = new Map<string, number>();

  if (data.trajectories?.length) {
    const toInsert = [];
    for (const t of data.trajectories) {
      const name = t.name || "Unnamed";
      if (trajNameMap.has(name)) throw new Error(`Duplicate Trajectory name found: ${name}. All Trajectory names must be unique.`);
      trajNameMap.set(name, 0); // temp mark
      toInsert.push({ projectId: data.projectId, name, color: t.color || null });
    }
    if (toInsert.length > 0) {
      const inserted = await db.insert(trajectories).values(toInsert).returning();
      for (const t of inserted) {
        trajNameMap.set(t.name, t.id);
      }
    }
  }

  if (data.courses?.length) {
    const toInsert = [];
    for (const c of data.courses) {
      const name = c.name || "Unnamed";
      if (courseNameMap.has(name)) throw new Error(`Duplicate Course name found: ${name}. All Course names must be unique.`);
      courseNameMap.set(name, 0); // temp mark
      toInsert.push({ projectId: data.projectId, name, color: c.color || null });
    }
    if (toInsert.length > 0) {
      const inserted = await db.insert(courses).values(toInsert).returning();
      for (const c of inserted) {
        courseNameMap.set(c.name, c.id);
      }
    }
  }

  if (data.ltos?.length) {
    const toInsert = [];
    for (const l of data.ltos) {
      const tName = l.trajectory || l.trajectoryName || l.trajectory_name;
      const newTrajId = tName ? trajNameMap.get(String(tName)) : null;

      if (!newTrajId) { throw new Error(`Missing Trajectory for LTO: ${l.name || "Unnamed"}. Make sure Trajectory names match.`); }

      const name = l.name || "Unnamed";
      if (ltoNameMap.has(name)) throw new Error(`Duplicate LTO name found: ${name}. All LTO names must be unique.`);
      ltoNameMap.set(name, 0); // temp mark
      toInsert.push({ trajectoryId: newTrajId, name, outcome: l.outcome || "", bloom: l.bloom || null });
    }
    if (toInsert.length > 0) {
      const inserted = await db.insert(ltos).values(toInsert).returning();
      for (const l of inserted) {
        ltoNameMap.set(l.name, l.id);
      }
    }
  }

  if (data.ilos?.length) {
    const toInsert = [];
    for (const i of data.ilos) {
      const cName = i.course || i.courseName || i.course_name;
      const newCourseId = cName ? courseNameMap.get(String(cName)) : null;

      if (!newCourseId) { throw new Error(`Missing Course for ILO: ${i.name || "Unnamed"}. Make sure Course names match.`); }

      const name = i.name || "Unnamed";
      let isNew = i.isNew === "true" || i.isNew === "True" || i.isNew === true || i.isNew === 1;
      let derivedFromId = null;

      toInsert.push({ courseId: newCourseId, name, outcome: i.outcome || "", bloom: i.bloom || null, isNew, derivedFromId });
    }
    if (toInsert.length > 0) {
      const inserted = await db.insert(ilos).values(toInsert).returning();
      const firstOccurrences = new Map<string, number>();

      for (const i of inserted) {
        if (firstOccurrences.has(i.name)) {
          await db.update(ilos)
            .set({ derivedFromId: firstOccurrences.get(i.name), isNew: true })
            .where(eq(ilos.id, i.id));
        } else {
          firstOccurrences.set(i.name, i.id);
          iloNameMap.set(i.name, i.id);
        }
      }
    }
  }

  if (data.mappings?.length) {
    const parsedMappings = data.mappings.map((m: any) => {
      const lName = m.tlo || m.lto || m.ltoName || m.lto_name;
      const newLtoId = lName ? ltoNameMap.get(String(lName)) : null;

      const iName = m.ilo || m.iloName || m.ilo_name || m.itoName || m.ito_name;
      const newIloId = iName ? iloNameMap.get(String(iName)) : null;

      return { ltoId: newLtoId, iloId: newIloId };
    }).filter((m: any) => m.ltoId && m.iloId);

    const uniqueMappings = Array.from(new Set(parsedMappings.map((m: any) => `${m.ltoId}-${m.iloId}`)))
      .map((str: any) => {
        const [ltoId, iloId] = str.split('-');
        return { ltoId: Number(ltoId), iloId: Number(iloId) };
      });

    if (uniqueMappings.length > 0) {
      await db.insert(mappings).values(uniqueMappings).onConflictDoNothing();
    }
  }
}

export async function handleMessage(data: any) {
  switch (data.type) {
    case "add_mapping": return handleAddMapping(data);
    case "remove_mapping": return handleRemoveMapping(data);
    case "add_trajectory": return handleAddTrajectory(data);
    case "update_trajectory": return handleUpdateTrajectory(data);
    case "add_lto": return handleAddLto(data);
    case "update_lto": return handleUpdateLto(data);
    case "remove_lto": return handleRemoveLto(data);
    case "add_ilo": return handleAddIlo(data);
    case "update_ilo": return handleUpdateIlo(data);
    case "remove_ilo": return handleRemoveIlo(data);
    case "import_data": return handleImportData(data);
    default:
      console.warn("Unknown message type:", data.type);
  }
}
