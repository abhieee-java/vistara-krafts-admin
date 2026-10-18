export type ProductCategory = 'keepsakes' | 'casting' | 'deep_pour' | 'pigments' | 'molds' | 'accessories';

export interface ProductVariant {
  id: string;
  label: string;
  desc?: string;
  price: number;
  regularPrice: number;
  stock: number;
  sku: string;
}

export interface ProductVarietyOption {
  id: string;
  label: string;
  hex?: string;
  accent?: string;
  icon?: string;
  desc?: string;
  priceDelta?: number;
  popular?: boolean;
}

export type ProductGender = 'all' | 'men' | 'women';

export interface Product {
  id: string;
  sku: string;
  name: string;
  shortName: string;
  subtitle: string;
  category: ProductCategory;
  subCategory?: string;
  badge?: string;
  price: number;
  regularPrice: number;
  ratio?: string;
  viscosity?: 'low' | 'medium' | 'high';
  cureTime?: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  isCustomizable: boolean;
  image: string;
  gallery: string[];
  variants: ProductVariant[];
  colors?: (string | ProductVarietyOption)[];
  shapes?: (string | ProductVarietyOption)[];
  sizes?: (string | ProductVarietyOption)[];
  gender?: ProductGender;
  genderAffinity?: 'neutral' | 'masculine' | 'feminine';
  description?: string;
  brand?: string;
  specs?: Record<string, any>;
  isActive?: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'new' | 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  customNote?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'razorpay' | 'cod' | 'upi';
  shippingAddress: ShippingAddress;
  carrier?: 'Delhivery' | 'BlueDart' | 'DTDC';
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredDate: string;
  lastLogin: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  defaultAddress?: ShippingAddress;
}

export interface InventoryMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  sku: string;
  change: number; // positive or negative
  newStock: number;
  reason: 'Manual Restock' | 'Order Deduction' | 'Damaged / Spoilage' | 'Correction' | 'Return Restock';
  performedBy: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  expiryDate: string;
  usageCount: number;
  usageLimit: number;
  isActive: boolean;
}

export interface OwnerSession {
  id: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  status: 'active' | 'expired';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  details: string;
}

export interface SystemServiceStatus {
  name: string;
  service: 'supabase-db' | 'cloudinary' | 'razorpay' | 'webhooks';
  status: 'mock' | 'connected' | 'disconnected' | 'error';
  latencyMs: number;
  details: string;
}

export interface StoreSettings {
  storeName: string;
  brandTagline: string;
  instagramHandle: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  freeShippingThreshold: number;
  defaultCourier: string;
  announcementBarText: string;
  announcementBarActive: boolean;
  lowStockAlertThreshold: number;
}
