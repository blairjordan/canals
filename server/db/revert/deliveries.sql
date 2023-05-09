-- Revert canals:deliveries from pg

BEGIN;

DROP FUNCTION IF EXISTS pickup_package(player_id INTEGER);

DROP FUNCTION IF EXISTS deliver_package(player_id INTEGER);

COMMIT;
