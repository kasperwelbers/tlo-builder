const fs = require('fs');
const Papa = require('papaparse');
const WebSocket = require('ws');

const fileContents = fs.readFileSync('../../data/ltos.csv', 'utf8');
const parsedData = Papa.parse(fileContents, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;

const getVal = (obj, keys) => {
  const foundKey = Object.keys(obj).find(k => keys.includes(k.trim().toLowerCase()));
  return foundKey ? obj[foundKey] : undefined;
};

const filterEmpty = (arr) =>
  arr ? arr.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== '')) : null;

const importedLtos = filterEmpty(parsedData)?.map((l) => ({
  ...l,
  trajectoryName: getVal(l, ['trajectory', 'trajectoryname'])
}));

const trajectoriesToImport = importedLtos
  ? Array.from(new Set(importedLtos.map(l => l.trajectoryName).filter(Boolean))).map(name => ({ name, color: null }))
  : [];

const payload = {
  type: 'import_data',
  trajectories: trajectoriesToImport,
  courses: [],
  ltos: importedLtos,
  ilos: [],
  mappings: []
};

const ws = new WebSocket('ws://localhost:8787/ws/test_ws_project');
ws.on('open', () => {
  console.log("Connected");
  ws.send(JSON.stringify(payload));
});

ws.on('message', (msg) => {
  const res = JSON.parse(msg.toString());
  if (res.type === 'sync') {
    console.log("Sync received. Trajectories count:", res.data.trajectories.length);
    res.data.trajectories.forEach(t => {
      console.log(`Trajectory [${t.id}] ${t.name} has ${t.ltos.length} LTOs`);
      if (t.ltos.length > 0) {
        console.log(`  First LTO trajectoryId: ${t.ltos[0].trajectoryId}`);
      }
    });
    process.exit(0);
  }
});
