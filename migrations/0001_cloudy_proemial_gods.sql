DROP TABLE `tlo_ilo_mappings`;--> statement-breakpoint
ALTER TABLE `ilos` ADD `tlo_id` integer REFERENCES tlos(id);