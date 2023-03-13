-- Revert canals:base_schema from pg

BEGIN;

DROP EXTENSION IF EXISTS postgis;

DROP FUNCTION IF EXISTS nearby_players(current_player_id INTEGER, distance FLOAT);

DROP TYPE IF EXISTS nearby_players;

DROP FUNCTION IF EXISTS sell_item(marker_id INTEGER, player_item_id INTEGER);

DROP FUNCTION IF EXISTS fish(player_id INTEGER);

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
