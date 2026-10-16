# ARCHITECTURE.md — SYSTEM TOPOLOGY & ENGINEERING BLUEPRINT

> **Ecosystem:** Vistāra Krafts & POTRY Ceramics E-Commerce Platform  
> **Customer Storefront:** `https://vistara-krafts.vercel.app` (Custom domain: `https://vistarakrafts.com`)  
> **Owner Admin Portal:** `https://vistara-krafts-admin.vercel.app`  
> **Cloudflare Edge Gateway:** Pages Functions (`functions/api/[[route]].js`)  
> **Primary Author:** Antigravity Principal Systems Architect & Super-Designer  
> **Last Updated:** October 2026  

---

## 1. High-Level System Architecture

The platform is designed as a distributed, decoupled e-commerce architecture optimized for extreme client performance, edge-compute scalability, and zero admin UI leakage:

```mermaid
flowchart TD
    subgraph Users ["Clients & Consumers"]
        Customer["Customer Device<br/>(Mobile / Tablet / Desktop)"]
        Owner["Store Owner / Operator<br/>(Desktop / Tablet)"]
    end

    subgraph CDN ["Edge Delivery & CDN (Vercel & Cloudflare Edge)"]
        SF_Host["Customer Storefront Host<br/>(Vercel Edge / Cloudflare Pages)"]
        AP_Host["Admin Portal Host<br/>(Vercel SPA)"]
    end

    subgraph Sync ["Real-Time Sync Engine"]
        BC["BroadcastChannel<br/>'RAM_STUDIO_LIVE_DROP_CHANNEL'"]
    end

    subgraph EdgeCompute ["Cloudflare Edge Compute (Pages Functions)"]
        Router["Edge API Router<br/>/api/* (functions/api/[[route]].js)"]
        Turnstile["Cloudflare Turnstile<br/>Bot Verification Engine"]
        AuthModule["PBKDF2 Auth & Session Issuer"]
        OrderModule["Order & Checkout Engine"]
    end

    subgraph Storage ["Cloudflare Serverless Persistence Layer"]
        D1[("Cloudflare D1 SQL<br/>vistara_krafts_db (SQLite)")]
        KV[("Cloudflare KV<br/>Session Cache (30-Day TTL)")]
        R2[("Cloudflare R2<br/>vistara-media Object Bucket")]
    end

    subgraph Gateway ["Payment & Logistics"]
        Razorpay["Razorpay Gateway<br/>Checkout & Webhook Verification"]
        Courier["Logistics Telemetry<br/>(BlueDart / Delhivery / Shiprocket)"]
    end

    Customer -->|HTTPS / Port 443| SF_Host
    Owner -->|HTTPS / Port 443| AP_Host

    Customer <-->|Real-Time Drop Sync| BC
    Owner <-->|Publish Product Drops| BC

    SF_Host -->|REST /api/*| Router
    AP_Host -->|Service Layer /api/*| Router

    Router --> Turnstile
    Router --> AuthModule
    Router --> OrderModule

    AuthModule --> D1
    AuthModule --> KV
    OrderModule --> D1
    AP_Host -->|Asset Uploads| R2

    Customer -->|Payments| Razorpay
    OrderModule -->|Webhook Signature Verify| Razorpay
    OrderModule --> Courier
```

---

## 2. Customer Storefront Architecture (`stitch_potry_e_commerce_storefront`)

### 1. Philosophy: Zero-Framework Craft & 120fps Kinetic Physics
The storefront is constructed in pure vanilla JavaScript, HTML5, and CSS Variables. This deliberate architectural choice guarantees:
- **Instant TTI (Time to Interactive):** Near-zero JavaScript bundle parse time.
- **Hardware-Accelerated Fluidity:** 120fps animations executed entirely on GPU-composited properties (`transform`, `opacity`, `backdrop-filter`).
- **Zero Framework Drift:** Completely immune to major version breaking changes in external view libraries.

