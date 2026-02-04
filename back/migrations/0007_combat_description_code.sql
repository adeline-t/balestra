ALTER TABLE combats ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE combats ADD COLUMN tech_code TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS uq_combats_tech_code ON combats(tech_code);
