-- V1__init.sql — PostgreSQL schema for Farmers Map (PostGIS version)
-- fresh-all-in-one: drop DB, recreate, run this.

-- === Extensions (idempotent) ===
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- CITEXT type
CREATE EXTENSION IF NOT EXISTS postgis;    -- geography(Point,4326)
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- trigram indexes
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- optional, for tools expecting it

-- === Enums (idempotent via catalog checks) ===
DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('USER','FARMER','ADMIN');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_type WHERE typname = 'verification_status') THEN
            CREATE TYPE verification_status AS ENUM ('PENDING','APPROVED','REJECTED');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_type WHERE typname = 'unit_type') THEN
            CREATE TYPE unit_type AS ENUM ('KG','G','L','ML','PIECE','BUNCH','BOX','PACK');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_type WHERE typname = 'notification_type') THEN
            CREATE TYPE notification_type AS ENUM ('SYSTEM','CHAT','ORDER','LISTING');
        END IF;
    END
$$;

-- === Users ===
CREATE TABLE IF NOT EXISTS users (
                                     id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     email             CITEXT NOT NULL UNIQUE,
                                     password_hash     TEXT NOT NULL,
                                     display_name      TEXT NOT NULL,
                                     phone             TEXT,
                                     role              user_role NOT NULL DEFAULT 'USER',
                                     email_verified_at TIMESTAMPTZ,
                                     is_active         BOOLEAN NOT NULL DEFAULT TRUE,
                                     last_login_at     TIMESTAMPTZ,
                                     created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
                                     updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast fuzzy search by display name (optional but handy)
CREATE INDEX IF NOT EXISTS idx_users_display_name_trgm ON users USING GIN (display_name gin_trgm_ops);

-- === Media assets ===
CREATE TABLE IF NOT EXISTS media_assets (
                                            id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                            owner_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
                                            url               TEXT NOT NULL,
                                            storage_path      TEXT,
                                            checksum_sha256   TEXT,                                 -- helps dedupe
                                            width_px          INTEGER CHECK (width_px IS NULL OR width_px > 0),
                                            height_px         INTEGER CHECK (height_px IS NULL OR height_px > 0),
                                            mime_type         TEXT,
                                            size_bytes        BIGINT CHECK (size_bytes IS NULL OR size_bytes >= 0),
                                            created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_owner ON media_assets(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_media_checksum ON media_assets(checksum_sha256);

-- === Farmer profiles & verification ===
CREATE TABLE IF NOT EXISTS farmer_profiles (
                                               user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                               farm_name             TEXT,
                                               bio                   TEXT,
                                               verification_status   verification_status NOT NULL DEFAULT 'PENDING',
                                               id_card_image_id      UUID REFERENCES media_assets(id) ON DELETE SET NULL,
                                               verified_at           TIMESTAMPTZ,
                                               updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === Product taxonomy ===
CREATE TABLE IF NOT EXISTS categories (
                                          id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                          name              TEXT NOT NULL UNIQUE,
                                          parent_id         UUID REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS products (
                                        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        name              TEXT NOT NULL UNIQUE,
                                        category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
                                        created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_name_trgm    ON products   USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_categories_name_trgm  ON categories USING GIN (name gin_trgm_ops);

-- === Listings (geo) ===
CREATE TABLE IF NOT EXISTS listings (
                                        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        farmer_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                        product_id        UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
                                        title             TEXT NOT NULL,
                                        description       TEXT,
                                        price_cents       INTEGER NOT NULL CHECK (price_cents >= 0),
                                        currency          CHAR(3) NOT NULL DEFAULT 'RON',
                                        quantity          NUMERIC(12,3) NOT NULL CHECK (quantity >= 0),
                                        unit              unit_type NOT NULL,
                                        available         BOOLEAN NOT NULL DEFAULT TRUE,
                                        address_text      TEXT,
                                        location          geography(Point, 4326) NOT NULL, -- WGS84 lon/lat as a point
                                        expires_at        TIMESTAMPTZ,                      -- optional: auto-hide listings after a date
                                        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
                                        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listing_images (
                                              id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                              listing_id        UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
                                              media_asset_id    UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
                                              sort_order        INTEGER NOT NULL DEFAULT 0
);

-- Saved/Favorites
CREATE TABLE IF NOT EXISTS saved_listings (
                                              user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                              listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
                                              created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                                              PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_listings_product            ON listings(product_id);
CREATE INDEX IF NOT EXISTS idx_listings_price              ON listings(price_cents);
CREATE INDEX IF NOT EXISTS idx_listings_available          ON listings(available);
CREATE INDEX IF NOT EXISTS idx_listings_created_at         ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm         ON listings USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_description_trgm   ON listings USING GIN (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_location_gix       ON listings USING GIST (location);

-- === Chat ===
CREATE TABLE IF NOT EXISTS conversations (
                                             id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                             created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
                                                         conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                                                         user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                                         PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_conv_part_user ON conversation_participants(user_id);

CREATE TABLE IF NOT EXISTS messages (
                                        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                                        sender_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                        body              TEXT,
                                        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
                                        read_at           TIMESTAMPTZ,         -- global read (legacy/simple)
                                        is_deleted        BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender                ON messages(sender_user_id);

CREATE TABLE IF NOT EXISTS message_attachments (
                                                   id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                   message_id        UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
                                                   media_asset_id    UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE
);

-- Per-recipient read tracking (robust read receipts)
CREATE TABLE IF NOT EXISTS message_reads (
                                             message_id  UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
                                             user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                             read_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
                                             PRIMARY KEY (message_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);

-- User blocks (abuse control)
CREATE TABLE IF NOT EXISTS user_blocks (
                                           blocker_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                           blocked_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                           created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
                                           PRIMARY KEY (blocker_user_id, blocked_user_id),
                                           CHECK (blocker_user_id <> blocked_user_id)
);

-- Reports (moderation)
CREATE TABLE IF NOT EXISTS reports (
                                       id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                       reporter_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                       target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                                       conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
                                       message_id     UUID REFERENCES messages(id) ON DELETE SET NULL,
                                       reason         TEXT NOT NULL,
                                       created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
                                       resolved_at    TIMESTAMPTZ
);

-- === Notifications (generic) ===
CREATE TABLE IF NOT EXISTS notifications (
                                             id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                             user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                             type         notification_type NOT NULL,
                                             payload      JSONB NOT NULL,               -- flexible (message preview, listing id, etc.)
                                             is_read      BOOLEAN NOT NULL DEFAULT FALSE,
                                             created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- === Auth: email verification, password resets, refresh sessions ===
-- Store only HASHES of tokens (never raw tokens)

CREATE TABLE IF NOT EXISTS email_verification_tokens (
                                                         user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                                         token_hash  TEXT NOT NULL,
                                                         expires_at  TIMESTAMPTZ NOT NULL,
                                                         created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                                                         PRIMARY KEY (user_id, token_hash)
);
CREATE INDEX IF NOT EXISTS idx_email_verify_expires ON email_verification_tokens(expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
                                                     user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                                     token_hash  TEXT NOT NULL,
                                                     expires_at  TIMESTAMPTZ NOT NULL,
                                                     created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                                                     PRIMARY KEY (user_id, token_hash)
);
CREATE INDEX IF NOT EXISTS idx_pwdreset_expires ON password_reset_tokens(expires_at);

-- Refresh tokens / sessions (optional but recommended for web/mobile)
CREATE TABLE IF NOT EXISTS auth_sessions (
                                             id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                             user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                             refresh_token_hash TEXT NOT NULL,
                                             user_agent        TEXT,
                                             ip_address        INET,
                                             created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
                                             expires_at        TIMESTAMPTZ NOT NULL,
                                             revoked_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at);

-- === Public view for map consumption (fixed cast) ===
CREATE OR REPLACE VIEW v_listings_public AS
SELECT
    l.id,
    l.title,
    l.description,
    l.price_cents,
    l.currency,
    l.quantity,
    l.unit,
    l.available,
    l.address_text,
    ST_X(l.location::geometry) AS lon,
    ST_Y(l.location::geometry) AS lat,
    p.name AS product_name,
    c.name AS category_name,
    u.display_name AS farmer_name,
    l.created_at,
    l.updated_at
FROM listings l
         JOIN products p ON p.id = l.product_id
         LEFT JOIN categories c ON c.id = p.category_id
         JOIN users u ON u.id = l.farmer_user_id;

-- === Seed data (idempotent) ===
INSERT INTO categories (id, name) VALUES
                                      (gen_random_uuid(),'Vegetables'),
                                      (gen_random_uuid(),'Fruits'),
                                      (gen_random_uuid(),'Dairy'),
                                      (gen_random_uuid(),'Meat')
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, category_id)
SELECT gen_random_uuid(), v.n, c.id
FROM (VALUES
          ('Tomatoes','Vegetables'),
          ('Potatoes','Vegetables'),
          ('Apples','Fruits'),
          ('Milk','Dairy'),
          ('Cheese','Dairy'),
          ('Eggs','Dairy'),
          ('Chicken','Meat')
     ) AS v(n, cat)
         JOIN categories c ON c.name = v.cat
ON CONFLICT DO NOTHING;

-- === updated_at triggers ===
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_users_set_updated_at') THEN
            CREATE TRIGGER tr_users_set_updated_at
                BEFORE UPDATE ON users
                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_listings_set_updated_at') THEN
            CREATE TRIGGER tr_listings_set_updated_at
                BEFORE UPDATE ON listings
                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_farmer_profiles_set_updated_at') THEN
            CREATE TRIGGER tr_farmer_profiles_set_updated_at
                BEFORE UPDATE ON farmer_profiles
                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        END IF;
    END
$$;

-- === Helpful partial indexes / constraints ===
-- Only available & not expired listings for quick search
CREATE INDEX IF NOT EXISTS idx_listings_available_expires
    ON listings(available, expires_at);
