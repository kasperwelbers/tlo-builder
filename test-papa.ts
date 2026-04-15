import Papa from "./node_modules/papaparse/papaparse.js";
import fs from "fs";

const file = fs.readFileSync('../../data/trajectories.csv', 'utf8');
const p = Papa.parse(file, { header: true, skipEmptyLines: true });
console.log(p.data);
