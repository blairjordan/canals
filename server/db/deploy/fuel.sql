-- Deploy canals:fuel.sql to pg

BEGIN;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='fuel') THEN
    ALTER TABLE players ADD COLUMN fuel FLOAT NOT NULL DEFAULT 100;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION calculate_fuel_consumed(distance FLOAT)
RETURNS FLOAT AS $$
DECLARE
  fuel_consumed_per_unit FLOAT := 0.005;
BEGIN
  -- Engines with better fuel consumption can apply modifiers here.
  RETURN distance * fuel_consumed_per_unit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_fuel()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fuel := GREATEST(0, OLD.fuel - calculate_fuel_consumed(
  sqrt(
    ((NEW.position->>'x')::FLOAT - (OLD.position->>'x')::FLOAT)^2 +
    ((NEW.position->>'y')::FLOAT - (OLD.position->>'y')::FLOAT)^2 +
    ((NEW.position->>'z')::FLOAT - (OLD.position->>'z')::FLOAT)^2
  )));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_fuel_trigger
BEFORE UPDATE ON players
FOR EACH ROW
WHEN (OLD.position IS DISTINCT FROM NEW.position)
EXECUTE FUNCTION update_fuel();

CREATE OR REPLACE FUNCTION fuel_is_zero()
RETURNS TRIGGER AS $$
DECLARE
  drift_duration INTERVAL := INTERVAL '10 seconds';
BEGIN
  IF OLD.fuel <= 0 THEN

    IF (OLD.drifting_at IS NULL) THEN
      -- Set drift mode 🌬
      NEW.drifting_at = now();
    ELSIF (OLD.drifting_at < now() - drift_duration) THEN
      -- Out of fuel, drift mode expired 🚫
      RAISE EXCEPTION 'Cannot update position when fuel is 0';
    END IF;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER fuel_is_zero_trigger
BEFORE UPDATE ON players
FOR EACH ROW
WHEN (OLD.position IS DISTINCT FROM NEW.position)
EXECUTE FUNCTION fuel_is_zero();

-- 🏪 Refueling stations
INSERT INTO markers (position, type)
VALUES
  ('{"x": 400, "y": 325, "z": 0}', 'fuel_station'),
  ('{"x": 725, "y": 75, "z": 0}', 'fuel_station')
ON CONFLICT DO NOTHING;

-- ⛽ Refuel
CREATE OR REPLACE FUNCTION refuel(player_id INTEGER)
RETURNS players AS $$
DECLARE
  -- TODO: Adjust as per player's engine type
  fuel_price_per_unit FLOAT := 0.15;
  updated_player players;
BEGIN

  SELECT * INTO updated_player FROM players WHERE id = player_id;

  IF updated_player.fuel >= 100 THEN
    RAISE EXCEPTION 'Player fuel level is already at maximum capacity';
  END IF;

  -- Update player's fuel level and balance
  UPDATE players
  SET
    balance = balance - fuel_price_per_unit,
    fuel = LEAST(updated_player.fuel + 1, 100),
    drifting_at = NULL -- Reset drift mode
  WHERE id = player_id
  AND balance >= fuel_price_per_unit
  RETURNING * INTO updated_player;

  -- Check if player's balance is sufficient for fuel purchase
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient player balance for fuel purchase';
  END IF;

  RETURN updated_player;

END;
$$ LANGUAGE plpgsql;

COMMIT;
