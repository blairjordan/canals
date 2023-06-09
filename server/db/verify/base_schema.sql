-- Verify canals:base_schema on pg

BEGIN;

SELECT EXISTS(SELECT 1 FROM pg_available_extensions WHERE name = 'postgis');

SELECT EXISTS(SELECT * FROM pg_type WHERE typname = 'nearby_players');

SELECT EXISTS(SELECT FROM pg_tables WHERE tablename = 'players');

SELECT EXISTS(SELECT FROM pg_tables WHERE tablename = 'markers');

SELECT EXISTS(SELECT FROM pg_tables WHERE tablename = 'links');

SELECT EXISTS(SELECT FROM pg_tables WHERE tablename = 'items');

SELECT EXISTS(SELECT FROM pg_tables WHERE tablename = 'marker_items');

SELECT EXISTS(SELECT FROM pg_tables WHERE tablename = 'player_items');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'notify_player_changes');

SELECT EXISTS(SELECT FROM pg_trigger WHERE tgname = 'player_changes_trigger');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'notify_player_item_changes');

SELECT EXISTS(SELECT FROM pg_trigger WHERE tgname = 'player_item_changes_trigger');

SELECT EXISTS(SELECT 1 FROM information_schema.views WHERE table_name = 'links_recursive');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'player_markers');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'purchase_item');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'fish');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'sell_item');

SELECT EXISTS(SELECT FROM pg_trigger WHERE tgname = 'marker_changes_trigger');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'notify_marker_changes');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'update_player_flag');

ROLLBACK;
