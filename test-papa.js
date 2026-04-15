const fs = require('fs');
const Papa = require('papaparse');
const fileContents = fs.readFileSync('data/ltos.csv', 'utf8');
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

console.log(trajectoriesToImport.map(t => t.name).join(', '));
