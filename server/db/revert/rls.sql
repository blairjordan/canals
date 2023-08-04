-- Revert canals:rls from pg

BEGIN;

ALTER TABLE players DISABLE ROW LEVEL SECURITY;

DROP POLICY player_crud_update ON players;

REVOKE SELECT ON players FROM authenticated_user;
REVOKE UPDATE (meta, position) ON players FROM authenticated_user;

DROP POLICY player_crud_select ON players;

COMMIT;
