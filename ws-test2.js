const ws = new WebSocket('ws://localhost:8787/ws/test-project');

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
  const d = JSON.parse(event.data);
  console.log('Received:', d);
  process.exit(0);
};

ws.onclose = () => {
  console.log('Disconnected');
};
