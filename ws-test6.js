const ws = new WebSocket('ws://localhost:8787/ws/test-project-6');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'import_data',
    trajectories: [{ id: "1", name: 'Methods', color: null }],
    courses: [{ id: "1", name: 'Stats 101', color: null }],
    ltos: [{ id: "1", trajectoryId: "1", name: 'Data', outcome: 'Student...', bloom: 'A2' }],
    ilos: [{ id: "1", courseId: "1", name: 'ANOVA', outcome: 'Student...', bloom: 'C3', isNew: "false", derivedFromId: null }],
    mappings: [{ ltoId: "1", iloId: "1" }]
  }));
};

let i = 0;
ws.onmessage = (event) => {
  i++;
  const d = JSON.parse(event.data);
  console.log(`Msg ${i}:`, 'T:', d.data.trajectories.length, 'C:', d.data.courses.length, 'LTOs:', d.data.trajectories[0]?.ltos?.length, 'ILOs:', d.data.courses[0]?.ilos?.length, 'Maps:', d.data.mappings.length);
  if (i === 2) process.exit(0);
};
