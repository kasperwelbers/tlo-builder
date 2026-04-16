export interface Tlo {
  id: number
  projectId: string
  trajectoryId: number
  name: string
  description: string
  bloomLevel: string | null
}

export interface Ilo {
  id: number
  projectId: string
  name: string
  description: string
  bloomLevel: string | null
}

export interface CourseObjective {
  id: number
  projectId: string
  courseId: number
  name: string
  description: string
}

export interface TloIloMapping {
  tloId: number
  iloId: number
  projectId: string
}

export interface IloCourseObjectiveMapping {
  iloId: number
  courseObjectiveId: number
  projectId: string
}

export interface Trajectory {
  id: number
  projectId: string
  name: string
  description: string
  color: string
}

export interface Course {
  id: number
  projectId: string
  name: string
  description: string
  color: string
}

export interface AppState {
  trajectories: Trajectory[]
  tlos: Tlo[]
  ilos: Ilo[]
  courseObjectives: CourseObjective[]
  tloIloMappings: TloIloMapping[]
  iloCourseObjectiveMappings: IloCourseObjectiveMapping[]
  courses: Course[]
}
