CREATE TABLE "comment" (
  id SERIAL PRIMARY KEY,
  body TEXT NOT NULL,
  topic_id INTEGER REFERENCES topic(id),
  account_id INTEGER REFERENCES account(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);