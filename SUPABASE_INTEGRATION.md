# SUPABASE & CLOUDINARY INTEGRATION RUNBOOK — VISTĀRA KRAFTS ADMIN

> **Shared Ecosystem:** Connects the Admin Portal directly to the same Supabase database and Cloudinary storage as the Customer Storefront ([`abhieee-java/vistara-krafts`](https://github.com/abhieee-java/vistara-krafts)).  
> **Schema File:** [`supabase/schema.sql`](./supabase/schema.sql)  
> **Primary Author:** Antigravity Principal Systems Architect & Super-Designer  
> **Last Updated:** October 2026  

---

## 1. Architecture Overview

Both the **Customer Storefront** and the **Owner Admin Portal** share a single unified PostgreSQL database on Supabase:
- **`public.products`**: Products edited or created here reflect instantly on the storefront.
- **`public.orders`**: Orders placed by customers on the storefront stream directly to the admin orders pipeline.
- **`public.inventory_logs`**: Inventory adjustments recorded here update stock counts on both sides.
- **`public.profiles`**: Customer CRM profiles, loyalty points, and gender preferences.
- **`public.custom_mockups`**: Bespoke client bridal floral preservation requests.
- **`supabase_realtime`**: Changes made in this portal broadcast to customer browser tabs in real-time.

---

## 2. Environment Setup

Create or update `.env` in the root of `vistara-krafts-admin`:
```env
# Switch from mock mode to live Supabase backend
VITE_USE_MOCK_SERVICES=false

# Supabase Credentials from https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Cloudinary Media Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=vistara_products
```

---

## 3. Database Initialization

If not already executed:
1. Go to your Supabase project's **SQL Editor**.
2. Open [`supabase/schema.sql`](./supabase/schema.sql).
3. Run the script. It provisions all 8 tables, indexes, Row-Level Security policies, and seeds all 12 flagship SKUs.
