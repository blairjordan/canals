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
  -- ⛽ Engines with better fuel consumption can apply modifiers here.
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
BEGIN
  IF OLD.fuel <= 0 THEN
    NEW.fuel = 0;
    RAISE EXCEPTION 'Cannot update position when fuel is 0';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER fuel_is_zero_trigger
BEFORE UPDATE ON players
FOR EACH ROW
WHEN (OLD.position IS DISTINCT FROM NEW.position)
EXECUTE FUNCTION fuel_is_zero();

COMMIT;
