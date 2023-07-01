-- Verify canals:npcs on pg

BEGIN;

SELECT EXISTS(SELECT FROM markers WHERE type = 'npc');

ROLLBACK;
