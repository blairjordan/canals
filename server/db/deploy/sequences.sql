-- Deploy canals:sequences to pg

BEGIN;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated_user;

COMMIT;
