const Papa = require('papaparse');
const fs = require('fs');

const trajectoriesCsv = fs.readFileSync('data/trajectories.csv', 'utf-8');
const ltosCsv = fs.readFileSync('data/ltos.csv', 'utf-8');

const tParsed = Papa.parse(trajectoriesCsv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
const lParsed = Papa.parse(ltosCsv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;

console.log("Trajectories parsed:", tParsed);
console.log("LTOs parsed (first 2):", lParsed.slice(0, 2));

