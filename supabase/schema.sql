-- ============================================================================
-- Vistāra Krafts & POTRY Ceramics — Complete Supabase PostgreSQL Schema
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Profiles Table (Patron Profiles synced with auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  gender_preference TEXT NOT NULL DEFAULT 'universal' CHECK (gender_preference IN ('masculine', 'feminine', 'universal')),
  provider TEXT NOT NULL DEFAULT 'email',
  wishlist JSONB NOT NULL DEFAULT '[]'::jsonb,
  member_tier TEXT NOT NULL DEFAULT 'Verified Vistāra Patron',
  loyalty_points INTEGER NOT NULL DEFAULT 250,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-provision profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, provider, gender_preference)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.app_metadata->>'provider', 'email'),
    COALESCE(NEW.raw_user_meta_data->>'gender_preference', 'universal')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = CASE WHEN public.profiles.full_name = '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. Products Table (Master Catalog & Supplementary Varieties)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Vistāra Krafts',
  category TEXT NOT NULL DEFAULT 'keepsake', -- 'keepsake' | 'chemical' | 'art_decor' | 'ceramic' | 'homeware'
  subcategory TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL,
  compare_at_price NUMERIC(10, 2) DEFAULT 0,
  discount INTEGER DEFAULT 0,
  tax INTEGER DEFAULT 18,
  stock INTEGER NOT NULL DEFAULT 10,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'draft' | 'archived'
  featured BOOLEAN NOT NULL DEFAULT false,
  image TEXT NOT NULL,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb, -- Supplementary optional colors
  shapes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Supplementary optional shapes
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Supplementary optional sizes
  gender TEXT NOT NULL DEFAULT 'all',        -- 'all' | 'women' | 'men'
  gender_affinity TEXT DEFAULT 'neutral',    -- 'neutral' | 'feminine' | 'masculine'
  description TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

DROP TRIGGER IF EXISTS on_products_updated ON public.products;
CREATE TRIGGER on_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 3. Orders Table (Shared Order Fulfillment Pipeline)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL DEFAULT '',
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'razorpay',
  gift_wrap BOOLEAN NOT NULL DEFAULT false,
  mockup_approved BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'placed', -- 'placed' | 'mockup_approved' | 'curing' | 'polishing' | 'shipped' | 'delivered'
  stage_index INTEGER NOT NULL DEFAULT 1,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  courier TEXT NOT NULL DEFAULT 'BlueDart Priority Air',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

DROP TRIGGER IF EXISTS on_orders_updated ON public.orders;
CREATE TRIGGER on_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. Inventory Movement Audit Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  change INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'RESTOCK' | 'DAMAGED' | 'AUDIT' | 'RETURN' | 'SALE'
  notes TEXT DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory_logs(sku);

