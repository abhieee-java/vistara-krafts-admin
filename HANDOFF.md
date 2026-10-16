# HANDOFF.md — OPERATIONAL PLAYBOOK & SYSTEM HANDOVER

> **Project Ecosystem:** Vistāra Krafts & POTRY Ceramics E-Commerce Platform  
> **Customer Storefront:** `https://vistara-krafts.vercel.app` (Target domain: `https://vistarakrafts.com`)  
> **Owner Admin Portal:** `https://vistara-krafts-admin.vercel.app` (Target domain: To be announced by owner)  
> **Backend & Database:** Supabase PostgreSQL 15+ (`supabase/schema.sql`) with Supabase Auth  
> **Media CDN & Storage:** Cloudinary (`storageService.ts` / `cloudinary-config.js`)  
> **Payment Gateway:** Razorpay  
> **Primary Author:** Antigravity Principal Systems Architect & Super-Designer  
> **Handover Date:** October 2026  

---

## 1. Executive Summary & Handover Scope

This document provides a turnkey operational handover of the complete Vistāra Krafts & POTRY Ceramics e-commerce platform. Both frontends (Storefront and Admin Portal) are fully engineered, verified, and deployed on Vercel. The backend is architected on **Supabase** (PostgreSQL 15+ with Row-Level Security and Supabase Auth) paired with **Cloudinary** for high-performance media storage and **Razorpay** for Indian Rupee payment capture.

---

## 2. System Coordinates & Repository Reference

| System Component | Repository Link | Live Production URL | Primary Tech Stack |
| :--- | :--- | :--- | :--- |
| **Customer Storefront** | [`abhieee-java/vistara-krafts`](https://github.com/abhieee-java/vistara-krafts) | [`vistara-krafts.vercel.app`](https://vistara-krafts.vercel.app) | Vanilla JS SPA · 120fps Kinetic CSS · Supabase SDK |
| **Owner Admin Portal** | [`abhieee-java/vistara-krafts-admin`](https://github.com/abhieee-java/vistara-krafts-admin) | [`vistara-krafts-admin.vercel.app`](https://vistara-krafts-admin.vercel.app) | React 19 · TypeScript · Vite · Tailwind v4 · Supabase SDK |
| **PostgreSQL Database** | Schema in `supabase/schema.sql` | Supabase Dashboard (`supabase.com`) | PostgreSQL 15+ with RLS & Realtime CDC |
| **Media & Asset CDN** | Cloudinary Console | Cloudinary CDN (`res.cloudinary.com`) | Cloudinary Direct Unsigned Uploads & Transformations |
| **Payment Gateway** | Razorpay Dashboard | Razorpay Checkout (`checkout.razorpay.com`) | Razorpay Standard Checkout & Webhook Verifier |

---

## 3. Environment Variables & Secret Configuration Matrix

### 1. Customer Storefront Vercel Configuration (`vistara-krafts`)
| Variable Key | Required | Public / Secret | Description |
| :--- | :---: | :---: | :--- |
| `VITE_SUPABASE_URL` | Yes | Public | `https://<PROJECT_REF>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public | Supabase public anonymous API key |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Public | Cloudinary cloud identifier (e.g. `vistara-krafts`) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Yes | Public | Unsigned preset for keepsake uploads (`vistara_keepsakes`) |
| `VITE_RAZORPAY_KEY_ID` | Yes | Public | Razorpay Key ID (`rzp_live_...` or `rzp_test_...`) |
| `SITE_URL` | Yes | Public | Canonical production URL (`https://vistarakrafts.com`) |

### 2. Owner Admin Portal Vercel Configuration (`vistara-krafts-admin`)
| Variable Key | Required | Public / Secret | Description |
| :--- | :---: | :---: | :--- |
| `VITE_USE_MOCK_SERVICES` | Yes | Public | Set to `false` when connecting to live Supabase backend |
| `VITE_SUPABASE_URL` | Yes | Public | `https://<PROJECT_REF>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public | Supabase public anonymous API key |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Public | Cloudinary cloud identifier |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Yes | Public | Unsigned preset for product photos (`vistara_products`) |
| `VITE_RAZORPAY_KEY_ID` | Yes | Public | Razorpay Key ID for payments dashboard reconciliation |

---

## 4. Owner & Operator Runbooks (Daily Operations)

### Runbook 1: Adding a Product with Optional Varieties
1. Log in to the Admin Portal (`https://vistara-krafts-admin.vercel.app`).
2. Navigate to **Products** and click **+ Add Product**.
3. Enter Name, SKU, Category, Base Price, and Stock Quantity.
4. **Gender Targeting:** Select `Universal (Men & Women)`, `Mainly for Female / Women`, or `Mainly for Male / Men`.
5. **Supplementary Varieties (Colors, Shapes, Sizes):**
   - If the item is a single, intact piece, **leave Colors, Shapes, and Sizes blank**.
   - The storefront will automatically omit all variety dropdowns and drawers.
   - If variants exist, enter comma-separated values (e.g. `Diamond Clear, Gold Flake` or `Small, Medium, Large`).
6. **Images:** Upload photos via the Cloudinary uploader.
7. Click **Save Product** or **Publish Drop**. The update broadcasts instantly to all open storefront tabs via `BroadcastChannel` and Supabase Realtime!

### Runbook 2: Inventory Adjustments
1. Navigate to **Inventory** in the Admin Portal.
2. Select any product row and click **Adjust Stock**.
3. Enter the unit change (`+` for restocking, `-` for sales or damages), select a reason code, and add internal notes.
4. The audit log updates immediately in `public.inventory_logs`.

### Runbook 3: Order Fulfillment & GST Tax Invoices
1. Navigate to **Orders** in the Admin Portal.
2. Click any order row to open the fulfillment timeline drawer.
3. Advance the stage from `Placed` → `Curing` → `Polishing` → `Shipped` → `Delivered`.
4. Enter courier tracking numbers (e.g. BlueDart AWB).
5. Click **Print Tax Invoice** to generate an official GST-compliant tax invoice.

---

## 5. Security & Maintenance Best Practices

- **API Keys:** Never commit secret keys (e.g. `SUPABASE_SERVICE_ROLE_KEY` or `RAZORPAY_KEY_SECRET`) to client-side code or public GitHub repositories.
- **Backups:** Supabase automatically performs daily database backups. In the Supabase dashboard, automated point-in-time recovery (PITR) is available on Pro tiers.
- **Image Optimization:** Cloudinary URLs use `f_auto,q_auto`, automatically compressing files to optimal WebP/AVIF formats based on client browser support.
- **Verification Tests:** Before deploying code changes, human developers and AI agents must always run:
  ```bash
  # In stitch_potry_e_commerce_storefront
  node verify-storefront.mjs  # All 25 suites must pass
  
  # In vistara_krafts_admin_portal
  npm run build               # Must exit with code 0 (tsc && vite build)
  ```