### 2. State & Engine Architecture (`store-bridge.js`)
State is maintained in a central singleton `StorefrontBridge` (`window.StorefrontBridge` and `window.ResinStore`):
```mermaid
flowchart LR
    Bridge["StorefrontBridge (store-bridge.js)"]
    
    Bridge --> Products["Catalog State<br/>(12 Flagship SKUs)"]
    Bridge --> Cart["Cart State<br/>(Items, Discounts, GST)"]
    Bridge --> Auth["Auth State<br/>(Token, Profile, Wishlist)"]
    Bridge --> Social["Social Proof<br/>(Likes, Comments)"]
    Bridge --> LiveDrop["BroadcastChannel Listener<br/>(Live Drops from Admin)"]

    Cart --> Storage[("localStorage / Memory Fallback")]
    Auth --> Storage
```
- **Resilience Invariant:** If `localStorage` throws a `QuotaExceededError` or `SecurityError` (e.g. strict Safari Private Browsing mode), the bridge transparently degrades to an in-memory Map, ensuring the cart and checkout never crash.

### 3. View Routing & DOM Reconciliation (`app.js`)
- Client-side hash router handling 7 core views:
  - `#/home` — Brand Hero, 3D Specimen Orb, Pour Calculator, Featured Grid.
  - `#/catalog` — Comprehensive catalog with category and gender filters.
  - `#/custom-studio` — Interactive epoxy casting customizer and volume calculator.
  - `#/social` — Instagram atelier feed (`@resin.art.memories`) with live liking.
  - `#/product/:id` — Kinetic PDP with gallery, optional varieties, and trust badges.
  - `#/cart` — Volume discount tiers, coupon engine, and shipping thresholds.
  - `#/orders` — Track historical studio orders and status progression.
- **Zero Admin Leakage:** The router rejects any admin URLs and strictly renders customer-facing components.

---

## 3. Owner Admin Portal Architecture (`vistara_krafts_admin_portal`)

### 1. Tech Stack
- **Framework:** React 19 + TypeScript (Strict Mode).
- **Build Tool:** Vite 5 (instant HMR and tree-shaken production bundles).
- **Styling:** Tailwind CSS v4 with custom brand tokens matching the 60/30/10 warm gallery aesthetic.
- **Icons:** `lucide-react` (refined 1.5px stroke weight).

### 2. Modular Service Layer Pattern
Every admin domain is abstracted behind a dedicated service module:
```
src/services/
├── authService.ts        # Admin login, session validation, logout
├── productService.ts     # Products CRUD, search, filter, BroadcastChannel drop
├── inventoryService.ts   # Stock levels, movement logs, reason-coded adjustments
├── orderService.ts       # Order pipeline status, timeline updates, invoice print
├── customerService.ts    # Customer CRM, lifetime value, loyalty tags
├── storageService.ts     # Cloudflare R2 presigned upload simulation & mime validation
└── systemService.ts      # Cloudflare edge health, database latency telemetry
```

### 3. Dual-Mode Mock / Live Adapter Architecture
All services are engineered with an adapter pattern:
- **Development & Staging Mode (`VITE_USE_MOCK_SERVICES=true`):**
  - Uses reactive in-memory state initialized with rich dummy data.
  - Persists changes across browser sessions using isolated admin local storage keys.
  - Broadcasts product updates to customer tabs via `BroadcastChannel`.
- **Production Mode (`VITE_USE_MOCK_SERVICES=false`):**
  - Dispatches standard `fetch()` HTTP requests to the Cloudflare Pages Function `/api/*` routes.
  - Transmits Bearer tokens and handles HTTP 401/403 session expiration automatically.

---

## 4. Edge Persistence & Database Topology

