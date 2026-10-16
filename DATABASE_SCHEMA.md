# DATABASE SCHEMA — SUPABASE POSTGRESQL 15+

> **Database Engine:** Supabase PostgreSQL 15+ (with Row-Level Security & Realtime CDC)  
> **Primary Schema Files:** [`supabase/schema.sql`](file:///C:/Users/Dell/.gemini/antigravity/scratch/vistara_krafts_admin_portal/supabase/schema.sql)  
> **Client Libraries:** `@supabase/supabase-js` v2, TypeScript Service Layer (`src/services/`)  
> **Media CDN & Storage:** Cloudinary (`storageService.ts`)  
> **Primary Author:** Antigravity Principal Systems Architect & Super-Designer  
> **Last Updated:** October 2026  

---

## 1. Entity-Relationship Architecture

```mermaid
erDiagram
    PROFILES ||--o{ ORDERS : "places"
    PROFILES ||--o{ DPDP_CONSENTS : "grants"
    PRODUCTS ||--o{ INVENTORY_LOGS : "tracks"
    ORDERS ||--o{ PAYMENTS : "reconciles"

    PROFILES {
        UUID id PK "References auth.users(id) ON DELETE CASCADE"
        TEXT full_name "Patron display name"
        TEXT phone "Contact telephone"
        TEXT address "Primary shipping address"
        TEXT pincode "6-digit Indian PIN code"
        TEXT gender_preference "'masculine' | 'feminine' | 'universal'"
        TEXT member_tier "Default: 'Verified Vistāra Patron'"
        INTEGER loyalty_points "Default: 250 welcome points"
        JSONB wishlist "Array of favorited product IDs"
        TIMESTAMPTZ created_at "Default: NOW()"
        TIMESTAMPTZ updated_at "Default: NOW()"
    }

    PRODUCTS {
        TEXT id PK "Canonical ID (e.g. 'ram-varmala-001')"
        TEXT sku UK "Inventory SKU"
        TEXT name "Display product title"
        TEXT brand "Resin Art Memories / Vistāra Krafts / POTRY"
        TEXT category "keepsake | chemical | art_decor | ceramic"
        NUMERIC price "Base selling price in INR"
        NUMERIC regular_price "Strikethrough / compare-at price"
        INTEGER stock "Available inventory units"
        BOOLEAN in_stock "Computed availability flag"
        TEXT gender "Catalog affinity: 'all' | 'men' | 'women'"
        JSONB variants "Structured array of SKU variants"
        JSONB specs "Technical specifications & resin chemistry"
        JSONB colors "Available pigment & glaze swatches"
        JSONB shapes "Available mould and silhouette shapes"
        JSONB sizes "Available volume and dimension sizes"
        BOOLEAN is_active "Storefront visibility toggle"
        TIMESTAMPTZ created_at "Default: NOW()"
        TIMESTAMPTZ updated_at "Default: NOW()"
    }

    ORDERS {
        TEXT id PK "Canonical order number (e.g. 'VK-2026-9021')"
        UUID user_id FK "References auth.users(id)"
        TEXT customer_name "Recipient full name"
        TEXT customer_email "Recipient email address"
        TEXT phone "Recipient telephone"
        TEXT address "Shipping street address"
        TEXT pincode "6-digit Indian PIN code"
        NUMERIC subtotal "Base product sum before discounts"
        NUMERIC discount "Applied volume or coupon discount"
        NUMERIC gst_amount "Statutory 18% GST amount"
        NUMERIC total "Final payable INR amount"
        TEXT payment_method "UPI / NetBanking / Cards / COD"
        BOOLEAN gift_wrap "Bespoke wax-sealed gift wrapping"
        BOOLEAN mockup_approved "3D specimen mockup approval flag"
        TEXT status "Pipeline status ('placed' | 'curing' | 'shipped')"
        INTEGER stage_index "Current step index in pipeline (1-6)"
        JSONB items "Array of ordered line items and variants"
        TEXT courier "Assigned logistics carrier & AWB tracking"
        TIMESTAMPTZ created_at "Default: NOW()"
    }

    INVENTORY_LOGS {
        UUID id PK "Primary key (gen_random_uuid())"
        TEXT product_id FK "References products(id) ON DELETE CASCADE"
        TEXT sku "Product SKU reference"
        INTEGER change "+/- delta unit count"
        INTEGER previous_stock "Stock count before adjustment"
        INTEGER new_stock "Stock count after adjustment"
        TEXT reason "'sale' | 'restock' | 'damage' | 'audit'"
        TEXT notes "Optional operational context"
        TEXT created_by "Admin user identifier or 'system'"
        TIMESTAMPTZ created_at "Default: NOW()"
    }

    PAYMENTS {
        UUID id PK "Primary key (gen_random_uuid())"
        TEXT payment_id UK "Gateway transaction reference"
        TEXT order_id FK "References orders(id) ON DELETE CASCADE"
        NUMERIC amount "Transaction value in INR"
        TEXT currency "Default: 'INR'"
        TEXT status "'captured' | 'pending' | 'failed' | 'refunded'"
        TEXT method "'upi' | 'card' | 'netbanking' | 'cod'"
        TEXT razorpay_order_id "Razorpay order reference"
        TIMESTAMPTZ created_at "Default: NOW()"
    }

    SETTINGS {
        TEXT key PK "Configuration key identifier"
        JSONB value "Structured configuration JSON"
        TIMESTAMPTZ updated_at "Default: NOW()"
    }

    COUPONS {
        TEXT code PK "Uppercase promotional code (e.g. 'STUDIO10')"
        TEXT discount_type "'percentage' | 'fixed'"
        NUMERIC discount_value "Discount value (10% or ₹500)"
        NUMERIC min_order_value "Minimum cart value required"
        BOOLEAN is_active "Toggle active status"
        TIMESTAMPTZ expires_at "Expiration timestamp"
    }

    CUSTOM_MOCKUPS {
        UUID id PK "Primary key (gen_random_uuid())"
        UUID user_id FK "References auth.users(id)"
        TEXT customer_name "Client full name"
        TEXT email "Client email"
        TEXT phone "Contact telephone"
        TEXT preservation_type "e.g. 'Wedding Varmala & Rose Petals'"
        TEXT mould_shape "e.g. 'Octagonal Faceted Crystal Block'"
        TEXT dimensions "e.g. '9 inch x 9 inch x 50mm'"
        TEXT notes "Custom gold leaf or LED base requests"
        TEXT status "'submitted' | 'designing' | 'approved'"
        JSONB photos "Array of uploaded reference photos (Cloudinary)"
        TIMESTAMPTZ created_at "Default: NOW()"
    }

    DPDP_CONSENTS {
        UUID id PK "Primary key (gen_random_uuid())"
        UUID user_id FK "References auth.users(id)"
        TEXT consent_type "'essential' | 'analytics' | 'marketing'"
        BOOLEAN granted "Consent state"
        TEXT ip_address "Audit IP address or 'client-verified'"
        TIMESTAMPTZ created_at "Default: NOW()"
    }
}
```

---

## 2. Table Specifications & PostgreSQL DDL

### 1. `public.profiles`
Stores extended customer patron information linked directly to Supabase Auth `auth.users`:
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  pincode TEXT DEFAULT '',
  gender_preference TEXT DEFAULT 'universal' CHECK (gender_preference IN ('masculine', 'feminine', 'universal')),
  member_tier TEXT DEFAULT 'Verified Vistāra Patron',
  loyalty_points INTEGER DEFAULT 250,
  wishlist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `public.products`
Catalog of all 12 flagship SKUs across Resin Art Memories, Vistāra Krafts & POTRY:
```sql
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  regular_price NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 10,
  in_stock BOOLEAN DEFAULT TRUE,
  gender TEXT DEFAULT 'all' CHECK (gender IN ('all', 'men', 'women')),
  variants JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  shapes JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `public.orders`
Unified order ledger shared between Customer Storefront and Admin Portal:
```sql
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  gst_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  gift_wrap BOOLEAN DEFAULT FALSE,
  mockup_approved BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'placed',
  stage_index INTEGER DEFAULT 1,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  courier TEXT DEFAULT 'BlueDart Air Express',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Row-Level Security (RLS) Policy Ledger

Every table enforces Row-Level Security:

| Table | Policy | Role | Command | Expression / Condition |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | Users can read own profile | `authenticated` | `SELECT` | `auth.uid() = id` |
| `profiles` | Users can update own profile | `authenticated` | `UPDATE` | `auth.uid() = id` |
| `products` | Anyone can view active products | `anon`, `authenticated` | `SELECT` | `is_active = TRUE` |
| `products` | Admins can manage products | `service_role` | `ALL` | `TRUE` |
| `orders` | Users can view own orders | `authenticated` | `SELECT` | `auth.uid() = user_id` |
| `orders` | Users can insert orders | `authenticated` | `INSERT` | `auth.uid() = user_id` |
| `orders` | Admins can manage orders | `service_role` | `ALL` | `TRUE` |
| `inventory_logs` | Admins can view logs | `service_role` | `SELECT` | `TRUE` |
| `settings` | Anyone can view public settings | `anon`, `authenticated` | `SELECT` | `TRUE` |
| `coupons` | Anyone can view active coupons | `anon`, `authenticated` | `SELECT` | `is_active = TRUE` |

---

## 4. Automatic Triggers & Functions

### New User Auto-Profile Trigger
Automatically provisions a `public.profiles` row upon Supabase Auth sign-up:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, gender_preference)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender_preference', 'universal')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 5. Realtime Publication

PostgreSQL Change Data Capture (CDC) enables instant catalog & order sync:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.products, public.orders, public.inventory_logs;
```
