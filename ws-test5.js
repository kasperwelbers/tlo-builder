const ws = new WebSocket('ws://localhost:8787/ws/test-project-6');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'import_data',
    trajectories: [{ id: 1, name: 'T1' }],
    courses: [{ id: 1, name: 'C1' }],
    ltos: [{ id: 1, trajectoryId: 1, name: 'L1', outcome: 'Out1' }],
    ilos: [{ id: 1, courseId: 1, name: 'I1', outcome: 'Out1' }],
    mappings: [{ ltoId: 1, iloId: 1 }]
  }));
};

let i = 0;
ws.onmessage = (event) => {
  i++;
  const d = JSON.parse(event.data);
  console.log(`Msg ${i}:`, 'T:', d.data.trajectories.length, 'C:', d.data.courses.length, 'LTOs:', d.data.trajectories[0]?.ltos?.length, 'ILOs:', d.data.courses[0]?.ilos?.length, 'Maps:', d.data.mappings.length);
  if (i === 2) process.exit(0);
};
