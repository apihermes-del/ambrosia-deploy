-- ==============================================================================
-- AMBROSIA BAKERY ORDER OPERATIONS SYSTEM - SUPABASE SCHEMA
-- Phase 1: Customer Care, Cake Setting, Delivery Management & Outlet Handover
-- ==============================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'customer_care',
  'cake_setting',
  'delivery',
  'outlet'
);

CREATE TYPE order_type_enum AS ENUM (
  'home_delivery',
  'outlet_pickup'
);

CREATE TYPE order_status_enum AS ENUM (
  'new',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'collected',
  'cancelled'
);

CREATE TYPE item_status_enum AS ENUM (
  'pending',
  'preparing',
  'ready'
);

CREATE TYPE payment_status_enum AS ENUM (
  'paid',
  'partial',
  'pending_cod'
);

CREATE TYPE payment_mode_enum AS ENUM (
  'cash',
  'upi_qr',
  'card',
  'online',
  'none'
);

-- 2. KITCHENS TABLE (Multiple kitchens configuration)
CREATE TABLE IF NOT EXISTS kitchens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PICKUP / STORAGE LOCATIONS (Cake Section Chiller, Outlet Chillers, Counter)
CREATE TABLE IF NOT EXISTS pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cake_section', 'outlet_chiller', 'outlet_counter')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'customer_care',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. DAILY DELIVERY ROSTER (Drivers on duty)
CREATE TABLE IF NOT EXISTS delivery_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roster_date DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  is_on_duty BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (roster_date, user_id)
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tally_so_number TEXT NOT NULL UNIQUE,       -- Tally Sales Order #
  tally_si_number TEXT,                      -- Tally Sales Invoice # (filled after delivery/pickup)
  order_type order_type_enum NOT NULL,       -- 'home_delivery' or 'outlet_pickup'
  
  -- Customer Details
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_alt_phone TEXT,
  
  -- Delivery Location (Separated for rider privacy masking)
  delivery_area TEXT NOT NULL,                -- General area (visible to rider early, e.g. "Indiranagar")
  delivery_address TEXT,                     -- Full detailed address (masked until 'out_for_delivery')
  delivery_landmark TEXT,
  google_maps_link TEXT,
  
  -- Delivery Schedule
  delivery_date DATE NOT NULL,
  delivery_time_slot TEXT NOT NULL,          -- e.g. "14:00 - 16:00" or "16:30"
  target_delivery_time TIMESTAMPTZ NOT NULL, -- Target timestamp for sorting & lead alerts
  
  -- Status & Assignment
  status order_status_enum NOT NULL DEFAULT 'new',
  assigned_delivery_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  pickup_location_id UUID REFERENCES pickup_locations(id) ON DELETE SET NULL,
  
  -- Financials
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  advance_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  pending_amount NUMERIC(10, 2) GENERATED ALWAYS AS (total_amount - advance_paid) STORED,
  payment_status payment_status_enum NOT NULL DEFAULT 'pending_cod',
  delivery_payment_collected NUMERIC(10, 2) DEFAULT 0.00,
  delivery_payment_mode payment_mode_enum DEFAULT 'none',
  
  -- Notes & Audit
  special_notes TEXT,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. ORDER ITEMS TABLE (Supports multi-item orders & item-level kitchen assignment)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT DEFAULT 'Cakes',
  size_or_weight TEXT NOT NULL,              -- e.g. "1 kg", "500g", "6 pcs"
  quantity INTEGER NOT NULL DEFAULT 1,
  cake_message TEXT,                         -- Message on cake
  egg_preference TEXT DEFAULT 'eggless',     -- 'eggless' or 'with_egg'
  special_instructions TEXT,
  lead_time_minutes INTEGER NOT NULL DEFAULT 120, -- Default 2 hours
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE SET NULL,
  status item_status_enum NOT NULL DEFAULT 'pending',
  photo_url TEXT,                            -- Cake proof photo URL
  ready_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. ORDER STATUS LOGS (Audit Trail)
CREATE TABLE IF NOT EXISTS order_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status_enum,
  to_status order_status_enum NOT NULL,
  changed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR HIGH-SPEED FILTERING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_target_time ON orders(target_delivery_time);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_driver ON orders(assigned_delivery_user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_kitchen_id ON order_items(kitchen_id);

-- ==============================================================================
-- REALTIME PUBLICATION
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_roster;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================
INSERT INTO kitchens (name, description) VALUES
  ('Kitchen 1 - Sponge & Base Baking', 'Handles sponge baking, base prep, and breads'),
  ('Kitchen 2 - Icing, Setting & Decor', 'Handles whipping, icing, customized fondants, and messages'),
  ('Kitchen 3 - Pastries, Desserts & Savouries', 'Handles individual desserts, dry cakes, and confectionery')
ON CONFLICT DO NOTHING;

INSERT INTO pickup_locations (name, category) VALUES
  ('Cake Section Chiller (Dispatch)', 'cake_section'),
  ('Outlet Chiller 1 (Left)', 'outlet_chiller'),
  ('Outlet Chiller 2 (Right)', 'outlet_chiller'),
  ('Outlet Counter Display Chiller', 'outlet_counter')
ON CONFLICT DO NOTHING;
