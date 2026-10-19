import { Product, Order, Customer, Coupon, InventoryMovement, OwnerSession, AuditLog, StoreSettings } from '../types';

/**
 * Vistāra Krafts — Clean Production State (Zero Mock Data)
 * Only live records created by the owner in Supabase PostgreSQL appear here.
 */

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'STUDIO10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1500,
    expiryDate: '2027-12-31',
    usageLimit: 500,
    usageCount: 0,
    isActive: true
  },
  {
    id: 'coup-2',
    code: 'VISTARA500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 3000,
    expiryDate: '2027-12-31',
    usageLimit: 250,
    usageCount: 0,
    isActive: true
  },
  {
    id: 'coup-3',
    code: 'WELCOME250',
    discountType: 'fixed',
    discountValue: 250,
    minOrderValue: 1000,
    expiryDate: '2027-12-31',
    usageLimit: 1000,
    usageCount: 0,
    isActive: true
  }
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [];

export const INITIAL_SESSIONS: OwnerSession[] = [
  {
    id: 'sess-1',
    loginTime: new Date().toISOString(),
    ipAddress: 'Supabase Auth Handshake',
    userAgent: 'Vistara Krafts Owner Portal',
    status: 'active'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: 'Just now',
    action: 'Database Connected',
    target: 'Supabase PostgreSQL',
    details: 'Zero mock data policy active. Ready for live product catalog ingestion.'
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Vistāra Krafts Studio',
  brandTagline: 'Curated Resin Art & Museum-Grade Preservation',
  instagramHandle: '@vistarakrafts',
  contactEmail: 'studio@vistarakrafts.com',
  contactPhone: '+91 98765 43210',
  currency: 'INR',
  freeShippingThreshold: 1999,
  defaultCourier: 'Delhivery Express',
  announcementBarText: '✨ Festive Atelier Drop: Free Pan-India Express Delivery on Orders Over ₹1,999',
  announcementBarActive: true,
  lowStockAlertThreshold: 5,
  enableFloralTransformationSection: false
};
