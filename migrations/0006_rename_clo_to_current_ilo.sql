ALTER TABLE ilo_clo_mappings RENAME COLUMN clo_id TO current_ilo_id;
ALTER TABLE ilo_clo_mappings RENAME TO ilo_current_ilo_mappings;
ALTER TABLE clos RENAME TO current_ilos;
