import React from 'react';
import { useStore } from '../context/StoreContext';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Plus,
  Truck,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import { Order } from '../types';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenOrder: (order: Order) => void;
  onOpenNewProduct: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onOpenOrder,
  onOpenNewProduct
}) => {
  const { products, orders, customers, auditLogs, isLoadingDb } = useStore();

  // Metrics Calculations
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' && o.orderStatus !== 'refunded')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) =>
    ['new', 'pending', 'processing'].includes(o.orderStatus)
  ).length;

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 5)
  );

  const outOfStockProducts = products.filter((p) => p.stockQuantity === 0 || !p.inStock);

  const recentOrders = [...orders].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1c1b18] via-[#2a2722] to-[#1c1b18] text-[#f9f8f5] border border-[#3b372e] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#cda851]">
              Atelier Command Center • Single Owner Active
            </span>
          </div>
          <h2 className="font-serif font-bold text-xl md:text-2xl text-white">
            Vistāra Krafts Operations
          </h2>
          <p className="text-xs text-gray-300 max-w-xl">
            Real-time catalog sync, express bridal floral dispatches, optical epoxy stock, and customer orders.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={onOpenNewProduct}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#cda851] text-[#1c1b18] text-xs font-bold hover:bg-[#dfc27d] transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
          <a
            href="https://vistara-krafts.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#33302a] text-[#f9f8f5] text-xs font-semibold hover:bg-[#403c34] border border-[#4d483e] transition-colors active:scale-95"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#cda851]" />
          </a>
        </div>
      </div>

      {/* Critical Alerts Banner (if out of stock) */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs text-amber-900">
              <strong>Stock Attention Required:</strong> {outOfStockProducts.length} out of stock,{' '}
              {lowStockProducts.length} running low on inventory.
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto"
          >
            Review Inventory
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      {isLoadingDb && products.length === 0 && orders.length === 0 ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Revenue */}
          <div className="p-4 sm:p-5 luxury-card space-y-3 cursor-default group">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold group-hover:text-[#1c1b18] transition-colors">Total Revenue</span>
              <div className="p-2 rounded-xl bg-[#faf8f5] text-[#cda851] border border-[#e6e2d8] group-hover:border-[#cda851]/50 group-hover:scale-105 transition-all">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-serif font-bold text-2xl text-[#1c1b18] group-hover:text-[#cda851] transition-colors">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+18.4% vs last week</span>
              </div>
            </div>
          </div>

          {/* Total & Pending Orders */}
          <div className="p-5 luxury-card space-y-3 cursor-default group">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold group-hover:text-[#1c1b18] transition-colors">Orders &amp; Dispatch</span>
              <div className="p-2 rounded-xl bg-[#faf8f5] text-purple-600 border border-[#e6e2d8] group-hover:border-purple-300 group-hover:scale-105 transition-all">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-serif font-bold text-2xl text-[#1c1b18] group-hover:text-purple-900 transition-colors">{orders.length}</div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1">
                {pendingOrders} awaiting fulfillment
              </div>
            </div>
          </div>

          {/* Active Catalog */}
          <div className="p-5 luxury-card space-y-3 cursor-default group">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold group-hover:text-[#1c1b18] transition-colors">Products in Catalog</span>
              <div className="p-2 rounded-xl bg-[#faf8f5] text-blue-600 border border-[#e6e2d8] group-hover:border-blue-300 group-hover:scale-105 transition-all">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-serif font-bold text-2xl text-[#1c1b18] group-hover:text-blue-900 transition-colors">{products.length}</div>
              <div className="text-[11px] text-gray-500 font-medium mt-1">
                {products.filter((p) => p.inStock).length} active for purchase
              </div>
            </div>
          </div>

          {/* Patrons & Customers */}
          <div className="p-5 luxury-card space-y-3 cursor-default group">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold group-hover:text-[#1c1b18] transition-colors">Registered Patrons</span>
              <div className="p-2 rounded-xl bg-[#faf8f5] text-teal-600 border border-[#e6e2d8] group-hover:border-teal-300 group-hover:scale-105 transition-all">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-serif font-bold text-2xl text-[#1c1b18] group-hover:text-teal-900 transition-colors">{customers.length}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                100% account delivery rate
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Orders Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1c1b18]">Recent Studio Orders</h3>
              <p className="text-xs text-gray-500">Latest customer orders and garland bookings</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-[#cda851] font-bold hover:underline"
            >
              View All Orders →
            </button>
          </div>

          {/* Orders Content or Empty State */}
          {orders.length === 0 ? (
            <div className="py-4">
              <EmptyState
                icon={ShoppingBag}
                title="No Studio Orders Recorded"
                description="Live customer orders placed on the storefront will stream here automatically for verification and fulfillment."
                compact
              />
            </div>
          ) : (
            <>
              {/* Mobile Recent Orders Cards (Phone Screens < 768px) */}
              <div className="md:hidden space-y-2.5">
                {recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => onOpenOrder(ord)}
                    className="p-3.5 rounded-xl border border-[#e6e2d8] hover:border-[#cda851] bg-[#faf8f5]/50 active:bg-[#faf8f5] transition-all space-y-2 text-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#1c1b18] whitespace-nowrap">{ord.orderNumber}</span>
                      <StatusBadge status={ord.orderStatus} />
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <div>
                        <span className="font-semibold">{ord.customerName}</span>
                        <span className="text-gray-400 text-[10px] ml-1">({ord.shippingAddress.city})</span>
                      </div>
                      <span className="font-serif font-bold text-sm text-[#1c1b18]">
                        ₹{ord.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                      <span className="truncate max-w-[200px]">
                        {ord.items.map((i) => i.productName).join(', ')}
                      </span>
                      <span className="text-[#cda851] font-bold">Details →</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 text-left">Order #</th>
                      <th className="py-2.5 text-left">Customer</th>
                      <th className="py-2.5 text-left">Items</th>
                      <th className="py-2.5 text-right">Amount</th>
                      <th className="py-2.5 text-center">Status</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} className="interactive-row cursor-pointer" onClick={() => onOpenOrder(ord)}>
                        <td className="py-3 font-mono font-bold text-[#1c1b18] whitespace-nowrap">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3">
                          <p className="font-semibold text-gray-800">{ord.customerName}</p>
                          <p className="text-[10px] text-gray-400">{ord.shippingAddress.city}</p>
                        </td>
                        <td className="py-3 text-gray-600 max-w-[180px] truncate">
                          {ord.items.map((i) => i.productName).join(', ')}
                        </td>
                        <td className="py-3 text-right font-bold text-[#1c1b18]">
                          ₹{ord.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <StatusBadge status={ord.orderStatus} />
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onOpenOrder(ord)}
                            className="px-2.5 py-1 rounded-lg border border-[#e6e2d8] text-[11px] font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Catalog Highlights & Live Logs */}
        <div className="space-y-6">
          {/* Top Selling Keepsakes */}
          <div className="p-6 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1c1b18] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#cda851]" />
              Top Products
            </h3>
            {products.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Catalog Empty"
                description="Products added to your catalog will be spotlighted here."
                compact
              />
            ) : (
              <div className="space-y-3">
                {products.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[#e6e2d8]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1c1b18] truncate">{p.shortName}</p>
                      <p className="text-[10px] text-gray-500">
                        ₹{p.price.toLocaleString()} • {p.stockQuantity} in stock
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {p.inStock ? 'ACTIVE' : 'OUT'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Operations Log */}
          <div className="p-6 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#1c1b18] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              Owner Operations Log
            </h3>
            <div className="space-y-2 text-xs">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-2 rounded-lg bg-[#faf8f5] border border-[#e6e2d8]">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-bold text-[#1c1b18]">{log.action}</span>
                    <span>{log.timestamp.split(',')[1] || log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5 truncate">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
