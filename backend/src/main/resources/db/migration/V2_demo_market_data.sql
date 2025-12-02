-- ============================================================
-- V2__demo_market_data.sql
-- Demo seed data for search/filter testing
-- ============================================================

-- Uniqueness helpers required by ON CONFLICT targets
CREATE UNIQUE INDEX IF NOT EXISTS uq_media_assets_url
    ON media_assets (url);

CREATE UNIQUE INDEX IF NOT EXISTS uq_listing_images_listing_sort
    ON listing_images (listing_id, sort_order);

-- === Step 1: Farmers (users) ===
INSERT INTO users (email, password_hash, display_name, phone, role)
VALUES
    ('maria@farm.test',  '$argon2id$v=19$m=65536,t=3,p=1$dummy$hash', 'Maria Ionescu', '+40 721 000 111', 'FARMER'),
    ('andrei@farm.test', '$argon2id$v=19$m=65536,t=3,p=1$dummy$hash', 'Andrei Pop',    '+40 722 000 222', 'FARMER')
ON CONFLICT (email) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        phone        = EXCLUDED.phone,
        role         = EXCLUDED.role;

-- === Step 2: Media assets for farmer IDs ===
INSERT INTO media_assets (owner_user_id, url, mime_type, size_bytes)
VALUES
    ((SELECT id FROM users WHERE email='maria@farm.test'),  'https://demo.local/media/id/maria.png',  'image/png', 12345),
    ((SELECT id FROM users WHERE email='andrei@farm.test'), 'https://demo.local/media/id/andrei.png', 'image/png', 12345)
ON CONFLICT (url) DO NOTHING;

-- === Step 3: Farmer profiles ===
INSERT INTO farmer_profiles (user_id, farm_name, bio, verification_status, id_card_image_id, verified_at)
VALUES
    ((SELECT id FROM users WHERE email='maria@farm.test'),
     'Eco Cluj Farm', 'Local vegetables from Apuseni foothills', 'APPROVED',
     (SELECT id FROM media_assets WHERE url='https://demo.local/media/id/maria.png'), now()),
    ((SELECT id FROM users WHERE email='andrei@farm.test'),
     'Dobrogea Fresh', 'Seaside produce and dairy', 'APPROVED',
     (SELECT id FROM media_assets WHERE url='https://demo.local/media/id/andrei.png'), now())
ON CONFLICT (user_id) DO UPDATE
    SET verification_status='APPROVED', verified_at=now(),
        farm_name=EXCLUDED.farm_name, bio=EXCLUDED.bio,
        id_card_image_id=EXCLUDED.id_card_image_id;

-- === Step 4: Listings (lon,lat order!) ===
INSERT INTO listings
(farmer_user_id, product_id, title, description,
 price_cents, currency, quantity, unit, available,
 address_text, location)
