CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trajectories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL DEFAULT '',
	`color` text NOT NULL DEFAULT '',
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trajectories_project_name_idx` ON `trajectories` (`project_id`,`name`);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL DEFAULT '',
	`color` text NOT NULL DEFAULT '',
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_project_name_idx` ON `courses` (`project_id`,`name`);
--> statement-breakpoint
CREATE TABLE `tlos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`trajectory_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL DEFAULT '',
	`bloom_level` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`trajectory_id`) REFERENCES `trajectories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ilos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL DEFAULT '',
	`bloom_level` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `course_objectives` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`course_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL DEFAULT '',
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tlo_ilo_mappings` (
	`tlo_id` integer NOT NULL,
	`ilo_id` integer NOT NULL,
	`project_id` text NOT NULL,
	PRIMARY KEY(`tlo_id`, `ilo_id`),
	FOREIGN KEY (`tlo_id`) REFERENCES `tlos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ilo_id`) REFERENCES `ilos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ilo_course_objective_mappings` (
	`ilo_id` integer NOT NULL,
	`course_objective_id` integer NOT NULL,
	`project_id` text NOT NULL,
	PRIMARY KEY(`ilo_id`, `course_objective_id`),
	FOREIGN KEY (`ilo_id`) REFERENCES `ilos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_objective_id`) REFERENCES `course_objectives`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
