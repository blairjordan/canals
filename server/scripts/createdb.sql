CREATE TABLE players (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  meta JSONB,
  position JSONB
);

CREATE TABLE grid_node (
  id BIGSERIAL PRIMARY KEY,
  position JSONB NOT NULL,
  props JSONB
);

INSERT INTO grid_node (position) VALUES ('{"x": 0, "y": 0, "z": 0}');
INSERT INTO grid_node (position) VALUES ('{"x": 500, "y": 0, "z": 0}');
INSERT INTO grid_node (position) VALUES ('{"x": 500, "y": 0, "z": 500}');

CREATE TABLE grid_node_links (
  id BIGSERIAL PRIMARY KEY,
  from_grid_node_id BIGINT REFERENCES grid_node(id) NOT NULL,
  to_grid_node_id BIGINT REFERENCES grid_node(id) NOT NULL,
  props JSONB
);

INSERT INTO grid_node_links (from_grid_node_id, to_grid_node_id) VALUES (1, 2);
INSERT INTO grid_node_links (from_grid_node_id, to_grid_node_id) VALUES (1, 3);

-- PostGraphile GQL subscbription for player updates
CREATE OR REPLACE FUNCTION notify_player_changes()
  RETURNS TRIGGER AS
$$
DECLARE
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    PERFORM pg_notify(
      'postgraphile:player_updated',
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

-- A nice view to return the grid node links recursively 👀
CREATE VIEW grid_node_links_recursive AS
WITH RECURSIVE grid_node_links_recursive AS (
    -- 🛑 Non-recursive term
    SELECT
      id,
      from_grid_node_id,
      to_grid_node_id,
      props,
      1 as depth
    FROM grid_node_links
    WHERE from_grid_node_id = 1
    UNION ALL
    -- 🪃 Recursive term
    SELECT
      gnl.id,
      gnl.from_grid_node_id,
      gnl.to_grid_node_id,
      gnl.props,
      gnlr.depth + 1 AS depth
    FROM grid_node_links gnl
    INNER JOIN grid_node_links_recursive gnlr ON gnlr.to_grid_node_id = gnl.from_grid_node_id
)
SELECT
  id,
  from_grid_node_id,
  to_grid_node_id,
  props,
  depth
FROM grid_node_links_recursive;

COMMENT ON VIEW grid_node_links_recursive IS E'@foreignKey (to_grid_node_id) references grid_node (id)|@foreignFieldName toGridNode\n@foreignKey (from_grid_node_id) references grid_node (id)|@foreignFieldName fromGridNode';

