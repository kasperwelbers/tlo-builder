export interface Project {
  id: string;
  name: string;
  createdAt: Date;
}

export interface InsertProject {
  id: string;
  name: string;
  createdAt?: Date;
}

export interface Trajectory {
  id: number;
  projectId: string;
  name: string;
  color: string | null;
}

export interface InsertTrajectory {
  id?: number;
  projectId: string;
  name: string;
  color?: string | null;
}

export interface Lto {
  id: number;
  trajectoryId: number;
  name: string;
  outcome: string;
  bloom: string | null;
}

export interface InsertLto {
  id?: number;
  trajectoryId: number;
  name: string;
  outcome: string;
  bloom?: string | null;
}

export interface Course {
  id: number;
  projectId: string;
  name: string;
  color: string | null;
}

export interface InsertCourse {
  id?: number;
  projectId: string;
  name: string;
  color?: string | null;
}

export interface Ilo {
  id: number;
  courseId: number;
  name: string;
  outcome: string;
  bloom: string | null;
  isNew: boolean;
  derivedFromId: number | null;
}

export interface InsertIlo {
  id?: number;
  courseId: number;
  name: string;
  outcome: string;
  bloom?: string | null;
  isNew?: boolean;
  derivedFromId?: number | null;
}

export interface Mapping {
  ltoId: number;
  iloId: number;
}

export interface InsertMapping {
  ltoId: number;
  iloId: number;
}

export interface TrajectoryWithLtos extends Trajectory {
  ltos: Lto[];
}

export interface CourseWithIlos extends Course {
  ilos: Ilo[];
}
