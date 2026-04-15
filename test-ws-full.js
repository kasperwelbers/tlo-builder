import fs from 'fs';
import JSZip from './apps/frontend/node_modules/jszip/lib/index.js';
import Papa from './apps/backend/node_modules/papaparse/papaparse.js';
import WebSocket from 'ws';

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

  const filterEmpty = (arr) => arr ? arr.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== '')) : null;

  const ws = new WebSocket('ws://localhost:8787/ws/test-full-import');
  
  ws.on('open', () => {
    ws.send(JSON.stringify({
      type: 'import_data',
      trajectories: filterEmpty(parsedData.trajectories),
      courses: filterEmpty(parsedData.courses),
      ltos: filterEmpty(parsedData.ltos),
      ilos: filterEmpty(parsedData.ilos),
      mappings: filterEmpty(parsedData.mappings)
    }));
  });

  let msgCount = 0;
  ws.on('message', (data) => {
    msgCount++;
    if (msgCount === 2) {
      const d = JSON.parse(data.toString());
      console.log("Returned T:", d.data.trajectories.length, "C:", d.data.courses.length);
      console.log("Returned LTOs from Traj 0:", d.data.trajectories[0]?.ltos?.length);
      console.log("Returned LTOs from Traj 1:", d.data.trajectories[1]?.ltos?.length);
      
      const flatL = d.data.trajectories.flatMap(t=>t.ltos);
      const flatI = d.data.courses.flatMap(c=>c.ilos);
      console.log("Total LTOs:", flatL.length);
      console.log("Total ILOs:", flatI.length);
      console.log("Total Maps:", d.data.mappings.length);
      process.exit(0);
    }
  });
}
test();
