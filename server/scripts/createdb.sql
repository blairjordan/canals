CREATE TABLE players (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  meta JSONB,
  position JSONB,
  balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE grid_nodes (
  id BIGSERIAL PRIMARY KEY,
  position JSONB NOT NULL,
  type VARCHAR(55),
  props JSONB
);

CREATE INDEX grid_nodes_position_idx ON grid_nodes USING GIN (position);
CREATE INDEX idx_grid_node_type ON grid_nodes (type);

INSERT INTO grid_nodes (position) VALUES ('{"x": 0, "y": 0, "z": 0}');
INSERT INTO grid_nodes (position) VALUES ('{"x": 500, "y": 0, "z": 0}');
INSERT INTO grid_nodes (position) VALUES ('{"x": 500, "y": 0, "z": 500}');

CREATE TABLE grid_node_links (
  id BIGSERIAL PRIMARY KEY,
  from_grid_node_id BIGINT REFERENCES grid_nodes(id) NOT NULL,
  to_grid_node_id BIGINT REFERENCES grid_nodes(id) NOT NULL,
  props JSONB
);

ALTER TABLE grid_node_links ADD CONSTRAINT uq_links UNIQUE (from_grid_node_id, to_grid_node_id);

INSERT INTO grid_node_links (from_grid_node_id, to_grid_node_id) VALUES (1, 2);
INSERT INTO grid_node_links (from_grid_node_id, to_grid_node_id) VALUES (1, 3);

CREATE TABLE items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type VARCHAR(55),
  description TEXT,
  floor_price NUMERIC(10,2) DEFAULT NULL
);

CREATE TABLE grid_node_items (
  grid_node_id BIGINT REFERENCES grid_nodes(id) NOT NULL,
  item_id BIGINT REFERENCES items(id) NOT NULL
);

-- 🎣 Fishing vendor
WITH vendor_insert AS (
  INSERT INTO grid_nodes (position, type, props)
  VALUES ('{"x": 50, "y": 50, "z": 0}', 'vendor', '{"name": "Bob''s Bait''n''Tackle Shop"}')
  RETURNING id
),
item_insert AS (
  INSERT INTO items (name, description, floor_price, type)
  VALUES
  ('Spincast Rod', 'A simple fishing rod designed to work with spincasting reels.', 25.00, 'fishing_rod'),
  ('Spinning Rod', 'The most common type of fishing rod, designed to work with spinning reels.', 50.00, 'fishing_rod'),
  ('Baitcasting Rod', 'A powerful fishing rod designed to work with baitcasting reels.', 100.00, 'fishing_rod'),
  ('Fly Rod', 'A specialized fishing rod designed for fly fishing.', 200.00, 'fishing_rod')
  RETURNING id
)
INSERT INTO grid_node_items (grid_node_id, item_id)
SELECT vendor_insert.id, item_insert.id FROM vendor_insert, item_insert;

-- 🪴 Florist vendor
WITH vendor_insert AS (
  INSERT INTO grid_nodes (position, type, props)
  VALUES ('{"x": 75, "y": 75, "z": 0}', 'vendor', '{"name": "Mary''s Florist"}')
  RETURNING id
),
item_insert AS (
  INSERT INTO items (name, description, floor_price, type)
  VALUES
  ('Snake Plant', 'A potted Snake Plant, also known as Mother-in-Law’s Tongue.', 20.00, 'plant'),
  ('Barrel Cactus', 'A potted Barrel Cactus, also known as Ferocactus.', 60.00, 'plant'),
  ('Boxwood Topiary', 'A potted Boxwood Topiary, pruned into a ball shape.', 35.00, 'plant'),
  ('Climbing Ivy', 'A potted Climbing Ivy, trained to climb a trellis or wall.', 25.00, 'plant')
  RETURNING id
)
INSERT INTO grid_node_items (grid_node_id, item_id)
SELECT vendor_insert.id, item_insert.id FROM vendor_insert, item_insert;

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

COMMENT ON VIEW grid_node_links_recursive IS E'@foreignKey (to_grid_node_id) references grid_nodes (id)|@foreignFieldName toGridNode\n@foreignKey (from_grid_node_id) references grid_nodes (id)|@foreignFieldName fromGridNode';

