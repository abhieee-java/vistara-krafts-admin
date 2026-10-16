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
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
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

  // Initial load & Live Supabase Synchronization (Zero Mock Data)
  useEffect(() => {
    productService.fetchFromSupabase().then((prods) => {
      setProducts(prods);
    });
    setOrders(orderService.getOrders());
    setCustomers(customerService.getCustomers());
    setMovements(inventoryService.getMovements());

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.onmessage = (ev) => {
          if (ev && ev.data && ev.data.type === 'PRODUCTS_UPDATED' && Array.isArray(ev.data.products)) {
            setProducts(ev.data.products);
          }
        };
      }
    } catch (e) {}

    const interval = setInterval(() => {
      productService.fetchFromSupabase().then((prods) => {
        setProducts(prods);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
    logAudit('Coupon Created', newCoupon.code, `Type: ${newCoupon.discountType}, Value: ${newCoupon.discountValue}`);
    addToast(`Coupon "${newCoupon.code}" created!`);
  };

  const toggleCoupon = (id: string) => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    setCoupons(updated);
    localStorage.setItem('vk_admin_coupons_v1', JSON.stringify(updated));
  };

  const deleteCoupon = (id: string) => {
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    localStorage.setItem('vk_admin_coupons_v1', JSON.stringify(updated));
    addToast('Coupon deleted', 'info');
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('vk_admin_settings_v1', JSON.stringify(updated));
    logAudit('Settings Updated', 'Store Settings', `Updated: ${Object.keys(newSettings).join(', ')}`);
    addToast('Store settings saved successfully!');
  };

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
        updateSettings
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
