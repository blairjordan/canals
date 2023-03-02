-- Revert canals:base_schema from pg

BEGIN;

DROP FUNCTION IF EXISTS purchase_item(player_id INTEGER, item_id INTEGER);

DROP VIEW IF EXISTS links_recursive;

DROP TRIGGER IF EXISTS player_changes_trigger ON players;

DROP FUNCTION IF EXISTS notify_player_changes();

DROP TABLE IF EXISTS player_items;

DROP TABLE IF EXISTS marker_items;

DROP TABLE IF EXISTS items;

DROP TABLE IF EXISTS links;

DROP TABLE IF EXISTS markers;

DROP TABLE IF EXISTS players;

COMMIT;
