# API CONTRACTS — CLOUDFLARE EDGE API SPECIFICATION

> **API Gateway:** Cloudflare Pages Functions (`functions/api/[[route]].js`)  
> **Base URL (Production):** `https://vistara-krafts.vercel.app/api`  
> **Custom Domain Target:** `https://api.vistarakrafts.in` / `https://vistarakrafts.in/api`  
> **Protocol:** HTTPS / HTTP/2 & HTTP/3  
> **Payload Format:** JSON (`application/json; charset=utf-8`)  
> **Last Updated:** October 2026  

---

## 1. Global Standards & Authentication Protocol

### 1. Common Request Headers
| Header | Type | Description |
| :--- | :--- | :--- |
| `Content-Type` | String | Must be `application/json; charset=utf-8` on `POST` and `PUT` requests. |
| `Authorization` | String | `Bearer <token>` (Issued upon login/registration). |
| `X-CF-Turnstile-Token` | String | Cloudflare Turnstile token for abuse-sensitive routes. |

### 2. Common Response Headers
```http
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-CF-Turnstile-Token
Cross-Origin-Opener-Policy: same-origin-allow-popups
```

### 3. Standard Error Envelope
All error responses adhere strictly to this schema:
```json
{
  "ok": false,
  "error": "Human-readable failure explanation.",
  "code": "INVALID_CREDENTIALS",
  "details": {}
}
```

---

## 2. Authentication & Patron Identity Endpoints

### `POST /api/auth/register`
Creates a verified customer patron record in Cloudflare D1.

#### Request Body
```json
{
  "email": "priya.sharma@example.com",
  "password": "UltraSecurePassword123!",
  "name": "Priya Sharma",
  "phone": "+91 98765 43210",
  "address": "402 Lavender Towers, Indiranagar",
  "pincode": "560038",
  "turnstileToken": "0.XXXXX.YYYYY",
  "wishlist": ["ram-varmala-001", "vk-epx-301"]
}
```

#### Success Response (`200 OK`)
```json
{
  "ok": true,
  "token": "vk_cf_a8f93bc410294e8db09a2c3d_m7x9q",
  "user": {
    "id": "usr_94b8e21a0fbc",
    "email": "priya.sharma@example.com",
    "name": "Priya Sharma",
    "phone": "+91 98765 43210",
    "address": "402 Lavender Towers, Indiranagar",
    "pincode": "560038",
    "provider": "email",
    "member_tier": "Verified Vistāra Patron",
    "loyalty_points": 250,
    "wishlist": ["ram-varmala-001", "vk-epx-301"]
  }
}
```

---

### `POST /api/auth/login`
Authenticates existing credentials against PBKDF2 salt and hash stored in D1.

#### Request Body
```json
{
  "email": "priya.sharma@example.com",
  "password": "UltraSecurePassword123!",
  "turnstileToken": "0.XXXXX.YYYYY"
}
```

#### Success Response (`200 OK`)
```json
{
  "ok": true,
  "token": "vk_cf_a8f93bc410294e8db09a2c3d_m7x9q",
  "user": {
    "id": "usr_94b8e21a0fbc",
    "email": "priya.sharma@example.com",
    "name": "Priya Sharma",
    "phone": "+91 98765 43210",
    "address": "402 Lavender Towers, Indiranagar",
    "pincode": "560038",
    "provider": "email",
    "member_tier": "Verified Vistāra Patron",
    "loyalty_points": 250,
    "wishlist": ["ram-varmala-001"]
  }
}
```

---

### `POST /api/auth/oauth`
Exchanges Google One-Tap / Apple ID OAuth identity tokens and synchronizes profile details in D1.

#### Request Body
```json
{
  "provider": "google",
  "credential": "eyJhbGciOiJSUzI1NiIs...",
  "address": "Flat 12B, Palm Meadows",
  "phone": "+91 91234 56789",
  "pincode": "560066",
  "wishlist": ["potry-ceramic-001"]
}
```

