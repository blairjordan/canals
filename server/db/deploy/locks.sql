-- Deploy canals:locks to pg

BEGIN;

-- 🔒 Locks
INSERT INTO markers (position, type, radius, props)
VALUES
  ('{"x": 775, "y": 0, "z": 445}', 'lock', 30, FORMAT('{ "name": "Foxton Locks", "price": 50, "lockType": "single", "cooldown_seconds": 20, "state": { "openGate": "upper" }, "last_used": "%s" }', TO_CHAR(clock_timestamp(), 'YYYY-MM-DD HH24:MI:SS'))::JSONB),
  ('{"x": 762, "y": 0, "z": 105}', 'lock', 30, FORMAT('{ "name": "Caen Hill Locks", "price": 200, "lockType": "single", "cooldown_seconds": 20, "state": { "openGate": "lower" }, "last_used": "%s" }', TO_CHAR(clock_timestamp(), 'YYYY-MM-DD HH24:MI:SS'))::JSONB)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION operate_lock(player_id INTEGER, marker_id INTEGER)
RETURNS players AS $$
DECLARE
  lock_row markers%ROWTYPE;
  updated_player players;
  new_state JSONB = '{}';
BEGIN

  -- TODO: Check if player is at the lock

  -- TODO: Validate states

  SELECT * INTO updated_player FROM players WHERE id = player_id;

  SELECT * INTO lock_row FROM markers WHERE id = marker_id AND type = 'lock';

  -- ⏳ Check cooldown timer
  IF (COALESCE((lock_row.props->>'last_used')::TIMESTAMPTZ, '-infinity') > clock_timestamp() - (lock_row.props->>'cooldown_seconds')::INTERVAL) THEN
    RAISE EXCEPTION 'Lock is on cooldown';
  END IF;

  -- Update player's fuel level and balance
  WITH lock_price AS (
    SELECT (m.props ->> 'price')::INTEGER AS price
    FROM markers m
    WHERE type = 'lock'
    AND id = marker_id
  ),
  player AS (
    UPDATE players p
    SET balance = balance - lp.price
    FROM lock_price lp
    WHERE p.id = player_id
      AND p.balance >= lp.price
    RETURNING p.*
  )
  SELECT *
  INTO updated_player
  FROM player;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient player balance to pay lock fee';
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
  SET props = jsonb_set(
    jsonb_set(props,
      -- 🔄 Update lock cooldown
      '{last_used}', to_jsonb(clock_timestamp()), true),
      '{state}', new_state, true)
  WHERE id = marker_id;

  RETURN updated_player;

END;
$$ LANGUAGE plpgsql;

COMMIT;
