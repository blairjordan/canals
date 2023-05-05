-- Verify canals:locks on pg

BEGIN;

SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'operate_lock');

SELECT EXISTS(SELECT 1 FROM markers WHERE type = 'lock');

ROLLBACK;
