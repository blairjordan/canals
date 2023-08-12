-- Deploy canals:npcs to pg

BEGIN;

-- 👴 Sawyer
INSERT INTO markers (position, type, props)
VALUES (
  '{"x": 40, "y": 0, "z": -45, "r": 0}',
  'npc',
  '{
    "key": "sawyer",
    "name": "Sawyer",
    "dialog": [
      {
        "text": "Ah, the gentle rhythm of the canal life. It''s as if time slows down here, allowing us to appreciate the simple beauty of each passing boat.",
        "order": 0
      },
      {
        "text": "Did you know that each canal boat has a story? Every scratch on their worn hulls, every flag fluttering in the wind tells a tale of adventure and exploration.",
        "order": 0
      },
      {
        "text": "Sometimes, I wonder what it would be like to drift away on one of those boats, floating from one picturesque town to another, free from the burdens of the world.",
        "order": 0
      },
      {
        "text": "You know, the canal has a language of its own. The sound of water lapping against the sides of the boats and the distant hum of engines—it''s like a symphony that calms the soul.",
        "order": 0
      },
      {
        "text": "People come and go on these canals, strangers passing like ships in the night. But occasionally, you stumble upon a kindred spirit, and those chance encounters can make all the difference.",
        "order": 0
      },
      {
        "text": "In the stillness of the canal, secrets are whispered and dreams are born. It''s a place where ideas take root and grow, where inspiration strikes the wandering mind.",
        "order": 0
      },
      {
        "text": "Some believe that the canals hold mystical powers, that the waters themselves possess healing properties. Maybe that''s why so many seek solace here, hoping to find a cure for their troubled hearts.",
        "order": 0
      },
      {
        "text": "If you ever feel lost or burdened, take a stroll along the canal. Let the gentle sway of the boats and the tranquility of the water wash away your worries. It''s a balm for the weary soul.",
        "order": 0
      },
      {
        "text": "They say the canal is a thread that connects us all—towns, cities, and the people who traverse its waters. It''s a tapestry of shared experiences, reminding us of our interconnectedness in this vast world.",
        "order": 0
      },
      {
        "text": "What compels a person like you to just drop everything and seek refuge on a canal boat? I suppose we''re all sailing away from some skeletons in our past, aren''t we?",
        "order": 0
      },
      {
        "text": "I have spoken.",
        "order": 1
      }
    ]
  }'
)
ON CONFLICT DO NOTHING;

-- 👦 Jimmy
INSERT INTO markers (position, type, props)
VALUES (
  '{"x": 102, "y": 0, "z": -23, "r": 2}',
  'npc',
  '{
    "key": "jimmy",
    "name": "Jimmy",
    "dialog": [
      {
        "text": "Can''t trust everyone on these waters. Remember that.",
        "order": 0
      },
      {
        "text": "Sawyer''s a good bloke, knows his ropes. But remember, everyone''s got a past.",
        "order": 0
      },
      {
        "text": "You ever get that feeling that the water''s talking to ya? Nah? Just me then...",
        "order": 0
      }
    ]
  }'
)
ON CONFLICT DO NOTHING;

-- 🎩 Harrison Blackwood
INSERT INTO markers (position, type, props)
VALUES (
  '{"x": 185, "y": 0, "z": -89, "r": 1.6}',
  'npc',
  '{
    "key": "harrison_blackwood",
    "name": "Harrison Blackwood",
    "dialog": [
      {
        "text": "One must always look the part. First impressions are the only impressions.",
        "order": 0
      },
      {
        "text": "Why waste time with small endeavors when the world is ripe with bigger opportunities?",
        "order": 0
      },
      {
        "text": "Your boat, while not the most sophisticated, certainly has... character. A reflection of its captain, I presume?",
        "order": 0
      },
      {
        "text": "Your enthusiasm for the canals is palpable. It reminds me of a younger version of myself, full of dreams and aspirations.",
        "order": 0
      },
      {
        "text": "Your passion for the canals is commendable. Not many of your age would invest so much in such a... quaint pastime.",
        "order": 0
      }
    ]
  }'
)
ON CONFLICT DO NOTHING;

COMMIT;
