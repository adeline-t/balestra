ALTER TABLE combats ADD COLUMN competition_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_combats_competition_id ON combats(competition_id);
