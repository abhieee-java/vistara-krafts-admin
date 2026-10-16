# TASKS.md — WORK BREAKDOWN STRUCTURE & ROADMAP

> **Project Ecosystem:** Vistāra Krafts & POTRY Ceramics E-Commerce Platform  
> **Customer Storefront:** `https://vistara-krafts.vercel.app` (Custom domain: `https://vistarakrafts.com`)  
> **Owner Admin Portal:** `https://vistara-krafts-admin.vercel.app`  
> **Last Updated:** October 2026  

---

## 1. Project Task Board & Status Matrix

| Sprint | Objective / Domain | Storefront | Admin Portal | Edge / D1 | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Sprint 1** | Brand System, Visual Tokens & Responsive Storefront Foundation | ✅ Done | — | — | **Completed** |
| **Sprint 2** | Interactive Pour Calculator, DPDP Compliance & Cart Volume Pricing | ✅ Done | — | — | **Completed** |
| **Sprint 3** | Cloudflare Pages Function API, PBKDF2 Auth & D1 SQL Schema | ✅ Done | — | ✅ Done | **Completed** |
| **Sprint 4** | Owner Admin Portal (Dashboard, Products, Inventory, Orders, CRM, Invoices) | — | ✅ Done | — | **Completed** |
| **Sprint 5** | Supplementary Varieties (Colors/Shapes/Sizes) & Gender Targeting Engine | ✅ Done | ✅ Done | ✅ Done | **Completed** |
| **Sprint 6** | Awwwards SOTD Polish, Zero-Leakage Audit, 25/25 Tests & Vercel Deployments | ✅ Done | ✅ Done | — | **Completed** |
| **Sprint 7** | Production Cloudflare D1, R2, KV, Turnstile & Live Razorpay Activation | 🟡 Planned | 🟡 Planned | 🟡 Planned | **In-Flight** |
| **Sprint 8** | WhatsApp Notifications, BlueDart AWB Logistics API & B2B Wholesale | ⚪ Backlog | ⚪ Backlog | ⚪ Backlog | **Backlog** |

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
- [x] **Inventory Control & Movement Ledger:**
  - Current, available, and reserved stock tracking.
  - Stock adjustment modal (+/-) requiring mandatory reason codes (`RESTOCK`, `DAMAGED`, `AUDIT`, `RETURN`, `SALE`) and operator notes.
  - Audit trail logging every movement with timestamp and admin attribution.
- [x] **Order Fulfillment Pipeline & GST Invoices:**
  - Stage-based pipeline: `1: Studio Batch Allocated` → `2: Casting & Curing` → `3: Quality Inspection` → `4: Hand-Packed & Sealed` → `5: In Transit` → `6: Delivered`.
  - Slide-over order detail drawer with complete customer info, items list, and tracking updates.
  - GST-compliant invoice generation modal with printable layout and tax split (CGST + SGST / IGST).
- [x] **Customer Relationship Management (CRM):** Customer directory with total spent, order history, contact details, and VIP patron loyalty tiers.
- [x] **Cloudflare R2 Media Upload Simulator:** Drag-and-drop image uploader with MIME validation (`image/jpeg`, `image/png`, `image/webp`) and file size limits (5MB max).
- [x] **Razorpay Payment Ledger:** Transaction log tracking payment IDs, order IDs, capture statuses, and simulated refund workflows.
- [x] **System Health Telemetry Screen:** Edge latency monitor, D1 binding status, KV cache hits, and sync status.
- [x] **Real-Time Studio Drop Sync:** Integrates browser `BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL')` to publish live drops to open customer tabs.
- [x] **Live Vercel Production Deployment:** Successfully deployed and verified at `https://vistara-krafts-admin.vercel.app`.

---

## 3. In-Flight Tasks (Sprint 7: Production Infrastructure Cutover)

```markdown
### Phase 1: Cloudflare D1 Serverless SQL
- [ ] Task 7.1: Execute `npx wrangler d1 create vistara_krafts_db` on production Cloudflare account.
- [ ] Task 7.2: Paste `database_id` into `wrangler.toml`.
- [ ] Task 7.3: Run `npx wrangler d1 execute vistara_krafts_db --remote --file=./cloudflare/schema.sql`.
- [ ] Task 7.4: Execute seed SQL script to populate 12 flagship products into remote D1.

### Phase 2: Cloudflare R2 Media Storage
- [ ] Task 7.5: Execute `npx wrangler r2 bucket create vistara-media`.
- [ ] Task 7.6: Apply CORS policy `r2-cors.json` to allow uploads from Vercel storefront and admin portal.
- [ ] Task 7.7: Bind custom domain `media.vistarakrafts.com` to R2 bucket.

### Phase 3: Cloudflare Turnstile & KV Sessions
- [ ] Task 7.8: Generate Turnstile Site Key & Secret Key in Cloudflare dashboard.
- [ ] Task 7.9: Run `npx wrangler kv:namespace create VISTARA_SESSIONS` and bind to `wrangler.toml`.
- [ ] Task 7.10: Set `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel environment variables.

### Phase 4: Razorpay Live Activation
- [ ] Task 7.11: Generate live API keys (`rzp_live_...`) in Razorpay dashboard.
- [ ] Task 7.12: Add Webhook endpoint `https://vistara-krafts.vercel.app/api/webhooks/razorpay`.
- [ ] Task 7.13: Update `VITE_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel settings.

### Phase 5: Domain & DNS Cutover
- [ ] Task 7.14: Update domain registrar NS records to Cloudflare nameservers.
- [ ] Task 7.15: Create CNAME records for `@`, `www`, and `admin` pointing to `cname.vercel-dns.com`.
- [ ] Task 7.16: Verify SSL/TLS Full (Strict) certificates.
```

---

## 4. Backlog & Post-Launch Tasks (Sprint 8)

```markdown
- [ ] Task 8.1: Real-time WhatsApp order tracking updates via Gupshup / Twilio API.
- [ ] Task 8.2: Automated BlueDart / Delhivery AWB label printing API integration.
- [ ] Task 8.3: Multi-currency currency converter (USD, GBP, AED) for international NRI bridal clientele.
- [ ] Task 8.4: B2B Wholesale inquiry portal and tiered pricing for professional resin artists.
- [ ] Task 8.5: Automated abandoned cart recovery emails via Cloudflare Worker cron triggers.
```
