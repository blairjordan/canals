-- Verify canals:deliveries on pg

BEGIN;

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'pickup_package');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'deliver_package');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'players_package');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'markers_packages');

ROLLBACK;
