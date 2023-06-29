-- Revert canals:sequences from pg

BEGIN;

REVOKE USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public FROM authenticated_user;

COMMIT;
