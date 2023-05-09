-- Revert canals:base_schema from pg

BEGIN;

DROP FUNCTION IF EXISTS nearby_players(current_player_id INTEGER, distance FLOAT);

DROP TYPE IF EXISTS nearby_players;

DROP FUNCTION IF EXISTS sell_item(marker_id INTEGER, player_item_id INTEGER);

DROP FUNCTION IF EXISTS fish(player_id INTEGER);

DROP FUNCTION IF EXISTS purchase_item(player_id INTEGER, item_id INTEGER);

DROP FUNCTION IF EXISTS player_markers(player_id INTEGER, marker_type TEXT, marker_distance_limit INTEGER);

DROP VIEW IF EXISTS links_recursive;

DROP TRIGGER IF EXISTS player_changes_trigger ON players;

DROP FUNCTION IF EXISTS notify_player_changes();

DROP TRIGGER IF EXISTS marker_changes_trigger ON markers;

DROP FUNCTION IF EXISTS notify_marker_changes();

DROP TABLE IF EXISTS player_items CASCADE;

DROP TABLE IF EXISTS marker_items CASCADE;

DROP TABLE IF EXISTS items CASCADE;

DROP TABLE IF EXISTS links CASCADE;

DROP TABLE IF EXISTS markers CASCADE;

DROP TABLE IF EXISTS players CASCADE;

COMMIT;
