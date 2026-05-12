CREATE TABLE user_roles (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL,
  project_id TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (user_id, role, project_id)
);
