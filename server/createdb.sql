
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  position JSONB
);