VALUES
    ((SELECT id FROM users WHERE email='maria@farm.test'),
     (SELECT id FROM products WHERE name='Tomatoes'),
     'Tomatoes - Cluj', 'Sweet tomatoes, 2025 harvest',
     800, 'RON', 5, 'KG', TRUE, 'Cluj-Napoca',
     ST_SetSRID(ST_MakePoint(23.6236, 46.7712),4326)::geography),

    ((SELECT id FROM users WHERE email='maria@farm.test'),
     (SELECT id FROM products WHERE name='Apples'),
     'Apples - Apahida', 'Ionathan apples',
     600, 'RON', 10, 'KG', TRUE, 'Apahida',
     ST_SetSRID(ST_MakePoint(23.7800, 46.8330),4326)::geography),

    ((SELECT id FROM users WHERE email='andrei@farm.test'),
     (SELECT id FROM products WHERE name='Milk'),
     'Milk - Constanța', 'Raw cow milk',
     700, 'RON', 20, 'L', TRUE, 'Constanța',
     ST_SetSRID(ST_MakePoint(28.6348, 44.1598),4326)::geography),

    ((SELECT id FROM users WHERE email='andrei@farm.test'),
     (SELECT id FROM products WHERE name='Eggs'),
     'Eggs (10) - Constanța', 'Free-range eggs (box of 10)',
     1500, 'RON', 10, 'BOX', TRUE, 'Constanța',
     ST_SetSRID(ST_MakePoint(28.6420, 44.1800),4326)::geography),

    ((SELECT id FROM users WHERE email='maria@farm.test'),
     (SELECT id FROM products WHERE name='Chicken'),
     'Chicken - Brașov', 'Fresh chicken meat / kg',
     2200, 'RON', 15, 'KG', TRUE, 'Brașov',
     ST_SetSRID(ST_MakePoint(25.6012, 45.6579),4326)::geography),

    ((SELECT id FROM users WHERE email='maria@farm.test'),
     (SELECT id FROM products WHERE name='Tomatoes'),
     'Tomatoes - București', 'Greenhouse tomatoes',
     900, 'RON', 30, 'KG', TRUE, 'București',
     ST_SetSRID(ST_MakePoint(26.1025, 44.4268),4326)::geography),

    ((SELECT id FROM users WHERE email='andrei@farm.test'),
     (SELECT id FROM products WHERE name='Apples'),
     'Apples - Iași', 'Golden delicious',
     800, 'RON', 12, 'KG', TRUE, 'Iași',
     ST_SetSRID(ST_MakePoint(27.6014, 47.1585),4326)::geography),

    ((SELECT id FROM users WHERE email='andrei@farm.test'),
     (SELECT id FROM products WHERE name='Tomatoes'),
     'Tomatoes - Timișoara', 'Outdoor grown',
     700, 'RON', 8, 'KG', TRUE, 'Timișoara',
     ST_SetSRID(ST_MakePoint(21.2087, 45.7489),4326)::geography)
ON CONFLICT DO NOTHING;

-- === Step 5: Demo media for listings ===
WITH urls(title, url) AS (
    VALUES
        ('Tomatoes - Cluj',       'https://demo.local/media/listings/tomatoes_cluj_1.jpg'),
        ('Apples - Apahida',      'https://demo.local/media/listings/apples_apahida_1.jpg'),
        ('Milk - Constanța',      'https://demo.local/media/listings/milk_constanta_1.jpg'),
        ('Eggs (10) - Constanța', 'https://demo.local/media/listings/eggs_constanta_1.jpg'),
        ('Chicken - Brașov',      'https://demo.local/media/listings/chicken_brasov_1.jpg'),
        ('Tomatoes - București',  'https://demo.local/media/listings/tomatoes_bucuresti_1.jpg'),
        ('Apples - Iași',         'https://demo.local/media/listings/apples_iasi_1.jpg'),
        ('Tomatoes - Timișoara',  'https://demo.local/media/listings/tomatoes_timisoara_1.jpg')
)
INSERT INTO media_assets (url, mime_type, size_bytes)
SELECT u.url, 'image/jpeg', 204800 FROM urls u
ON CONFLICT (url) DO NOTHING;

-- === Step 6: Link images to listings ===
WITH urls(title, url) AS (
    VALUES
        ('Tomatoes - Cluj',       'https://demo.local/media/listings/tomatoes_cluj_1.jpg'),
        ('Apples - Apahida',      'https://demo.local/media/listings/apples_apahida_1.jpg'),
        ('Milk - Constanța',      'https://demo.local/media/listings/milk_constanta_1.jpg'),
        ('Eggs (10) - Constanța', 'https://demo.local/media/listings/eggs_constanta_1.jpg'),
        ('Chicken - Brașov',      'https://demo.local/media/listings/chicken_brasov_1.jpg'),
        ('Tomatoes - București',  'https://demo.local/media/listings/tomatoes_bucuresti_1.jpg'),
        ('Apples - Iași',         'https://demo.local/media/listings/apples_iasi_1.jpg'),
        ('Tomatoes - Timișoara',  'https://demo.local/media/listings/tomatoes_timisoara_1.jpg')
)
INSERT INTO listing_images (listing_id, media_asset_id, sort_order)
SELECT l.id, m.id, 0
FROM urls u
         JOIN listings l ON l.title = u.title
         JOIN media_assets m ON m.url = u.url
ON CONFLICT (listing_id, sort_order) DO NOTHING;

-- === Step 7: Quick verification ===
-- (You can run this manually to check data)
-- SELECT id, title, price_cents / 100.0 AS price_ron, lon, lat, product_name, farmer_name FROM v_listings_public;
