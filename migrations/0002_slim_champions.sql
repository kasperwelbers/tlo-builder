PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ilo_course_objective_mappings` (
	`ilo_id` integer NOT NULL,
	`course_id` integer NOT NULL,
	`course_objective_id` integer,
	`project_id` text NOT NULL,
	PRIMARY KEY(`ilo_id`, `course_id`, `course_objective_id`),
	FOREIGN KEY (`ilo_id`) REFERENCES `ilos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_objective_id`) REFERENCES `course_objectives`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_ilo_course_objective_mappings`("ilo_id", "course_id", "course_objective_id", "project_id") SELECT "ilo_id", "course_id", "course_objective_id", "project_id" FROM `ilo_course_objective_mappings`;--> statement-breakpoint
DROP TABLE `ilo_course_objective_mappings`;--> statement-breakpoint
ALTER TABLE `__new_ilo_course_objective_mappings` RENAME TO `ilo_course_objective_mappings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;