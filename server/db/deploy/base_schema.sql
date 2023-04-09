-- Deploy canals:base_schema to pg

BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  meta JSONB,
  position JSONB,
  balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  last_fished TIMESTAMP WITHOUT TIME ZONE, -- The last time the player fished (used for cooldown)
  drifting_at TIMESTAMP WITHOUT TIME ZONE  -- The time the player started drifting (allows movement for N seconds after fuel depletion)
);

-- Omit drifting_at from PostGraphile schema
COMMENT ON COLUMN players.drifting_at is E'@omit';

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
  item_key VARCHAR(55) NOT NULL,
  name TEXT NOT NULL,
  type VARCHAR(55),
  description TEXT,
  price NUMERIC(10,2) DEFAULT NULL,
  props JSONB
);

CREATE TABLE IF NOT EXISTS marker_items (
  marker_id BIGINT REFERENCES markers(id) NOT NULL,
  item_id BIGINT REFERENCES items(id) NOT NULL,
  props JSONB
);

CREATE TABLE IF NOT EXISTS player_items (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT REFERENCES players(id) NOT NULL,
  item_id BIGINT REFERENCES items(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  props JSONB
);

-- 📍 Geo markers
INSERT INTO markers (position, type)
VALUES
  ('{"x": 0, "y": 0, "z": 0}', 'geo_marker'),
  ('{"x": 500, "y": 0, "z": 0}', 'geo_marker'),
  ('{"x": 500, "y": 0, "z": 500}', 'geo_marker')
ON CONFLICT DO NOTHING;

-- Fish 🐠
INSERT INTO items (name, item_key, description, price, type, props)
VALUES
-- Common Fish
('Sea Bass', 'sea_bass', 'A popular game fish with mild, white flesh and a rich flavor.', 4, 'fish', '{"rarity": "common"}'),
('Trout', 'trout', 'A freshwater fish with delicate, flaky flesh that is mild in flavor.', 4, 'fish', '{"rarity": "common"}'),
('Salmon', 'salmon', 'A fatty fish with a rich, buttery flavor and tender flesh.', 6, 'fish', '{"rarity": "common"}'),
('Pike', 'pike', 'A freshwater fish with firm, white flesh that is often smoked or pickled.', 7, 'fish', '{"rarity": "common"}'),
('Carp', 'carp', 'A freshwater fish with a mild, sweet flavor and firm texture that is often used in European cuisine.', 8, 'fish', '{"rarity": "common"}'),
-- Uncommon Fish
('Zander', 'zander', 'A freshwater fish with firm, white flesh that is prized for its mild, delicate flavor.', 14, 'fish', '{"rarity": "uncommon"}'),
('Grayling', 'grayling', 'A freshwater fish with delicate, white flesh that is similar in taste to trout.', 15, 'fish', '{"rarity": "uncommon"}'),
-- Rare Fish
('Catfish', 'catfish', 'A freshwater fish with firm, white flesh that is often used in stews and soups.', 22, 'fish', '{"rarity": "rare"}'),
-- Epic fish
('Sturgeon', 'sturgeon', 'A large, prehistoric-looking fish with firm, flavorful flesh that is prized for its caviar.', 47, 'fish', '{"rarity": "epic"}'),
-- Legendary,
('Bull Shark', 'bull_shark', 'A large, aggressive shark with a reputation for attacking humans. Bull sharks are known for their strong, muscular bodies and sharp teeth.', 250, 'fish', '{"rarity": "legendary"}');
;

-- 🐟 A fishing spot marker
WITH fishing_spot_insert AS (
  INSERT INTO markers (position, type)
  VALUES ('{"x": 200, "y": 0, "z": 250}', 'fishing_spot')
  RETURNING id
),
fishing_spot_fish AS (
  SELECT id, '{"chance": 0.1 }'::JSONB AS props FROM items WHERE item_key = 'sea_bass'
  UNION SELECT id, '{"chance": 0.2 }'::JSONB AS props FROM items WHERE item_key = 'trout'
  UNION SELECT id, '{"chance": 0.05 }'::JSONB AS props FROM items WHERE item_key = 'salmon'
  UNION SELECT id, '{"chance": 0.15 }'::JSONB AS props FROM items WHERE item_key = 'pike'
  UNION SELECT id, '{"chance": 0.05 }'::JSONB AS props FROM items WHERE item_key = 'zander'
)
INSERT INTO marker_items (marker_id, item_id, props)
SELECT fishing_spot_insert.id, fishing_spot_fish.id, fishing_spot_fish.props FROM fishing_spot_insert, fishing_spot_fish;

-- 🐟 A second fishing spot marker
WITH fishing_spot_insert AS (
  INSERT INTO markers (position, type)
  VALUES ('{"x": 50, "y": 0, "z": 25}', 'fishing_spot')
  RETURNING id
),
fishing_spot_fish AS (
  SELECT id, '{"chance": 0.05 }'::JSONB AS props FROM items WHERE item_key = 'sea_bass'
  UNION SELECT id, '{"chance": 0.15 }'::JSONB AS props FROM items WHERE item_key = 'trout'
  UNION SELECT id, '{"chance": 0.2 }'::JSONB AS props FROM items WHERE item_key = 'salmon'
  UNION SELECT id, '{"chance": 0.05 }'::JSONB AS props FROM items WHERE item_key = 'pike'
  UNION SELECT id, '{"chance": 0.15 }'::JSONB AS props FROM items WHERE item_key = 'zander'
)
INSERT INTO marker_items (marker_id, item_id, props)
SELECT fishing_spot_insert.id, fishing_spot_fish.id, fishing_spot_fish.props FROM fishing_spot_insert, fishing_spot_fish;

INSERT INTO links (from_marker_id, to_marker_id)
VALUES
(1, 2),
(1, 3)
ON CONFLICT DO NOTHING;

-- 🎣 Fishing vendor
WITH vendor_insert AS (
  INSERT INTO markers (position, type, props)
  VALUES ('{"x": -20, "y": 20, "z": 0}', 'vendor', '{"name": "Bob''s Bait''n''Tackle"}')
  RETURNING id
),
item_insert AS (
  INSERT INTO items (name, item_key, description, price, type, props)
  VALUES
  ('Spincast Rod', 'spincast_rod', 'A simple fishing rod designed to work with spincasting reels.', 25.00, 'fishing_rod', '{"chance_multiplier": 1}'::JSONB),
  ('Spinning Rod', 'spinning_rod', 'The most common type of fishing rod, designed to work with spinning reels.', 50.00, 'fishing_rod', '{"chance_multiplier": 1.05}'::JSONB),
  ('Baitcasting Rod', 'baitcasting_rod', 'A powerful fishing rod designed to work with baitcasting reels.', 100.00, 'fishing_rod', '{"chance_multiplier": 1.1}'::JSONB),
  ('Fly Rod', 'fly_rod', 'A specialized fishing rod designed for fly fishing.', 200.00, 'fishing_rod', '{"chance_multiplier": 1.15}'::JSONB)
  RETURNING id
)
INSERT INTO marker_items (marker_id, item_id)
SELECT vendor_insert.id, item_insert.id FROM vendor_insert, item_insert;

-- 🦐 Fishmonger (purchaser of fish items)
INSERT INTO markers (position, type, props)
VALUES ('{"x": 75, "y": -40, "z": 15}', 'vendor', '{"name": "The Salmon Slinger", "purchase_item_types": ["fish"]}');

-- 👬 Give demo players a rod
WITH fishing_rod AS (
  SELECT id FROM items WHERE item_key = 'spincast_rod'
)
INSERT INTO player_items (player_id, item_id, props)
SELECT players.id, fishing_rod.id, '{"equipped": true}'::JSONB
FROM players
CROSS JOIN fishing_rod;

-- 🐡 Give player some fish to sell
WITH fish AS (
  SELECT id FROM items WHERE item_key = 'catfish'
  UNION SELECT id FROM items WHERE item_key = 'trout'
  UNION SELECT id FROM items WHERE item_key = 'salmon'
)
INSERT INTO player_items (player_id, item_id)
SELECT players.id, fish.id
FROM players
CROSS JOIN fish
WHERE players.username = 'matt';

-- 🪴 Florist vendor
WITH vendor_insert AS (
  INSERT INTO markers (position, type, props)
  VALUES ('{"x": 100, "y": 100, "z": 0}', 'vendor', '{"name": "Mary''s Florist"}')
  RETURNING id
),
item_insert AS (
  INSERT INTO items (name, item_key, description, price, type)
  VALUES
  ('Snake Plant', 'snake_plant', 'A potted Snake Plant, also known as Mother-in-Law’s Tongue.', 20.00, 'plant'),
  ('Barrel Cactus', 'barrel_cactus', 'A potted Barrel Cactus, also known as Ferocactus.', 60.00, 'plant'),
  ('Boxwood Topiary', 'boxwood_topiary', 'A potted Boxwood Topiary, pruned into a ball shape.', 35.00, 'plant'),
  ('Climbing Ivy', 'climbing_ivy', 'A potted Climbing Ivy, trained to climb a trellis or wall.', 25.00, 'plant')
  RETURNING id
)
INSERT INTO marker_items (marker_id, item_id)
SELECT vendor_insert.id, item_insert.id FROM vendor_insert, item_insert;

-- 🛥 Boating vendor
WITH vendor_insert AS (
  INSERT INTO markers (position, type, props)
  VALUES ('{"x": -50, "y": 0, "z": 0}', 'vendor', '{"name": "Frank''s Boating"}')
  RETURNING id
),
item_insert AS (
  INSERT INTO items (name, item_key, description, price, type)
  VALUES
  -- General Items
  ('Air Conditioner', 'air_conditioner', 'Cools air inside a boat''s cabin or enclosed space.', 500.00, 'general_item'),
  ('Solar Panel', 'solar_panel', 'Converts sunlight into electricity to power onboard systems.', 300.00, 'general_item'),
  -- Hulls
  ('Flat-bottomed Hull', 'flat_hull', 'A type of boat hull that has a flat bottom, making it very stable but slower than other hull types.', 500.00, 'boat_hull'),
  ('Multi-chine Hull', 'multi_chine_hull', 'A type of boat hull that has multiple angles or "chines" in its shape, providing good stability and speed.', 1000.00, 'boat_hull'),
  ('Round-bottomed Hull', 'round_hull', 'A type of boat hull that has a round bottom, providing good speed but less stability than flat-bottomed hulls.', 1500.00, 'boat_hull'),
  -- Decks
  ('Fiberglass Deck', 'fiberglass_deck', 'A type of boat deck made from fiberglass, providing good durability and resistance to water damage.', 750.00, 'boat_deck'),
  ('Pine Deck',  'pine_deck', 'A type of boat deck made from pine wood, providing a traditional and classic look.', 500.00, 'boat_deck'),
  ('Cedar Deck', 'cedar_deck','A type of boat deck made from cedar wood, providing good resistance to water damage and a pleasant aroma.', 1250.00, 'boat_deck'),
  ('Mahogany Deck', 'mahogany_deck', 'A type of boat deck made from mahogany wood, providing a luxurious and classic look.', 2500.00, 'boat_deck'),
  -- Engines
  ('Outboard Engine', 'outboard_engine', 'A type of boat engine that is mounted on the outside of the boat, providing good speed and maneuverability.', 5000.00, 'boat_engine'),
  ('Inboard Engine', 'inboard_engine', 'A type of boat engine that is mounted inside the boat, providing good power and torque.', 7500.00, 'boat_engine'),
  ('Electric Engine', 'electric_engine', 'A type of boat engine that is powered by electricity, providing quiet and eco-friendly propulsion.', 10000.00, 'boat_engine'),
  ('Inboard Diesel Engine', 'inboard_diesel_engine', 'A type of boat engine that is powered by diesel fuel and mounted inside the boat, providing good power and fuel efficiency.', 12500.00, 'boat_engine'),
  -- Sterns
  ('Traditional', 'traditional_stern', 'A classic stern design that provides good stability and handling.', 500.00, 'boat_stern'),
  ('Semi-Traditional', 'semi_traditional_stern', 'A modern take on the traditional stern design, providing a balance between stability and speed.', 2500.00, 'boat_stern'),
  ('Cruiser', 'cruiser_stern', 'A sleek and stylish stern design that emphasizes speed and maneuverability.', 5000.00, 'boat_stern')
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
  player_item player_items; -- items purchased in player's inventory
BEGIN

  -- TODO: Validate player session. Source player_id from session.
  -- TODO: Validate player and a vendor with the item are in the same location.

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

-- 🎣 Fishin' function
CREATE OR REPLACE FUNCTION fish(
  player_id INTEGER
  )
RETURNS player_items AS $$
  #variable_conflict use_variable
DECLARE
  player_item player_items := NULL; -- The fish caught by the player
  marker_id_found INTEGER := NULL;
  marker_distance_limit NUMERIC := 1000;
  chance_multiplier NUMERIC;
BEGIN

  -- TODO: Validate player session

  -- Find closest marker within the given distance of the current player's position
  WITH current_player AS (
    SELECT position
    FROM players
    WHERE id = 1
  ),
  player_distances AS (
    SELECT
      m.id,
        ST_Distance(
        ST_MakePoint(
          (cp.position->>'x')::double precision,
          (cp.position->>'z')::double precision
        ),
        ST_MakePoint(
          (m.position->>'x')::double precision,
          (m.position->>'z')::double precision
        )
    ) AS marker_distance
    FROM markers m
    CROSS JOIN current_player cp
    WHERE m.type = 'fishing_spot'
  )
  SELECT pd.id
  INTO marker_id_found
  FROM player_distances pd
  WHERE pd.marker_distance <= marker_distance_limit
  ORDER BY pd.marker_distance ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No fishing markers found';
  END IF;

  SELECT (items.props ->> 'chance_multiplier')::NUMERIC AS chance_multiplier
  INTO chance_multiplier
  FROM players
  LEFT OUTER JOIN player_items on players.id = player_items.player_id
  LEFT OUTER JOIN items on player_items.item_id = items.id
  WHERE players.id = player_id
  AND COALESCE(last_fished, '-infinity') < now() - interval '30 seconds'
  AND items.type = 'fishing_rod'
  AND player_items.props ->> 'equipped' = 'true';

  IF NOT FOUND THEN
    -- 🕤 Fishing action on cooldown (return NULL)
    RETURN player_item;
  END IF;

  UPDATE players
  SET last_fished = now()
  WHERE id = player_id;

  INSERT INTO player_items(player_id, item_id)
  SELECT player_id, item_id
  FROM marker_items
  INNER JOIN items ON marker_items.item_id = items.id
  WHERE marker_id = marker_id_found
  AND random() < (marker_items.props ->> 'chance')::NUMERIC * chance_multiplier
  ORDER BY random()
  LIMIT 1
  RETURNING * INTO player_item;

  -- Return the caught fish
  RETURN player_item;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sell_item(
  marker_id INTEGER, -- vendor's marker id
  player_item_id INTEGER
) 
RETURNS players AS $$
  #variable_conflict use_variable
DECLARE
  player players := NULL; -- The player selling the item
BEGIN

-- TODO: Validate player session
-- TODO: Validate player and marker are in the same location

-- Returns true if vendor sells item, and player has item
PERFORM 1
  FROM player_items pi
    INNER JOIN items i ON pi.item_id = i.id
    INNER JOIN (
      SELECT m.id AS vendor_id,
        jsonb_array_elements_text(m.props->'purchase_item_types') AS purchase_item_type
      FROM markers m
      WHERE m.type = 'vendor'
        AND m.props->'purchase_item_types' IS NOT NULL
        AND jsonb_array_length(m.props->'purchase_item_types') > 0
    ) vi ON i.type = vi.purchase_item_type
  WHERE vi.vendor_id = marker_id
    AND pi.id = player_item_id
  ;

IF NOT FOUND THEN
  RAISE EXCEPTION 'Item cannot be sold';
END IF;

-- 💰 Add to the player's balance
WITH player_item AS (
  SELECT pi.player_id, COALESCE(i.price, 0) as item_price
  FROM player_items pi
    INNER JOIN items i ON pi.item_id = i.id
  WHERE pi.id = player_item_id
)
UPDATE players
SET balance = balance + (SELECT item_price FROM player_item)
WHERE id = (SELECT player_id FROM player_item);

-- 🧑 Player to return
SELECT p.*
INTO player
FROM players p
INNER JOIN player_items pi on p.id = pi.player_id
WHERE pi.id = player_item_id;

-- 🔻 Remove the item from the player's inventory
DELETE FROM player_items
WHERE id = player_item_id;

RETURN player;

END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TYPE nearby_players AS (
    player_id INTEGER,
    distance FLOAT
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE nearby_players IS '@foreignKey (player_id) references players (id)';

CREATE OR REPLACE FUNCTION nearby_players(current_player_id INTEGER, distance FLOAT)
RETURNS SETOF nearby_players AS $$
  -- Find players within the given distance of the current player's position
  WITH current_player AS (
    SELECT position
    FROM players
    WHERE id = current_player_id
  ),
  player_distances AS (
    SELECT
      p.id,
      ST_Distance(
      ST_MakePoint(
        (cp.position->>'x')::double precision,
        (cp.position->>'y')::double precision,
        (cp.position->>'z')::double precision
      ),
      ST_MakePoint(
        (p.position->>'x')::double precision,
        (p.position->>'y')::double precision,
        (p.position->>'z')::double precision
      )
    ) AS player_distance
    FROM players p
    CROSS JOIN current_player cp
    WHERE p.id <> current_player_id
  )
  SELECT pd.id, pd.player_distance
  FROM player_distances pd
  WHERE pd.player_distance <= distance;
$$ LANGUAGE sql STABLE;

COMMIT;

