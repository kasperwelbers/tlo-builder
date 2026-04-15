const fs = require('fs');
let code = fs.readFileSync('apps/backend/src/ws/handlers.ts', 'utf-8');

code = code.replace(/name: l\.name,/g, 'name: l.name || "",');
code = code.replace(/outcome: l\.outcome,/g, 'outcome: l.outcome || "",');

code = code.replace(/name: i\.name,/g, 'name: i.name || "",');
code = code.replace(/outcome: i\.outcome,/g, 'outcome: i.outcome || "",');

code = code.replace(/name: t\.name,/g, 'name: t.name || "Unnamed",');
code = code.replace(/name: c\.name,/g, 'name: c.name || "Unnamed",');

fs.writeFileSync('apps/backend/src/ws/handlers.ts', code);
