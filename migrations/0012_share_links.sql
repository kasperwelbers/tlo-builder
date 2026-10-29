ALTER TABLE projects ADD COLUMN share_token TEXT;
CREATE UNIQUE INDEX projects_share_token_idx ON projects(share_token);
ALTER TABLE ws_tickets ADD COLUMN project_id TEXT NOT NULL DEFAULT '';
ALTER TABLE ws_tickets ADD COLUMN mode TEXT NOT NULL DEFAULT 'edit';
