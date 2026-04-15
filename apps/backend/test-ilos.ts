import { db } from './src/db';
import { courses, ilos } from './src/db/schema';
import Papa from 'papaparse';
import fs from 'fs';

async function test() {
  const courseInsert = await db.insert(courses).values([
    { projectId: 'test_ilos', name: 'S_SRM - Social Research Methodology' }
  ]).returning();
  const newCourseId = courseInsert[0].id;

  const fileContents = fs.readFileSync('../../data/ilos.csv', 'utf8');
  const parsedData = Papa.parse(fileContents, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;

  const getVal = (obj, keys) => {
    const foundKey = Object.keys(obj).find(k => keys.includes(k.trim().toLowerCase()));
    return foundKey ? obj[foundKey] : undefined;
  };

  const filterEmpty = (arr) =>
    arr ? arr.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== '')) : null;

  const importedIlos = filterEmpty(parsedData)?.map((i) => ({
    ...i,
    courseName: getVal(i, ['course', 'coursename'])
  }));

  const toInsert = [];
  for (const i of importedIlos) {
    let isNew = i.isNew === "true" || i.isNew === "True" || i.isNew === true || i.isNew === 1;
    toInsert.push({
      courseId: newCourseId,
      name: i.name || "Unnamed",
      outcome: i.outcome || "",
      bloom: i.bloom || null,
      isNew,
      derivedFromId: null
    });
  }

  console.log("Inserting", toInsert.length, "ILOs");
  try {
    const inserted = await db.insert(ilos).values(toInsert).returning();
    console.log("Inserted", inserted.length, "ILOs");
  } catch (e) {
    console.error(e);
  }
}
test().catch(console.error);
