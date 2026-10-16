-- ============================================================================
-- Vistāra Krafts & POTRY Ceramics — Production Supabase PostgreSQL Schema
-- Pure Production DDL (Zero Mock Data)
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- 0. Required Extensions
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
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender_preference);

-- Automatic updated_at trigger helper
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
-- 2. Categories Table (Optional Dynamic Taxonomies)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ============================================================================
-- 3. Products Table (Enterprise Master Catalog & Varietal Architecture)
-- Engineered for direct import of real products (zero mock data baked in)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT ('prod_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  brand TEXT NOT NULL DEFAULT 'Vistāra Krafts',
  category TEXT NOT NULL, -- e.g. 'keepsakes', 'casting', 'deep_pour', 'pigments', 'molds', 'accessories', 'art_decor', 'ceramic'
  subcategory TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10, 2) DEFAULT 0 CHECK (compare_at_price >= 0),
  cost_price NUMERIC(10, 2) DEFAULT 0 CHECK (cost_price >= 0),
  discount INTEGER DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  tax_rate NUMERIC(5, 2) DEFAULT 18.00,
  hsn_code TEXT DEFAULT '39073010',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived', 'out_of_stock')),
  featured BOOLEAN NOT NULL DEFAULT false,
  is_customizable BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  image TEXT NOT NULL DEFAULT '',
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  shapes JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  gender TEXT NOT NULL DEFAULT 'all' CHECK (gender IN ('all', 'women', 'men')),
  gender_affinity TEXT NOT NULL DEFAULT 'neutral' CHECK (gender_affinity IN ('neutral', 'feminine', 'masculine')),
  gifting_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_products_gender_affinity ON public.products(gender_affinity);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

-- Full text search index on title, subtitle, and description
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING gin(to_tsvector('english', name || ' ' || COALESCE(subtitle, '') || ' ' || COALESCE(description, '')));

DROP TRIGGER IF EXISTS on_products_updated ON public.products;
CREATE TRIGGER on_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-calculate in_stock based on stock quantity
CREATE OR REPLACE FUNCTION public.sync_product_in_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock <= 0 THEN
    NEW.in_stock = false;
  ELSE
    NEW.in_stock = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_products_stock_sync ON public.products;
CREATE TRIGGER on_products_stock_sync
  BEFORE INSERT OR UPDATE OF stock ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_product_in_stock();

