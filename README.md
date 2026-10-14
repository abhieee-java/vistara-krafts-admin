# Vistāra Krafts — Dedicated Owner Operations Portal

> **Luxury E-Commerce Atelier Administration System**  
> *Resin Art Memories (@resin.art.memories) × Vistāra Krafts Studio*

![Vistāra Krafts Admin Portal](https://raw.githubusercontent.com/abhieee-java/vistara-krafts-admin/main/public/preview.png)

## Overview

A dedicated, standalone Owner/Admin portal architected specifically for **Vistāra Krafts**. Built with a modular, swappable service layer ready to connect to **Cloudflare D1**, **Cloudflare R2**, and **Razorpay** without requiring redesign.

### Key Capabilities

- **Single-Owner Command Console:** Zero staff hierarchy friction; dedicated owner authentication with session monitoring.
- **Products & Optical Resin Catalog:** Full CRUD operations for preserved floral keepsakes, optical 3:1 & 2:1 epoxy systems, chameleon pigments, and silicone molds. Includes instant stock toggles and variant builders.
- **Inventory & Movement Audit Trail:** Accurate stock quantity tracking with automated audit logging for restocks, adjustments, and order deductions.
- **Orders & Express Dispatch:** Manage fulfillment status, Pan-India delivery addresses with 6-digit PIN validation, courier tracking assignment (**Delhivery Express**, **BlueDart Air**, **DTDC Priority**), and printable tax invoices.
- **Promotions & Storefront Announcements:** Discount coupon management (percentage/flat off) and dynamic storefront announcement bar CMS.
- **Real-Time Storefront Sync:** Communicates with the live storefront across tabs via the `RAM_STUDIO_LIVE_DROP_CHANNEL` BroadcastChannel.
- **System Diagnostics:** Connection latency and health testing for Cloudflare D1, R2, and Razorpay.

---

## Tech Stack

- **Framework:** React 18, TypeScript, Vite 5
- **Styling:** Tailwind CSS with custom editorial tokens
- **Icons & Motion:** Lucide React, fluid micro-interactions
- **Backend Architecture:** Modular service abstraction layer prepared for Cloudflare Pages / Workers / D1 / KV / R2

---

## Live Deployments

- **Customer Storefront:** [https://vistara-krafts.vercel.app](https://vistara-krafts.vercel.app)
- **Owner Admin Portal:** [https://vistara-krafts-admin.vercel.app](https://vistara-krafts-admin.vercel.app)

---

## Local Development (Optional)

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build
```

---

## License

Private repository for Vistāra Krafts Studio. All rights reserved.
