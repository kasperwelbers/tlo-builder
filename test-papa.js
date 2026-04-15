const Papa = require('papaparse');
const fs = require('fs');

const file = fs.readFileSync('data/trajectories.csv', 'utf8');
const p = Papa.parse(file, { header: true, skipEmptyLines: true });
console.log(p.data);
