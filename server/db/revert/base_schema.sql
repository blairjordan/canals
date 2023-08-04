-- Revert canals:base_schema from pg

BEGIN;

DROP FUNCTION IF EXISTS update_player_flag(player_id INTEGER, flag_url TEXT);

DROP FUNCTION IF EXISTS nearby_players(distance FLOAT);

DROP TYPE IF EXISTS nearby_players;

DROP FUNCTION IF EXISTS sell_item(marker_id INTEGER, player_item_id INTEGER);

DROP FUNCTION IF EXISTS fish();

DROP FUNCTION IF EXISTS purchase_item(item_id INTEGER);

DROP FUNCTION IF EXISTS player_markers(marker_type TEXT, marker_distance_limit FLOAT);

DROP TRIGGER IF EXISTS player_changes_trigger ON players;

DROP FUNCTION IF EXISTS notify_player_changes();

DROP TRIGGER IF EXISTS player_item_changes_trigger ON player_items;

DROP FUNCTION IF EXISTS notify_player_item_changes();

DROP TRIGGER IF EXISTS marker_changes_trigger ON markers;

DROP FUNCTION IF EXISTS notify_marker_changes();

DROP FUNCTION IF EXISTS current_player();

DROP FUNCTION IF EXISTS current_player_id();

DROP TABLE IF EXISTS player_items CASCADE;

DROP TABLE IF EXISTS marker_items CASCADE;

DROP TABLE IF EXISTS items CASCADE;

DROP TABLE IF EXISTS links CASCADE;

DROP TABLE IF EXISTS markers CASCADE;

DROP TABLE IF EXISTS area_markers CASCADE;

DROP TABLE IF EXISTS areas CASCADE;

DROP TABLE IF EXISTS players CASCADE;

-- Drop db roles 🎭
DO
$do$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated_user') THEN
    DROP ROLE authenticated_user;
  END IF;

  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anonymous') THEN
    DROP ROLE anonymous;
  END IF;
END
$do$;

COMMIT;
