const Papa = require('./apps/backend/node_modules/papaparse/papaparse.js');
const fs = require('fs');

const map = Papa.parse(fs.readFileSync('data/mappings.csv', 'utf8'), {header:true, dynamicTyping:true, skipEmptyLines:true}).data;
console.log(map.length);
