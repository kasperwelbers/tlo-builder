ALTER TABLE `courses` RENAME COLUMN `name` TO `code`;
--> statement-breakpoint
ALTER TABLE `courses` RENAME COLUMN `description` TO `name`;
--> statement-breakpoint
DROP INDEX IF EXISTS `courses_project_name_idx`;
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_project_code_idx` ON `courses` (`project_id`,`code`);
