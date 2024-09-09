CREATE TABLE "comments" (
  id SERIAL PRIMARY KEY,
  body TEXT NOT NULL,
  topic_id INTEGER REFERENCES topics(id),
  account_id INTEGER REFERENCES accounts(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);