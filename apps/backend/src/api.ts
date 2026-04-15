import { broadcastState } from "./index";
import { Hono } from 'hono';
import { db } from './db';
import { trajectories, courses, ltos, ilos, mappings } from './db/schema';
import { eq, inArray } from 'drizzle-orm';
import { handleImportData } from './ws/handlers';
import Papa from 'papaparse';

export const importApi = new Hono();

importApi.post('/import/:projectId', async (c) => {
  const projectId = c.req.param('projectId');
  const body = await c.req.parseBody();
  
  try {
    const fileContents: Record<string, string> = {};
    for (const key of Object.keys(body)) {
      const val = body[key];
      if (val instanceof File && val.name.endsWith('.csv')) {
        fileContents[val.name.toLowerCase()] = await val.text();
      }
    }

    const parseCsv = (baseName: string) => {
      const key = Object.keys(fileContents).find(k => k.includes(baseName.replace('.csv', '')));
      const content = key ? fileContents[key] : null;
      if (!content) return null;
      return Papa.parse(content, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
    };

    const parsedData = {
      ltos: parseCsv("ltos.csv"),
      ilos: parseCsv("ilos.csv") || parseCsv("itos.csv"),
      mappings: parseCsv("mappings.csv"),
    };

    const getVal = (obj: any, keys: string[]) => {
      const foundKey = Object.keys(obj).find(k => keys.includes(k.trim().toLowerCase()));
      return foundKey ? obj[foundKey] : undefined;
    };

    const filterEmpty = (arr: any[] | null) =>
      arr ? arr.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== '')) : null;

    const importedLtos = filterEmpty(parsedData.ltos)?.map((l: any) => ({
      ...l,
      trajectoryName: getVal(l, ['trajectory', 'trajectoryname'])
    }));
    const importedIlos = filterEmpty(parsedData.ilos)?.map((i: any) => ({
      ...i,
      courseName: getVal(i, ['course', 'coursename'])
    }));
    const importedMappings = filterEmpty(parsedData.mappings)?.map((m: any) => ({
      ...m,
      ltoName: getVal(m, ['lto', 'ltoname', 'tlo', 'tloname']),
      iloName: getVal(m, ['ilo', 'iloname', 'ito', 'itoname'])
    }));

    const existingTrajs = await db.query.trajectories.findMany({ where: eq(trajectories.projectId, projectId), with: { ltos: true } });
    const existingCourses = await db.query.courses.findMany({ where: eq(courses.projectId, projectId), with: { ilos: true } });
    const flatLtos = existingTrajs.flatMap((t: any) => (t.ltos || []).map((l: any) => ({ trajectoryName: t.name, name: l.name, outcome: l.outcome, bloom: l.bloom })));
    const flatIlos = existingCourses.flatMap((c: any) => (c.ilos || []).map((i: any) => ({ courseName: c.name, name: i.name, outcome: i.outcome, bloom: i.bloom, isNew: i.isNew })));

    const trajectoriesToImport = importedLtos
      ? Array.from(new Set(importedLtos.map((l: any) => l.trajectoryName).filter(Boolean))).map(name => ({ name, color: null }))
      : existingTrajs.map((t: any) => ({ name: t.name, color: t.color }));

    const coursesToImport = importedIlos
      ? Array.from(new Set(importedIlos.map((i: any) => i.courseName).filter(Boolean))).map(name => ({ name, color: null }))
      : existingCourses.map((c: any) => ({ name: c.name, color: c.color }));

    const data = {
      type: "import_data",
      projectId,
      trajectories: trajectoriesToImport,
      courses: coursesToImport,
      ltos: importedLtos ?? flatLtos,
      ilos: importedIlos ?? flatIlos,
      mappings: importedMappings ?? [],
    };

    await handleImportData(data);
    await broadcastState(projectId);
    return c.json({ success: true, message: 'Import successful' });
  } catch (err: any) {
    console.error(err);
    return c.json({ success: false, error: err.message }, 500);
  }
});
