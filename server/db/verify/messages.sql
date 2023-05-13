-- Verify canals:messages on pg

BEGIN;

SELECT EXISTS(SELECT FROM pg_tables WHERE tablename = 'messages');

SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'notify_global_message');

SELECT EXISTS(SELECT FROM pg_trigger WHERE tgname = 'messages_global_trigger');

ROLLBACK;
