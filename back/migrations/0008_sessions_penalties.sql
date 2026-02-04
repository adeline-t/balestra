ALTER TABLE evaluations ADD COLUMN session_type TEXT NOT NULL DEFAULT 'technique';
ALTER TABLE evaluations ADD COLUMN artistic_scores TEXT NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS uq_eval_combat_user_session
ON evaluations(combat_id, author_user_id, session_type);

CREATE TABLE IF NOT EXISTS combat_penalty_validations (
  combat_id INTEGER NOT NULL,
  session_type TEXT NOT NULL,
  penalty_id TEXT NOT NULL,
  is_validated INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (combat_id, session_type, penalty_id)
);
