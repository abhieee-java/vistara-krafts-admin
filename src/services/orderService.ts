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
          id: String(row.id),
          orderNumber: row.order_number || row.orderId || row.id,
          customerName: row.customer_name || 'Valued Patron',
          customerEmail: row.customer_email || '',
          customerPhone: row.phone || row.customer_phone || '',
          items: Array.isArray(row.items) ? row.items : [],
          subtotal: Number(row.subtotal || 0),
          discountAmount: Number(row.discount ?? row.discount_amount ?? 0),
          couponCode: row.coupon_code || '',
          shippingFee: Number(row.shipping_fee || 0),
          totalAmount: Number(row.total ?? row.total_amount ?? 0),
          orderStatus: (row.order_status || 'new') as OrderStatus,
          paymentStatus: row.payment_status || 'pending',
          paymentMethod: row.payment_method || 'razorpay',
          shippingAddress: {
            fullName: row.customer_name || 'Valued Patron',
            phone: row.phone || row.customer_phone || '',
            street: row.address || '',
            city: row.city || '',
            state: row.state || '',
            pincode: row.pincode || ''
          },
          carrier: (row.courier || row.carrier || 'Delhivery') as any,
          trackingNumber: row.tracking_number || '',
          notes: row.notes || '',
          timeline: [
            {
              status: (row.order_status || 'new') as OrderStatus,
              timestamp: row.created_at || new Date().toISOString(),
              note: 'Order placed by patron'
            },
            ...(row.tracking_number ? [{
              status: 'shipped' as OrderStatus,
              timestamp: row.updated_at || row.created_at || new Date().toISOString(),
              note: `Dispatched via ${row.courier || row.carrier || 'courier'} (AWB: ${row.tracking_number})`
            }] : [])
          ],
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || new Date().toISOString()
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
    try {
      localStorage.setItem('ram_vk_orders_v2', JSON.stringify(orders));
    } catch (_e) {}
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({ type: 'ORDERS_UPDATED', orders });
        channel.close();
      }
    } catch (e) {}
  },

  updateStatus(orderId: string, status: OrderStatus, note?: string): Order {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
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

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({ type: 'ORDER_STATUS_CHANGED', order: updated, orderId: updated.orderNumber || updated.id, status });
        channel.close();
      }
    } catch (e) {}

    if (isSupabaseConfigured) {
      const stageMap: Record<string, number> = {
        new: 1,
        pending: 1,
        processing: 2,
        curing: 3,
        packed: 4,
        shipped: 5,
        delivered: 6,
        cancelled: 1,
        refunded: 1
      };
      safeDbExec(
        () =>
          supabase
            .from('orders')
            .update({
              order_status: status,
              stage_index: stageMap[status] || 2,
              notes: note || order.notes || '',
              updated_at: new Date().toISOString()
            })
            .or(`id.eq.${orderId},order_number.eq.${orderId}`),
        'update order status'
      );
    }

    return updated;
  },

  updateTracking(orderId: string, carrier: 'Delhivery' | 'BlueDart' | 'DTDC', trackingNumber: string): Order {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
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

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({ type: 'ORDER_STATUS_CHANGED', order: updated, orderId: updated.orderNumber || updated.id, status: 'shipped' });
        channel.close();
      }
    } catch (e) {}

    if (isSupabaseConfigured) {
      safeDbExec(
        () =>
          supabase
            .from('orders')
            .update({
              courier: carrier,
              tracking_number: trackingNumber,
              order_status: 'shipped',
              stage_index: 5,
              updated_at: new Date().toISOString()
            })
            .or(`id.eq.${orderId},order_number.eq.${orderId}`),
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
    const idx = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
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

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({ type: 'ORDER_STATUS_CHANGED', order: updated, orderId: updated.orderNumber || updated.id, status: 'refunded' });
        channel.close();
      }
    } catch (e) {}

    if (isSupabaseConfigured) {
      safeDbExec(
        () =>
          supabase
            .from('orders')
            .update({
              order_status: 'refunded',
              payment_status: 'refunded',
              updated_at: new Date().toISOString()
            })
            .or(`id.eq.${orderId},order_number.eq.${orderId}`),
        'refund order'
      );
    }

    return updated;
  }
};