-- ============================================================================
-- 5. Payments Table (Razorpay Gateway Reconciliation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'captured', -- 'captured' | 'pending' | 'failed' | 'refunded'
  method TEXT NOT NULL DEFAULT 'upi',
  razorpay_order_id TEXT DEFAULT '',
  razorpay_signature TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON public.payments(payment_id);

-- ============================================================================
-- 6. System Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 7. Coupons Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 8. Custom Mockups Table (Bridal Keepsake Inquiries)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.custom_mockups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preservation_type TEXT NOT NULL,
  mould_shape TEXT NOT NULL,
  dimensions TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted' | 'designing' | 'approved'
  photos JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of Cloudinary URLs
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 9. DPDP Act 2023 Consent Audit Ledger
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dpdp_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL, -- 'essential' | 'analytics' | 'marketing'
  granted BOOLEAN NOT NULL DEFAULT true,
  ip_address TEXT DEFAULT 'client-verified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- Row Level Security (RLS) Setup
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_mockups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpdp_consents ENABLE ROW LEVEL SECURITY;

-- Products RLS
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin write products" ON public.products
  FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

-- Profiles RLS
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public insert profiles on signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Orders RLS
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

-- Inventory Logs RLS
CREATE POLICY "Admin view inventory logs" ON public.inventory_logs
  FOR SELECT USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Admin write inventory logs" ON public.inventory_logs
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

-- Payments RLS
CREATE POLICY "Admin view payments" ON public.payments
  FOR SELECT USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "System insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

-- Settings & Coupons RLS
CREATE POLICY "Public view settings" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Public view coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

-- DPDP & Mockups RLS
CREATE POLICY "Users manage mockups" ON public.custom_mockups
  FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Public record consent" ON public.dpdp_consents
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- Supabase Realtime CDC Publication
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_logs;

-- ============================================================================
-- Initial Seed Catalog: 12 Flagship Master SKUs
-- ============================================================================
INSERT INTO public.products (
  id, sku, name, brand, category, subcategory, price, compare_at_price, stock, in_stock, status, featured,
  image, colors, shapes, sizes, gender, gender_affinity, description
) VALUES
(
  'ram-varmala-001',
  'RAM-VK-HEX-3500',
  'Eternal Varmala 50mm Floral Keepsake Block',
  'Resin Art Memories',
  'keepsake',
  'varmala_preservation',
  4499.00,
  5499.00,
  18,
  true,
  'active',
  true,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/varmala-block.jpg',
  '["Royal Gold", "Champagne Rose", "UltraClear Archival"]'::jsonb,
  '["Mughal Arch", "Romantic Cube", "Geode Hexagon", "Heirloom Disc"]'::jsonb,
  '["8-inch Desk Mini", "12-inch Royal Heirloom", "16-inch Gallery Mantel"]'::jsonb,
  'women',
  'feminine',
  'Handcrafted 50mm diamond-clear acrylic-epoxy crystal block preserving heirloom wedding varmala blooms and sacred petals in non-yellowing HALS epoxy.'
),
(
  'vk-epx-301',
  'VK-EPX-301-12K',
  'UltraClear 3:1 Optical Casting Resin Kit (1.2kg)',
  'Vistāra Krafts',
  'chemical',
  'casting_3_1',
  1299.00,
  1499.00,
  42,
  true,
  'active',
  true,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/ultraclear-3-1.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  '["400g Starter Kit", "1.2kg Studio Pack", "4.0kg Bulk Workshop Kit", "12kg Commercial Pack"]'::jsonb,
  'all',
  'neutral',
  'ISO-9001 certified low-viscosity optical epoxy casting system with HALS UV stabilizers and bubble-release formulation.'
),
(
  'ram-keep-002',
  'RAM-OCN-TRY-01',
  'Maldives Ocean Wave Teak Charcuterie & Vanity Tray',
  'Resin Art Memories',
  'keepsake',
  'home_decor',
  2199.00,
  2799.00,
  15,
  true,
  'active',
  true,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/ocean-wave-tray.jpg',
  '["Maldives Deep Navy", "Caribbean Emerald", "Midnight Obsidian & Gold Leaf"]'::jsonb,
  '["14-inch Serving Board", "18-inch Live-Edge Paddle", "12-inch Round Vanity Platter"]'::jsonb,
  '["Standard 14-inch Tray", "Grand 18-inch Board + 4 Coasters Combo"]'::jsonb,
  'men',
  'masculine',
  'Hand-poured multi-layer ocean wave resin art over seasoned Burma Teak with food-safe high gloss finish.'
),
(
  'vk-epx-201',
  'VK-EPX-201-3KG',
  'DeepPour 2:1 River Table Casting Epoxy (3kg)',
  'Vistāra Krafts',
  'chemical',
  'deep_pour_2_1',
  2899.00,
  3499.00,
  25,
  true,
  'active',
  false,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/deeppour-2-1.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  '["1.5kg Kit", "3.0kg River Pack", "7.5kg Furniture Kit", "15kg Contractor Drum"]'::jsonb,
  'all',
  'neutral',
  'Slow-curing deep-pour epoxy casting resin engineered for monolithic pours up to 50mm single layer with ultra-low exotherm.'
),
(
  'potry-pitcher-001',
  'POTRY-PTCH-1200',
  'Sienna Ridged Terracotta Pitcher (1200ml)',
  'POTRY',
  'ceramic',
  'tableware',
  2850.00,
  3200.00,
  22,
  true,
  'active',
  true,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/potry-pitcher.jpg',
  '["Sienna Rust", "Wabi White", "Smoked Matte Charcoal"]'::jsonb,
  '["Fluted Ridges", "Round Belly Silhouette"]'::jsonb,
  '["1200ml Table Pitcher"]'::jsonb,
  'all',
  'neutral',
  'Wheel-thrown stoneware pitcher with ridged tactile body and lead-free food-grade interior glaze.'
),
(
  'vk-epx-101',
  'VK-EPX-101-1KG',
  'GlassGloss 1:1 Art & Doming Topcoat Resin (1kg)',
  'Vistāra Krafts',
  'chemical',
  'doming_1_1',
  999.00,
  1249.00,
  38,
  true,
  'active',
  false,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/glassgloss-1-1.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  '["500g Artist Duo", "1.0kg Studio Kit", "2.0kg Workshop Duo"]'::jsonb,
  'all',
  'neutral',
  'Equal-ratio 1:1 high-viscosity self-leveling topcoat epoxy for mirror-like doming, canvas sealing, and jewelry.'
),
(
  'ram-clock-geode',
  'RAM-CLK-GEO-16',
  'Royal Amethyst Geode Wall Clock with Raw Quartz (16-inch)',
  'Resin Art Memories',
  'art_decor',
  'wall_art',
  5499.00,
  6999.00,
  8,
  true,
  'active',
  true,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/geode-clock.jpg',
  '["Royal Amethyst Purple", "Emerald Geode", "Rose Quartz Blush"]'::jsonb,
  '["16-inch Circular Geode", "18-inch Irregular Raw Slice"]'::jsonb,
  '["16-inch Standard", "18-inch Grand Statement"]'::jsonb,
  'women',
  'feminine',
  'Luxurious geode wall clock with genuine Brazilian crushed quartz points, gold leaf veins, and silent quartz movement.'
),
(
  'potry-mug-002',
  'POTRY-MUG-350',
  'Raw Oatmeal Matte Stoneware Coffee Mug (350ml)',
  'POTRY',
  'ceramic',
  'drinkware',
  850.00,
  1050.00,
  45,
  true,
  'active',
  false,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/potry-mug.jpg',
  '["Raw Oatmeal Sand", "Speckled Chalk White", "Earthy Umber"]'::jsonb,
  '["Ergonomic Wide Handle", "Chubby Thumb-Rest"]'::jsonb,
  '["350ml Standard"]'::jsonb,
  'all',
  'neutral',
  'Artisan high-fired stoneware mug featuring exposed raw clay bottom and tactile speckled oatmeal matte glaze.'
),
(
  'vk-uv-fast',
  'VK-UV-FAST-250',
  'SunCure Single-Part UV Resin (250g)',
  'Vistāra Krafts',
  'chemical',
  'uv_resin',
  699.00,
  849.00,
  60,
  true,
  'active',
  false,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/suncure-uv.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  '["100g Squeeze Bottle", "250g Studio Refill Bottle"]'::jsonb,
  'all',
  'neutral',
  'Single-component UV curing resin that cures crystal clear in 2-4 minutes under 365nm-395nm UV lamp.'
),
(
  'ram-coasters-gold',
  'RAM-CST-GLD-04',
  '24K Gold Leaf Hexagonal Coasters (Set of 4)',
  'Resin Art Memories',
  'art_decor',
  'barware',
  1299.00,
  1699.00,
  28,
  true,
  'active',
  false,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/gold-coasters.jpg',
  '["Clear & Gold Flakes", "Emerald & Gold", "White Marble & Gold"]'::jsonb,
  '["Hexagon Faceted", "Organic Geode Edges"]'::jsonb,
  '["Set of 4 Coasters", "Set of 6 + Holder"]'::jsonb,
  'all',
  'neutral',
  'Set of 4 hand-cast hexagonal resin coasters embedded with genuine 24K gold foil and silicone bumper feet.'
),
(
  'potry-planter-003',
  'POTRY-PLT-06',
  'Wabi-Sabi Fluted Terracotta Planter (6-inch)',
  'POTRY',
  'ceramic',
  'homeware',
  1450.00,
  1800.00,
  16,
  true,
  'active',
  false,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/potry-planter.jpg',
  '["Natural Terracotta", "White Washed Clay", "Soot Black"]'::jsonb,
  '["Fluted Cylinder", "Tapered Bowl"]'::jsonb,
  '["6-inch Planter", "8-inch Planter"]'::jsonb,
  'all',
  'neutral',
  'Porous handcrafted terracotta planter promoting root aeration, finished with delicate artisanal fluting.'
),
(
  'ram-ring-dish-001',
  'RAM-RNG-DSH-01',
  'Petal Preservation Faceted Ring Dish',
  'Resin Art Memories',
  'keepsake',
  'jewelry_trays',
  1199.00,
  1499.00,
  35,
  true,
  'active',
  false,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/ring-dish.jpg',
  '["Preserved Crimson Rose", "White Lily Petals", "Lavender & Baby Breath"]'::jsonb,
  '["Faceted Octagon", "Classic Heart", "Oval Trinket"]'::jsonb,
  '["4-inch Vanity Dish"]'::jsonb,
  'women',
  'feminine',
  'Dainty ring holder and nightstand keepsake preserving bridal bouquet petals in diamond-clear archival resin.'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock = EXCLUDED.stock,
    colors = EXCLUDED.colors,
    shapes = EXCLUDED.shapes,
    sizes = EXCLUDED.sizes,
    gender = EXCLUDED.gender,
    gender_affinity = EXCLUDED.gender_affinity,
    description = EXCLUDED.description;

-- ============================================================================
-- Seed Coupons
-- ============================================================================
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, is_active)
VALUES
  ('STUDIO10', 'percentage', 10, 1500, true),
  ('VISTARA500', 'fixed', 500, 3000, true),
  ('WELCOME250', 'fixed', 250, 1000, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- Seed Store Settings
-- ============================================================================
INSERT INTO public.settings (key, value)
VALUES
  ('announcement_bar', '{"text": "✨ Festive Atelier Drop: Free Pan-India Express Delivery on Orders Over ₹1,999", "enabled": true}'::jsonb),
  ('store_info', '{"name": "Vistāra Krafts Studio", "email": "studio@vistarakrafts.com", "phone": "+91 98765 43210", "gst_number": "29AAAAA0000A1Z5"}'::jsonb),
  ('shipping', '{"free_shipping_threshold": 1999, "standard_shipping_fee": 149, "express_shipping_fee": 299}'::jsonb)
ON CONFLICT (key) DO NOTHING;
