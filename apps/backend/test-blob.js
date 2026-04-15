const fs = require('fs');

async function test() {
  const formData = new FormData();
  const buffer = fs.readFileSync('../../data/ltos.csv');
  const blob = new Blob([buffer]);
  formData.append('ltos.csv', blob, 'ltos.csv');

  const res = await fetch('http://localhost:8788/import', { method: 'POST', body: formData });
  console.log(await res.text());
}
test().catch(console.error);
