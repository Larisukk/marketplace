-- V1__init.sql — PostgreSQL schema for Farmers Map (PostGIS version)

-- === Extensions (idempotent) ===
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- CITEXT type
CREATE EXTENSION IF NOT EXISTS postgis;    -- geography(Point,4326)
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- trigram indexes

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
    END
$$;
-- user_role → defines user permissions (USER, FARMER, ADMIN).
--
-- verification_status → defines farmer ID verification stage (PENDING, APPROVED, REJECTED).
--
-- unit_type → defines measurement units for product quantities (KG, L, PIECE, etc.).

-- === Users ===
CREATE TABLE IF NOT EXISTS users (
                                     id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     email             CITEXT NOT NULL UNIQUE,
                                     password_hash     TEXT NOT NULL,
                                     display_name      TEXT NOT NULL,
                                     phone             TEXT,
                                     role              user_role NOT NULL DEFAULT 'USER',
                                     created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
                                     updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === Media assets ===
CREATE TABLE IF NOT EXISTS media_assets (
                                            id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                            owner_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
                                            url               TEXT NOT NULL,
                                            storage_path      TEXT,
                                            mime_type         TEXT,
                                            size_bytes        BIGINT CHECK (size_bytes IS NULL OR size_bytes >= 0),
                                            created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Used for storing any uploaded files, such as:
--
-- Farmer ID cards
--
-- Product photos
--
-- Chat image attachments
--
-- ON DELETE SET NULL means if a user is deleted, their files remain but ownership is cleared.

-- === Farmer profiles & verification ===
CREATE TABLE IF NOT EXISTS farmer_profiles (
                                               user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                               farm_name             TEXT,
                                               bio                   TEXT,
                                               verification_status   verification_status NOT NULL DEFAULT 'PENDING',
                                               id_card_image_id      UUID REFERENCES media_assets(id) ON DELETE SET NULL,
                                               verified_at           TIMESTAMPTZ
);
-- Holds extra info for farmers that normal users don’t have.
-- ON DELETE CASCADE means if a user is deleted, their farmer profile is deleted too.

-- === Product taxonomy ===
CREATE TABLE IF NOT EXISTS categories (
                                          id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                          name              TEXT NOT NULL UNIQUE,
                                          parent_id         UUID REFERENCES categories(id) ON DELETE SET NULL
);
-- Allows hierarchical product organization (e.g., “Fruits → Citrus → Oranges”).

CREATE TABLE IF NOT EXISTS products (
                                        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        name              TEXT NOT NULL UNIQUE,
                                        category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
                                        created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Defines what products exist (used in listings).

CREATE INDEX IF NOT EXISTS idx_products_name_trgm    ON products   USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_categories_name_trgm  ON categories USING GIN (name gin_trgm_ops);

-- GIN + gin_trgm_ops → enables fast fuzzy text search on product and category names.

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
                                        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
                                        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Represents farmers’ ads that appear on the map.
-- location geography(Point,4326) is the actual coordinate stored in WGS84 format.

CREATE TABLE IF NOT EXISTS listing_images (
                                              id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                              listing_id        UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
                                              media_asset_id    UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
                                              sort_order        INTEGER NOT NULL DEFAULT 0
);
-- Allows multiple photos per listing.
-- sort_order controls display order.

CREATE INDEX IF NOT EXISTS idx_listings_product            ON listings(product_id);
CREATE INDEX IF NOT EXISTS idx_listings_price              ON listings(price_cents);
CREATE INDEX IF NOT EXISTS idx_listings_available          ON listings(available);
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm         ON listings USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_description_trgm   ON listings USING GIN (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_location_gix       ON listings USING GIST (location);

-- These indexes make filtering fast:
--
-- by product, price, or availability
--
-- by partial title search (LIKE 'tom%')

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

CREATE TABLE IF NOT EXISTS messages (
                                        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                                        sender_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                        body              TEXT,
                                        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
                                        read_at           TIMESTAMPTZ,
                                        is_deleted        BOOLEAN NOT NULL DEFAULT FALSE
);
-- Each message belongs to a conversation and can be soft-deleted.

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender                ON messages(sender_user_id);
-- Speed up fetching messages by conversation or sender.

CREATE TABLE IF NOT EXISTS message_attachments (
                                                   id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                   message_id        UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
                                                   media_asset_id    UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE
);
-- Allows messages to include images/files (stored in media_assets).

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
    ST_X(l.location::geometry) AS lon,   -- simple, correct cast
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

-- This view is like a shortcut “map-ready” table:
--
-- Combines all listing + product + farmer info
--
-- Converts PostGIS geography to longitude and latitude
--
-- Perfect for your Leaflet frontend’s API calls

-- === Seed data (idempotent) ===
INSERT INTO categories (id, name) VALUES
                                      (gen_random_uuid(),'Vegetables'),
                                      (gen_random_uuid(),'Fruits'),
                                      (gen_random_uuid(),'Dairy'),
                                      (gen_random_uuid(),'Meat')
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, category_id)
SELECT gen_random_uuid(), n, c.id
FROM (VALUES
          ('Tomatoes','Vegetables'),
          ('Potatoes','Vegetables'),
          ('Apples','Fruits'),
          ('Milk','Dairy'),
          ('Cheese','Dairy'),
          ('Eggs','Dairy'),
          ('Chicken','Meat')
     ) v(n, cat)
         JOIN categories c ON c.name = v.cat
ON CONFLICT DO NOTHING;

-- === updated_at triggers ===
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_trigger WHERE tgname = 'tr_users_set_updated_at') THEN
            CREATE TRIGGER tr_users_set_updated_at
                BEFORE UPDATE ON users
                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_trigger WHERE tgname = 'tr_listings_set_updated_at') THEN
            CREATE TRIGGER tr_listings_set_updated_at
                BEFORE UPDATE ON listings
                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        END IF;
    END
$$;
