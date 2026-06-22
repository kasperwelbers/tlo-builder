CREATE TABLE IF NOT EXISTS exit_qualifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT ''
);

ALTER TABLE tlos ADD COLUMN eq_id INTEGER REFERENCES exit_qualifications(id);
