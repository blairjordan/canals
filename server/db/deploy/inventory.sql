-- Deploy canals:inventory to pg

BEGIN;

CREATE OR REPLACE FUNCTION equip_item(
  player_id INTEGER,
  player_item_id INTEGER
)
RETURNS players AS $$
  #variable_conflict use_variable
DECLARE
  player players := NULL; -- The player equipping the item
  equip_item_types TEXT[] := ARRAY['decor', 'plant', 'boat_hull', 'fishing_rod', 'boat_engine', 'boat_stern', 'boat_deck'];
  multi_item_types TEXT[] := ARRAY['decor', 'plant'];
BEGIN

-- TODO: player_id isn't really necessary - just keeping consistent with other fns before moving to x_player_id session

-- Update the "equipped" property of specified item to TRUE
UPDATE player_items pi
SET props = jsonb_set(COALESCE(pi.props, '{}'::jsonb), '{equipped}', 'true', true)
FROM items i
WHERE pi.player_id = player_id
  AND pi.id = player_item_id
  AND i.id = pi.item_id
  AND i.type = ANY (equip_item_types);

IF NOT FOUND THEN
  RAISE EXCEPTION 'Item cannot be equipped';
END IF;

-- Some item types only allow one item to be equipped at a time.
-- Unequip those items by setting "equipped" to FALSE
UPDATE player_items pi
SET props = jsonb_set(COALESCE(pi.props, '{}'::jsonb), '{equipped}', 'false', true)
FROM items i
WHERE pi.player_id = player_id
  AND pi.id <> player_item_id
  AND i.id = pi.item_id
  AND EXISTS (
    SELECT 1
    FROM player_items pi2
    INNER JOIN items i2 ON pi2.item_id = i2.id
    WHERE pi2.id = player_item_id
    AND i2.type = i.type
  )
  AND NOT (i.type = ANY (multi_item_types));

-- 🧑 Player to return
SELECT p.*
INTO player
FROM players p
WHERE p.id = player_id;

RETURN player;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION unequip_item(
  player_id INTEGER,
  player_item_id INTEGER
)
RETURNS players AS $$
  #variable_conflict use_variable
DECLARE
  player players := NULL; -- The player equipping the item
  required_item_types TEXT[] := ARRAY['boat_hull', 'fishing_rod', 'boat_engine', 'boat_stern', 'boat_deck'];
BEGIN

-- TODO: player_id isn't really necessary - just keeping consistent with other fns before moving to x_player_id session

-- Update the "equipped" property of specified item to FALSE
-- Do not update if a "required" item type - For required items, equip_item should be used to equip another item
UPDATE player_items pi
SET props = jsonb_set(COALESCE(pi.props, '{}'::jsonb), '{equipped}', 'false', true)
FROM items i
WHERE pi.player_id = player_id
  AND pi.id = player_item_id
  AND i.id = pi.item_id
  AND pi.props->>'equipped' = 'true'
  AND NOT (i.type = ANY (required_item_types));

IF NOT FOUND THEN
  RAISE EXCEPTION 'Item cannot be unequipped';
END IF;

-- 🧑 Player to return
SELECT p.*
INTO player
FROM players p
WHERE p.id = player_id;

RETURN player;

END;
$$ LANGUAGE plpgsql;

COMMIT;
