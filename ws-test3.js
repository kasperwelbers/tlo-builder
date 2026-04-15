const ws = new WebSocket('ws://localhost:8787/ws/test-project-4');

let messages = 0;
ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    type: 'import_data',
    trajectories: [{ id: 1, name: 'T1' }],
    courses: [{ id: 1, name: 'C1' }],
    ltos: [{ id: 1, trajectoryId: 1, name: 'L1', outcome: 'Out1' }],
    ilos: [{ id: 1, courseId: 1, name: 'I1', outcome: 'Out1' }],
    mappings: [{ ltoId: 1, iloId: 1 }]
  }));
};

ws.onmessage = (event) => {
  messages++;
  const d = JSON.parse(event.data);
  console.log(`Msg ${messages}:`, d.data.trajectories.length, d.data.courses.length);
  if (messages === 2) process.exit(0);
};

ws.onclose = () => {
  console.log('Disconnected');
};
