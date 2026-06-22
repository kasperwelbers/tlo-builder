import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const trajectories = sqliteTable(
  "trajectories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("project_id")
      .references(() => projects.id)
      .notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    color: text("color").notNull().default(""),
    coordinator: text("coordinator"),
  },
  (t) => [uniqueIndex("trajectories_project_name_idx").on(t.projectId, t.name)]
)

export const courses = sqliteTable(
  "courses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("project_id")
      .references(() => projects.id)
      .notNull(),
    code: text("code").notNull(),
    name: text("name").notNull().default(""),
    color: text("color").notNull().default(""),
    coordinator: text("coordinator"),
    start: text("start"),
    end: text("end"),
    level: integer("level"),
    ec: integer("ec"),
    type: text("type").notNull().default(""),
    owner: text("owner"),
  },
  (t) => [uniqueIndex("courses_project_code_idx").on(t.projectId, t.code)]
)

export const tlos = sqliteTable("tlos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: text("project_id")
    .references(() => projects.id)
    .notNull(),
  trajectoryId: integer("trajectory_id")
    .references(() => trajectories.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  bloomLevel: text("bloom_level"),
  eqId: integer("eq_id"),
})

export const ilos = sqliteTable("ilos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: text("project_id")
    .references(() => projects.id)
    .notNull(),
  description: text("description").notNull().default(""),
  bloomLevel: text("bloom_level"),
})

export const currentIlos = sqliteTable("current_ilos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: text("project_id")
    .references(() => projects.id)
    .notNull(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  description: text("description").notNull().default(""),
  bloomLevel: text("bloom_level"),
})

export const tloIloMappings = sqliteTable(
  "tlo_ilo_mappings",
  {
    tloId: integer("tlo_id")
      .references(() => tlos.id)
      .notNull(),
    iloId: integer("ilo_id")
      .references(() => ilos.id)
      .notNull(),
    projectId: text("project_id")
      .references(() => projects.id)
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.tloId, t.iloId] })]
)

export const iloCurrentIloMappings = sqliteTable(
  "ilo_current_ilo_mappings",
  {
    iloId: integer("ilo_id")
      .references(() => ilos.id)
      .notNull(),
    courseId: integer("course_id")
      .references(() => courses.id)
      .notNull(),
    currentIloId: integer("current_ilo_id").references(() => currentIlos.id), // nullable: null = course-level link
    projectId: text("project_id")
      .references(() => projects.id)
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.iloId, t.courseId] })]
)

export const projectRelations = relations(projects, ({ many }) => ({
  trajectories: many(trajectories),
  courses: many(courses),
  tlos: many(tlos),
  ilos: many(ilos),
  currentIlos: many(currentIlos),
  comments: many(comments),
  exitQualifications: many(exitQualifications),
}))
export const trajectoryRelations = relations(trajectories, ({ one, many }) => ({
  project: one(projects, {
    fields: [trajectories.projectId],
    references: [projects.id],
  }),
  tlos: many(tlos),
}))
export const courseRelations = relations(courses, ({ one, many }) => ({
  project: one(projects, {
    fields: [courses.projectId],
    references: [projects.id],
  }),
  currentIlos: many(currentIlos),
}))
export const tloRelations = relations(tlos, ({ one, many }) => ({
  project: one(projects, {
    fields: [tlos.projectId],
    references: [projects.id],
  }),
  trajectory: one(trajectories, {
    fields: [tlos.trajectoryId],
    references: [trajectories.id],
  }),
  iloMappings: many(tloIloMappings),
  exitQualification: one(exitQualifications, {
    fields: [tlos.eqId],
    references: [exitQualifications.id],
  }),
}))
export const iloRelations = relations(ilos, ({ one, many }) => ({
  project: one(projects, {
    fields: [ilos.projectId],
    references: [projects.id],
  }),
  tloMappings: many(tloIloMappings),
  currentIloMappings: many(iloCurrentIloMappings),
}))
export const currentIloRelations = relations(currentIlos, ({ one, many }) => ({
  project: one(projects, {
    fields: [currentIlos.projectId],
    references: [projects.id],
  }),
  course: one(courses, {
    fields: [currentIlos.courseId],
    references: [courses.id],
  }),
  iloMappings: many(iloCurrentIloMappings),
}))
export const tloIloMappingRelations = relations(tloIloMappings, ({ one }) => ({
  tlo: one(tlos, { fields: [tloIloMappings.tloId], references: [tlos.id] }),
  ilo: one(ilos, { fields: [tloIloMappings.iloId], references: [ilos.id] }),
}))
export const iloCurrentIloMappingRelations = relations(
  iloCurrentIloMappings,
  ({ one }) => ({
    ilo: one(ilos, {
      fields: [iloCurrentIloMappings.iloId],
      references: [ilos.id],
    }),
    course: one(courses, {
      fields: [iloCurrentIloMappings.courseId],
      references: [courses.id],
    }),
    currentIlo: one(currentIlos, {
      fields: [iloCurrentIloMappings.currentIloId],
      references: [currentIlos.id],
    }),
  })
)

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const otpCodes = sqliteTable("otp_codes", {
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
})

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
})

export const wsTickets = sqliteTable("ws_tickets", {
  ticket: text("ticket").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: integer("expires_at").notNull(),
})

export const userRoles = sqliteTable(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    projectId: text("project_id").notNull().default(""),
  },
  (t) => [primaryKey({ columns: [t.userId, t.role, t.projectId] })]
)

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: text("project_id")
    .references(() => projects.id)
    .notNull(),
  userEmail: text("user_email").notNull(),
  context: text("context").notNull(), // 'trajectory' | 'course'
  contextId: integer("context_id").notNull(),
  comment: text("comment").notNull().default(""),
  deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at"),
  parentId: integer("parent_id"),
  status: text("status").notNull().default("open"),
  tloId: integer("tlo_id").references(() => tlos.id),
  iloId: integer("ilo_id").references(() => ilos.id),
})

export const commentRelations = relations(comments, ({ one }) => ({
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id],
  }),
  tlo: one(tlos, { fields: [comments.tloId], references: [tlos.id] }),
  ilo: one(ilos, { fields: [comments.iloId], references: [ilos.id] }),
}))

export const exitQualifications = sqliteTable("exit_qualifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: text("project_id")
    .references(() => projects.id)
    .notNull(),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
})

export const exitQualificationRelations = relations(
  exitQualifications,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [exitQualifications.projectId],
      references: [projects.id],
    }),
    tlos: many(tlos),
  })
)
