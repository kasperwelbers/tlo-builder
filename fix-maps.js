const fs = require('fs');
let code = fs.readFileSync('apps/backend/src/ws/handlers.ts', 'utf-8');

code = code.replace(/trajIdMap = new Map<number, number>\(\)/g, 'trajIdMap = new Map<string, number>()');
code = code.replace(/courseIdMap = new Map<number, number>\(\)/g, 'courseIdMap = new Map<string, number>()');
code = code.replace(/ltoIdMap = new Map<number, number>\(\)/g, 'ltoIdMap = new Map<string, number>()');
code = code.replace(/iloIdMap = new Map<number, number>\(\)/g, 'iloIdMap = new Map<string, number>()');

code = code.replace(/trajIdMap\.set\(t\.id/g, 'trajIdMap.set(String(t.id)');
code = code.replace(/courseIdMap\.set\(c\.id/g, 'courseIdMap.set(String(c.id)');
code = code.replace(/ltoIdMap\.set\(l\.id/g, 'ltoIdMap.set(String(l.id)');
code = code.replace(/iloIdMap\.set\(i\.id/g, 'iloIdMap.set(String(i.id)');

code = code.replace(/trajIdMap\.get\(l\.trajectoryId\)/g, 'trajIdMap.get(String(l.trajectoryId))');
code = code.replace(/courseIdMap\.get\(i\.courseId\)/g, 'courseIdMap.get(String(i.courseId))');
code = code.replace(/iloIdMap\.get\(i\.derivedFromId\)/g, 'iloIdMap.get(String(i.derivedFromId))');
code = code.replace(/ltoIdMap\.get\(m\.ltoId\)/g, 'ltoIdMap.get(String(m.ltoId))');
code = code.replace(/iloIdMap\.get\(m\.iloId \|\| m\.itoId\)/g, 'iloIdMap.get(String(m.iloId || m.itoId))');

fs.writeFileSync('apps/backend/src/ws/handlers.ts', code);
