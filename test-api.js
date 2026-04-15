const Papa = require('papaparse');
const fs = require('fs');

const fileContents = {
  'ilos.csv': fs.readFileSync('data/ilos.csv', 'utf8')
};
const parseCsv = (baseName) => {
  const key = Object.keys(fileContents).find(k => k.includes(baseName.replace('.csv', '')));
  const content = key ? fileContents[key] : null;
  if (!content) return null;
  return Papa.parse(content, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
};

const parsedData = { ilos: parseCsv('ilos.csv') };
const getVal = (obj, keys) => {
  const foundKey = Object.keys(obj).find(k => keys.includes(k.trim().toLowerCase()));
  return foundKey ? obj[foundKey] : undefined;
};
const filterEmpty = (arr) =>
  arr ? arr.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== '')) : null;

const importedIlos = filterEmpty(parsedData.ilos)?.map((i) => ({
  ...i,
  courseName: getVal(i, ['course', 'coursename'])
}));
console.log(importedIlos.slice(0, 2));
