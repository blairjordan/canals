CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  meta JSONB,
  position JSONB
);

CREATE TABLE grid_node (
  id SERIAL PRIMARY KEY,
  position JSONB NOT NULL,
  props JSONB
);

CREATE TABLE grid_node_links (
  id SERIAL PRIMARY KEY,
  from_node BIGINT REFERENCES grid_node(id),
  props JSONB
);

-- PostGraphile GQL subscbription for player updates
CREATE OR REPLACE FUNCTION notify_player_changes()
  RETURNS TRIGGER AS
$$
DECLARE
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    PERFORM pg_notify(
      'postgraphile:hello',
      json_build_object(
        '__node__', json_build_array(
          'players',
          (SELECT NEW.id)
        )
      )::text
    );
    RETURN NULL;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER player_changes_trigger
  AFTER INSERT OR UPDATE
  ON players
  FOR EACH ROW
  EXECUTE FUNCTION notify_player_changes();

