-- Verify canals:quests on pg

BEGIN;

SELECT EXISTS(SELECT FROM pg_tables WHERE tablename = 'quests');

SELECT EXISTS(SELECT FROM pg_tables WHERE tablename = 'player_quests');

ROLLBACK;
