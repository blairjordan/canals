-- Verify canals:fuel.sql on pg

BEGIN;

SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'fuel');

SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'calculate_fuel_consumed');

SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_fuel');

SELECT EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_fuel_trigger');

SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'fuel_is_zero');

SELECT EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'fuel_is_zero_trigger');

SELECT EXISTS(SELECT 1 FROM markers WHERE type = 'fueling_station');

SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'refuel');

ROLLBACK;
