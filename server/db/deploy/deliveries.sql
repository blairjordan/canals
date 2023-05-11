-- Deploy canals:deliveries to pg

BEGIN;

WITH marina AS (
  INSERT INTO markers (position, type, props, radius)
  VALUES (
    '{ "x": 650, "y": 0, "z": -58 }',
    'marina',
    '{ "name": "Brighton Marina" }',
    25
  )
  RETURNING id),
marina_items AS (
  INSERT INTO items (item_key, name, type, description, price)
  VALUES
  ('lures', 'lures', 'delivery', 'Box container lures', 500),
  ('propellers', 'propellers', 'delivery', 'Boat propellers', 1500)
  RETURNING id)
INSERT INTO marker_items
SELECT marina.id, marina_items.id
FROM marina CROSS JOIN marina_items;

WITH marina AS (
  INSERT INTO markers (position, type, props, radius)
  VALUES (
    '{ "x": 360, "y": 0, "z": 200 }',
    'marina',
    '{ "name": "Marina Hemingway" }',
    25
  )
  RETURNING id),
marina_items AS (
  INSERT INTO items (item_key, name, type, description, price)
  VALUES
  ('boating_magazines', 'Boating Magazines', 'delivery', 'Pack of Boating Magazines', 120)
  RETURNING id)
INSERT INTO marker_items
SELECT marina.id, marina_items.id
FROM marina CROSS JOIN marina_items;


WITH marina AS (
  INSERT INTO markers (position, type, props, radius)
  VALUES (
    '{ "x": -88, "y": 0, "z": 108 }',
    'marina',
    '{ "name": "Port Pendennis Marina" }',
    25
  )
  RETURNING id),
marina_items AS (
  INSERT INTO items (item_key, name, type, description, price)
  VALUES
  ('art_supplies', 'Art Supplies', 'delivery', 'Box of Art Supplies', 120)
  RETURNING id)
INSERT INTO marker_items
SELECT marina.id, marina_items.id
FROM marina CROSS JOIN marina_items;

CREATE OR REPLACE FUNCTION pickup_package(player_id INTEGER)
RETURNS players AS $$
  #variable_conflict use_variable
DECLARE
  updated_player players;
  delivery_item_id INTEGER;
  pickup_marker_id INTEGER;
  delivery_reward INTEGER;
  destination_marker_id INTEGER;
  player_delivery_count INTEGER;
BEGIN

  -- 📍 Find the nearest marina and calculate a delivery reward
  SELECT pm.marker_id, CEIL(marker_distance / 2)
  INTO pickup_marker_id, delivery_reward
  FROM player_markers(1, 'marina', 75) pm;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unable to find marina marker';
  END IF;

  SELECT COUNT(*)
  FROM player_items pi
  INNER JOIN items i ON pi.item_id = i.id
  WHERE i.type = 'delivery' AND pi.player_id = player_id
  INTO player_delivery_count;

  IF player_delivery_count <> 0 THEN
    RAISE EXCEPTION 'Player has active delivery';
  END IF;

  -- 🎲 Select a random package from the chosen marina
  SELECT mi.item_id
  FROM marker_items mi
  WHERE mi.marker_id = pickup_marker_id
  ORDER BY RANDOM()
  LIMIT 1
  INTO delivery_item_id;

  -- 🎯 Select a random destination for the package
  SELECT pm.marker_id
  INTO destination_marker_id
  FROM player_markers(1, 'marina', 'infinity') pm
  WHERE pm.marker_id <> pickup_marker_id
  ORDER BY RANDOM()
  LIMIT 1;

  -- 🎒 Insert the package into the player's inventory
  INSERT INTO player_items (player_id, item_id, props)
  VALUES (
    player_id,
    delivery_item_id,
    json_build_object(
      'pickup_marker_id', pickup_marker_id,
      'destination_marker_id', destination_marker_id,
      'delivery_reward', delivery_reward
    ));

  SELECT * INTO updated_player FROM players WHERE id = player_id;

  RETURN updated_player;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deliver_package(player_id INTEGER)
RETURNS players AS $$
  #variable_conflict use_variable
DECLARE
  updated_player players;
  nearest_marker_id INTEGER;
  delivery_reward INTEGER;
BEGIN

  SELECT pm.marker_id
  INTO nearest_marker_id
  FROM player_markers(1, 'marina', 75) pm
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unable to find marina marker';
  END IF;

  SELECT (pi.props ->> 'delivery_reward')::NUMERIC
  INTO delivery_reward
  FROM player_items pi
  INNER JOIN items i on pi.item_id = i.id
  WHERE pi.player_id = player_id
  AND i.type = 'delivery'
  AND (pi.props ->> 'destination_marker_id')::NUMERIC = nearest_marker_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unable to deliver package';
  END IF;

  -- 🗑 Remove the packages from player inventory
  DELETE FROM player_items pi
  USING items i
  WHERE pi.item_id = i.id
  AND pi.player_id = player_id
  AND i.type = 'delivery';

  -- 💰 Delivery reward
  UPDATE players p
  SET balance = p.balance + delivery_reward
  WHERE p.id = player_id;

  SELECT * INTO updated_player FROM players WHERE id = player_id;

  RETURN updated_player;

END;
$$ LANGUAGE plpgsql;

COMMIT;
