-- Revert canals:npcs from pg

BEGIN;

DELETE FROM markers WHERE type = 'npc';

COMMIT;
