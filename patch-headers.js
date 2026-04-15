const fs = require('fs');
let code = fs.readFileSync('apps/backend/src/ws/handlers.ts', 'utf-8');

code = code.replace(/trajIdMap\.get\(String\(l\.trajectoryId\)\)/g, 'trajIdMap.get(String(l.trajectoryId || l.trajectory_id))');
code = code.replace(/courseIdMap\.get\(String\(i\.courseId\)\)/g, 'courseIdMap.get(String(i.courseId || i.course_id))');
code = code.replace(/iloIdMap\.get\(String\(i\.derivedFromId\)\)/g, 'iloIdMap.get(String(i.derivedFromId || i.derived_from_id))');
code = code.replace(/ltoIdMap\.get\(String\(m\.ltoId\)\)/g, 'ltoIdMap.get(String(m.ltoId || m.lto_id))');
code = code.replace(/iloIdMap\.get\(String\(m\.iloId \|\| m\.itoId\)\)/g, 'iloIdMap.get(String(m.iloId || m.itoId || m.ilo_id || m.ito_id))');

fs.writeFileSync('apps/backend/src/ws/handlers.ts', code);
