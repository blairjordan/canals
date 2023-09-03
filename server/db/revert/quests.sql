-- Revert canals:quests from pg

BEGIN;

DROP TABLE IF EXISTS player_quests CASCADE;

DROP TABLE IF EXISTS quests CASCADE;

COMMIT;
