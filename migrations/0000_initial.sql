CREATE TABLE `projects` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `created_at` integer NOT NULL
);
CREATE TABLE `trajectories` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` text NOT NULL REFERENCES `projects`(`id`),
  `name` text NOT NULL,
  `description` text NOT NULL DEFAULT '',
  `color` text NOT NULL DEFAULT '',
  `coordinator` text
);
CREATE UNIQUE INDEX `trajectories_project_name_idx` ON `trajectories` (`project_id`, `name`);
CREATE TABLE `courses` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` text NOT NULL REFERENCES `projects`(`id`),
  `name` text NOT NULL,
  `description` text NOT NULL DEFAULT '',
  `color` text NOT NULL DEFAULT '',
  `coordinator` text,
  `start` text,
  `end` text
);
CREATE UNIQUE INDEX `courses_project_name_idx` ON `courses` (`project_id`, `name`);
CREATE TABLE `tlos` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` text NOT NULL REFERENCES `projects`(`id`),
  `trajectory_id` integer NOT NULL REFERENCES `trajectories`(`id`),
  `name` text NOT NULL,
  `description` text NOT NULL DEFAULT '',
  `bloom_level` text
);
CREATE TABLE `ilos` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` text NOT NULL REFERENCES `projects`(`id`),
  `description` text NOT NULL DEFAULT '',
  `bloom_level` text
);
CREATE TABLE `clos` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` text NOT NULL REFERENCES `projects`(`id`),
  `course_id` integer NOT NULL REFERENCES `courses`(`id`),
  `description` text NOT NULL DEFAULT '',
  `bloom_level` text
);
CREATE TABLE `tlo_ilo_mappings` (
  `tlo_id` integer NOT NULL REFERENCES `tlos`(`id`),
  `ilo_id` integer NOT NULL REFERENCES `ilos`(`id`),
  `project_id` text NOT NULL REFERENCES `projects`(`id`),
  PRIMARY KEY (`tlo_id`, `ilo_id`)
);
CREATE TABLE `ilo_clo_mappings` (
  `ilo_id` integer NOT NULL REFERENCES `ilos`(`id`),
  `course_id` integer NOT NULL REFERENCES `courses`(`id`),
  `clo_id` integer REFERENCES `clos`(`id`),
  `project_id` text NOT NULL REFERENCES `projects`(`id`),
  PRIMARY KEY (`ilo_id`, `course_id`)
);
