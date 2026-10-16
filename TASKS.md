# TASKS.md — WORK BREAKDOWN STRUCTURE & ROADMAP

> **Project Ecosystem:** Vistāra Krafts & POTRY Ceramics E-Commerce Platform  
> **Customer Storefront:** `https://vistara-krafts.vercel.app` (Custom domain: `https://vistarakrafts.com`)  
> **Owner Admin Portal:** `https://vistara-krafts-admin.vercel.app` (Custom domain to be announced by owner)  
> **Backend & Database:** Supabase PostgreSQL 15+ (`supabase/schema.sql`) with Supabase Auth  
> **Media CDN & Storage:** Cloudinary (`storageService.ts` / `cloudinary-config.js`)  
> **Payments:** Razorpay  
> **Last Updated:** October 2026  

---

## 1. Project Task Board & Status Matrix

| Sprint | Objective / Domain | Storefront | Admin Portal | Backend | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Sprint 1** | Brand System, Visual Tokens & Responsive Storefront Foundation | ✅ Done | — | — | **Completed** |
| **Sprint 2** | Interactive Pour Calculator, DPDP Compliance & Cart Volume Pricing | ✅ Done | — | — | **Completed** |
| **Sprint 3** | Dual Platform Architecture & Service Layer Abstractions | ✅ Done | ✅ Done | ✅ Done | **Completed** |
| **Sprint 4** | Owner Admin Portal (Dashboard, Products, Inventory, Orders, CRM, Invoices) | — | ✅ Done | — | **Completed** |
| **Sprint 5** | Supplementary Varieties (Colors/Shapes/Sizes) & Gender Targeting Engine | ✅ Done | ✅ Done | ✅ Done | **Completed** |
| **Sprint 6** | Awwwards SOTD Polish, Zero-Leakage Audit, 25/25 Tests & Vercel Deployments | ✅ Done | ✅ Done | — | **Completed** |
| **Sprint 7** | Full Migration to Supabase (PostgreSQL + Auth) & Cloudinary (Media CDN) | ✅ Done | ✅ Done | ✅ Done | **Completed** |
| **Sprint 8** | Production Credential Provisioning, DNS Cutover & Live Razorpay Testing | 🟡 Planned | 🟡 Planned | 🟡 Planned | **Ready for Cutover** |
| **Sprint 9** | WhatsApp Notifications, BlueDart AWB Logistics API & B2B Wholesale | ⚪ Backlog | ⚪ Backlog | ⚪ Backlog | **Roadmap** |

---

## 2. Completed Milestones (Compilation of Delivered Work)

### 1. Customer Storefront (`stitch_potry_e_commerce_storefront`)
- [x] **Brand Token System:** Engineered 60/30/10 warm alabaster palette (`#faf8f5`, `#031a38`, `#b08d57`) across `tokens.css` and `styles.css`.
- [x] **12 Flagship Products:** Structured complete specifications for 12 master items across Resin Art Memories, Vistāra Krafts, and POTRY.
- [x] **Epoxy Pour Calculator:** Developed real-time volume math for 3:1 casting, 2:1 deep pour, 1:1 topcoat, and UV fast cure resin.
- [x] **DPDP Act 2023 Consent Banner:** Implemented explicit privacy compliance banner with session memory and transparent policy links.
- [x] **Indian PIN Code Validation:** Added 6-digit PIN validation regex (`^[1-9][0-9]{5}$`) across checkout and delivery estimators.
- [x] **Two-Part Authentication & Curation Flow:**
  - Part 1: Email/Password, 1-Click Google OAuth, Apple ID.
  - Part 2: Feed Personalization with `👔 Male` and `🌸 Female` options.
  - Zero "Universal" button rule strictly enforced; dismissing defaults silently to universal.
- [x] **3D Liquid Resin Animation Showcase:**
  - Desktop: Split two-column modal with interactive 140px liquid resin sphere and concentric golden orbit rings.
  - Mobile: Clean vertical stack hiding heavy desktop shaders.
