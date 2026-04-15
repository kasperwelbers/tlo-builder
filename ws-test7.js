const ws = new WebSocket('ws://localhost:8787/ws/test-project-7');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'import_data',
    trajectories: [{ id: 1, name: 'Methods', color: null }],
    courses: [{ id: 1, name: 'Stats 101', color: null }],
    ltos: [{ id: 1, trajectoryId: 1, name: 'Data', outcome: 'Student...', bloom: 'A2' }],
    ilos: [{ id: 1, courseId: 1, name: 'ANOVA', outcome: 'Student...', bloom: 'C3', isNew: "false", derivedFromId: null }],
    mappings: [{ ltoId: 1, iloId: 1 }]
  }));
};

let i = 0;
ws.onmessage = (event) => {
  i++;
  const d = JSON.parse(event.data);
  if (i === 2) {
    // Send ONLY LTOs!
    console.log("Existing Trajectories:", d.data.trajectories.length);
    ws.send(JSON.stringify({
      type: 'import_data',
      trajectories: d.data.trajectories,
      courses: d.data.courses,
      ltos: [{ id: 2, trajectoryId: 1, name: 'New LTO', outcome: 'Out2', bloom: 'C4' }],
      ilos: d.data.courses.flatMap(c => c.ilos),
      mappings: d.data.mappings
    }));
  }
  if (i === 3) {
    const d3 = JSON.parse(event.data);
    console.log('After LTO import: T:', d3.data.trajectories.length, 'LTOs:', d3.data.trajectories[0]?.ltos?.length);
    process.exit(0);
  }
};
