export interface Tlo { id: number; projectId: string; trajectoryId: number; name: string; description: string; bloomLevel: string | null }
export interface Ilo { id: number; projectId: string; tloId: number | null; description: string; bloomLevel: string | null }
export interface Clo { id: number; projectId: string; courseId: number; description: string; bloomLevel: string | null }
export interface IloCloMapping { iloId: number; courseId: number; cloId: number | null; projectId: string }
export interface Trajectory { id: number; projectId: string; name: string; description: string; color: string; coordinator: string | null }
export interface Course { id: number; projectId: string; code: string; name: string; color: string; coordinator: string | null; start: string | null; end: string | null }
export interface AppState { trajectories: Trajectory[]; tlos: Tlo[]; ilos: Ilo[]; clos: Clo[]; iloCloMappings: IloCloMapping[]; courses: Course[] }
