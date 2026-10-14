import { Order, OrderStatus } from '../types';
import { INITIAL_ORDERS } from '../mock/initialData';

const ORDERS_STORAGE_KEY = 'vk_admin_orders_v1';
const STOREFRONT_ORDERS_KEY = 'ram_vk_orders_v2';

export const orderService = {
  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (data) return JSON.parse(data);

      const storefrontData = localStorage.getItem(STOREFRONT_ORDERS_KEY);
      if (storefrontData) {
        const parsed = JSON.parse(storefrontData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    }
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  },

  saveOrders(orders: Order[]): void {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  },

  updateStatus(orderId: string, status: OrderStatus, note?: string): Order {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    const updated: Order = {
      ...order,
      orderStatus: status,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...order.timeline,
        {
          status,
          timestamp: new Date().toISOString(),
          note: note || `Status updated to ${status}`
        }
      ]
    };
    orders[idx] = updated;
    this.saveOrders(orders);
    return updated;
  },

  updateTracking(orderId: string, carrier: 'Delhivery' | 'BlueDart' | 'DTDC', trackingNumber: string): Order {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    const updated: Order = {
      ...order,
      carrier,
      trackingNumber,
      orderStatus: 'shipped',
      updatedAt: new Date().toISOString(),
      timeline: [
        ...order.timeline,
        {
          status: 'shipped',
          timestamp: new Date().toISOString(),
          note: `Dispatched via ${carrier} (AWB: ${trackingNumber})`
        }
      ]
    };
    orders[idx] = updated;
    this.saveOrders(orders);
    return updated;
  },

  cancelOrder(orderId: string, reason?: string): Order {
    return this.updateStatus(orderId, 'cancelled', reason || 'Cancelled by Store Owner');
  },

  refundOrder(orderId: string): Order {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    const updated: Order = {
      ...order,
      orderStatus: 'refunded',
      paymentStatus: 'refunded',
      updatedAt: new Date().toISOString(),
      timeline: [
        ...order.timeline,
        {
          status: 'refunded',
          timestamp: new Date().toISOString(),
          note: 'Refund processed to original payment method via Razorpay mock'
        }
      ]
    };
    orders[idx] = updated;
    this.saveOrders(orders);
    return updated;
  }
};