- [x] **Cart & Volume Pricing Engine:** Real-time volume tier discounts (3+ units: 5%, 5+ units: 10%, 10+ units: 15%), GST calculation, and coupon validation.
- [x] **Awwwards SOTD Kinetic Micro-Interactions:** Magnetic hover cursor, 3D card tilt, specimen loupe, before/after slider, and zero audio e-commerce interactions.
- [x] **Automated 25-Suite Test Runner:** `verify-storefront.mjs` verifying 100% empty state, router safety, volume pricing, and responsive viewports (320px–1920px).
- [x] **Live Vercel Production Deployment:** Successfully deployed and verified at `https://vistara-krafts.vercel.app`.
- [x] **Supabase Client & Cloudinary Integration:** Replaced all Cloudflare scripts with `supabase-client.js` and `cloudinary-config.js`.

---

### 2. Owner Admin Portal (`vistara_krafts_admin_portal`)
- [x] **Executive Dashboard:** Real-time revenue metrics (today, weekly, monthly), order breakdown badges, inventory health alerts, customer growth charts, and recent activity feed.
- [x] **Comprehensive Product Management (CRUD):**
  - Add, edit, duplicate, search, and filter catalog items.
  - Support for images, category, subcategory, brand, SKU, prices, compare-at prices, discount, and status.
- [x] **Supplementary Product Varieties (Colors, Shapes, Sizes):**
  - Optional inputs for Colors, Shapes, and Sizes.
  - **Blank = None:** If left blank, product stays intact with no forced variety selectors on the storefront.
  - Comma-separated input parser translating text to structured options.
- [x] **Gender Targeting Selector:**
  - `✨ Universal (Men & Women)` (Default)
  - `🌸 Mainly for Female / Women`
  - `👔 Mainly for Male / Men`
  - Subtle visual badges rendered in product list table and mobile cards.
- [x] **Cloudinary Image Uploader:** Direct unsigned multipart uploads to Cloudinary with progress feedback, preview, and delete capability.
- [x] **Inventory Management Ledger:** Real-time stock counts, quick adjustments (+/- stock), reason tags, and audit history.
- [x] **Order Fulfillment Board & GST Invoices:** Order status workflow (`placed` → `mockup_approved` → `curing` → `polishing` → `shipped` → `delivered`), tracking updates, and printable tax invoices.
- [x] **Customer CRM:** Lifetime value metrics, order history drawer, and segment filtering.
- [x] **System Health Page:** Real-time latency monitors for Supabase, Cloudinary, Razorpay, and Webhook endpoints.
- [x] **Live Vercel Production Deployment:** Successfully deployed and verified at `https://vistara-krafts-admin.vercel.app`.

---

### 3. Backend & Storage Migration
- [x] **Supabase PostgreSQL DDL:** Authored `supabase/schema.sql` covering 8 tables with foreign keys, checks, indexes, and RLS policies.
- [x] **Row-Level Security (RLS):** Enforced read-only catalog access for anonymous users, private orders for authenticated users, and full access for service roles.
- [x] **Auto-Profile Trigger:** Implemented `handle_new_user()` trigger to automatically create profile records upon auth sign-up.
- [x] **Realtime CDC Publication:** Configured `supabase_realtime` publication for products, orders, and inventory.
- [x] **Cloudinary Storage Service:** Created unsigned upload pipeline in `src/services/storageService.ts` and `cloudinary-config.js`.
- [x] **Zero Cloudflare Remnants:** Completely deleted all Cloudflare D1/R2/KV/Wrangler files and bindings.

---

## 3. Immediate Next Steps (Cutover Checklist)

- [ ] Add live Supabase Project URL and Anon Key to Vercel environment variables.
- [ ] Add live Cloudinary Cloud Name and Upload Preset to Vercel environment variables.
- [ ] Add live Razorpay Key ID and Secret to Vercel environment variables.
- [ ] Configure custom domain `vistarakrafts.com` in Vercel DNS settings for the storefront.
- [ ] Configure custom domain for the admin portal when provided by owner.
