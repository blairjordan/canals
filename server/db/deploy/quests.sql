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
      "listeners": [],
      "condiditions": {
        "type": "marker",
        "condition": "SELECT EXISTS (\nSELECT 1\nFROM player_quests pm\nINNER JOIN quests q ON pm.quest_id = q.id\nAND q.key=''law_of_attraction''\nAND pm.quest_state->>''status'' = ''available'')"
      },
      "targetModifier": {
        "dialogue": [
          {
            "text": "Hello boy sonny Jim laddy boy. Heard of magnet fishin'' have ya?",
            "order": 0
          },
          {
            "text": "It''s your lucky day, I''ve got a spare magnet here. You can have it if you want.",
            "order": 1
          }
        ]
      },
      "completedSelector": {
        "type": "player_marker",
        "condition": ""
      },
      "completedCondition": "SELECT EXISTS (\nSELECT 1\nFROM player_quests pm\nWHERE quest_key=''law_of_attraction''\nAND interacted=''true''\n)",
      "completedActions": [
        "INSERT INTO player_quests (quest_key, stage_key, started) VALUES (''law_of_attraction'', ''start'', true)"
      ]
    }'
FROM quest_insert;

COMMIT;
