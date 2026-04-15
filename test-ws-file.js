import Papa from "./apps/backend/node_modules/papaparse/papaparse.js";
import fs from "fs";

const traj = Papa.parse(fs.readFileSync('data/trajectories.csv', 'utf8'), {header:true, dynamicTyping:true, skipEmptyLines:true}).data;
const crs = Papa.parse(fs.readFileSync('data/courses.csv', 'utf8'), {header:true, dynamicTyping:true, skipEmptyLines:true}).data;
const lto = Papa.parse(fs.readFileSync('data/ltos.csv', 'utf8'), {header:true, dynamicTyping:true, skipEmptyLines:true}).data;
const ilo = Papa.parse(fs.readFileSync('data/ilos.csv', 'utf8'), {header:true, dynamicTyping:true, skipEmptyLines:true}).data;
const map = Papa.parse(fs.readFileSync('data/mappings.csv', 'utf8'), {header:true, dynamicTyping:true, skipEmptyLines:true}).data;

const ws = new WebSocket('ws://localhost:8787/ws/test-csv-import');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'import_data',
    trajectories: traj,
    courses: crs,
    ltos: lto,
    ilos: ilo,
    mappings: map
  }));
};

let i = 0;
ws.onmessage = (event) => {
  i++;
  if (i===2) {
    const d = JSON.parse(event.data);
    console.log("T:", d.data.trajectories.length, "C:", d.data.courses.length, "L:", d.data.trajectories[0]?.ltos?.length);
    process.exit(0);
  }
};