### Cloudflare D1 Serverless SQL Schema
The system runs on Cloudflare D1 (serverless SQLite at the edge) defined in `cloudflare/schema.sql`:

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : "issues"
    USERS ||--o{ ORDERS : "places"
    PRODUCTS ||--o{ INVENTORY_LOGS : "tracks"
    ORDERS ||--o{ PAYMENTS : "reconciles"

    USERS {
        text id PK
        text email UK
        text name
        text phone
        text address
        text pincode
        text provider
        text password_hash
        text password_salt
        text wishlist_json
        text member_tier
        integer loyalty_points
        text created_at
        text updated_at
    }

    SESSIONS {
        text token_hash PK
        text user_id FK
        text provider
        text expires_at
        text created_at
    }

    ORDERS {
        text order_id PK
        text user_id FK
        text customer_name
        text customer_email
        text phone
        text address
        text pincode
        integer subtotal
        integer discount
        real gst_amount
        integer total
        text payment_method
        integer gift_wrap
        integer mockup_approved
        text status
        integer stage_index
        text items_json
        text courier
        text created_at
    }

    PRODUCTS {
        text id PK
        text sku UK
        text name
        text brand
        text category
        integer price
        integer stock
        text gender
        text varieties_json
        text status
    }

    INVENTORY_LOGS {
        text id PK
        text product_id FK
        text sku
        integer change
        integer previous_stock
        integer new_stock
        text reason
        text notes
        text created_by
        text created_at
    }

    PAYMENTS {
        text id PK
        text payment_id UK
        text order_id FK
        integer amount
        text currency
        text status
        text method
        text razorpay_order_id
        text created_at
    }
```

---

## 5. Real-Time Cross-Application Synchronization

To enable instantaneous live drops without expensive WebSocket infrastructure, the system utilizes the browser's native **`BroadcastChannel` API**:

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Studio Admin (Admin Portal)
    participant AP as Admin Portal (React)
    participant BC as BroadcastChannel ('RAM_STUDIO_LIVE_DROP_CHANNEL')
    participant SF as Customer Storefront (Vanilla JS)
    actor Customer as Shopper (Storefront Tab)

    Owner->>AP: Edits Product & Clicks "Publish Drop"
    AP->>AP: Updates Local Store & Dispatches to /api/products
    AP->>BC: postMessage({ type: 'PRODUCTS_UPDATED', payload: [products] })
    BC->>SF: onmessage triggers in all open storefront tabs
    SF->>SF: Store.receiveStudioPush(payload)
    SF->>SF: Re-renders active catalog / PDP view instantly
    SF->>Customer: Displays subtle toast: "✨ Studio Drop Live: Catalog Updated"
```

---

## 6. Security Architecture & Threat Modeling

1. **Authentication Security:**
   - Client passwords are never stored in plaintext. Passwords undergo **PBKDF2** key derivation with 50,000 SHA-256 iterations and a unique 16-character cryptographic salt.
   - Session tokens are issued using cryptographically secure UUIDs (`crypto.randomUUID()`), hashed with SHA-256 before storage in D1 and KV.
2. **Bot Deterrence & Abuse Prevention:**
   - Registration and checkout endpoints require validation through **Cloudflare Turnstile**.
   - Requests lacking a valid Turnstile token are rejected at the edge with HTTP 403.
3. **Cross-Origin & Header Policy:**
   - Strict CORS configuration whitelisting the production domains:
     - `https://vistara-krafts.vercel.app`
     - `https://vistara-krafts-admin.vercel.app`
     - `https://vistarakrafts.com`
   - `Cross-Origin-Opener-Policy: same-origin-allow-popups` enabled to support 1-Click Google and Apple OAuth popups.
4. **Data Privacy Compliance:**
   - Complete compliance with the **Digital Personal Data Protection (DPDP) Act 2023** (explicit customer consent, clear privacy policies, data erasure capability).

---

## 7. Performance & Resilience Guardrails

- **Zero Layout Shift (CLS < 0.05):** Strict aspect ratio constraints and inline image dimensions prevent jarring page reflows.
- **Largest Contentful Paint (LCP < 1.2s):** Pre-rendered critical hero paths and high-priority image fetching.
- **Offline & Network Resilience:**
  - Dynamic network state listener (`navigator.onLine`) triggers a graceful offline banner.
  - Dedicated `404.html` and `500.html` standalone fallback pages with instant route recovery.