#### Success Response (`200 OK`)
```json
{
  "ok": true,
  "token": "vk_cf_e7c91240fba143d...",
  "user": {
    "id": "usr_goog_10823910293",
    "email": "aditya.verma@gmail.com",
    "name": "Aditya Verma",
    "phone": "+91 91234 56789",
    "address": "Flat 12B, Palm Meadows",
    "pincode": "560066",
    "provider": "google",
    "member_tier": "Verified Vistāra Patron",
    "loyalty_points": 250,
    "wishlist": ["potry-ceramic-001"]
  }
}
```

---

### `GET /api/auth/me`
Validates session token (via `Authorization: Bearer <token>` or `Cookie: vk_cf_session=...`).

#### Success Response (`200 OK`)
```json
{
  "ok": true,
  "user": {
    "id": "usr_94b8e21a0fbc",
    "email": "priya.sharma@example.com",
    "name": "Priya Sharma",
    "phone": "+91 98765 43210",
    "address": "402 Lavender Towers, Indiranagar",
    "pincode": "560038",
    "provider": "email",
    "member_tier": "Verified Vistāra Patron",
    "loyalty_points": 250,
    "wishlist": ["ram-varmala-001"]
  }
}
```

---

### `POST /api/auth/logout`
Revokes active session in Cloudflare D1 and KV, clearing the session cookie.

#### Response (`200 OK`)
```json
{
  "ok": true,
  "message": "Session successfully terminated."
}
```

---

## 3. Order Management Endpoints

### `GET /api/orders`
Retrieves orders placed by the currently authenticated user.

#### Response (`200 OK`)
```json
{
  "ok": true,
  "count": 1,
  "orders": [
    {
      "order_id": "VK-2026-9021",
      "user_id": "usr_94b8e21a0fbc",
      "customer_name": "Priya Sharma",
      "customer_email": "priya.sharma@example.com",
      "phone": "+91 98765 43210",
      "address": "402 Lavender Towers, Indiranagar, Bengaluru",
      "pincode": "560038",
      "subtotal": 4499,
      "discount": 0,
      "gst_amount": 809.82,
      "total": 4499,
      "payment_method": "Razorpay Online (UPI / Card)",
      "gift_wrap": 1,
      "mockup_approved": 1,
      "status": "Order Confirmed • Studio Batch Allocated",
      "stage_index": 1,
      "items": [
        {
          "sku": "ram-varmala-001",
          "title": "Eternal Varmala 50mm Floral Keepsake Block",
          "price": 4499,
          "quantity": 1,
          "color": "Royal Gold",
          "shape": "Mughal Arch",
          "size": "12-inch Royal"
        }
      ],
      "courier": "BlueDart Priority Air • AWB Pending",
      "created_at": "2026-10-15 14:32:10"
    }
  ]
}
```

---

### `POST /api/orders`
Places an authenticated order into D1. Unauthenticated requests are rejected.

#### Request Body
```json
{
  "orderId": "VK-2026-9021",
  "customerName": "Priya Sharma",
  "customerEmail": "priya.sharma@example.com",
  "phone": "+91 98765 43210",
  "address": "402 Lavender Towers, Indiranagar, Bengaluru",
  "pincode": "560038",
  "subtotal": 4499,
  "discount": 0,
  "gstAmount": 809.82,
  "total": 4499,
  "paymentMethod": "Razorpay Online (UPI / Card)",
  "giftWrap": true,
  "mockupApproved": true,
  "items": [
    {
      "sku": "ram-varmala-001",
      "title": "Eternal Varmala 50mm Floral Keepsake Block",
      "price": 4499,
      "quantity": 1,
      "color": "Royal Gold",
      "shape": "Mughal Arch",
      "size": "12-inch Royal"
    }
  ],
  "courier": "BlueDart Priority Air"
}
```

---

### `PATCH /api/orders/:id/status` (Admin Portal)
Updates order fulfillment status, courier tracking, and stage index.

#### Request Body
```json
{
  "status": "In Transit • Dispatched via BlueDart Air",
  "stageIndex": 5,
  "courier": "BlueDart Air • AWB #8491029312",
  "notes": "Floral block polished and packaged with wax seal."
}
```

---

## 4. Product Catalog Management Endpoints

### `GET /api/products`
Retrieves catalog products with optional query filtering.
- Query Parameters:
  - `category`: `keepsake` | `chemical` | `art_decor` | `homeware` | `ceramic`
  - `gender`: `all` | `women` | `men`
  - `search`: Case-insensitive text query

