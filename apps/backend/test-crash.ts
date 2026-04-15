import { importApi } from './src/api';
import { db } from './src/db';
import { trajectories, courses, ltos, ilos, mappings } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { handleImportData } from './src/ws/handlers';
import Papa from 'papaparse';

async function test() {
  await db.delete(mappings);
  await db.delete(ilos);
  await db.delete(ltos);
  await db.delete(courses);
  await db.delete(trajectories);

  const fileContents = {
    'ltos.csv': `trajectory,name,outcome,bloom\nTest Traj,LTO 1,Outcome 1,C1`
  };

  const parseCsv = (baseName) => {
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

  const getVal = (obj, keys) => {
    const foundKey = Object.keys(obj).find(k => keys.includes(k.trim().toLowerCase()));
    return foundKey ? obj[foundKey] : undefined;
  };

  const filterEmpty = (arr) =>
    arr ? arr.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== '')) : null;

  const importedLtos = filterEmpty(parsedData.ltos)?.map((l) => ({
    ...l,
    trajectoryName: getVal(l, ['trajectory', 'trajectoryname'])
  }));
  const importedIlos = filterEmpty(parsedData.ilos)?.map((i) => ({
    ...i,
    courseName: getVal(i, ['course', 'coursename'])
  }));
  const importedMappings = filterEmpty(parsedData.mappings)?.map((m) => ({
    ...m,
    ltoName: getVal(m, ['lto', 'ltoname', 'tlo', 'tloname']),
    iloName: getVal(m, ['ilo', 'iloname', 'ito', 'itoname'])
  }));

  const existingTrajs = await db.query.trajectories.findMany({ where: eq(trajectories.projectId, 'test'), with: { ltos: true } });
  const existingCourses = await db.query.courses.findMany({ where: eq(courses.projectId, 'test'), with: { ilos: true } });
  const flatLtos = existingTrajs.flatMap((t) => (t.ltos || []).map((l) => ({ trajectoryName: t.name, name: l.name, outcome: l.outcome, bloom: l.bloom })));
  const flatIlos = existingCourses.flatMap((c) => (c.ilos || []).map((i) => ({ courseName: c.name, name: i.name, outcome: i.outcome, bloom: i.bloom, isNew: i.isNew })));

  const trajectoriesToImport = importedLtos
    ? Array.from(new Set(importedLtos.map((l) => l.trajectoryName).filter(Boolean))).map(name => ({ name, color: null }))
    : existingTrajs.map((t) => ({ name: t.name, color: t.color }));

  const coursesToImport = importedIlos
    ? Array.from(new Set(importedIlos.map((i) => i.courseName).filter(Boolean))).map(name => ({ name, color: null }))
    : existingCourses.map((c) => ({ name: c.name, color: c.color }));

  const data = {
    type: "import_data",
    projectId: 'test',
    trajectories: trajectoriesToImport,
    courses: coursesToImport,
    ltos: importedLtos ?? flatLtos,
    ilos: importedIlos ?? flatIlos,
    mappings: importedMappings ?? [],
  };

  try {
    await handleImportData(data);
    console.log("SUCCESS");
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
