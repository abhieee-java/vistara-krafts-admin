# HANDOFF.md — OPERATIONAL PLAYBOOK & SYSTEM HANDOVER

> **Project Ecosystem:** Vistāra Krafts & POTRY Ceramics E-Commerce Platform  
> **Customer Storefront:** `https://vistara-krafts.vercel.app` (Target domain: `https://vistarakrafts.com`)  
> **Owner Admin Portal:** `https://vistara-krafts-admin.vercel.app`  
> **Primary Author:** Antigravity Principal Systems Architect & Super-Designer  
> **Handover Date:** October 2026  

---

## 1. Executive Summary & Handover Scope

This document provides a turnkey operational handover of the entire Vistāra Krafts & POTRY Ceramics e-commerce platform. Both frontends (Storefront and Admin Portal) are fully engineered, verified, and deployed on Vercel. The backend is architected exclusively for Cloudflare (Pages Functions, D1 SQL, R2 Media Storage, KV, and Turnstile) paired with Razorpay for payment capture.

---

## 2. System Coordinates & Repository Reference

| System Component | Repository Link | Live Production URL | Primary Tech Stack |
| :--- | :--- | :--- | :--- |
| **Customer Storefront** | [`abhieee-java/vistara-krafts`](https://github.com/abhieee-java/vistara-krafts) | [`vistara-krafts.vercel.app`](https://vistara-krafts.vercel.app) | Vanilla JS SPA · 120fps Kinetic CSS · Edge API |
| **Owner Admin Portal** | [`abhieee-java/vistara-krafts-admin`](https://github.com/abhieee-java/vistara-krafts-admin) | [`vistara-krafts-admin.vercel.app`](https://vistara-krafts-admin.vercel.app) | React 19 · TypeScript · Vite · Tailwind v4 |
| **Edge API Gateway** | Inside Storefront (`/functions/api/`) | `https://vistara-krafts.vercel.app/api` | Cloudflare Pages Functions (`[[route]].js`) |
| **Serverless Database** | Schema in `cloudflare/schema.sql` | Cloudflare D1 (`vistara_krafts_db`) | Serverless SQLite at the Edge |
| **Media & Assets Bucket** | Cloudflare R2 | `https://media.vistarakrafts.com` | S3-Compatible Cloudflare R2 Bucket |

---

## 3. Environment Variables & Secret Configuration Matrix

### 1. Storefront Vercel Configuration (`vistara-krafts`)
| Variable Key | Required | Public / Secret | Description |
| :--- | :---: | :---: | :--- |
| `TURNSTILE_SITE_KEY` | Yes | Public | Cloudflare Turnstile public widget site key. |
| `TURNSTILE_SECRET_KEY` | Yes | Secret | Cloudflare Turnstile server verification secret. |
| `VITE_RAZORPAY_KEY_ID` | Yes | Public | Razorpay Key ID (`rzp_live_...` or `rzp_test_...`). |
| `RAZORPAY_KEY_SECRET` | Yes | Secret | Razorpay Key Secret for HMAC verification. |
| `SITE_URL` | Yes | Public | Canonical production URL (`https://vistarakrafts.com`). |
| `ENVIRONMENT` | Yes | Public | Set to `production`. |

### 2. Admin Portal Vercel Configuration (`vistara-krafts-admin`)
| Variable Key | Required | Public / Secret | Description |
| :--- | :---: | :---: | :--- |
| `VITE_USE_MOCK_SERVICES` | Yes | Public | Set to `false` when connecting to live Cloudflare backend. |
| `VITE_API_URL` | Yes | Public | Base API URL: `https://vistara-krafts.vercel.app/api`. |
| `VITE_RAZORPAY_KEY_ID` | Yes | Public | Razorpay Key ID for payments dashboard reconciliation. |
| `VITE_R2_PUBLIC_DOMAIN` | Yes | Public | Base CDN URL: `https://media.vistarakrafts.com`. |

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
   - If the item has variations, enter comma-separated values (e.g. `Royal Gold, Champagne Rose`).
6. Upload high-resolution photos via the drag-and-drop uploader.
7. Click **Save Product**. The update broadcasts instantly to all open customer tabs.

---

### Runbook 2: Fulfilling an Order & Printing Invoices
1. Navigate to **Orders** to view incoming customer orders.
2. Click any order row to open the **Order Details Drawer**.
3. Advance the order stage through the 6-step pipeline:
   - `1: Studio Batch Allocated` → `2: Casting & Curing` → `3: Quality Inspection` → `4: Hand-Packed & Sealed` → `5: In Transit` → `6: Delivered`.
4. Add BlueDart / Delhivery AWB tracking numbers in the courier field.
5. Click **Print Tax Invoice** to preview or print a 100% GST-compliant tax invoice splitting taxable amount, CGST, SGST, and IGST.

---

### Runbook 3: Reconciling Inventory & Stock Adjustments
1. Navigate to **Inventory** to inspect real-time stock levels and low-stock alerts.
2. To adjust stock, click **Adjust Stock (+/-)** on any product row.
3. Select an adjustment direction, enter quantity delta, and pick a mandatory reason:
   - `RESTOCK` — Received fresh workshop chemical batch or ceramic firing.
   - `DAMAGED` — Floral crystal cracked during diamond polishing or handling.
   - `AUDIT` — Routine physical cycle count correction.
   - `RETURN` — Customer return accepted back into sellable inventory.
4. Enter brief operator notes and click **Save Adjustment**.
5. Inspect the **Movement Audit Log** at the bottom of the page to verify audit attribution.

---

## 5. Developer & AI Agent Maintenance Runbook

### 1. Verifying the Customer Storefront
Run the 25-suite automated verification runner:
```bash
cd stitch_potry_e_commerce_storefront
node verify-storefront.mjs
```
*Expected output: `Verification Summary: 25 passed, 0 failed`.*

### 2. Verifying the Owner Admin Portal
Run TypeScript strict type-checking and Vite production compilation:
```bash
cd vistara_krafts_admin_portal
npm run build
```
*Expected output: `✓ built in ~4s` with exit code 0.*

### 3. Deploying Schema Changes to Cloudflare D1
```bash
npx wrangler d1 execute vistara_krafts_db --remote --file=./cloudflare/schema.sql
```

---

## 6. Incident Management & Troubleshooting Guide

| Symptom / Incident | Root Cause | Immediate Remediation |
| :--- | :--- | :--- |
| **CORS error on Image Upload** | R2 bucket missing frontend origin headers | Re-apply `r2-cors.json` using `npx wrangler r2 bucket cors set vistara-media --file=./r2-cors.json`. |
| **Orders not showing in Admin** | `VITE_USE_MOCK_SERVICES` mismatch | If backend D1 is not yet provisioned, set `VITE_USE_MOCK_SERVICES=true`. Once live, set to `false`. |
| **Cart throws QuotaExceededError** | Safari Private Browsing blocking localStorage | Storefront's `store-bridge.js` automatically falls back to in-memory state; no action required. |
| **Turnstile Challenge Failing** | Secret key mismatch or domain not whitelisted | Add domain to Cloudflare Turnstile dashboard and verify `TURNSTILE_SECRET_KEY`. |
| **Missing Varieties on Storefront** | Varieties were intentionally left blank | Invariant behavior: blank fields indicate an intact product with zero variations. |

---

## 7. Emergency Contacts & Escalation Matrix

- **Principal Architect & Systems Lead:** Antigravity Super-Designer Team
- **Studio Founder & Operating Owner:** Vistāra Krafts & Resin Art Memories Atelier
- **Support Email:** `concierge@vistarakrafts.com` / `support@vistarakrafts.com`
- **Studio Address:** 42 Craft Enclave, Indiranagar 100 Feet Road, Bengaluru, Karnataka 560001, India
