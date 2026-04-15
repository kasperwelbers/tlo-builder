const ws = new WebSocket('ws://localhost:8787/ws/test-project');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    type: 'import_data',
    trajectories: [{ id: 1, name: 'T1' }],
    courses: [{ id: 1, name: 'C1' }],
    ltos: [],
    ilos: [],
    mappings: []
  }));
};

ws.onmessage = (event) => {
  console.log('Received payload length:', event.data.length);
  process.exit(0);
};

ws.onclose = () => {
  console.log('Disconnected');
};
