-- Revert canals:fuel.sql from pg

BEGIN;

DROP FUNCTION IF EXISTS refuel();

DELETE FROM markers WHERE type = 'fuel_station';

DROP TRIGGER IF EXISTS fuel_is_zero_trigger ON players;

DROP FUNCTION IF EXISTS fuel_is_zero();

DROP TRIGGER IF EXISTS update_fuel_trigger ON players;

DROP FUNCTION IF EXISTS calculate_fuel_consumed(distance FLOAT);

DROP FUNCTION IF EXISTS update_fuel();

COMMIT;
