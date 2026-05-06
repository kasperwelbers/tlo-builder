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
  coordinator: text("coordinator"),
}, (t) => [
  uniqueIndex("trajectories_project_name_idx").on(t.projectId, t.name),
])

export const courses = sqliteTable("courses", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  projectId:   text("project_id").references(() => projects.id).notNull(),
  code:        text("code").notNull(),
  name:        text("name").notNull().default(""),
  color:       text("color").notNull().default(""),
  coordinator: text("coordinator"),
  start:       text("start"),
  end:         text("end"),
}, (t) => [
  uniqueIndex("courses_project_code_idx").on(t.projectId, t.code),
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
  description: text("description").notNull().default(""),
  bloomLevel:  text("bloom_level"),
})

export const clos = sqliteTable("clos", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  projectId:   text("project_id").references(() => projects.id).notNull(),
  courseId:    integer("course_id").references(() => courses.id).notNull(),
  description: text("description").notNull().default(""),
  bloomLevel:  text("bloom_level"),
})

export const tloIloMappings = sqliteTable("tlo_ilo_mappings", {
  tloId:     integer("tlo_id").references(() => tlos.id).notNull(),
  iloId:     integer("ilo_id").references(() => ilos.id).notNull(),
  projectId: text("project_id").references(() => projects.id).notNull(),
}, (t) => [primaryKey({ columns: [t.tloId, t.iloId] })])

export const iloCloMappings = sqliteTable("ilo_clo_mappings", {
  iloId:     integer("ilo_id").references(() => ilos.id).notNull(),
  courseId:  integer("course_id").references(() => courses.id).notNull(),
  cloId:     integer("clo_id").references(() => clos.id),   // nullable: null = course-level link
  projectId: text("project_id").references(() => projects.id).notNull(),
}, (t) => [primaryKey({ columns: [t.iloId, t.courseId] })])

export const projectRelations = relations(projects, ({ many }) => ({
  trajectories: many(trajectories), courses: many(courses),
  tlos: many(tlos), ilos: many(ilos), clos: many(clos),
}))
export const trajectoryRelations = relations(trajectories, ({ one, many }) => ({
  project: one(projects, { fields: [trajectories.projectId], references: [projects.id] }),
  tlos: many(tlos),
}))
export const courseRelations = relations(courses, ({ one, many }) => ({
  project: one(projects, { fields: [courses.projectId], references: [projects.id] }),
  clos: many(clos),
}))
export const tloRelations = relations(tlos, ({ one, many }) => ({
  project:     one(projects,     { fields: [tlos.projectId],    references: [projects.id] }),
  trajectory:  one(trajectories, { fields: [tlos.trajectoryId], references: [trajectories.id] }),
  iloMappings: many(tloIloMappings),
}))
export const iloRelations = relations(ilos, ({ one, many }) => ({
  project: one(projects, { fields: [ilos.projectId], references: [projects.id] }),
  tloMappings: many(tloIloMappings),
  cloMappings: many(iloCloMappings),
}))
export const cloRelations = relations(clos, ({ one, many }) => ({
  project: one(projects, { fields: [clos.projectId], references: [projects.id] }),
  course:  one(courses,  { fields: [clos.courseId],  references: [courses.id] }),
  iloMappings: many(iloCloMappings),
}))
export const tloIloMappingRelations = relations(tloIloMappings, ({ one }) => ({
  tlo: one(tlos, { fields: [tloIloMappings.tloId], references: [tlos.id] }),
  ilo: one(ilos, { fields: [tloIloMappings.iloId], references: [ilos.id] }),
}))
export const iloCloMappingRelations = relations(iloCloMappings, ({ one }) => ({
  ilo:    one(ilos,    { fields: [iloCloMappings.iloId],    references: [ilos.id] }),
  course: one(courses, { fields: [iloCloMappings.courseId], references: [courses.id] }),
  clo:    one(clos,    { fields: [iloCloMappings.cloId],    references: [clos.id] }),
}))
