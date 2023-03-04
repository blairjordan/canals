-- Deploy canals:base_schema to pg

BEGIN;

CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  meta JSONB,
  position JSONB,
  balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

INSERT INTO players (username, position, balance)
VALUES
  ('blair', '{"x": 0, "y": 0, "z": 0}', 1000000.00),
  ('matt', '{"x": 10, "y": 0, "z": 0}', 25.00);

CREATE TABLE IF NOT EXISTS markers (
  id BIGSERIAL PRIMARY KEY,
  position JSONB NOT NULL,
  type VARCHAR(55),
  props JSONB
);

CREATE INDEX IF NOT EXISTS markers_position_idx ON markers USING GIN (position);
CREATE INDEX IF NOT EXISTS idx_markers_type ON markers (type);

CREATE TABLE IF NOT EXISTS links (
  id BIGSERIAL PRIMARY KEY,
  from_marker_id BIGINT REFERENCES markers(id) NOT NULL,
  to_marker_id BIGINT REFERENCES markers(id) NOT NULL,
  props JSONB,
  CONSTRAINT uq_links UNIQUE (from_marker_id, to_marker_id)
);

CREATE INDEX IF NOT EXISTS links_props_idx ON links USING GIN (props);

CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type VARCHAR(55),
  description TEXT,
  price NUMERIC(10,2) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS marker_items (
  marker_id BIGINT REFERENCES markers(id) NOT NULL,
  item_id BIGINT REFERENCES items(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS player_items (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT REFERENCES players(id) NOT NULL,
  item_id BIGINT REFERENCES items(id) NOT NULL,
  props JSONB
);

INSERT INTO markers (position, type)
VALUES
  ('{"x": 0, "y": 0, "z": 0}', 'geo_marker'),
  ('{"x": 500, "y": 0, "z": 0}', 'geo_marker'),
  ('{"x": 500, "y": 0, "z": 500}', 'geo_marker')
ON CONFLICT DO NOTHING;

INSERT INTO links (from_marker_id, to_marker_id)
VALUES
(1, 2),
(1, 3)
ON CONFLICT DO NOTHING;

-- 🎣 Fishing vendor
WITH vendor_insert AS (
  INSERT INTO markers (position, type, props)
  VALUES ('{"x": 50, "y": 50, "z": 0}', 'vendor', '{"name": "Bob''s Bait''n''Tackle"}')
  RETURNING id
),
item_insert AS (
  INSERT INTO items (name, description, price, type)
  VALUES
  ('Spincast Rod', 'A simple fishing rod designed to work with spincasting reels.', 25.00, 'fishing_rod'),
  ('Spinning Rod', 'The most common type of fishing rod, designed to work with spinning reels.', 50.00, 'fishing_rod'),
  ('Baitcasting Rod', 'A powerful fishing rod designed to work with baitcasting reels.', 100.00, 'fishing_rod'),
  ('Fly Rod', 'A specialized fishing rod designed for fly fishing.', 200.00, 'fishing_rod')
  RETURNING id
)
INSERT INTO marker_items (marker_id, item_id)
SELECT vendor_insert.id, item_insert.id FROM vendor_insert, item_insert;

-- 🪴 Florist vendor
WITH vendor_insert AS (
  INSERT INTO markers (position, type, props)
  VALUES ('{"x": 75, "y": 75, "z": 0}', 'vendor', '{"name": "Mary''s Florist"}')
  RETURNING id
),
item_insert AS (
  INSERT INTO items (name, description, price, type)
  VALUES
  ('Snake Plant', 'A potted Snake Plant, also known as Mother-in-Law’s Tongue.', 20.00, 'plant'),
  ('Barrel Cactus', 'A potted Barrel Cactus, also known as Ferocactus.', 60.00, 'plant'),
  ('Boxwood Topiary', 'A potted Boxwood Topiary, pruned into a ball shape.', 35.00, 'plant'),
  ('Climbing Ivy', 'A potted Climbing Ivy, trained to climb a trellis or wall.', 25.00, 'plant')
  RETURNING id
)
INSERT INTO marker_items (marker_id, item_id)
SELECT vendor_insert.id, item_insert.id FROM vendor_insert, item_insert;

-- 🛥 Boating vendor
WITH vendor_insert AS (
  INSERT INTO markers (position, type, props)
  VALUES ('{"x": 50, "y": 50, "z": 0}', 'vendor', '{"name": "Frank''s Boating"}')
  RETURNING id
),
item_insert AS (
  INSERT INTO items (name, description, price, type)
  VALUES
  -- General Items
  ('Air Conditioner', 'Cools air inside a boat''s cabin or enclosed space.', 500.00, 'general_item'),
  ('Solar Panel', 'Converts sunlight into electricity to power onboard systems.', 300.00, 'general_item'),
  -- Hulls
  ('Flat-bottomed Hull', 'A type of boat hull that has a flat bottom, making it very stable but slower than other hull types.', 500.00, 'boat_hull'),
  ('Multi-chine Hull', 'A type of boat hull that has multiple angles or "chines" in its shape, providing good stability and speed.', 1000.00, 'boat_hull'),
  ('Round-bottomed Hull', 'A type of boat hull that has a round bottom, providing good speed but less stability than flat-bottomed hulls.', 1500.00, 'boat_hull'),
  -- Decks
  ('Fiberglass Deck', 'A type of boat deck made from fiberglass, providing good durability and resistance to water damage.', 750.00, 'boat_deck'),
  ('Pine Deck', 'A type of boat deck made from pine wood, providing a traditional and classic look.', 500.00, 'boat_deck'),
  ('Cedar Deck', 'A type of boat deck made from cedar wood, providing good resistance to water damage and a pleasant aroma.', 1250.00, 'boat_deck'),
  ('Mahogany Deck', 'A type of boat deck made from mahogany wood, providing a luxurious and classic look.', 2500.00, 'boat_deck'),
  -- Engines
  ('Outboard Engine', 'A type of boat engine that is mounted on the outside of the boat, providing good speed and maneuverability.', 5000.00, 'boat_engine'),
  ('Inboard Engine', 'A type of boat engine that is mounted inside the boat, providing good power and torque.', 7500.00, 'boat_engine'),
  ('Electric Engine', 'A type of boat engine that is powered by electricity, providing quiet and eco-friendly propulsion.', 10000.00, 'boat_engine'),
  ('Inboard Diesel Engine', 'A type of boat engine that is powered by diesel fuel and mounted inside the boat, providing good power and fuel efficiency.', 12500.00, 'boat_engine'),
  -- Sterns
  ('Traditional', 'A classic stern design that provides good stability and handling.', 500.00, 'boat_stern'),
  ('Semi-Traditional', 'A modern take on the traditional stern design, providing a balance between stability and speed.', 2500.00, 'boat_stern'),
  ('Cruiser', 'A sleek and stylish stern design that emphasizes speed and maneuverability.', 5000.00, 'boat_stern')
  RETURNING id
)
INSERT INTO marker_items (marker_id, item_id)
SELECT vendor_insert.id, item_insert.id FROM vendor_insert, item_insert;

-- 📰 PostGraphile GQL subscbription for player updates
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

-- 🔫 Trigger for player updates
CREATE OR REPLACE TRIGGER player_changes_trigger
  AFTER INSERT OR UPDATE
  ON players
  FOR EACH ROW
  EXECUTE FUNCTION notify_player_changes();

-- A nice view to return the grid node links recursively 👀
CREATE OR REPLACE VIEW links_recursive AS
WITH RECURSIVE links_recursive AS (
    -- 🛑 Non-recursive term
    SELECT
      id,
      from_marker_id,
      to_marker_id,
      props,
      1 as depth
    FROM links
    WHERE from_marker_id = 1
    UNION ALL
    -- 🪃 Recursive term
    SELECT
      gnl.id,
      gnl.from_marker_id,
      gnl.to_marker_id,
      gnl.props,
      gnlr.depth + 1 AS depth
    FROM links gnl
    INNER JOIN links_recursive gnlr ON gnlr.to_marker_id = gnl.from_marker_id
)
SELECT
  id,
  from_marker_id,
  to_marker_id,
  props,
  depth
FROM links_recursive;

COMMENT ON VIEW links_recursive IS E'@foreignKey (to_marker_id) references markers (id)|@foreignFieldName toMarker\n@foreignKey (from_marker_id) references markers (id)|@foreignFieldName fromMarker';

-- 🏪 Purchase item function
CREATE OR REPLACE FUNCTION purchase_item(player_id INTEGER, item_id INTEGER)
RETURNS player_items AS $$
DECLARE
  player_item player_items;
BEGIN
  WITH item_price AS (
    SELECT price FROM items WHERE id = item_id
  ),
  deducted_balance AS (
    UPDATE players
    SET balance = balance - (SELECT price FROM item_price)::FLOAT
    WHERE id = player_id AND balance >= (SELECT price FROM item_price)::FLOAT
    RETURNING balance
  ),
  updated_player_items AS (
    INSERT INTO player_items(player_id, item_id, props)
    SELECT player_id, item_id, (SELECT JSONB_BUILD_OBJECT('price', price::FLOAT) FROM item_price)
    WHERE EXISTS (
      SELECT 1 FROM deducted_balance
    )
    RETURNING *
  )
  SELECT upi.*
  INTO player_item
  FROM updated_player_items upi
  WHERE upi.player_id = purchase_item.player_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient player balance for purchase';
  END IF;

  RETURN player_item;
END;
$$ LANGUAGE plpgsql;

COMMIT;
