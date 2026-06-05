-- ==========================================
-- 1. Seed Roles & Permissions
-- ==========================================
INSERT INTO roles (id, name) VALUES
('11111111-1111-4111-8111-111111111111', 'Admin'),
('22222222-2222-4222-8222-222222222222', 'Photographer'),
('33333333-3333-4333-8333-333333333333', 'Rental Manager'),
('44444444-4444-4444-8444-444444444444', 'Customer')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO permissions (id, name) VALUES
('00000001-0000-4000-9000-000000000001', '*'),
('00000002-0000-4000-9000-000000000002', 'bookings:read'),
('00000003-0000-4000-9000-000000000003', 'bookings:write-status'),
('00000004-0000-4000-9000-000000000004', 'gallery:write'),
('00000005-0000-4000-9000-000000000005', 'rentals:read'),
('00000006-0000-4000-9000-000000000006', 'rentals:write'),
('00000007-0000-4000-9000-000000000007', 'inventory:read'),
('00000008-0000-4000-9000-000000000008', 'products:read'),
('00000009-0000-4000-9000-000000000009', 'gallery:read'),
('00000010-0000-4000-9000-000000000010', 'bookings:create'),
('00000011-0000-4000-9000-000000000011', 'bookings:read-own'),
('00000012-0000-4000-9000-000000000012', 'rentals:create'),
('00000013-0000-4000-9000-000000000013', 'rentals:read-own'),
('00000014-0000-4000-9000-000000000014', 'orders:create'),
('00000015-0000-4000-9000-000000000015', 'orders:read-own')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO role_permissions (role_id, permission_id) VALUES
('11111111-1111-4111-8111-111111111111', '00000001-0000-4000-9000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id) VALUES
('22222222-2222-4222-8222-222222222222', '00000002-0000-4000-9000-000000000002'),
('22222222-2222-4222-8222-222222222222', '00000003-0000-4000-9000-000000000003'),
('22222222-2222-4222-8222-222222222222', '00000004-0000-4000-9000-000000000004')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id) VALUES
('33333333-3333-4333-8333-333333333333', '00000005-0000-4000-9000-000000000005'),
('33333333-3333-4333-8333-333333333333', '00000006-0000-4000-9000-000000000006'),
('33333333-3333-4333-8333-333333333333', '00000007-0000-4000-9000-000000000007')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id) VALUES
('44444444-4444-4444-8444-444444444444', '00000008-0000-4000-9000-000000000008'),
('44444444-4444-4444-8444-444444444444', '00000009-0000-4000-9000-000000000009'),
('44444444-4444-4444-8444-444444444444', '00000010-0000-4000-9000-000000000010'),
('44444444-4444-4444-8444-444444444444', '00000011-0000-4000-9000-000000000011'),
('44444444-4444-4444-8444-444444444444', '00000012-0000-4000-9000-000000000012'),
('44444444-4444-4444-8444-444444444444', '00000013-0000-4000-9000-000000000013'),
('44444444-4444-4444-8444-444444444444', '00000014-0000-4000-9000-000000000014'),
('44444444-4444-4444-8444-444444444444', '00000015-0000-4000-9000-000000000015')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 2. Seed Users
-- ==========================================
INSERT INTO users (id, email, password_hash, first_name, last_name, phone) VALUES
('11111111-1111-4111-a111-111111111111', 'admin@platform.com', '$2a$10$231HdAZzyoE76tiGfRJLaeol1sYN7wc0KPZfMK/QrDSn1Qh2HVRqe', 'John', 'Admin', '+1234567890'),
('22222222-2222-4222-a222-222222222222', 'photographer@platform.com', '$2a$10$231HdAZzyoE76tiGfRJLaeol1sYN7wc0KPZfMK/QrDSn1Qh2HVRqe', 'Alice', 'Lens', '+1234567891'),
('33333333-3333-4333-a333-333333333333', 'rental@platform.com', '$2a$10$231HdAZzyoE76tiGfRJLaeol1sYN7wc0KPZfMK/QrDSn1Qh2HVRqe', 'Bob', 'Gear', '+1234567892'),
('44444444-4444-4444-a444-444444444444', 'customer@platform.com', '$2a$10$231HdAZzyoE76tiGfRJLaeol1sYN7wc0KPZfMK/QrDSn1Qh2HVRqe', 'Sarah', 'Buyer', '+1234567893')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_roles (user_id, role_id) VALUES
('11111111-1111-4111-a111-111111111111', '11111111-1111-4111-8111-111111111111'),
('22222222-2222-4222-a222-222222222222', '22222222-2222-4222-8222-222222222222'),
('33333333-3333-4333-a333-333333333333', '33333333-3333-4333-8333-333333333333'),
('44444444-4444-4444-a444-444444444444', '44444444-4444-4444-8444-444444444444')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. Seed Inventory Categories & Items
-- ==========================================
INSERT INTO inventory_categories (id, name) VALUES
('01111111-1111-4111-e011-111111111111', 'Stationery'),
('02222222-2222-4222-e022-222222222222', 'Camera'),
('03333333-3333-4333-e033-333333333333', 'Lens'),
('04444444-4444-4444-e044-444444444444', 'Lighting')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO inventory_items (id, category_id, name, sku, description, type, total_quantity, available_quantity, price_per_day, sale_price, status) VALUES
('01111111-1111-4111-b111-111111111111', '01111111-1111-4111-e011-111111111111', 'Premium Leather Sketchbook', 'SKB-PRM-001', 'Hardcover bound A5 sketchbook with 180gsm cartridge paper.', 'Sale', 100, 100, NULL, 24.99, 'Available'),
('02222222-2222-4222-b222-222222222222', '01111111-1111-4111-e011-111111111111', 'Calligraphy Fountain Pen Set', 'PEN-CAL-002', 'Classic wood fountain pen with 5 nib sizes and ink reservoir.', 'Sale', 50, 50, NULL, 39.50, 'Available'),
('03333333-3333-4333-b333-333333333333', '01111111-1111-4111-e011-111111111111', 'Metallic Gel Pen Pack (12 Colors)', 'PEN-GEL-003', 'Smooth writing high-opacity metallic inks perfect for dark paper.', 'Sale', 200, 200, NULL, 12.99, 'Available'),
('11111111-1111-4111-c111-111111111111', '02222222-2222-4222-e022-222222222222', 'Sony Alpha 7 IV Mirrorless', 'CAM-SON-74', '33MP full-frame mirrorless camera with high-speed autofocus.', 'Rental', 5, 5, 75.00, NULL, 'Available'),
('22222222-2222-4222-c222-222222222222', '02222222-2222-4222-e022-222222222222', 'Canon EOS R5 Full-Frame', 'CAM-CAN-R5', '45MP photo quality with 8K video capture capabilities.', 'Rental', 3, 3, 95.00, NULL, 'Available'),
('31111111-1111-4111-d111-111111111111', '03333333-3333-4333-e033-333333333333', 'Sony FE 24-70mm f/2.8 GM II', 'LNS-SON-2470', 'Premium G Master standard zoom lens for weddings and portraits.', 'Rental', 8, 8, 40.00, NULL, 'Available'),
('41111111-1111-4111-e111-111111111111', '04444444-4444-4444-e044-444444444444', 'Profoto B10X Location Flash', 'LGT-PRO-B10', '250Ws powerful off-camera flash with continuous modeling light.', 'Rental', 4, 4, 55.00, NULL, 'Available')
ON CONFLICT (sku) DO UPDATE SET total_quantity = EXCLUDED.total_quantity;

