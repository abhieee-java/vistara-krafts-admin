import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { OrderDetailDrawer } from '../components/orders/OrderDetailDrawer';
import { InvoiceModal } from '../components/orders/InvoiceModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Search, Filter, FileText, Truck, Eye } from 'lucide-react';

interface OrdersProps {
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
}

export const Orders: React.FC<OrdersProps> = ({ selectedOrder, setSelectedOrder }) => {
  const {
    orders,
    updateOrderStatus,
    updateOrderTracking,
    cancelOrder,
    refundOrder
  } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const statuses: { label: string; value: string }[] = [
    { label: 'All Orders', value: 'all' },
    { label: 'Processing / Garland Pickup', value: 'processing' },
    { label: 'Shipped (In Transit)', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Pending Verification', value: 'pending' },
    { label: 'Cancelled / Refunded', value: 'cancelled' }
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress.pincode.includes(search) ||
      o.shippingAddress.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'cancelled'
        ? o.orderStatus === 'cancelled' || o.orderStatus === 'refunded'
        : o.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer, City, or 6-digit PIN..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e6e2d8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s.value
                  ? 'bg-[#1c1b18] text-[#cda851] shadow-sm'
                  : 'bg-white text-gray-600 border border-[#e6e2d8] hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#faf8f5] border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4 text-left">Order &amp; Date</th>
                <th className="py-3 px-3 text-left">Customer &amp; Location</th>
                <th className="py-3 px-3 text-left">Preserved Keepsakes / Kits</th>
                <th className="py-3 px-3 text-right">Total (₹)</th>
                <th className="py-3 px-3 text-left">Courier Tracking</th>
                <th className="py-3 px-3 text-center">Fulfillment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className="interactive-row cursor-pointer group"
                >
                  {/* Order Number & Date */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-sm text-[#1c1b18]">
                      {ord.orderNumber}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                      {new Date(ord.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>

                  {/* Customer & Location */}
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-gray-800">{ord.customerName}</div>
                    <div className="text-[11px] text-gray-500 font-mono">
                      {ord.shippingAddress.city} • PIN: {ord.shippingAddress.pincode}
                    </div>
                  </td>

                  {/* Items */}
                  <td className="py-3.5 px-3 max-w-xs">
                    <div className="truncate font-medium text-gray-700">
                      {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </div>
                    {ord.items.some((i) => i.customNote) && (
                      <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 px-1 rounded border border-amber-200">
                        Custom Note Attached
                      </span>
                    )}
                  </td>

                  {/* Total Amount */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-bold text-sm text-[#1c1b18]">
                      ₹{ord.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold uppercase">
                      {ord.paymentMethod} • {ord.paymentStatus}
                    </div>
                  </td>

                  {/* Tracking */}
                  <td className="py-3.5 px-3">
                    {ord.trackingNumber ? (
                      <div className="flex items-center gap-1.5 text-teal-800 font-mono font-medium text-[11px]">
                        <Truck className="w-3.5 h-3.5 text-teal-600" />
                        <span>
                          {ord.carrier}: {ord.trackingNumber}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 text-center">
                    <StatusBadge status={ord.orderStatus} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setInvoiceOrder(ord)}
                        className="p-1.5 text-gray-500 hover:text-[#cda851] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Print Order Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1c1b18] text-[#cda851] text-xs font-bold hover:bg-[#2d2a24] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-xs">
            No orders match the selected search or filter status.
          </div>
        )}
      </div>

      {/* Slide-Over Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(id, st, note) => {
            updateOrderStatus(id, st, note);
            const fresh = orders.find((o) => o.id === id);
            if (fresh) setSelectedOrder(fresh);
          }}
          onUpdateTracking={(id, carrier, awb) => {
            updateOrderTracking(id, carrier, awb);
            const fresh = orders.find((o) => o.id === id);
            if (fresh) setSelectedOrder(fresh);
          }}
          onCancelOrder={(id) => setCancellingOrderId(id)}
          onRefundOrder={(id) => {
            refundOrder(id);
            const fresh = orders.find((o) => o.id === id);
            if (fresh) setSelectedOrder(fresh);
          }}
          onOpenInvoice={(ord) => setInvoiceOrder(ord)}
        />
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

      {/* Cancel Order Confirmation */}
      <ConfirmationDialog
        isOpen={!!cancellingOrderId}
        onClose={() => setCancellingOrderId(null)}
        onConfirm={() => {
          if (cancellingOrderId) {
            cancelOrder(cancellingOrderId);
            setCancellingOrderId(null);
            setSelectedOrder(null);
          }
        }}
        title="Cancel Customer Order"
        message="Are you sure you want to cancel this order? This updates fulfillment status and notifies express couriers."
        confirmLabel="Cancel Order"
        confirmVariant="danger"
      />
    </div>
  );
};
