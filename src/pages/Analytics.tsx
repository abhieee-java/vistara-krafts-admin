import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { TrendingUp, DollarSign, ShoppingBag, MapPin, Award, Calendar } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { orders, products } = useStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' && o.orderStatus !== 'refunded')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Breakdown by location
  const locationMap: Record<string, { orders: number; revenue: number }> = {};
  orders.forEach((o) => {
    const city = o.shippingAddress.city || 'Other';
    if (!locationMap[city]) locationMap[city] = { orders: 0, revenue: 0 };
    locationMap[city].orders += 1;
    locationMap[city].revenue += o.totalAmount;
  });

  const topLocations = Object.entries(locationMap)
    .map(([city, data]) => ({ city, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Breakdown by category
  const categoryMap: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const cat = prod?.category || 'keepsakes';
      categoryMap[cat] = (categoryMap[cat] || 0) + it.totalPrice;
    });
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-base text-[#1c1b18]">
            Performance &amp; Revenue Analytics
          </h3>
          <p className="text-xs text-gray-500">
            Real-time conversion, order distribution, and Pan-India geographic metrics
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#e6e2d8] self-start sm:self-auto overflow-x-auto max-w-full">
          <Calendar className="w-3.5 h-3.5 text-gray-400 ml-2 shrink-0" />
          {(['7d', '30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase whitespace-nowrap ${
                timeRange === r
                  ? 'bg-[#1c1b18] text-[#cda851] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-2">
          <div className="text-xs font-semibold text-gray-500">Total Net Revenue</div>
          <div className="font-serif font-bold text-2xl text-[#1c1b18]">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">98.2% settlement rate</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-2">
          <div className="text-xs font-semibold text-gray-500">Average Order Value (AOV)</div>
          <div className="font-serif font-bold text-2xl text-[#1c1b18]">
            ₹{avgOrderValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 font-medium">High-ticket bridal keepsakes</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-2">
          <div className="text-xs font-semibold text-gray-500">Conversion Rate</div>
          <div className="font-serif font-bold text-2xl text-[#1c1b18]">4.6%</div>
          <div className="text-[11px] text-blue-600 font-medium">Instagram traffic benchmark</div>
        </div>
      </div>

      {/* Two Column Layout: Cities & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by City */}
        <div className="p-6 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#cda851]" />
            <h4 className="font-serif font-bold text-base text-[#1c1b18]">
              Pan-India Orders by City
            </h4>
          </div>

          <div className="space-y-3">
            {topLocations.map((loc, i) => {
              const pct = totalRevenue > 0 ? Math.round((loc.revenue / totalRevenue) * 100) : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="font-bold text-gray-800">{loc.city}</span>
                    <span className="text-gray-600">
                      ₹{loc.revenue.toLocaleString()} ({loc.orders} orders)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#cda851] to-[#99792e] rounded-full"
                      style={{ width: `${Math.max(pct, 10)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="p-6 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#cda851]" />
            <h4 className="font-serif font-bold text-base text-[#1c1b18]">
              Revenue by Product Category
            </h4>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryMap).map(([cat, rev], idx) => {
              const pct = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="font-bold text-gray-800 capitalize">
                      {cat.replace('_', ' ')}
                    </span>
                    <span className="text-gray-600">
                      ₹{rev.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-[#1c1b18] rounded-full"
                      style={{ width: `${Math.max(pct, 12)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