-- ==========================================
-- 4. Seed Gallery Albums & Gallery Media
-- ==========================================
INSERT INTO gallery_albums (id, name, description) VALUES
('00000000-0000-4000-a000-000000000000', 'Default Album', 'Default workspace album for photo submissions')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO gallery_media (id, album_id, photographer_id, title, description, image_url, tags, dimensions, size_bytes) VALUES
('11111111-1111-4111-f111-111111111111', '00000000-0000-4000-a000-000000000000', '22222222-2222-4222-a222-222222222222', 'Sunset Beach Wedding', 'A romantic wedding photoshoot on the beaches of Maui during golden hour.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', ARRAY['wedding', 'beach', 'sunset', 'couple'], '{"width": 1200, "height": 800}'::jsonb, 450000),
('22222222-2222-4222-f222-222222222222', '00000000-0000-4000-a000-000000000000', '22222222-2222-4222-a222-222222222222', 'Rustic Forest Wedding', 'Ethereal forest background featuring warm fairy lights and classic elegance.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', ARRAY['wedding', 'forest', 'nature', 'lights'], '{"width": 1200, "height": 800}'::jsonb, 520000),
('33333333-3333-4333-f333-333333333333', '00000000-0000-4000-a000-000000000000', '22222222-2222-4222-a222-222222222222', 'Modern Studio Portraiture', 'Sleek studio headshots focusing on lighting transitions and shadow styling.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', ARRAY['portrait', 'studio', 'lighting', 'fashion'], '{"width": 1000, "height": 1000}'::jsonb, 380000)
ON CONFLICT (id) DO NOTHING;