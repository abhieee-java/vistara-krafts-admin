-- ============================================================================
-- Vistāra Krafts & POTRY Ceramics — Production Catalog Ingestion Template
-- Use this file to directly insert or batch-import your real product catalog.
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- ============================================================================
-- METHOD 1: Direct SQL Upsert Template
-- Replace the values below with your real product data and run.
-- You can add as many rows as you want inside the VALUES (...) clause.
-- ============================================================================

INSERT INTO public.products (
  sku,                    -- [Required] Unique product inventory SKU (e.g. 'VK-EPX-101')
  name,                   -- [Required] Full product display title
  short_name,             -- [Optional] Shorter name for mobile cards and cart lines
  subtitle,               -- [Optional] Editorial descriptor or chemistry summary
  brand,                  -- [Required] Brand name (e.g. 'Vistāra Krafts', 'Resin Art Memories', 'POTRY')
  category,               -- [Required] 'keepsakes' | 'casting' | 'deep_pour' | 'pigments' | 'molds' | 'accessories' | 'art_decor' | 'ceramic'
  subcategory,            -- [Optional] Granular classification (e.g. 'varmala_preservation', 'river_table')
  badge,                  -- [Optional] Marketing tag (e.g. 'Bestseller', 'Artisan Choice', 'PAN-India Express')
  price,                  -- [Required] Base selling price in INR
  compare_at_price,       -- [Optional] Strikethrough / original MRP (0 if none)
  cost_price,             -- [Optional] Studio production cost (for profit margin tracking)
  discount,               -- [Optional] Percentage discount (e.g. 15 for 15% off)
  stock,                  -- [Required] Current available inventory count
  low_stock_threshold,    -- [Optional] Alert threshold (default: 5)
  status,                 -- [Required] 'active' | 'draft' | 'archived' | 'out_of_stock'
  featured,               -- [Optional] true to display on homepage hero grid
  is_customizable,        -- [Optional] true if customer can request custom sizes/engraving
  image,                  -- [Required] Cloudinary or CDN image URL
  gallery,                -- [Optional] JSON array of additional image URLs
  variants,               -- [Optional] JSON array of size/kit variants with specific pricing
  specs,                  -- [Optional] JSON object of technical specifications (viscosity, cure time, etc.)
  colors,                 -- [Optional] JSON array of pigment/glaze options
  shapes,                 -- [Optional] JSON array of mould/silhouette options
  sizes,                  -- [Optional] JSON array of dimension/volume options
  gender,                 -- [Optional] 'all' | 'men' | 'women'
  gender_affinity,        -- [Optional] 'neutral' | 'masculine' | 'feminine'
  description,            -- [Optional] Comprehensive product storytelling and usage guide
  is_active               -- [Required] true to show in storefront, false to hide
) VALUES
(
  'YOUR-SKU-001',                                                         -- sku
  'Your Real Product Name Here',                                           -- name
  'Your Short Name',                                                      -- short_name
  'Premium Handcrafted Optical Keepsake / Industrial Epoxy System',       -- subtitle
  'Vistāra Krafts',                                                       -- brand
  'keepsakes',                                                            -- category
  'varmala_preservation',                                                 -- subcategory
  'Flagship Pour',                                                        -- badge
  2999.00,                                                                -- price (INR)
  3499.00,                                                                -- compare_at_price
  1200.00,                                                                -- cost_price
  14,                                                                     -- discount (%)
  25,                                                                     -- stock units
  5,                                                                      -- low_stock_threshold
  'active',                                                               -- status
  true,                                                                   -- featured
  true,                                                                   -- is_customizable
  'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/products/your-image.jpg', -- image
  '["https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/products/your-image-2.jpg"]'::jsonb, -- gallery
  '[
    {"id": "var-1", "label": "Standard Edition", "price": 2999, "regularPrice": 3499, "stock": 15, "sku": "YOUR-SKU-001-A"},
    {"id": "var-2", "label": "Deluxe Archival Edition", "price": 3999, "regularPrice": 4499, "stock": 10, "sku": "YOUR-SKU-001-B"}
  ]'::jsonb,                                                              -- variants
  '{
    "mixRatio": "3:1 by weight",
    "viscosity": "Medium-Low (850 mPa.s)",
    "potLife": "45 Minutes",
    "cureTime": "24 Hours Demold",
    "uvResistance": "HALS UV+ Non-Yellowing"
  }'::jsonb,                                                              -- specs
  '["Royal Amber", "Ocean Cobalt", "Pure Archival Clear"]'::jsonb,        -- colors
  '["Hexagon Facet", "Classic Cube", "Curved Arch"]'::jsonb,              -- shapes
  '["9-inch Studio", "12-inch Heirloom Block"]'::jsonb,                   -- sizes
  'all',                                                                  -- gender
  'neutral',                                                              -- gender_affinity
  'Detailed editorial product description. Hand-poured using optical grade resin in Bangalore studio with Pan-India delivery.', -- description
  true                                                                    -- is_active
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
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());

-- ============================================================================
-- METHOD 2: High-Speed Batch JSON Ingestion
-- If your catalog is exported from Excel, Shopify, WooCommerce, or an ERP
-- as a JSON array, you can paste it directly into this function call:
-- ============================================================================

/*
SELECT public.import_catalog_batch('[
  {
    "sku": "REAL-SKU-002",
    "name": "Bespoke River Table Resin System 2:1",
    "brand": "Vistāra Krafts",
    "category": "deep_pour",
    "price": 3899.00,
    "compareAtPrice": 4499.00,
    "stock": 30,
    "status": "active",
    "image": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/products/river-resin.jpg",
    "description": "Ultra low-exotherm deep pour resin for up to 50mm single layer casting."
  },
  {
    "sku": "REAL-SKU-003",
    "name": "Artisan Wheel-Thrown Stoneware Pitcher",
    "brand": "POTRY Ceramics",
    "category": "ceramic",
    "price": 2499.00,
    "compareAtPrice": 2999.00,
    "stock": 12,
    "status": "active",
    "image": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/products/ceramic-pitcher.jpg",
    "description": "High-fire Cone 10 reduction stoneware pitcher with feldspathic ochre glaze."
  }
]'::jsonb);
*/
