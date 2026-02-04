CREATE TABLE IF NOT EXISTS combats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  owner_user_id INTEGER
);

CREATE TABLE IF NOT EXISTS combat_shares (
  combat_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (combat_id, user_id)
);

ALTER TABLE evaluations ADD COLUMN combat_id INTEGER;
ALTER TABLE evaluations ADD COLUMN author_user_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_combats_owner ON combats(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_combat_shares_user ON combat_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_eval_combat_user ON evaluations(combat_id, author_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_eval_combat_user ON evaluations(combat_id, author_user_id);
