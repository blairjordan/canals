-- Deploy canals:quests to pg

BEGIN;


CREATE TABLE IF NOT EXISTS quests (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quest_stages (
  id BIGSERIAL PRIMARY KEY,
  quest_id BIGINT REFERENCES quests(id) NOT NULL,
  key TEXT NOT NULL,
  label TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  FOREIGN KEY (quest_id) REFERENCES quests(id)
);

CREATE TABLE IF NOT EXISTS player_quests (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT REFERENCES players(id) NOT NULL,
  quest_id BIGINT REFERENCES quests(id) NOT NULL,
  quest_state JSONB,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (quest_id) REFERENCES quests(id)
);

-- ⚔️ First quest
WITH quest_insert AS (
  INSERT INTO quests (key)
  VALUES ('law_of_attraction')
  RETURNING id
)
INSERT INTO quest_stages (quest_id, key, label, config)
SELECT
  quest_insert.id,
  'start',
  'Talk to Sawyer',
  '{
      "action": "start",
      "Label": "Talk to Sawyer",
      "availableSelector": {
        "table": "markers",
        "condition": "SELECT EXISTS (\nSELECT 1\nFROM player_quests pm\nWHERE key=''law_of_attraction''\nAND available=''true''\nAND \nSELECT 1\nFROM player_markers(''npc'', 1000) pm\nINNER JOIN markers m ON pm.marker_id = m.INDEX\nWHERE m.key = ''stuart''\n)"
      },
      "targetModifier": {
        "dialogue": [
          "Hello boy sonny Jim laddy boy. Heard of magnet fishin'' have ya?",
          "It''s your lucky day, I''ve got a spare magnet here. You can have it if you want."
        ]
      },
      "completedSelector": {
        "table": "player_markers",
        "condition": ""
      },
      "completedCondition": "SELECT EXISTS (\nSELECT 1\nFROM player_quests pm\nWHERE quest_key=''law_of_attraction''\nAND interacted=''true''\n)",
      "completedActions": [
        "INSERT INTO player_quests (quest_key, stage_key, started) VALUES (''law_of_attraction'', ''start'', true)"
      ]
    }'
FROM quest_insert;

COMMIT;
