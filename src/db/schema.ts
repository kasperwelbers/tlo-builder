import { sqliteTable, text, integer, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

export const projects = sqliteTable("projects", {
  id:        text("id").primaryKey(),
  name:      text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})

export const trajectories = sqliteTable("trajectories", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  projectId:   text("project_id").references(() => projects.id).notNull(),
  name:        text("name").notNull(),
  description: text("description").notNull().default(""),
  color:       text("color").notNull().default(""),
}, (t) => [
  uniqueIndex("trajectories_project_name_idx").on(t.projectId, t.name),
])

export const courses = sqliteTable("courses", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  projectId:   text("project_id").references(() => projects.id).notNull(),
  name:        text("name").notNull(),
  description: text("description").notNull().default(""),
  color:       text("color").notNull().default(""),
}, (t) => [
  uniqueIndex("courses_project_name_idx").on(t.projectId, t.name),
])

export const tlos = sqliteTable("tlos", {
  id:           integer("id").primaryKey({ autoIncrement: true }),
  projectId:    text("project_id").references(() => projects.id).notNull(),
  trajectoryId: integer("trajectory_id").references(() => trajectories.id).notNull(),
  name:         text("name").notNull(),
  description:  text("description").notNull().default(""),
  bloomLevel:   text("bloom_level"),
})

export const ilos = sqliteTable("ilos", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  projectId:   text("project_id").references(() => projects.id).notNull(),
  tloId:       integer("tlo_id").references(() => tlos.id),
  description: text("description").notNull().default(""),
  bloomLevel:  text("bloom_level"),
})

export const courseObjectives = sqliteTable("course_objectives", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  projectId:   text("project_id").references(() => projects.id).notNull(),
  courseId:    integer("course_id").references(() => courses.id).notNull(),
  description: text("description").notNull().default(""),
})

export const iloCourseObjectiveMappings = sqliteTable("ilo_course_objective_mappings", {
  iloId:             integer("ilo_id").references(() => ilos.id).notNull(),
  courseId:          integer("course_id").references(() => courses.id).notNull(),
  courseObjectiveId: integer("course_objective_id").references(() => courseObjectives.id),
  projectId:         text("project_id").references(() => projects.id).notNull(),
}, (t) => [primaryKey({ columns: [t.iloId, t.courseId, t.courseObjectiveId] })])

export const projectRelations = relations(projects, ({ many }) => ({
  trajectories: many(trajectories), courses: many(courses),
  tlos: many(tlos), ilos: many(ilos), courseObjectives: many(courseObjectives),
}))
export const trajectoryRelations = relations(trajectories, ({ one, many }) => ({
  project: one(projects, { fields: [trajectories.projectId], references: [projects.id] }),
  tlos: many(tlos),
}))
export const courseRelations = relations(courses, ({ one, many }) => ({
  project: one(projects, { fields: [courses.projectId], references: [projects.id] }),
  courseObjectives: many(courseObjectives),
  iloMappings: many(iloCourseObjectiveMappings),
}))
export const tloRelations = relations(tlos, ({ one, many }) => ({
  project:     one(projects,     { fields: [tlos.projectId],    references: [projects.id] }),
  trajectory:  one(trajectories, { fields: [tlos.trajectoryId], references: [trajectories.id] }),
  ilos:        many(ilos),
}))
export const iloRelations = relations(ilos, ({ one, many }) => ({
  project: one(projects, { fields: [ilos.projectId], references: [projects.id] }),
  tlo:     one(tlos, { fields: [ilos.tloId], references: [tlos.id] }),
  courseObjectiveMappings: many(iloCourseObjectiveMappings),
}))
export const courseObjectiveRelations = relations(courseObjectives, ({ one, many }) => ({
  project: one(projects, { fields: [courseObjectives.projectId], references: [projects.id] }),
  course:  one(courses,  { fields: [courseObjectives.courseId],  references: [courses.id] }),
  iloMappings: many(iloCourseObjectiveMappings),
}))
export const iloCourseObjectiveMappingRelations = relations(iloCourseObjectiveMappings, ({ one }) => ({
  ilo:             one(ilos,             { fields: [iloCourseObjectiveMappings.iloId],             references: [ilos.id] }),
  course:          one(courses,          { fields: [iloCourseObjectiveMappings.courseId],          references: [courses.id] }),
  courseObjective: one(courseObjectives, { fields: [iloCourseObjectiveMappings.courseObjectiveId], references: [courseObjectives.id] }),
}))
