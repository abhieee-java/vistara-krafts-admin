# Vistāra Krafts — Dedicated Owner Operations Portal

> **Luxury E-Commerce Atelier Administration System**  
> *Resin Art Memories (@resin.art.memories) × Vistāra Krafts Studio*

## Overview

A dedicated, standalone Owner/Admin portal architected specifically for **Vistāra Krafts**. Built with a clean, modular service layer connected to **Supabase** (PostgreSQL 15+ & Supabase Auth), **Cloudinary** (Media CDN & Image Storage), and **Razorpay** (Payment Gateway).

### Key Capabilities

- **Single-Owner Command Console:** Zero staff hierarchy friction; dedicated owner authentication with session monitoring via Supabase Auth.
- **Products & Optical Resin Catalog:** Full CRUD operations for preserved floral keepsakes, optical 3:1 & 2:1 epoxy systems, chameleon pigments, silicone molds, and POTRY ceramics. Includes instant stock toggles, optional varieties (Colors, Shapes, Sizes), and gender targeting.
- **Inventory & Movement Audit Trail:** Accurate stock quantity tracking with automated audit logging in `public.inventory_logs` for restocks, adjustments, and order deductions.
- **Orders & Express Dispatch:** Manage fulfillment status, Pan-India delivery addresses with 6-digit PIN validation, courier tracking assignment (**Delhivery Express**, **BlueDart Air**, **DTDC Priority**), and printable tax invoices.
- **Promotions & Storefront Announcements:** Discount coupon management (percentage/flat off) and dynamic storefront announcement bar CMS.
- **Real-Time Storefront Sync:** Communicates with the live storefront across tabs via the `RAM_STUDIO_LIVE_DROP_CHANNEL` BroadcastChannel and Supabase Realtime CDC.
- **System Diagnostics:** Connection latency and health testing for Supabase, Cloudinary, and Razorpay.

---

## Tech Stack

- **Framework:** React 19, TypeScript, Vite 5
- **Styling:** Tailwind CSS v4 with custom editorial tokens (60/30/10 warm alabaster palette)
- **Icons & Motion:** Lucide React, fluid micro-interactions
- **Backend Architecture:** Supabase PostgreSQL 15+, Supabase Auth, Cloudinary Image Storage, Razorpay

---

## Live Deployments

- **Customer Storefront:** [https://vistara-krafts.vercel.app](https://vistara-krafts.vercel.app) (Target Domain: `https://vistarakrafts.com`)
- **Owner Admin Portal:** [https://vistara-krafts-admin.vercel.app](https://vistara-krafts-admin.vercel.app)

---

## Local Development & Build

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production (TypeScript check & Vite bundle)
npm run build
```

---

## License

Private repository for Vistāra Krafts Studio. All rights reserved.
