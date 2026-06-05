-- ==========================================
-- 1. Seed Roles & Permissions
-- ==========================================
INSERT INTO roles (id, name) VALUES
('1111111-1111-4111-8111-111111111111', 'Admin'),
('2222222-2222-4222-8222-222222222222', 'Photographer'),
('3333333-3333-4333-8333-333333333333', 'Rental Manager'),
('4444444-4444-4444-8444-444444444444', 'Customer')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO permissions (id, name) VALUES
('0000001-0000-4000-9000-000000000001', '*'),
('0000002-0000-4000-9000-000000000002', 'bookings:read'),
('0000003-0000-4000-9000-000000000003', 'bookings:write-status'),
('0000004-0000-4000-9000-000000000004', 'gallery:write'),
('0000005-0000-4000-9000-000000000005', 'rentals:read'),
('0000006-0000-4000-9000-000000000006', 'rentals:write'),
('0000007-0000-4000-9000-000000000007', 'inventory:read'),
('0000008-0000-4000-9000-000000000008', 'products:read'),
('0000009-0000-4000-9000-000000000009', 'gallery:read'),
('0000010-0000-4000-9000-000000000010', 'bookings:create'),
('0000011-0000-4000-9000-000000000011', 'bookings:read-own'),
('0000012-0000-4000-9000-000000000012', 'rentals:create'),
('0000013-0000-4000-9000-000000000013', 'rentals:read-own'),
('0000014-0000-4000-9000-000000000014', 'orders:create'),
('0000015-0000-4000-9000-000000000015', 'orders:read-own')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO role_permissions (role_id, permission_id) VALUES
('1111111-1111-4111-8111-111111111111', '0000001-0000-4000-9000-000000000001')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 2. Seed Default Admin User
-- ==========================================
-- Pass hash is pre-calculated bcrypt of 'password123'
INSERT INTO users (id, email, password_hash, first_name, last_name, phone) VALUES
('11111111-1111-4111-a111-111111111111', 'admin@platform.com', '$2a$10$231HdAZzyoE76tiGfRJLaeol1sYN7wc0KPZfMK/QrDSn1Qh2HVRqe', 'John', 'Admin', '+1234567890')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_roles (user_id, role_id) VALUES
('11111111-1111-4111-a111-111111111111', 'r1111111-1111-4111-8111-111111111111')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. Seed Default Gallery Album
-- ==========================================
INSERT INTO gallery_albums (id, name, description) VALUES
('0000000-0000-4000-a000-000000000000', 'Default Album', 'Default workspace album for photo submissions')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;
