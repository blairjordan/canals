-- Revert canals:messages from pg

BEGIN;

DROP TRIGGER IF EXISTS messages_global_trigger ON messages;

DROP FUNCTION IF EXISTS notify_global_message();

DROP TABLE IF EXISTS messages CASCADE;

COMMIT;
