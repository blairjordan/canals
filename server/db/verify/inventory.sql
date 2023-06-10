-- Verify canals:inventory on pg

BEGIN;

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'equip_item');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'unequip_item');

ROLLBACK;
