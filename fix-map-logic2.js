const fs = require('fs');
let code = fs.readFileSync('apps/backend/src/ws/handlers.ts', 'utf-8');

code = code.replace(/let derivedFromId = i\.derivedFromId \? \(iloIdMap\.get\(String\(i\.derivedFromId \|\| i\.derived_from_id\)\) \|\| null\) : null;/g, 'let derivedFromId = (i.derivedFromId || i.derived_from_id) ? (iloIdMap.get(String(i.derivedFromId || i.derived_from_id)) || null) : null;');

code = code.replace(/ltoId: ltoIdMap\.get\(String\(m\.ltoId \|\| m\.lto_id\)\),/g, 'ltoId: ltoIdMap.get(String(m.ltoId)) || ltoIdMap.get(String(m.lto_id)),');

code = code.replace(/iloId: iloIdMap\.get\(String\(m\.iloId \|\| m\.itoId \|\| m\.ilo_id \|\| m\.ito_id\)\)/g, 'iloId: iloIdMap.get(String(m.iloId)) || iloIdMap.get(String(m.itoId)) || iloIdMap.get(String(m.ilo_id)) || iloIdMap.get(String(m.ito_id))');

fs.writeFileSync('apps/backend/src/ws/handlers.ts', code);
