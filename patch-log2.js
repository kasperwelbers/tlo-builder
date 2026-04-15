const fs = require('fs');
let code = fs.readFileSync('apps/backend/src/ws/handlers.ts', 'utf-8');

code = code.replace(
  /trajIdMap\.set\(String\(t\.id\), inserted\.id\);/g,
  'console.log("Mapped Traj ID:", t.id, "->", inserted.id, "Raw T:", t);\n      trajIdMap.set(String(t.id), inserted.id);'
);

code = code.replace(
  /courseIdMap\.set\(String\(c\.id\), inserted\.id\);/g,
  'console.log("Mapped Course ID:", c.id, "->", inserted.id, "Raw C:", c);\n      courseIdMap.set(String(c.id), inserted.id);'
);

fs.writeFileSync('apps/backend/src/ws/handlers.ts', code);
