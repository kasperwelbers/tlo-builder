export interface Tlo {
  id: number
  projectId: string
  trajectoryId: number
  name: string
  description: string
  bloomLevel: string | null
  eqId: number | null
}
export interface Ilo {
  id: number
  projectId: string
  tloId: number | null
  description: string
  bloomLevel: string | null
}
export interface CurrentIlo {
  id: number
  projectId: string
  courseId: number
  description: string
  bloomLevel: string | null
}
export interface IloCurrentIloMapping {
  iloId: number
  courseId: number
  currentIloId: number | null
  projectId: string
}
export interface Trajectory {
  id: number
  projectId: string
  name: string
  description: string
  color: string
  coordinator: string | null
}
export interface ExitQualification {
  id: number
  projectId: string
  name: string
  description: string
}
export interface Comment {
  id: number
  projectId: string
  userEmail: string
  context: string // 'trajectory' | 'course'
  contextId: number
  comment: string
  deleted: boolean
  createdAt: number // unix ms
  updatedAt: number | null
  parentId: number | null
  status: "open" | "done"
  tloId: number | null
  iloId: number | null
}
export interface Course {
  id: number
  projectId: string
  code: string
  name: string
  color: string
  coordinator: string | null
  start: string | null
  end: string | null
  type: string
  owner: string | null
}
export interface AppState {
  trajectories: Trajectory[]
  tlos: Tlo[]
  ilos: Ilo[]
  currentIlos: CurrentIlo[]
  iloCurrentIloMappings: IloCurrentIloMapping[]
  courses: Course[]
  comments: Comment[]
  exitQualifications: ExitQualification[]
}
