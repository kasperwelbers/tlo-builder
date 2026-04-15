const fs = require('fs');
let code = fs.readFileSync('apps/frontend/src/components/Courses/CourseColumn.tsx', 'utf-8');

code = code.replace(
  /interface CourseColumnProps {[\s\S]*?}/m,
  `import type { TrajectoryWithLtos, CourseWithIlos, Mapping, Lto, Ilo, Course } from "@lto/shared";\n\ninterface CourseColumnProps {\n  courses: CourseWithIlos[];\n  mappings: Mapping[];\n  trajectories: TrajectoryWithLtos[];\n  sendMutation: (type: string, payload: any) => void;\n  searchQuery: string;\n  onSearchChange: (val: string) => void;\n}`
);

code = code.replace(/course: any/g, 'course: CourseWithIlos');
code = code.replace(/ilo: any/g, 'ilo: Ilo');
code = code.replace(/dIlo: any/g, 'dIlo: Ilo');
code = code.replace(/i: any/g, 'i: Ilo');
code = code.replace(/m: any/g, 'm: Mapping');
code = code.replace(/l: any/g, 'l: Lto');
code = code.replace(/lto: any/g, 'lto: Lto');
code = code.replace(/t: any/g, 't: TrajectoryWithLtos');
code = code.replace(/sourceIlo: any/g, 'sourceIlo: Ilo');
code = code.replace(/<any>\(null\)/g, '<Ilo | null>(null)');

fs.writeFileSync('apps/frontend/src/components/Courses/CourseColumn.tsx', code);