#### Response (`200 OK`)
```json
{
  "ok": true,
  "count": 12,
  "products": [
    {
      "id": "ram-varmala-001",
      "sku": "ram-varmala-001",
      "name": "Eternal Varmala 50mm Floral Keepsake Block",
      "brand": "Resin Art Memories",
      "category": "keepsake",
      "price": 4499,
      "compareAtPrice": 5499,
      "stock": 18,
      "status": "active",
      "featured": true,
      "gender": "women",
      "genderAffinity": "feminine",
      "colors": ["Royal Gold", "Champagne Rose"],
      "shapes": ["Mughal Arch", "Hexagon", "Circle"],
      "sizes": ["6-inch Desk", "12-inch Royal"],
      "image": "/assets/varmala-crystal.jpg",
      "gallery": []
    }
  ]
}
```

---

### `POST /api/products` & `PUT /api/products/:id` (Admin Portal)
Creates or updates a product in the catalog.
- If `colors`, `shapes`, or `sizes` are empty or omitted, they are stored as `[]`.

#### Request Body
```json
{
  "sku": "vk-custom-001",
  "name": "Botanical Heritage Keepsake Paperweight",
  "brand": "Vistāra Krafts",
  "category": "keepsake",
  "price": 1899,
  "compareAtPrice": 2299,
  "stock": 25,
  "status": "active",
  "featured": false,
  "gender": "all",
  "colors": [],
  "shapes": [],
  "sizes": [],
  "image": "https://media.vistarakrafts.in/products/paperweight.jpg",
  "description": "Optical acrylic-epoxy paperweight encasing heirloom dried botanicals."
}
```

---

## 5. Inventory Movement & Adjustment Endpoints

### `POST /api/inventory/adjust` (Admin Portal)
Executes a stock adjustment with full audit attribution.

#### Request Body
```json
{
  "sku": "vk-epx-301",
  "adjustment": 20,
  "reason": "RESTOCK",
  "notes": "Received 20 factory units of 3:1 resin kit batch #B892.",
  "adjustedBy": "admin@vistarakrafts.in"
}
```

#### Response (`200 OK`)
```json
{
  "ok": true,
  "sku": "vk-epx-301",
  "previousStock": 42,
  "newStock": 62,
  "logId": "inv_log_98f12a0c"
}
```

---

## 6. Cloudflare R2 Media Storage Endpoints

### `POST /api/storage/upload-url` (Admin Portal)
Generates a presigned S3/R2 direct upload URL for product photography.

#### Request Body
```json
{
  "filename": "varmala-hero.jpg",
  "contentType": "image/jpeg",
  "fileSize": 1849102
}
```

#### Response (`200 OK`)
```json
{
  "ok": true,
  "uploadUrl": "https://vistara-media.<account>.r2.cloudflarestorage.com/products/varmala-hero.jpg?X-Amz-Signature=...",
  "publicUrl": "https://media.vistarakrafts.in/products/varmala-hero.jpg",
  "key": "products/varmala-hero.jpg"
}
```

---

## 7. System Health & SEO Telemetry Endpoints

### `GET /api/health`
Edge infrastructure diagnostic and binding telemetry.

#### Response (`200 OK`)
```json
{
  "ok": true,
  "service": "Vistāra Krafts E-Commerce API",
  "environment": "production",
  "bindings": {
    "d1": true,
    "kv": true,
    "r2": true
  },
  "timestamp": "2026-10-16T05:10:00.000Z"
}
```

---

### `GET /api/seo`
Outputs AEO (Answer Engine Optimization) and JSON-LD discovery payloads for AI scrapers (Perplexity, ChatGPT, Gemini, Claude).
```json
{
  "ok": true,
  "siteUrl": "https://vistara-krafts.vercel.app",
  "futureCustomDomain": "https://vistarakrafts.in",
  "brand": "Vistāra Krafts × Resin Art Memories (@resin.art.memories)",
  "geo": {
    "country": "IN",
    "placename": "Bengaluru, Karnataka, India",
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "aeoSchemas": ["Organization", "OnlineStore", "LocalBusiness", "Product", "FAQPage"]
}
```
