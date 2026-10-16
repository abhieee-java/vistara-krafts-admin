# API CONTRACTS — SUPABASE, CLOUDINARY & RAZORPAY SPECIFICATION

> **Database & Auth:** Supabase PostgREST & GoTrue API (`https://<PROJECT_REF>.supabase.co`)  
> **Media CDN & Storage:** Cloudinary REST Upload API (`https://api.cloudinary.com/v1_1/<CLOUD_NAME>`)  
> **Payment Gateway:** Razorpay API (`https://api.razorpay.com/v1`)  
> **Protocol:** HTTPS / TLS 1.3  
> **Payload Format:** JSON (`application/json; charset=utf-8`)  
> **Last Updated:** October 2026  

---

## 1. Global Standards & Authentication Protocol

### 1. Common Supabase Request Headers
| Header | Type | Description |
| :--- | :--- | :--- |
| `apikey` | String | Supabase Public Anon Key (`VITE_SUPABASE_ANON_KEY`) or Service Role Key |
| `Authorization` | String | `Bearer <JWT_TOKEN>` (User session token or service role key) |
| `Content-Type` | String | `application/json` |
| `Prefer` | String | E.g. `return=representation`, `resolution=merge-duplicates` |

### 2. Common Supabase Error Envelope
```json
{
  "code": "PGRST116",
  "details": null,
  "hint": null,
  "message": "JSON object requested, multiple (or no) rows returned"
}
```

---

## 2. Supabase Auth API (GoTrue)

Base URL: `https://<PROJECT_REF>.supabase.co/auth/v1`

### 1. Register Patron / User
**Endpoint:** `POST /auth/v1/signup`

#### Request Body
```json
{
  "email": "priya.sharma@example.com",
  "password": "UltraSecurePassword123!",
  "data": {
    "full_name": "Priya Sharma",
    "phone": "+91 98765 43210",
    "address": "402 Lavender Towers, Indiranagar",
    "pincode": "560038"
  }
}
```

#### Success Response (`200 OK`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "u4W7rQ...",
  "user": {
    "id": "e4b3734c-2849-43c2-8438-e6d328cf0b41",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "priya.sharma@example.com",
    "email_confirmed_at": "2026-10-16T10:00:00.000Z",
    "user_metadata": {
      "full_name": "Priya Sharma",
      "phone": "+91 98765 43210"
    }
  }
}
```

### 2. Login with Password
**Endpoint:** `POST /auth/v1/token?grant_type=password`

#### Request Body
```json
{
  "email": "priya.sharma@example.com",
  "password": "UltraSecurePassword123!"
}
```

#### Success Response (`200 OK`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "u4W7rQ...",
  "user": {
    "id": "e4b3734c-2849-43c2-8438-e6d328cf0b41",
    "email": "priya.sharma@example.com"
  }
}
```

### 3. Sign Out
**Endpoint:** `POST /auth/v1/logout`  
**Header:** `Authorization: Bearer <access_token>`

#### Success Response (`204 No Content`)

### 4. Password Recovery
**Endpoint:** `POST /auth/v1/recover`

#### Request Body
```json
{
  "email": "owner@vistarakrafts.com"
}
```

#### Success Response (`200 OK`)
```json
{}
```

---

## 3. Products API (Supabase PostgREST)

Base URL: `https://<PROJECT_REF>.supabase.co/rest/v1/products`

### 1. List Products (Storefront Catalog Query)
**Endpoint:** `GET /rest/v1/products?select=*&is_active=eq.true&order=created_at.desc`  
**Headers:** `apikey: <ANON_KEY>`

#### Success Response (`200 OK`)
```json
[
  {
    "id": "ram-varmala-001",
    "sku": "RAM-VK-HEX-3500",
    "name": "Varmala Preservation Hexagon Diamond Block",
    "brand": "Resin Art Memories",
    "category": "keepsake",
    "price": 8499.00,
    "regular_price": 9999.00,
    "stock": 14,
    "in_stock": true,
    "gender": "women",
    "variants": [
      {
        "id": "ram-varmala-001-lg",
        "name": "Grand 10-inch Hexagon (3.5kg)",
        "sku": "RAM-VK-HEX-3500",
        "price": 8499.00,
        "stock": 8
      }
    ],
    "specs": {
      "resin": "UltraClear 3:1 UV-Resistant",
      "cureTime": "72 Hours Pressure Cured",
      "finish": "Hand Diamond-Polished 10,000 Grit"
    },
    "colors": ["Diamond Clear", "Champagne Gold Flecks"],
    "shapes": ["Hexagon", "Octagon", "Arch"],
    "sizes": ["8-inch (2.2kg)", "10-inch (3.5kg)"],
    "is_active": true,
    "created_at": "2026-10-10T12:00:00.000Z",
    "updated_at": "2026-10-16T12:00:00.000Z"
  }
]
```

