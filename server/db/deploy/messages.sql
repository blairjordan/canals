-- Deploy canals:messages to pg

BEGIN;

CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT REFERENCES players(id) NOT NULL,
  message TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
GRANT SELECT, INSERT ON messages TO authenticated_user;
GRANT SELECT ON messages TO anonymous;

-- 🌏 PostGraphile GQL subscription for global message
CREATE OR REPLACE FUNCTION notify_global_message()
  RETURNS TRIGGER AS
$$
DECLARE
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM pg_notify(
      'postgraphile:global_message_received',
      json_build_object(
        '__node__', json_build_array(
          'messages',
          (SELECT NEW.id)
        )
      )::text
    );
    RETURN NULL;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 🔫 Trigger for global message updates
CREATE OR REPLACE TRIGGER messages_global_trigger
  AFTER INSERT
  ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_global_message();

COMMIT;
