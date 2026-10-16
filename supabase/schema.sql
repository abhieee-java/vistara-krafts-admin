-- ============================================================================
-- Vistāra Krafts & POTRY Ceramics — Supabase PostgreSQL Database Schema
-- Run in Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ============================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles / Users Table (Patrons & Registered Customers)
-- Synchronized with Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT 'email', -- 'email' | 'google' | 'apple'
  wishlist JSONB NOT NULL DEFAULT '[]'::jsonb,
  member_tier TEXT NOT NULL DEFAULT 'Verified Vistāra Patron',
  loyalty_points INTEGER NOT NULL DEFAULT 250,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create public.profiles row when new auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.app_metadata->>'provider', 'email')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = CASE WHEN public.profiles.name = '' THEN EXCLUDED.name ELSE public.profiles.name END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Products Table (Catalog, Supplementary Varieties & Gender Targeting)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Vistāra Krafts',
  category TEXT NOT NULL DEFAULT 'keepsake', -- 'keepsake' | 'chemical' | 'art_decor' | 'ceramic' | 'homeware'
  subcategory TEXT DEFAULT '',
  price INTEGER NOT NULL,
  compare_at_price INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  tax INTEGER DEFAULT 18,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'draft' | 'archived'
  featured BOOLEAN NOT NULL DEFAULT false,
  image TEXT NOT NULL,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb, -- Supplementary optional colors
  shapes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Supplementary optional shapes
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Supplementary optional sizes
  gender TEXT NOT NULL DEFAULT 'all',        -- 'all' | 'women' | 'men'
  gender_affinity TEXT DEFAULT 'neutral',    -- 'neutral' | 'feminine' | 'masculine'
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);

CREATE TRIGGER on_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  order_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL DEFAULT '',
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  gift_wrap BOOLEAN NOT NULL DEFAULT true,
  mockup_approved BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Order Confirmed • Studio Batch Allocated',
  stage_index INTEGER NOT NULL DEFAULT 1,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  courier TEXT NOT NULL DEFAULT 'BlueDart Priority Air • AWB Pending',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

CREATE TRIGGER on_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Inventory Movement Audit Logs
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

-- 5. Payments Reconciliation Table (Razorpay Ledger)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'captured', -- 'captured' | 'failed' | 'refunded'
  method TEXT NOT NULL DEFAULT 'upi',
  razorpay_order_id TEXT DEFAULT '',
  razorpay_signature TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_rzp ON public.payments(payment_id);

-- 6. System Settings Table (Key-Value)
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read active products; Service role can write
CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Service role write products" ON public.products
  FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'authenticated');

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public insert profiles on signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Orders: Users can read their own orders; Anyone authenticated can insert
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Enable Supabase Realtime for instant catalog drops & order updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ============================================================================
-- Initial Seed Catalog (12 Flagship SKUs)
-- ============================================================================
INSERT INTO public.products (
  id, sku, name, brand, category, price, compare_at_price, stock, status, featured,
  image, colors, shapes, sizes, gender, gender_affinity, description
) VALUES
(
  'ram-varmala-001', 'ram-varmala-001', 'Eternal Varmala 50mm Floral Keepsake Block',
  'Resin Art Memories', 'keepsake', 4499, 5499, 18, 'active', true,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/varmala-block.jpg',
  '["Royal Gold", "Champagne Rose"]'::jsonb,
  '["Mughal Arch", "Hexagon", "Circle"]'::jsonb,
  '["6-inch Desk", "12-inch Royal"]'::jsonb,
  'women', 'feminine',
  '50mm diamond-clear acrylic-epoxy crystal block preserving heirloom wedding varmala blooms.'
),
(
  'vk-epx-301', 'vk-epx-301', 'UltraClear 3:1 Optical Casting Resin Kit (1.2kg)',
  'Vistāra Krafts', 'chemical', 1299, 1599, 42, 'active', true,
  'https://res.cloudinary.com/vistara-krafts/image/upload/v1/products/ultraclear-3-1.jpg',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  'all', 'neutral',
  'ISO-9001 certified optical epoxy system with HALS UV stabilizers and bubble-release formulation.'
)
ON CONFLICT (id) DO NOTHING;
