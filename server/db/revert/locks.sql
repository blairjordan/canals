-- Revert canals:locks from pg

BEGIN;

DELETE FROM markers WHERE type = 'lock';

DROP FUNCTION IF EXISTS use_lock(player_id INTEGER, marker_id INTEGER, state JSONB);

COMMIT;
