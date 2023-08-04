-- Deploy canals:rls to pg

BEGIN;

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- 🔄 Can only UPDATE own players record
CREATE POLICY player_crud_update ON players
FOR UPDATE
TO authenticated_user
USING (id = current_player_id());

GRANT SELECT ON players TO authenticated_user;
GRANT UPDATE (meta, position) ON players TO authenticated_user;

-- 👀 Can SELECT all other players
CREATE POLICY player_crud_select ON players
FOR SELECT
TO public
USING (true);

COMMIT;
