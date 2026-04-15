const fs = require('fs');
let code = fs.readFileSync('apps/backend/src/ws/handlers.ts', 'utf-8');

code = code.replace(/const newTrajId = trajIdMap\.get\(String\(l\.trajectoryId \|\| l\.trajectory_id\)\);/g, 'const newTrajId = trajIdMap.get(String(l.trajectoryId)) || trajIdMap.get(String(l.trajectory_id));');

code = code.replace(/const newCourseId = courseIdMap\.get\(String\(i\.courseId \|\| i\.course_id\)\);/g, 'const newCourseId = courseIdMap.get(String(i.courseId)) || courseIdMap.get(String(i.course_id));');

fs.writeFileSync('apps/backend/src/ws/handlers.ts', code);
