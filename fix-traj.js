const fs = require('fs');
let code = fs.readFileSync('apps/frontend/src/components/Trajectories/TrajectoryColumn.tsx', 'utf-8');

code = code.replace(
  /interface TrajectoryColumnProps {[\s\S]*?}/m,
  `import type { TrajectoryWithLtos, CourseWithIlos, Mapping, Lto, Ilo, Trajectory } from "@lto/shared";\n\ninterface TrajectoryColumnProps {\n  trajectories: TrajectoryWithLtos[];\n  courses: CourseWithIlos[];\n  mappings: Mapping[];\n  sendMutation: (type: string, payload: any) => void;\n  onIloClick?: (ilo: Ilo) => void;\n}`
);

code = code.replace(/traj: any/g, 'traj: TrajectoryWithLtos');
code = code.replace(/lto: any/g, 'lto: Lto');
code = code.replace(/m: any/g, 'm: Mapping');
code = code.replace(/c: any/g, 'c: CourseWithIlos');
code = code.replace(/i: any/g, 'i: Ilo');
code = code.replace(/ilo: any/g, 'ilo: Ilo');

fs.writeFileSync('apps/frontend/src/components/Trajectories/TrajectoryColumn.tsx', code);
