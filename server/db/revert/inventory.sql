-- Revert canals:inventory from pg

BEGIN;

DROP FUNCTION IF EXISTS equip_item(INTEGER, INTEGER);

DROP FUNCTION IF EXISTS unequip_item(INTEGER, INTEGER);

COMMIT;