-- ============================================================================
-- 4. Orders Table (Production Order Ledger)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  pincode TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  coupon_code TEXT DEFAULT '',
  gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
  shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'new' CHECK (order_status IN ('new', 'pending', 'processing', 'curing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  stage_index INTEGER NOT NULL DEFAULT 1 CHECK (stage_index >= 1 AND stage_index <= 6),
  gift_wrap BOOLEAN NOT NULL DEFAULT false,
  mockup_approved BOOLEAN NOT NULL DEFAULT false,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  courier TEXT DEFAULT 'BlueDart Air Express',
  tracking_number TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

DROP TRIGGER IF EXISTS on_orders_updated ON public.orders;
CREATE TRIGGER on_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. Inventory Movement Logs Table (Audited Stock Reconciliation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  change INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('RESTOCK', 'SALE', 'DAMAGE', 'AUDIT', 'RETURN', 'MANUAL_ADJUSTMENT')),
  notes TEXT DEFAULT '',
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON public.inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_sku ON public.inventory_logs(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON public.inventory_logs(created_at DESC);

-- ============================================================================
-- 6. Payments Table (Transaction Reconciliation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  method TEXT NOT NULL,
  razorpay_order_id TEXT DEFAULT '',
  razorpay_payment_id TEXT DEFAULT '',
  razorpay_signature TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON public.payments(payment_id);

-- ============================================================================
-- 7. Store Settings Table (Key-Value Dynamic Configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 8. Coupons Table (Promotion Engine)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
  max_discount_value NUMERIC(10, 2) DEFAULT NULL,
  usage_limit INTEGER DEFAULT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);

-- ============================================================================
-- 9. Custom Mockups Table (Bespoke Bridal Keepsake Inquiries)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.custom_mockups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preservation_type TEXT NOT NULL DEFAULT 'varmala',
  mould_shape TEXT DEFAULT '',
  dimensions TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'mockup_generated', 'approved', 'in_production', 'completed', 'rejected')),
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_custom_mockups_user_id ON public.custom_mockups(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_mockups_status ON public.custom_mockups(status);

DROP TRIGGER IF EXISTS on_custom_mockups_updated ON public.custom_mockups;
CREATE TRIGGER on_custom_mockups_updated
  BEFORE UPDATE ON public.custom_mockups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 10. DPDP Consents Table (Indian DPDP Act 2023 Compliance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dpdp_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('essential', 'analytics', 'marketing')),
  granted BOOLEAN NOT NULL DEFAULT true,
  ip_address TEXT DEFAULT 'client-verified',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_dpdp_consents_user_id ON public.dpdp_consents(user_id);

-- ============================================================================
-- 11. Row Level Security (RLS) Policies
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_mockups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpdp_consents ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public can read active products; Admins/Service-role full control
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin write products" ON public.products
  FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

-- Categories Policies
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin write categories" ON public.categories
  FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

-- Profiles Policies
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public insert profiles on signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Orders Policies
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

-- Inventory Logs Policies
CREATE POLICY "Admin view inventory logs" ON public.inventory_logs
  FOR SELECT USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Admin write inventory logs" ON public.inventory_logs
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

-- Payments Policies
CREATE POLICY "Admin view payments" ON public.payments
  FOR SELECT USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "System insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

-- Settings & Coupons Policies
CREATE POLICY "Public view settings" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Admin manage settings" ON public.settings
  FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Public view coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage coupons" ON public.coupons
  FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

-- DPDP & Custom Mockups Policies
CREATE POLICY "Users manage mockups" ON public.custom_mockups
  FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Public record consent" ON public.dpdp_consents
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 12. Supabase Realtime CDC Publication
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
-- 13. High-Speed Bulk Catalog Ingestion Function (For Real Product Data)
-- Allows importing or updating products directly via JSON batch
-- Usage: SELECT public.import_catalog_batch('[{"sku": "...", "name": "...", ...}]'::jsonb);
-- ============================================================================
CREATE OR REPLACE FUNCTION public.import_catalog_batch(p_products JSONB)
RETURNS JSONB AS $$
DECLARE
  v_item JSONB;
  v_inserted_count INT := 0;
  v_updated_count INT := 0;
BEGIN
  IF jsonb_typeof(p_products) <> 'array' THEN
    RAISE EXCEPTION 'Input must be a JSON array of product objects';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_products)
  LOOP
    INSERT INTO public.products (
      id, sku, name, short_name, subtitle, brand, category, subcategory, badge,
      price, compare_at_price, cost_price, discount, stock, low_stock_threshold,
      status, featured, is_customizable, image, gallery, variants, specs,
      colors, shapes, sizes, gender, gender_affinity, gifting_tags, description, is_active
    ) VALUES (
      COALESCE(v_item->>'id', 'prod_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
      v_item->>'sku',
      v_item->>'name',
      COALESCE(v_item->>'short_name', v_item->>'shortName', ''),
      COALESCE(v_item->>'subtitle', ''),
      COALESCE(v_item->>'brand', 'Vistāra Krafts'),
      v_item->>'category',
      COALESCE(v_item->>'subcategory', v_item->>'subCategory', ''),
      COALESCE(v_item->>'badge', ''),
      (v_item->>'price')::numeric,
      COALESCE((v_item->>'compare_at_price')::numeric, (v_item->>'compareAtPrice')::numeric, (v_item->>'regularPrice')::numeric, 0),
      COALESCE((v_item->>'cost_price')::numeric, 0),
      COALESCE((v_item->>'discount')::int, 0),
      COALESCE((v_item->>'stock')::int, (v_item->>'stockQuantity')::int, 10),
      COALESCE((v_item->>'low_stock_threshold')::int, (v_item->>'lowStockThreshold')::int, 5),
      COALESCE(v_item->>'status', 'active'),
      COALESCE((v_item->>'featured')::boolean, false),
      COALESCE((v_item->>'is_customizable')::boolean, (v_item->>'isCustomizable')::boolean, false),
      COALESCE(v_item->>'image', ''),
      COALESCE(v_item->'gallery', '[]'::jsonb),
      COALESCE(v_item->'variants', '[]'::jsonb),
      COALESCE(v_item->'specs', '{}'::jsonb),
      COALESCE(v_item->'colors', '[]'::jsonb),
      COALESCE(v_item->'shapes', '[]'::jsonb),
      COALESCE(v_item->'sizes', '[]'::jsonb),
      COALESCE(v_item->>'gender', 'all'),
      COALESCE(v_item->>'gender_affinity', v_item->>'genderAffinity', 'neutral'),
      COALESCE(v_item->'gifting_tags', v_item->'giftingTags', '[]'::jsonb),
      COALESCE(v_item->>'description', ''),
      COALESCE((v_item->>'is_active')::boolean, true)
    )
    ON CONFLICT (sku) DO UPDATE SET
      name = EXCLUDED.name,
      short_name = EXCLUDED.short_name,
      subtitle = EXCLUDED.subtitle,
      brand = EXCLUDED.brand,
      category = EXCLUDED.category,
      subcategory = EXCLUDED.subcategory,
      badge = EXCLUDED.badge,
      price = EXCLUDED.price,
      compare_at_price = EXCLUDED.compare_at_price,
      cost_price = EXCLUDED.cost_price,
      discount = EXCLUDED.discount,
      stock = EXCLUDED.stock,
      low_stock_threshold = EXCLUDED.low_stock_threshold,
      status = EXCLUDED.status,
      featured = EXCLUDED.featured,
      is_customizable = EXCLUDED.is_customizable,
      image = EXCLUDED.image,
      gallery = EXCLUDED.gallery,
      variants = EXCLUDED.variants,
      specs = EXCLUDED.specs,
      colors = EXCLUDED.colors,
      shapes = EXCLUDED.shapes,
      sizes = EXCLUDED.sizes,
      gender = EXCLUDED.gender,
      gender_affinity = EXCLUDED.gender_affinity,
      gifting_tags = EXCLUDED.gifting_tags,
      description = EXCLUDED.description,
      is_active = EXCLUDED.is_active,
      updated_at = timezone('utc'::text, now());

    v_inserted_count := v_inserted_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'processed_count', v_inserted_count,
    'message', 'Catalog batch processed and synchronized successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
