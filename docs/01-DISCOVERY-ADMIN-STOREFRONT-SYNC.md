# VISTĀRA KRAFTS — 100% ADMIN ↔ STOREFRONT SYNCHRONIZATION & UI/UX EXCELLENCE SPECIFICATION

**Author:** Chief AI Engineering Coordinator  
**Approved By:** Kakoli Borah (Founder & Master Artisan) / Human Chief Architect  
**Status:** In Progress / Controlled Execution  
**Project:** Vistāra Krafts Owner Portal & Customer Storefront

---

## 1. Executive Summary & Core Directives
1. **100% Synchronization Between Admin Panel & Storefront:**
   - Every product change (Create, Edit, Duplicate, Archive, Toggle Stock, Price Delta, Resin Specs, Varieties) must write directly to Supabase and broadcast over `BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL')` to the live storefront across all active sessions.
   - Every stock adjustment in the Admin Portal must insert an audit record into the Supabase `inventory_logs` table (`RESTOCK`, `MANUAL_ADJUSTMENT`, `DAMAGE`, `AUDIT`, `RETURN`, `SALE`) and update product available stock in real time.
   - Every Store Setting change (Store Name, Brand Tagline, Contact Email, Phone, Instagram, Free Shipping Threshold, Announcement Bar Active/Text, Floral Preservation Section toggle) must write to both `settings` and `categories` tables in Supabase and broadcast immediately.
   - Promotional Coupons (add, edit, toggle active, delete, usage count, min order value, storefront visibility) must synchronize bidirectionally with Supabase `coupons`.
   - Customer Orders, AWB Tracking Numbers, Courier Partners (Delhivery, BlueDart, DTDC), Custom Preservation Stages (Cryo-Dehydration, Color Locking, Liquid Diamond Pour, 21-Day UV Cure, Polishing & Inspection, Dispatched), and Artisan Notes must sync seamlessly between Patron Accounts and the Owner Portal.
2. **Product Form Modal Conditional Logic:**
   - The "Resin Specifications — Mix ratios and curing chemistry" card must only be displayed when the Primary Category is Resin & Hardener Kit (`casting` or `deep_pour` or resin kits).
   - The "Target Audience / Style" selector must be hidden for chemical kits (Resin & Hardener Kits) and only visible for finished keepsakes, molds, or accessories.
3. **Storefront Scroll Position & History Restoration:**
   - When a patron explores down to the last product of the catalog and navigates into product details or checkout, pressing the Back button must smoothly and instantly restore their exact scroll position and focus on the product they were inspecting.
   - It must never snap back to the first product at the top of the catalog.
4. **Anti-AI Slop & "Apple, Elevated" Design Craft:**
   - Zero robotic AI tells, buzzwords, or placeholder content.
   - Elegant, warm ivory surfaces (`#faf8f5`), crisp 1px borders (`border-[#e6e2d8]`), tabular mono numerals for currency and stock quantities, tactile spring buttons (`active:scale-[0.98]`), and fluid transitions.
   - 100% responsive on mobile devices with thumb-zone ergonomics.

---

## 2. Supabase Database Schema Alignment
| Table | Operation | Admin Service | Realtime Broadcast |
|---|---|---|---|
| `products` | CRUD, Stock Toggle, Variant Management | `productService.ts` | `PRODUCTS_UPDATED` |
| `inventory_logs` | Stock Adjustment Audit Trail | `inventoryService.ts` | Local + DB sync |
| `orders` | Status Update, AWB Tracking, Custom Stages | `orderService.ts` | `ORDERS_UPDATED` |
| `coupons` | Upsert, Toggle, Delete, Usage Sync | `StoreContext.tsx` | `COUPONS_UPDATED` |
| `settings` | Store Info, Shipping, Announcement Bar | `StoreContext.tsx` | `SETTINGS_UPDATED` |
| `categories` | Redundancy mirror for store settings | `StoreContext.tsx` | `STORE_PUBLISHED` |

---

## 3. Verification Criteria
- `vistara-krafts-admin`: `npm run build` passes with zero TypeScript or bundle warnings.
- `stitch_potry_e_commerce_storefront`: `node verify-storefront.mjs` passes 27/27 tests.
- `stitch_potry_e_commerce_storefront`: `npm test` passes all 14 integration test suites.
- End-to-end cross-tab testing: Product updates, coupon creation, settings modifications, and stock adjustments synchronize across tabs and live storefront with zero page reloads.
