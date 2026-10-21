import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Order,
  Customer,
  Coupon,
  InventoryMovement,
  AuditLog,
  StoreSettings,
  OrderStatus
} from '../types';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { inventoryService } from '../services/inventoryService';
import { customerService } from '../services/customerService';
import { INITIAL_COUPONS, INITIAL_SETTINGS, INITIAL_AUDIT_LOGS } from '../mock/initialData';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  movements: InventoryMovement[];
  auditLogs: AuditLog[];
  settings: StoreSettings;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  isLoadingDb: boolean;
  refreshFromDb: () => Promise<void>;
  // Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  toggleStock: (id: string) => void;
  // Orders
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  updateOrderTracking: (orderId: string, carrier: 'Delhivery' | 'BlueDart' | 'DTDC', trackingNumber: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  refundOrder: (orderId: string) => void;
  // Inventory
  adjustStock: (
    productId: string,
    change: number,
    reason: 'Manual Restock' | 'Order Deduction' | 'Damaged / Spoilage' | 'Correction' | 'Return Restock'
  ) => void;
  // Customers
  toggleCustomerStatus: (customerId: string) => void;
  // Coupons
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  toggleCoupon: (id: string) => void;
  deleteCoupon: (id: string) => void;
  // Settings
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  // Live Storefront Release Publishing
  isPublishing: boolean;
  lastPublishedVersion: number | null;
  lastPublishedAt: string | null;
  publishToStorefront: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('vk_admin_coupons_v1');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('vk_admin_audit_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('vk_admin_settings_v1');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [lastPublishedVersion, setLastPublishedVersion] = useState<number | null>(() => {
    try {
      const v = localStorage.getItem('vk_store_published_version') || localStorage.getItem('vk_admin_published_version');
      return v ? Number(v) : null;
    } catch {
      return null;
    }
  });
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem('vk_last_published_at') || null;
    } catch {
      return null;
    }
  });

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAudit = useCallback((action: string, target: string, details: string) => {
    const log: AuditLog = {
      id: 'log-' + Date.now().toString(36),
      timestamp: new Date().toLocaleString(),
      action,
      target,
      details
    };
    setAuditLogs((prev) => {
      const updated = [log, ...prev];
      localStorage.setItem('vk_admin_audit_logs_v1', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshFromDb = useCallback(async () => {
    setIsLoadingDb(true);
    try {
      const [liveProds, liveOrders, liveCust, supaCouponsRes, supaSettingsRes, supaCatSettingsRes] = await Promise.allSettled([
        productService.fetchFromSupabase(),
        orderService.fetchFromSupabase(),
        customerService.fetchFromSupabase(),
        isSupabaseConfigured ? supabase.from('coupons').select('*').order('created_at', { ascending: false }) : Promise.resolve({ data: null, error: null }),
        isSupabaseConfigured ? supabase.from('settings').select('*') : Promise.resolve({ data: null, error: null }),
        isSupabaseConfigured ? supabase.from('categories').select('*').eq('id', 'store_settings_payload').maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);

      if (liveProds.status === 'fulfilled') setProducts(liveProds.value);
      if (liveOrders.status === 'fulfilled') setOrders(liveOrders.value);
      if (liveCust.status === 'fulfilled') setCustomers(liveCust.value);
      setMovements(inventoryService.getMovements());

      // Sync Coupons from live Supabase
      if (supaCouponsRes.status === 'fulfilled' && (supaCouponsRes.value as any)?.data && Array.isArray((supaCouponsRes.value as any).data) && (supaCouponsRes.value as any).data.length > 0) {
        const rows = (supaCouponsRes.value as any).data;
        const mappedCoupons: Coupon[] = rows.map((c: any) => ({
          id: c.id || 'cpn-' + c.code,
          code: c.code,
          discountType: c.discount_type === 'percentage' ? 'percentage' : 'fixed',
          discountValue: Number(c.discount_value || 0),
          minOrderValue: Number(c.min_order_value || 0),
          expiryDate: c.expires_at ? c.expires_at.split('T')[0] : '2027-12-31',
          usageLimit: Number(c.usage_limit || 1000),
          usageCount: Number(c.usage_count || 0),
          isActive: Boolean(c.is_active)
        }));
        setCoupons(mappedCoupons);
        localStorage.setItem('vk_admin_coupons_v1', JSON.stringify(mappedCoupons));
      }

      // Sync Settings from live Supabase
      if (supaSettingsRes.status === 'fulfilled' && (supaSettingsRes.value as any)?.data && Array.isArray((supaSettingsRes.value as any).data)) {
        const rows = (supaSettingsRes.value as any).data;
        const barRow = rows.find((r: any) => r.key === 'announcement_bar');
        const shipRow = rows.find((r: any) => r.key === 'shipping');
        const infoRow = rows.find((r: any) => r.key === 'store_info');
        const sectionsRow = rows.find((r: any) => r.key === 'storefront_sections');
        const versionRow = rows.find((r: any) => r.key === 'store_published_version');

        if (versionRow && versionRow.value) {
          const v = typeof versionRow.value === 'object' ? versionRow.value.version : Number(versionRow.value);
          if (v) {
            setLastPublishedVersion(v);
            localStorage.setItem('vk_store_published_version', String(v));
            localStorage.setItem('vk_admin_published_version', String(v));
          }
          const pAt = typeof versionRow.value === 'object' ? versionRow.value.published_at : versionRow.updated_at;
          if (pAt) {
            setLastPublishedAt(pAt);
            localStorage.setItem('vk_last_published_at', pAt);
          }
        }

        let catPayload: any = null;
        if (supaCatSettingsRes.status === 'fulfilled' && (supaCatSettingsRes.value as any)?.data?.description) {
          try {
            catPayload = JSON.parse((supaCatSettingsRes.value as any).data.description);
          } catch (_) {}
        }

        setSettings((prev) => {
          const localUpdated = (prev as any)?.updated_at ? new Date((prev as any).updated_at).getTime() : 0;
          const barDbUpdated = barRow?.updated_at ? new Date(barRow.updated_at).getTime() : 0;
          const shipDbUpdated = shipRow?.updated_at ? new Date(shipRow.updated_at).getTime() : 0;
          const infoDbUpdated = infoRow?.updated_at ? new Date(infoRow.updated_at).getTime() : 0;
          const catDbUpdated = catPayload?.updated_at ? new Date(catPayload.updated_at).getTime() : 0;

          let resolvedEmail = prev.contactEmail;
          let resolvedPhone = prev.contactPhone;
          let resolvedName = prev.storeName;
          let resolvedTagline = prev.brandTagline;
          let resolvedInstagram = prev.instagramHandle;

          if (infoDbUpdated >= catDbUpdated) {
            if (infoRow && infoRow.value) {
              resolvedEmail = infoRow.value.email || infoRow.value.contactEmail || infoRow.value.supportEmail || catPayload?.contactEmail || resolvedEmail;
              resolvedPhone = infoRow.value.phone || infoRow.value.contactPhone || infoRow.value.supportPhone || catPayload?.contactPhone || resolvedPhone;
              resolvedName = infoRow.value.name || catPayload?.storeName || resolvedName;
              resolvedTagline = infoRow.value.tagline || catPayload?.brandTagline || resolvedTagline;
              resolvedInstagram = infoRow.value.instagram || catPayload?.instagramHandle || resolvedInstagram;
            }
          } else {
            if (catPayload) {
              resolvedEmail = catPayload.contactEmail || catPayload.supportEmail || infoRow?.value?.email || resolvedEmail;
              resolvedPhone = catPayload.contactPhone || catPayload.supportPhone || infoRow?.value?.phone || resolvedPhone;
              resolvedName = catPayload.storeName || infoRow?.value?.name || resolvedName;
              resolvedTagline = catPayload.brandTagline || infoRow?.value?.tagline || resolvedTagline;
              resolvedInstagram = catPayload.instagramHandle || infoRow?.value?.instagram || resolvedInstagram;
            }
          }

          const next: StoreSettings = {
            ...prev,
            storeName: resolvedName,
            brandTagline: resolvedTagline,
            contactEmail: resolvedEmail,
            supportEmail: resolvedEmail,
            contactPhone: resolvedPhone,
            supportPhone: resolvedPhone,
            instagramHandle: resolvedInstagram,
            ...(barRow && barRow.value ? {
              announcementBarText: barRow.value.text !== undefined ? barRow.value.text : prev.announcementBarText,
              announcementBarActive: barRow.value.enabled !== undefined ? barRow.value.enabled : prev.announcementBarActive
            } : {}),
            ...(shipRow && shipRow.value && (shipDbUpdated >= localUpdated || !prev.freeShippingThreshold) ? {
              freeShippingThreshold: (shipRow.value.free_shipping_threshold !== undefined && !isNaN(Number(shipRow.value.free_shipping_threshold)))
                ? Number(shipRow.value.free_shipping_threshold)
                : prev.freeShippingThreshold,
              defaultCourier: shipRow.value.default_courier || prev.defaultCourier
            } : {}),
            ...(sectionsRow && sectionsRow.value ? {
              enableFloralTransformationSection: Boolean(sectionsRow.value.enable_floral_transformation)
            } : (catPayload?.enableFloralTransformationSection !== undefined ? {
              enableFloralTransformationSection: Boolean(catPayload.enableFloralTransformationSection)
            } : {})),
            updated_at: new Date(Math.max(infoDbUpdated, catDbUpdated, barDbUpdated, shipDbUpdated, localUpdated) || Date.now()).toISOString()
          };

          localStorage.setItem('vk_admin_settings_v1', JSON.stringify(next));
          localStorage.setItem('vk_settings_v1', JSON.stringify(next));
          localStorage.setItem('ram_vk_settings_v2', JSON.stringify(next));
          return next;
        });
      }
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  // Initial load & real-time sync
  useEffect(() => {
    // 1. Initial instant load from cache
    setProducts(productService.getProducts());
    setOrders(orderService.getOrders());
    setCustomers(customerService.getCustomers());
    setMovements(inventoryService.getMovements());

    // 2. Refresh immediately from live Supabase
    refreshFromDb();

    // 3. Listen to cross-tab BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.onmessage = (ev) => {
          if (!ev || !ev.data) return;
          if (ev.data.type === 'PRODUCTS_UPDATED' && Array.isArray(ev.data.products)) {
            setProducts(ev.data.products);
          } else if (ev.data.type === 'ORDERS_UPDATED' && Array.isArray(ev.data.orders)) {
            setOrders(ev.data.orders);
          } else if (ev.data.type === 'COUPONS_UPDATED' && Array.isArray(ev.data.coupons)) {
            setCoupons(ev.data.coupons);
          } else if (ev.data.type === 'ORDER_PLACED') {
            addToast('New patron order placed on storefront!', 'info');
            orderService.fetchFromSupabase().then(setOrders);
          } else if (ev.data.type === 'SETTINGS_UPDATED' && ev.data.settings) {
            setSettings(ev.data.settings);
          }
        };
        return () => channel.close();
      }
    } catch (e) {}
  }, [refreshFromDb, addToast]);

  // Product Actions
  const addProduct = (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = productService.addProduct(p);
    setProducts(productService.getProducts());
    logAudit('Product Created', created.name, `SKU: ${created.sku}, Price: ₹${created.price}`);
    addToast(`Product "${created.shortName}" created successfully!`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = productService.updateProduct(id, updates);
    setProducts(productService.getProducts());
    logAudit('Product Updated', updated.name, `Updated fields: ${Object.keys(updates).join(', ')}`);
    addToast(`Updated "${updated.shortName}"`);
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    productService.deleteProduct(id);
    setProducts(productService.getProducts());
    if (target) {
      logAudit('Product Deleted', target.name, `Deleted SKU: ${target.sku}`);
      addToast(`Deleted "${target.shortName}"`, 'info');
    }
  };

  const duplicateProduct = (id: string) => {
    const dup = productService.duplicateProduct(id);
    setProducts(productService.getProducts());
    logAudit('Product Duplicated', dup.name, `Cloned from ID: ${id}`);
    addToast(`Duplicated into "${dup.shortName}"`);
  };

  const toggleStock = (id: string) => {
    const updated = productService.toggleStock(id);
    setProducts(productService.getProducts());
    logAudit(
      'Stock Toggled',
      updated.name,
      `Status changed to: ${updated.inStock ? 'IN STOCK' : 'OUT OF STOCK'}`
    );
    addToast(
      `"${updated.shortName}" is now ${updated.inStock ? 'In Stock' : 'Out of Stock'}`
    );
  };

  // Orders Actions
  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    const updated = orderService.updateStatus(orderId, status, note);
    setOrders(orderService.getOrders());
    logAudit('Order Status Updated', updated.orderNumber, `New status: ${status}. Note: ${note || 'None'}`);
    addToast(`Order ${updated.orderNumber} updated to ${status}`);
  };

  const updateOrderTracking = (
    orderId: string,
    carrier: 'Delhivery' | 'BlueDart' | 'DTDC',
    trackingNumber: string
  ) => {
    const updated = orderService.updateTracking(orderId, carrier, trackingNumber);
    setOrders(orderService.getOrders());
    logAudit(
      'Tracking Added',
      updated.orderNumber,
      `Carrier: ${carrier}, AWB: ${trackingNumber}`
    );
    addToast(`Dispatched ${updated.orderNumber} via ${carrier}`);
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    const updated = orderService.cancelOrder(orderId, reason);
    setOrders(orderService.getOrders());
    logAudit('Order Cancelled', updated.orderNumber, `Reason: ${reason || 'Owner decision'}`);
    addToast(`Order ${updated.orderNumber} cancelled`, 'error');
  };

  const refundOrder = (orderId: string) => {
    const updated = orderService.refundOrder(orderId);
    setOrders(orderService.getOrders());
    logAudit('Order Refunded', updated.orderNumber, `Amount: ₹${updated.totalAmount}`);
    addToast(`Refund processed for ${updated.orderNumber}`, 'info');
  };

  // Inventory Actions
  const adjustStock = (
    productId: string,
    change: number,
    reason: 'Manual Restock' | 'Order Deduction' | 'Damaged / Spoilage' | 'Correction' | 'Return Restock'
  ) => {
    inventoryService.adjustStock(productId, change, reason);
    setProducts(productService.getProducts());
    setMovements(inventoryService.getMovements());
    const prod = products.find((p) => p.id === productId);
    logAudit('Inventory Adjusted', prod?.name || productId, `Change: ${change > 0 ? '+' : ''}${change} units (${reason})`);
    addToast(`Adjusted stock by ${change > 0 ? '+' : ''}${change} units`);
  };

  // Customer Actions
  const toggleCustomerStatus = (customerId: string) => {
    const updated = customerService.toggleCustomerStatus(customerId);
    setCustomers(customerService.getCustomers());
    logAudit('Customer Status Changed', updated.name, `New status: ${updated.status}`);
    addToast(`Customer ${updated.name} is now ${updated.status}`);
  };

  // Coupon Actions
  const addCoupon = (c: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newCoupon: Coupon = {
      ...c,
      id: 'cpn-' + Date.now().toString(36),
      usageCount: 0
    };
    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    localStorage.setItem('vk_admin_coupons_v1', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      supabase
        .from('coupons')
        .upsert({
          code: newCoupon.code,
          discount_type: newCoupon.discountType === 'percentage' ? 'percentage' : 'fixed',
          discount_value: Number(newCoupon.discountValue),
          min_order_value: Number(newCoupon.minOrderValue || 0),
          usage_limit: Number(newCoupon.usageLimit || 1000),
          usage_count: Number(newCoupon.usageCount || 0),
          is_active: Boolean(newCoupon.isActive),
          expires_at: newCoupon.expiryDate ? new Date(newCoupon.expiryDate).toISOString() : null
        }, { onConflict: 'code' })
        .then((res) => {
          if (res.error) console.warn('Supabase coupon upsert warning:', res.error.message);
        });
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({ type: 'COUPONS_UPDATED', coupons: updated });
        channel.close();
      }
    } catch (e) {}

    logAudit('Coupon Created', newCoupon.code, `Type: ${newCoupon.discountType}, Value: ${newCoupon.discountValue}`);
    addToast(`Coupon "${newCoupon.code}" created and pushed live!`);
  };

  const toggleCoupon = (id: string) => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    setCoupons(updated);
    localStorage.setItem('vk_admin_coupons_v1', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      const target = updated.find((c) => c.id === id);
      if (target) {
        supabase
          .from('coupons')
          .update({ is_active: target.isActive })
          .eq('code', target.code)
          .then((res) => {
            if (res.error) console.warn('Supabase coupon toggle warning:', res.error.message);
          });
      }
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({ type: 'COUPONS_UPDATED', coupons: updated });
        channel.close();
      }
    } catch (e) {}

    addToast('Coupon status updated and synced live!');
  };

  const deleteCoupon = (id: string) => {
    const target = coupons.find((c) => c.id === id);
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    localStorage.setItem('vk_admin_coupons_v1', JSON.stringify(updated));

    if (isSupabaseConfigured && target) {
      supabase
        .from('coupons')
        .delete()
        .eq('code', target.code)
        .then((res) => {
          if (res.error) console.warn('Supabase coupon delete warning:', res.error.message);
        });
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({ type: 'COUPONS_UPDATED', coupons: updated, deletedCode: target?.code });
        channel.close();
      }
    } catch (e) {}

    addToast('Coupon deleted', 'info');
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings, updated_at: new Date().toISOString() };
    setSettings(updated);
    localStorage.setItem('vk_admin_settings_v1', JSON.stringify(updated));
    localStorage.setItem('vk_settings_v1', JSON.stringify(updated));
    localStorage.setItem('ram_vk_settings_v2', JSON.stringify(updated));

    // Save to live Supabase settings table & dynamic cloud backbone
    if (isSupabaseConfigured) {
      // Dynamic cloud backbone payload (unrestricted RLS row in categories)
      const settingsPayload = {
        storeName: updated.storeName,
        brandTagline: updated.brandTagline,
        instagramHandle: updated.instagramHandle,
        contactEmail: updated.contactEmail,
        supportEmail: updated.contactEmail,
        contactPhone: updated.contactPhone,
        supportPhone: updated.contactPhone,
        freeShippingThreshold: (updated.freeShippingThreshold !== undefined && !isNaN(Number(updated.freeShippingThreshold))) ? Number(updated.freeShippingThreshold) : 999,
        defaultCourier: updated.defaultCourier || 'Delhivery Express',
        announcementBarText: updated.announcementBarText,
        announcementBarActive: updated.announcementBarActive,
        updated_at: updated.updated_at
      };
      supabase
        .from('categories')
        .upsert({
          id: 'store_settings_payload',
          slug: 'store_settings',
          name: updated.storeName || 'Vistāra Krafts',
          description: JSON.stringify(settingsPayload),
          display_order: 0,
          is_active: true
        })
        .then((res) => {
          if (res.error) console.warn('Supabase categories store_settings_payload upsert warning:', res.error.message);
        });

      if (newSettings.announcementBarText !== undefined || newSettings.announcementBarActive !== undefined) {
        supabase
          .from('settings')
          .upsert({
            key: 'announcement_bar',
            value: {
              text: updated.announcementBarText,
              enabled: updated.announcementBarActive
            },
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' })
          .then((res) => {
            if (res.error) console.warn('Supabase settings update warning:', res.error.message);
          });
      }
      if (newSettings.freeShippingThreshold !== undefined || newSettings.defaultCourier !== undefined) {
        supabase
          .from('settings')
          .upsert({
            key: 'shipping',
            value: {
              free_shipping_threshold: Number(updated.freeShippingThreshold),
              default_courier: updated.defaultCourier || 'Delhivery',
              standard_shipping_fee: 99,
              express_shipping_fee: 299
            },
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' })
          .then((res) => {
            if (res.error) console.warn('Supabase shipping settings update warning:', res.error.message);
          });
      }
      if (newSettings.enableFloralTransformationSection !== undefined) {
        supabase
          .from('settings')
          .upsert({
            key: 'storefront_sections',
            value: {
              enable_floral_transformation: Boolean(updated.enableFloralTransformationSection)
            },
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' })
          .then((res) => {
            if (res.error) console.warn('Supabase settings update warning:', res.error.message);
          });
      }
      if (
        newSettings.storeName !== undefined ||
        newSettings.brandTagline !== undefined ||
        newSettings.contactEmail !== undefined ||
        newSettings.contactPhone !== undefined ||
        newSettings.instagramHandle !== undefined
      ) {
        supabase
          .from('settings')
          .upsert({
            key: 'store_info',
            value: {
              name: updated.storeName,
              tagline: updated.brandTagline,
              email: updated.contactEmail,
              contactEmail: updated.contactEmail,
              supportEmail: updated.contactEmail,
              phone: updated.contactPhone,
              contactPhone: updated.contactPhone,
              supportPhone: updated.contactPhone,
              instagram: updated.instagramHandle,
              instagramHandle: updated.instagramHandle
            },
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' })
          .then((res) => {
            if (res.error) console.warn('Supabase store_info settings update warning:', res.error.message);
          });
      }
    }

    // Broadcast across browser tabs to storefront
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({ type: 'SETTINGS_UPDATED', settings: updated });
        channel.close();
      }
    } catch (e) {}

    logAudit('Settings Updated', 'Store Settings', `Updated: ${Object.keys(newSettings).join(', ')}`);
    addToast('Store settings saved and published live to Storefront!');
  };

  const publishToStorefront = useCallback(async () => {
    setIsPublishing(true);
    const newVersion = Date.now();
    const nowIso = new Date().toISOString();

    const publishPayload = {
      version: newVersion,
      published_by: 'owner',
      published_at: nowIso,
      total_products: products.length,
      total_coupons: coupons.length,
      freeShippingThreshold: Number(settings.freeShippingThreshold) || 999,
      announcementBarText: settings.announcementBarText
    };

    try {
      // 1. Update localStorage immediately for instant local reflection
      localStorage.setItem('vk_store_published_version', String(newVersion));
      localStorage.setItem('vk_admin_published_version', String(newVersion));
      localStorage.setItem('vk_last_published_at', nowIso);
      setLastPublishedVersion(newVersion);
      setLastPublishedAt(nowIso);

      // 2. Persist to Supabase if configured
      if (isSupabaseConfigured) {
        // Upsert store_published_version into settings table
        const { error: settingsErr } = await supabase
          .from('settings')
          .upsert({
            key: 'store_published_version',
            value: publishPayload,
            description: 'Authoritative storefront published version timestamp and release metadata',
            updated_at: nowIso
          }, { onConflict: 'key' });

        if (settingsErr) {
          console.warn('Supabase publish settings warning:', settingsErr.message);
        }

        // Ensure announcement_bar row is updated with latest published announcement
        if (settings.announcementBarText !== undefined) {
          await supabase
            .from('settings')
            .upsert({
              key: 'announcement_bar',
              value: {
                text: settings.announcementBarText,
                enabled: settings.announcementBarActive !== false
              },
              updated_at: nowIso
            }, { onConflict: 'key' });
        }

        // Redundancy mirror in categories table (unrestricted RLS fallback)
        const { error: catErr } = await supabase
          .from('categories')
          .upsert({
            id: 'store_published_version',
            name: 'Storefront Published Release',
            description: JSON.stringify(publishPayload),
            slug: 'store-published-version',
            display_order: 999,
            is_active: true
          }, { onConflict: 'id' });

        if (catErr) {
          console.warn('Supabase publish categories mirror warning:', catErr.message);
        }
      }

      // 3. Broadcast across browser tabs via BroadcastChannel
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
          channel.postMessage({
            type: 'STORE_PUBLISHED',
            version: newVersion,
            published_at: nowIso,
            productsCount: products.length,
            settings: {
              freeShippingThreshold: Number(settings.freeShippingThreshold) || 999,
              announcementBarText: settings.announcementBarText
            }
          });
          channel.close();
        }
      } catch (bcErr) {
        console.warn('BroadcastChannel error:', bcErr);
      }

      // 4. Log audit & show toast
      logAudit(
        'Storefront Published',
        'Live Release',
        `Release v${newVersion} deployed with ${products.length} products & free shipping ₹${settings.freeShippingThreshold || 999}`
      );
      addToast(`🚀 Published to live storefront! Version v${newVersion} active across all devices.`);
    } catch (err: any) {
      console.error('Publish to storefront failed:', err);
      addToast(`Failed to publish to live storefront: ${err?.message || 'Unknown error'}`, 'error');
    } finally {
      setIsPublishing(false);
    }
  }, [products.length, coupons.length, settings, isSupabaseConfigured, logAudit, addToast]);

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        customers,
        coupons,
        movements,
        auditLogs,
        settings,
        toasts,
        addToast,
        removeToast,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        toggleStock,
        updateOrderStatus,
        updateOrderTracking,
        cancelOrder,
        refundOrder,
        adjustStock,
        toggleCustomerStatus,
        addCoupon,
        toggleCoupon,
        deleteCoupon,
        updateSettings,
        isLoadingDb,
        refreshFromDb,
        isPublishing,
        lastPublishedVersion,
        lastPublishedAt,
        publishToStorefront
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};