### 2. Create Product (Admin Portal Drop)
**Endpoint:** `POST /rest/v1/products`  
**Headers:** `Authorization: Bearer <ADMIN_OR_SERVICE_ROLE_KEY>`, `Prefer: return=representation`

#### Request Body
```json
{
  "id": "potry-pitcher-001",
  "sku": "POTRY-PTCH-1200",
  "name": "Sienna Ridged Terracotta Pitcher (1200ml)",
  "brand": "POTRY",
  "category": "ceramic",
  "price": 2850.00,
  "regular_price": 3200.00,
  "stock": 22,
  "in_stock": true,
  "gender": "all",
  "colors": ["Sienna Rust", "Wabi White"],
  "shapes": ["Fluted", "Round Belly"],
  "sizes": ["1200ml"],
  "is_active": true
}
```

#### Success Response (`201 Created`)
Returns the newly created product row.

### 3. Update Product
**Endpoint:** `PATCH /rest/v1/products?id=eq.potry-pitcher-001`  
**Headers:** `Authorization: Bearer <ADMIN_KEY>`, `Prefer: return=representation`

#### Request Body
```json
{
  "stock": 30,
  "price": 2750.00
}
```

---

## 4. Orders API (Supabase PostgREST)

Base URL: `https://<PROJECT_REF>.supabase.co/rest/v1/orders`

### 1. Create Order
**Endpoint:** `POST /rest/v1/orders`  
**Headers:** `Authorization: Bearer <USER_JWT>`, `Prefer: return=representation`

#### Request Body
```json
{
  "id": "VK-2026-9021",
  "customer_name": "Priya Sharma",
  "customer_email": "priya.sharma@example.com",
  "phone": "+91 98765 43210",
  "address": "402 Lavender Towers, Indiranagar",
  "pincode": "560038",
  "subtotal": 8499.00,
  "discount": 500.00,
  "gst_amount": 1439.82,
  "total": 9438.82,
  "payment_method": "razorpay",
  "gift_wrap": true,
  "mockup_approved": true,
  "status": "processing",
  "stage_index": 1,
  "items": [
    {
      "productId": "ram-varmala-001",
      "title": "Varmala Preservation Hexagon Diamond Block",
      "price": 8499.00,
      "quantity": 1,
      "selectedColor": "Diamond Clear",
      "selectedShape": "Hexagon",
      "selectedSize": "10-inch (3.5kg)"
    }
  ]
}
```

#### Success Response (`201 Created`)
Returns the persisted order row.

---

## 5. Media Upload API (Cloudinary Direct Unsigned)

Base URL: `https://api.cloudinary.com/v1_1/<CLOUDINARY_CLOUD_NAME>/image/upload`

### Upload Media Asset
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

#### Form Parameters
| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | Binary File / Blob | JPG, PNG, WEBP, or GIF (max 10MB) |
| `upload_preset` | String | Cloudinary unsigned preset (e.g. `vistara_products` or `vistara_keepsakes`) |
| `folder` | String | Target Cloudinary directory (e.g. `vistara-products`) |

#### Success Response (`200 OK`)
```json
{
  "asset_id": "7d9a10...",
  "public_id": "vistara-products/ram-varmala-001-hero",
  "version": 1729080000,
  "format": "webp",
  "width": 1600,
  "height": 1600,
  "bytes": 245120,
  "secure_url": "https://res.cloudinary.com/vistara-krafts/image/upload/v1729080000/vistara-products/ram-varmala-001-hero.webp"
}
```

#### URL Auto-Transformation Formula
```
https://res.cloudinary.com/{cloud_name}/image/upload/f_auto,q_auto,w_{width}/{public_id}.{format}
```
- `f_auto`: Automatically serves next-gen formats (AVIF, WEBP) based on browser support.
- `q_auto`: Dynamic visual quality compression balancing crispness and byte weight.
- `w_{width}`: Responsive scaling for device viewports (e.g. `w_800` for mobile, `w_1600` for Retina).

---

## 6. Razorpay Payment Gateway Contract

### 1. Client-Side Options Initialization
```javascript
const rzpOptions = {
  key: window.ENV?.RAZORPAY_KEY_ID || "rzp_live_PLACEHOLDER",
  amount: Math.round(order.total * 100), // In Paise
  currency: "INR",
  name: "Vistāra Krafts Studio",
  description: "Artisanal Keepsakes & Specialty Resin Chemicals",
  image: "https://vistara-krafts.vercel.app/vistara-krafts-logo.jpg",
  order_id: razorpayOrderId,
  handler: function (response) {
    // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
    verifyPaymentSignature(response);
  },
  prefill: {
    name: order.customer_name,
    email: order.customer_email,
    contact: order.phone
  },
  theme: {
    color: "#031a38"
  }
};
const rzp = new window.Razorpay(rzpOptions);
rzp.open();
```

### 2. Signature Verification Contract
The payment signature is valid if and only if:
```
HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET) === razorpay_signature
```
