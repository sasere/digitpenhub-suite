CREATE TABLE funnel_templates (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category      TEXT        NOT NULL,
  name          TEXT        NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  steps         JSONB       NOT NULL DEFAULT '[]',
  sort_order    INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX funnel_templates_category_idx ON funnel_templates (category);

CREATE TABLE form_templates (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category       TEXT        NOT NULL,
  name           TEXT        NOT NULL,
  description    TEXT,
  thumbnail_url  TEXT,
  fields         JSONB       NOT NULL DEFAULT '[]',
  submit_message TEXT        NOT NULL DEFAULT 'Thank you for your submission!',
  sort_order     INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX form_templates_category_idx ON form_templates (category);
