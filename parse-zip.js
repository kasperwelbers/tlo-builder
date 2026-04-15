import fs from 'fs';
import JSZip from './apps/frontend/node_modules/jszip/lib/index.js';
import Papa from './apps/backend/node_modules/papaparse/papaparse.js';

async function test() {
  const fileContents = {};
  const file = fs.readFileSync('data.zip');
  
  const zip = await JSZip.loadAsync(file);
  for (const [filename, zipEntry] of Object.entries(zip.files)) {
    if (!zipEntry.dir && filename.endsWith(".csv")) {
      const normalizedName = filename.split('/').pop()?.toLowerCase() || filename;
      fileContents[normalizedName] = await zipEntry.async("string");
    }
  }

  const parseCsv = (filename) => {
    const content = fileContents[filename];
    if (!content) return null;
    return Papa.parse(content, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
  };

  const parsedData = {
    trajectories: parseCsv("trajectories.csv"),
    courses: parseCsv("courses.csv"),
    ltos: parseCsv("ltos.csv"),
    ilos: parseCsv("ilos.csv") || parseCsv("itos.csv"),
    mappings: parseCsv("mappings.csv"),
  };

  console.log("T:", parsedData.trajectories?.length, "C:", parsedData.courses?.length, "L:", parsedData.ltos?.length, "I:", parsedData.ilos?.length, "M:", parsedData.mappings?.length);
  
  const filterEmpty = (arr) => arr ? arr.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== '')) : null;
  console.log("Filtered:", filterEmpty(parsedData.ltos)?.length);
}
test();
