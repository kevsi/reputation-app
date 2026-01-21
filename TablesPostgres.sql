

CREATE TABLE organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role role NOT NULL DEFAULT 'USER',
  organization_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_user_organization
    FOREIGN KEY (organization_id)
    REFERENCES organization(id)
    ON DELETE CASCADE
);

CREATE TABLE source (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type source_type NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_source_organization
    FOREIGN KEY (organization_id)
    REFERENCES organization(id)
    ON DELETE CASCADE
);

CREATE TABLE mention (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  url TEXT NOT NULL,
  source_id UUID NOT NULL,
  sentiment sentiment,
  sentiment_score FLOAT,
  emotions TEXT[],
  virality_score FLOAT,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMP,

  CONSTRAINT fk_mention_source
    FOREIGN KEY (source_id)
    REFERENCES source(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_mention_organization
    FOREIGN KEY (organization_id)
    REFERENCES organization(id)
    ON DELETE CASCADE
);

CREATE TABLE alert (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level alert_level NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status alert_status NOT NULL DEFAULT 'NEW',
  mention_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_alert_mention
    FOREIGN KEY (mention_id)
    REFERENCES mention(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_alert_organization
    FOREIGN KEY (organization_id)
    REFERENCES organization(id)
    ON DELETE CASCADE
);

CREATE TABLE action (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type action_type NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  alert_id UUID NOT NULL,
  assigned_to UUID,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_action_alert
    FOREIGN KEY (alert_id)
    REFERENCES alert(id)
    ON DELETE CASCADE
);

CREATE TABLE report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type report_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  file_url TEXT,
  organization_id UUID NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  generated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_report_organization
    FOREIGN KEY (organization_id)
    REFERENCES organization(id)
    ON DELETE CASCADE
);

CREATE TABLE trend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  type TEXT NOT NULL, -- daily / weekly / monthly
  total_mentions INT NOT NULL,
  positive_mentions INT NOT NULL,
  neutral_mentions INT NOT NULL,
  negative_mentions INT NOT NULL,
  average_sentiment_score FLOAT NOT NULL,
  average_virality_score FLOAT NOT NULL,
  source_breakdown JSONB NOT NULL,
  top_emotions TEXT[],
  organization_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_trend_organization
    FOREIGN KEY (organization_id)
    REFERENCES organization(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_user_org ON "user"(organization_id);
CREATE INDEX idx_source_org ON source(organization_id);
CREATE INDEX idx_mention_org ON mention(organization_id);
CREATE INDEX idx_mention_source ON mention(source_id);
CREATE INDEX idx_alert_org ON alert(organization_id);
CREATE INDEX idx_alert_status ON alert(status);
CREATE INDEX idx_trend_org_date ON trend(organization_id, date);

-- Rôles utilisateur
CREATE TYPE role AS ENUM ('USER', 'ADMIN');

-- Types de sources
CREATE TYPE source_type AS ENUM ('REDDIT', 'TWITTER', 'DISCORD', 'OTHER');

-- Sentiment
CREATE TYPE sentiment AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- Niveau d’alerte
CREATE TYPE alert_level AS ENUM ('LOW', 'MEDIUM', 'CRITICAL');

-- Statut d’alerte
CREATE TYPE alert_status AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED');

-- Type d’action
CREATE TYPE action_type AS ENUM ('RESPONSE', 'PRIVATE_MESSAGE', 'ARTICLE');

-- Type de rapport
CREATE TYPE report_type AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');
