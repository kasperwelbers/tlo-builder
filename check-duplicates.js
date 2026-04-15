const Papa = require('./apps/backend/node_modules/papaparse/papaparse.js');
const fs = require('fs');

const map = Papa.parse(fs.readFileSync('data/mappings.csv', 'utf8'), {header:true, dynamicTyping:true, skipEmptyLines:true}).data;

const set = new Set();
let dups = 0;
for (const m of map) {
  const key = `${m.ltoId}-${m.iloId || m.itoId}`;
  if (set.has(key)) {
    dups++;
  } else {
    set.add(key);
  }
}
console.log("Total:", map.length, "Duplicates:", dups);
