const fs = require('fs');

let code = `import { db } from '../db';
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
  const trajIdMap = new Map<string, number>();
  const courseNameMap = new Map<string, number>();
  const courseIdMap = new Map<string, number>();
  const ltoNameMap = new Map<string, number>();
  const ltoIdMap = new Map<string, number>();
  const iloNameMap = new Map<string, number>();
  const iloIdMap = new Map<string, number>();

  if (data.trajectories?.length) {
    for (const t of data.trajectories) {
      const name = t.name || "Unnamed";
      if (trajNameMap.has(name)) continue;
      const [inserted] = await db.insert(trajectories).values({
        projectId: data.projectId,
        name: name,
        color: t.color || null
      }).returning();
      trajNameMap.set(name, inserted.id);
      if (t.id) trajIdMap.set(String(t.id), inserted.id);
    }
  }

  if (data.courses?.length) {
    for (const c of data.courses) {
      const name = c.name || "Unnamed";
      if (courseNameMap.has(name)) continue;
      const [inserted] = await db.insert(courses).values({
        projectId: data.projectId,
        name: name,
        color: c.color || null
      }).returning();
      courseNameMap.set(name, inserted.id);
      if (c.id) courseIdMap.set(String(c.id), inserted.id);
    }
  }

  if (data.ltos?.length) {
    for (const l of data.ltos) {
      const tName = l.trajectoryName || l.trajectory_name;
      const tId = l.trajectoryId || l.trajectory_id;
      const newTrajId = (tName ? trajNameMap.get(String(tName)) : null) || (tId ? trajIdMap.get(String(tId)) : null);

      if (!newTrajId) { throw new Error(\`Missing Trajectory for LTO: \${l.name || "Unnamed"}\`); }

      const name = l.name || "Unnamed";
      const [inserted] = await db.insert(ltos).values({
        trajectoryId: newTrajId,
        name: name,
        outcome: l.outcome || "",
        bloom: l.bloom || null
      }).returning();
      ltoNameMap.set(name, inserted.id);
      if (l.id) ltoIdMap.set(String(l.id), inserted.id);
    }
  }

  if (data.ilos?.length) {
    const firstOccurrences = new Map<string, number>();
    for (const i of data.ilos) {
      const cName = i.courseName || i.course_name;
      const cId = i.courseId || i.course_id;
      const newCourseId = (cName ? courseNameMap.get(String(cName)) : null) || (cId ? courseIdMap.get(String(cId)) : null);

      if (!newCourseId) { throw new Error(\`Missing Course for ILO: \${i.name || "Unnamed"}\`); }

      const name = i.name || "Unnamed";
      let isNew = i.isNew === "true" || i.isNew === "True" || i.isNew === true || i.isNew === 1;
      let derivedFromId = null;

      if (firstOccurrences.has(name)) {
        derivedFromId = firstOccurrences.get(name);
        isNew = true;
      }

      const [inserted] = await db.insert(ilos).values({
        courseId: newCourseId,
        name: name,
        outcome: i.outcome || "",
        bloom: i.bloom || null,
        isNew,
        derivedFromId
      }).returning();

      if (!firstOccurrences.has(name)) {
        firstOccurrences.set(name, inserted.id);
      }

      iloNameMap.set(name, inserted.id);
      if (i.id) iloIdMap.set(String(i.id), inserted.id);
    }
  }

  if (data.mappings?.length) {
    const parsedMappings = data.mappings.map((m: any) => {
      const lName = m.ltoName || m.lto_name;
      const lId = m.ltoId || m.lto_id;
      const newLtoId = (lName ? ltoNameMap.get(String(lName)) : null) || (lId ? ltoIdMap.get(String(lId)) : null);

      const iName = m.iloName || m.ilo_name || m.itoName || m.ito_name;
      const iId = m.iloId || m.itoId || m.ilo_id || m.ito_id;
      const newIloId = (iName ? iloNameMap.get(String(iName)) : null) || (iId ? iloIdMap.get(String(iId)) : null);

      return { ltoId: newLtoId, iloId: newIloId };
    }).filter((m: any) => m.ltoId && m.iloId);

    if (parsedMappings.length > 0) {
      await db.insert(mappings).values(parsedMappings).onConflictDoNothing();
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
`;
fs.writeFileSync('apps/backend/src/ws/handlers.ts', code);
