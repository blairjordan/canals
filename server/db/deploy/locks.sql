-- Deploy canals:locks to pg

BEGIN;

-- 🔒 Locks
INSERT INTO markers (position, type, radius, props)
VALUES
  ('{"x": 775, "y": 0, "z": 445}', 'lock', 30, FORMAT('{ "name": "Foxton Locks", "price": 25, "lockType": "single", "transition_cooldown_seconds": 10, "usage_cooldown_seconds": 60, "player_id": 0, "state": { "openGate": "upper" }, "last_transition": "%1$s", "last_used": "%1$s" }', TO_CHAR(clock_timestamp() - INTERVAL '1 minute', 'YYYY-MM-DD HH24:MI:SS'))::JSONB),
  ('{"x": 762, "y": 0, "z": 105}', 'lock', 30, FORMAT('{ "name": "Caen Hill Locks", "price": 30, "lockType": "single", "transition_cooldown_seconds": 10, "usage_cooldown_seconds": 60, "player_id": 0, "state": { "openGate": "lower" }, "last_transition": "%1$s", "last_used": "%1$s" }', TO_CHAR(clock_timestamp() - INTERVAL '1 minute', 'YYYY-MM-DD HH24:MI:SS'))::JSONB)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION operate_lock(player_id INTEGER)
RETURNS markers AS $$
DECLARE
  lock_row markers%ROWTYPE;
  marker_id_found INTEGER;
  is_usage_cooldown_active BOOLEAN := FALSE;
  is_same_player BOOLEAN := FALSE;
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

  is_same_player := (lock_row.props->>'player_id')::INTEGER = player_id;

  IF (COALESCE((lock_row.props->>'last_used')::TIMESTAMPTZ, '-infinity') > clock_timestamp() - (lock_row.props->>'usage_cooldown_seconds')::INTERVAL) THEN
    is_usage_cooldown_active := true;
  END IF;

  -- ⏳ Check usage timer
  IF (is_usage_cooldown_active AND NOT is_same_player) THEN
    RAISE EXCEPTION 'Lock is currently being used by another player';
  END IF;

  -- ⏳ Check transition cooldown timer
  IF (COALESCE((lock_row.props->>'last_transition')::TIMESTAMPTZ, '-infinity') > clock_timestamp() - (lock_row.props->>'transition_cooldown_seconds')::INTERVAL) THEN
    RAISE EXCEPTION 'Lock transition is on cooldown';
  END IF;

  fee_payable := CASE WHEN is_usage_cooldown_active AND is_same_player THEN 0 ELSE (lock_row.props->>'price')::FLOAT END;

  RAISE NOTICE 'is_same_player %', is_same_player::TEXT;
  RAISE NOTICE 'is_usage_cooldown_active %', is_usage_cooldown_active::TEXT;
  RAISE NOTICE 'Fee is %', fee_payable::TEXT;

  -- Update player's balance
  UPDATE players p
  SET balance = balance - fee_payable
  WHERE p.id = player_id
    AND p.balance >= fee_payable;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance to pay lock fee';
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
    -- 🔄 Update global cooldown
    'last_transition', clock_timestamp(),
    -- 🔄 Update player cooldown
    'last_used',
        CASE
          WHEN fee_payable <> 0 THEN clock_timestamp()
          ELSE (lock_row.props->>'last_used')::TIMESTAMPTZ
        END,
    'state', props->'state' || new_state,
    'player_id', player_id
  )
WHERE id = marker_id_found;

  -- Return the updated lock marker
  SELECT * INTO lock_row FROM markers WHERE id = marker_id_found AND type = 'lock';

  RETURN lock_row;

END;
$$ LANGUAGE plpgsql;

COMMIT;
