const fs = require('fs');
let code = fs.readFileSync('apps/backend/src/ws/handlers.ts', 'utf-8');

code = code.replace(
  /if \(\!newTrajId\) continue;/g,
  'if (!newTrajId) { console.log("Missing newTrajId for LTO:", l); continue; }'
);
code = code.replace(
  /if \(\!newCourseId\) continue;/g,
  'if (!newCourseId) { console.log("Missing newCourseId for ILO:", i); continue; }'
);

fs.writeFileSync('apps/backend/src/ws/handlers.ts', code);
