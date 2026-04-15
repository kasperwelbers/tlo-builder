const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8787/ws/test-csv-import');

let i = 0;
ws.on('message', (data) => {
  i++;
  if (i===1) {
    const d = JSON.parse(data.toString());
    console.log("T:", d.data.trajectories.length, "C:", d.data.courses.length, "L:", d.data.trajectories[0]?.ltos?.length, "ILOs:", d.data.courses[0]?.ilos?.length, "Mappings:", d.data.mappings.length);
    process.exit(0);
  }
});
