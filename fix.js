const fs = require('fs');
let code = fs.readFileSync('apps/frontend/src/components/Courses/CourseColumn.tsx', 'utf-8');

code = code.replace(
  /<Card key=\{course\.id\}\n\s+style=\{\{ backgroundColor: course\.color \|\| getColorForString\(course\.name\) \}\}\n\s+className="bg-white border-slate-200 shadow-sm overflow-hidden">/,
  '<Card key={course.id} className="bg-white border-slate-200 shadow-sm">'
);

code = code.replace(
  /<CardHeader\n\s+className=""\n\s+>/,
  '<CardHeader\n              className="pb-3 border-b border-slate-100"\n              style={{ backgroundColor: course.color || getColorForString(course.name) }}\n            >'
);

code = code.replace(
  /<CardContent className="p-3 rounded-md">\n\s+<div className="">/,
  '<CardContent className="p-0">\n              <div className="divide-y divide-slate-100">'
);

fs.writeFileSync('apps/frontend/src/components/Courses/CourseColumn.tsx', code);
