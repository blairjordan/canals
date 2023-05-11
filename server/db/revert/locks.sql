-- Revert canals:locks from pg

BEGIN;

DELETE FROM markers WHERE type = 'lock';

DROP FUNCTION IF EXISTS operate_lock(player_id INTEGER);

COMMIT;
