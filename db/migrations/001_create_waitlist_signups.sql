CREATE TABLE waitlist_signups (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE,
  source text NOT NULL DEFAULT 'landing',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_signups_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT waitlist_signups_email_length CHECK (char_length(email) BETWEEN 3 AND 254)
);
