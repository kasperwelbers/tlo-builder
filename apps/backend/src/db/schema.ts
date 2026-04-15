import { sqliteTable, text, integer, primaryKey, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const trajectories = sqliteTable('trajectories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: text('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),
  color: text('color'),
});

export const ltos = sqliteTable('ltos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trajectoryId: integer('trajectory_id').references(() => trajectories.id).notNull(),
  name: text('name').notNull(),
  outcome: text('outcome').notNull(),
  bloom: text('bloom'),
});

export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: text('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),
  color: text('color'),
});

export const ilos = sqliteTable('ilos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  name: text('name').notNull(),
  outcome: text('outcome').notNull(),
  bloom: text('bloom'),
  isNew: integer('is_new', { mode: 'boolean' }).notNull().default(false),
  derivedFromId: integer('derived_from_id').references((): AnySQLiteColumn => ilos.id),
});

export const mappings = sqliteTable('mappings', {
  ltoId: integer('lto_id').references(() => ltos.id).notNull(),
  iloId: integer('ilo_id').references(() => ilos.id).notNull(),
}, (t) => [
  primaryKey({ columns: [t.ltoId, t.iloId] })
]);

export const projectRelations = relations(projects, ({ many }) => ({
  trajectories: many(trajectories),
  courses: many(courses),
}));

export const trajectoryRelations = relations(trajectories, ({ one, many }) => ({
  project: one(projects, {
    fields: [trajectories.projectId],
    references: [projects.id],
  }),
  ltos: many(ltos),
}));

export const ltoRelations = relations(ltos, ({ one, many }) => ({
  trajectory: one(trajectories, {
    fields: [ltos.trajectoryId],
    references: [trajectories.id],
  }),
  mappings: many(mappings),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
  project: one(projects, {
    fields: [courses.projectId],
    references: [projects.id],
  }),
  ilos: many(ilos),
}));

export const iloRelations = relations(ilos, ({ one, many }) => ({
  course: one(courses, {
    fields: [ilos.courseId],
    references: [courses.id],
  }),
  derivedFrom: one(ilos, {
    fields: [ilos.derivedFromId],
    references: [ilos.id],
    relationName: 'derivedFrom',
  }),
  derivedIlos: many(ilos, {
    relationName: 'derivedFrom',
  }),
  mappings: many(mappings),
}));

export const mappingRelations = relations(mappings, ({ one }) => ({
  lto: one(ltos, {
    fields: [mappings.ltoId],
    references: [ltos.id],
  }),
  ilo: one(ilos, {
    fields: [mappings.iloId],
    references: [ilos.id],
  }),
}));
