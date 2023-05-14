-- Deploy canals:locks to pg

BEGIN;

-- 🔑 Create lock key item
INSERT INTO items (item_key, name, type, description)
VALUES ('lock_key', 'Lock Key', 'key', 'Use to unlock locks');

-- 🔒 Locks
INSERT INTO markers (position, type, radius, props)
VALUES
  ('{"x": 775, "y": 0, "z": 445}', 'lock', 30, FORMAT('{ "name": "Foxton Locks", "price": 25, "lockType": "single", "usage_cooldown_seconds": 60, "state": { "openGate": "upper" }, "last_used": "%1$s" }', TO_CHAR(clock_timestamp() - INTERVAL '1 minute', 'YYYY-MM-DD HH24:MI:SS'))::JSONB),
  ('{"x": 762, "y": 0, "z": 105}', 'lock', 30, FORMAT('{ "name": "Caen Hill Locks", "price": 30, "lockType": "single", "usage_cooldown_seconds": 60, "state": { "openGate": "lower" }, "last_used": "%1$s" }', TO_CHAR(clock_timestamp() - INTERVAL '1 minute', 'YYYY-MM-DD HH24:MI:SS'))::JSONB)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION operate_lock(player_id INTEGER)
RETURNS markers AS $$
  #variable_conflict use_variable
DECLARE
  lock_row markers%ROWTYPE;
  marker_id_found INTEGER;
  is_usage_cooldown_active BOOLEAN := FALSE;
  key_duration TEXT := '2 hours';
  has_key BOOLEAN := FALSE;
  fee_payable FLOAT := 0;
  new_state JSONB = '{}';
BEGIN

  -- 📡 Get the closest lock marker
  SELECT gm.marker_id
  INTO marker_id_found
  FROM player_markers(player_id, 'lock', 100) gm
  ORDER BY gm.marker_distance ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lock not found';
  END IF;

  SELECT * INTO lock_row FROM markers WHERE id = marker_id_found AND type = 'lock';

  -- ⏳ Check transition cooldown timer
  IF (COALESCE((lock_row.props->>'last_used')::TIMESTAMPTZ, '-infinity') > clock_timestamp() - (lock_row.props->>'usage_cooldown_seconds')::INTERVAL) THEN
    RAISE EXCEPTION 'Lock usage is on cooldown';
  END IF;

  -- 🔑 Determine if key exists in player's inventory
  SELECT INTO has_key
  EXISTS (
    SELECT 1
    FROM player_items pi
    WHERE pi.player_id = player_id
    AND pi.item_id = (SELECT id FROM items WHERE item_key = 'lock_key' LIMIT 1)
    AND pi.created_at > clock_timestamp() - (pi.props->>'duration')::INTERVAL
    AND (pi.props->>'marker_id')::BIGINT = marker_id_found
  );

  fee_payable := CASE WHEN has_key THEN 0 ELSE (lock_row.props->>'price')::FLOAT END;

  -- 💸 Update player's balance
  UPDATE players p
  SET balance = balance - fee_payable
  WHERE p.id = player_id
    AND p.balance >= fee_payable;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance to pay lock fee';
  END IF;

  -- 🎒 If the player just purchased a lock key, add it to their inventory
  IF (fee_payable <> 0) THEN
    INSERT INTO player_items (player_id, item_id, props)
    SELECT
      player_id,
      items.id,
      jsonb_build_object(
        'duration', key_duration,
        'marker_id', marker_id_found
      )
    FROM items
    WHERE item_key = 'lock_key';
  END IF;

  -- 🚦 Update the lock state, depending on the lock type
  IF (lock_row.props->>'lockType' = 'single') THEN
    new_state := CASE
      WHEN (lock_row.props->'state'->>'openGate' = 'upper') THEN '{ "openGate": "lower" }'::JSONB
      WHEN (lock_row.props->'state'->>'openGate' = 'lower') THEN '{ "openGate": "upper" }'::JSONB
      ELSE lock_row.props->'state'
    END;
  ELSE
    RAISE EXCEPTION 'Unable to determine state of unknown lockType';
  END IF;

UPDATE markers
SET props = props ||
  jsonb_build_object(
    -- 🔄 Update usage cooldown
    'last_used', clock_timestamp(),
    'state', props->'state' || new_state
  )
WHERE id = marker_id_found;

  -- Return the updated lock marker
  SELECT * INTO lock_row FROM markers WHERE id = marker_id_found AND type = 'lock';

  RETURN lock_row;

END;
$$ LANGUAGE plpgsql;

COMMIT;
