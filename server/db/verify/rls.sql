SELECT EXISTS (SELECT 1 FROM pg_class WHERE oid = 'players'::regclass AND relrowsecurity = TRUE);

SELECT EXISTS(SELECT 1 FROM pg_policies WHERE policyname = 'player_crud_update' AND 'authenticated_user' = ANY(roles));

SELECT EXISTS (SELECT 1 FROM pg_class WHERE oid = 'players'::regclass AND relrowsecurity = TRUE);

SELECT EXISTS(SELECT 1 FROM pg_policies WHERE policyname = 'player_crud_select');
