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

ALTER TABLE player_quests ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON player_quests TO authenticated_user;

-- 👀 Can view own player_quests
CREATE POLICY player_quests_crud_select ON player_quests
FOR SELECT
TO authenticated_user
USING (player_id = current_player_id());

COMMIT;
