const fs = require('fs');
let code = fs.readFileSync('apps/frontend/src/components/DataActions.tsx', 'utf-8');

code = code.replace(
  /interface DataActionsProps {[\s\S]*?}/m,
  `import type { TrajectoryWithLtos, CourseWithIlos, Mapping, Lto, Ilo } from "@lto/shared";\n\ninterface DataActionsProps {\n  data: {\n    trajectories: TrajectoryWithLtos[];\n    courses: CourseWithIlos[];\n    mappings: Mapping[];\n  };\n  onImport: (data: any) => void;\n}`
);

code = code.replace(/t: any/g, 't: TrajectoryWithLtos');
code = code.replace(/c: any/g, 'c: CourseWithIlos');
code = code.replace(/l: any/g, 'l: Lto');
code = code.replace(/i: any/g, 'i: Ilo');
code = code.replace(/arr: any\[\]/g, 'arr: any[]');
code = code.replace(/m: any/g, 'm: Mapping');
code = code.replace(/c: any/g, 'c: CourseWithIlos');
code = code.replace(/t: any/g, 't: TrajectoryWithLtos');

fs.writeFileSync('apps/frontend/src/components/DataActions.tsx', code);
