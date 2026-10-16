import { Order, OrderStatus } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const ORDERS_STORAGE_KEY = 'vk_admin_orders_v1';
const STOREFRONT_ORDERS_KEY = 'ram_vk_orders_v2';

async function safeDbExec(action: () => PromiseLike<any>, desc: string) {
  try {
    const res = await action();
    if (res && res.error) {
      console.warn(`Supabase ${desc} warning:`, res.error.message);
    }
  } catch (err: any) {
    console.error(`Supabase ${desc} exception:`, err?.message || err);
  }
}

export const orderService = {
  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }

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
    // Strictly zero mock orders
    return [];
  },

  async fetchFromSupabase(): Promise<Order[]> {
    if (!isSupabaseConfigured) return this.getOrders();

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase orders fetch notice:', error.message);
        return this.getOrders();
      }

      if (Array.isArray(data)) {
        const orders: Order[] = data.map((row: any) => ({
          id: row.id,
          orderNumber: row.order_number,
          customerName: row.customer_name,
          customerEmail: row.customer_email,
          customerPhone: row.customer_phone,
          items: Array.isArray(row.items) ? row.items : [],
          subtotal: Number(row.subtotal || 0),
          discountAmount: Number(row.discount_amount || 0),
          couponCode: row.coupon_code || '',
          shippingFee: Number(row.shipping_fee || 0),
          totalAmount: Number(row.total_amount || 0),
          orderStatus: row.order_status || 'new',
          paymentStatus: row.payment_status || 'pending',
          paymentMethod: row.payment_method || 'razorpay',
          shippingAddress: row.shipping_address || {},
          carrier: row.carrier,
          trackingNumber: row.tracking_number,
          notes: row.notes,
          timeline: Array.isArray(row.timeline) ? row.timeline : [],
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));

        this.saveOrders(orders);
        return orders;
      }
    } catch (e) {
      console.error('Orders sync error:', e);
    }

    return this.getOrders();
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
        ...(order.timeline || []),
        {
          status,
          timestamp: new Date().toISOString(),
          note: note || `Status updated to ${status}`
        }
      ]
    };
    orders[idx] = updated;
    this.saveOrders(orders);

    if (isSupabaseConfigured) {
      safeDbExec(
        () =>
          supabase
            .from('orders')
            .update({
              order_status: status,
              timeline: updated.timeline,
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId),
        'update order status'
      );
    }

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
        ...(order.timeline || []),
        {
          status: 'shipped',
          timestamp: new Date().toISOString(),
          note: `Dispatched via ${carrier} (AWB: ${trackingNumber})`
        }
      ]
    };
    orders[idx] = updated;
    this.saveOrders(orders);

    if (isSupabaseConfigured) {
      safeDbExec(
        () =>
          supabase
            .from('orders')
            .update({
              carrier,
              tracking_number: trackingNumber,
              order_status: 'shipped',
              timeline: updated.timeline,
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId),
        'update order tracking'
      );
    }

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
        ...(order.timeline || []),
        {
          status: 'refunded',
          timestamp: new Date().toISOString(),
          note: 'Refund processed to original payment method'
        }
      ]
    };
    orders[idx] = updated;
    this.saveOrders(orders);

    if (isSupabaseConfigured) {
      safeDbExec(
        () =>
          supabase
            .from('orders')
            .update({
              order_status: 'refunded',
              payment_status: 'refunded',
              timeline: updated.timeline,
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId),
        'refund order'
      );
    }

    return updated;
  }
};
