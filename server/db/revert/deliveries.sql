-- Revert canals:deliveries from pg

BEGIN;

DROP FUNCTION IF EXISTS pickup_package();

DROP FUNCTION IF EXISTS deliver_package();

DROP FUNCTION IF EXISTS players_package(player players);

DROP FUNCTION IF EXISTS markers_packages(marker markers);

COMMIT;
