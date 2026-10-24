import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { StatusBadge } from '../components/common/Badge';
import {
  Search,
  Mail,
  Phone,
  MapPin,
  UserX,
  UserCheck,
  Eye,
  ShoppingBag,
  Users,
  Activity,
  Sparkles,
  RefreshCw,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Customers: React.FC = () => {
  const { customers, orders, toggleCustomerStatus, refreshFromDb, isLoadingDb, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'recent' | 'ordered'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [togglingCustomer, setTogglingCustomer] = useState<Customer | null>(null);

  // Analytical calculations
  const totalPatrons = customers.length;
  const patronsWithOrders = customers.filter((c) => c.totalOrders > 0).length;
  const totalPatronSpend = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalOrdersCount = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.defaultAddress?.city && c.defaultAddress.city.toLowerCase().includes(search.toLowerCase())) ||
      (c.defaultAddress?.pincode && c.defaultAddress.pincode.includes(search));

    if (!matchesSearch) return false;

    if (filterTab === 'recent') {
      return Boolean(c.lastLogin || c.last_sign_in_at);
    }
    if (filterTab === 'ordered') {
      return c.totalOrders > 0;
    }
    return true;
  });

  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) =>
          o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase() ||
          o.customerPhone === selectedCustomer.phone
      )
    : [];

  const handleManualRefresh = async () => {
    try {
      await refreshFromDb();
      addToast('Customer directory synced with live authentication records.', 'success');
    } catch {
      addToast('Unable to refresh live patrons. Please try again.', 'error');
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Active Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. PATRON TRAFFIC & ENGAGEMENT ANALYTICAL METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Registered Patrons */}
        <div className="p-4 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Registered Patrons</span>
            <div className="p-2 rounded-xl bg-amber-50 text-[#cda851]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1c1b18]">
            {totalPatrons}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>100% Live Supabase Auth</span>
          </div>
        </div>

        {/* Metric 2: Active / Logged-in Patrons */}
        <div className="p-4 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Logged-In Traffic</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1c1b18]">
            {customers.filter((c) => Boolean(c.lastLogin || c.last_sign_in_at)).length}
          </div>
          <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Verified Sessions Tracked</span>
          </div>
        </div>

        {/* Metric 3: Converting Patrons */}
        <div className="p-4 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ordering Patrons</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1c1b18]">
            {patronsWithOrders}{' '}
            <span className="text-xs font-normal text-gray-400">
              ({totalPatrons > 0 ? Math.round((patronsWithOrders / totalPatrons) * 100) : 0}% conv.)
            </span>
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            {totalOrdersCount} Total Orders Placed
          </div>
        </div>

        {/* Metric 4: Total Patron GMV */}
        <div className="p-4 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Patron Lifetime Spend</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1c1b18]">
            ₹{totalPatronSpend.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            Avg. ₹{patronsWithOrders > 0 ? Math.round(totalPatronSpend / patronsWithOrders).toLocaleString() : 0} per buyer
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH, QUICK FILTER TABS & LIVE REFRESH ACTION */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#e6e2d8] shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patron name, email, phone, city, or pincode..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e6e2d8] bg-gray-50/60 text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Filter Pills & Live Refresh */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="inline-flex p-1 bg-gray-100/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'all'
                  ? 'bg-white text-[#1c1b18] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All ({totalPatrons})
            </button>
            <button
              onClick={() => setFilterTab('recent')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                filterTab === 'recent'
                  ? 'bg-white text-[#1c1b18] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Logged In ({customers.filter((c) => Boolean(c.lastLogin || c.last_sign_in_at)).length})</span>
            </button>
            <button
              onClick={() => setFilterTab('ordered')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'ordered'
                  ? 'bg-white text-[#1c1b18] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              With Orders ({patronsWithOrders})
            </button>
          </div>

          {/* Live Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isLoadingDb}
            title="Sync with live Supabase authentication records"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin text-[#cda851]' : ''}`} />
            <span className="hidden sm:inline">Refresh Patrons</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE PATRON CARDS (< 768px) */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-[#e6e2d8] rounded-2xl p-8 text-center text-xs text-gray-500 space-y-2">
            <Users className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="font-semibold text-gray-700">No patrons found matching your search</p>
            <p className="text-[11px] text-gray-400">Try adjusting your search criteria or filter tabs</p>
          </div>
        ) : (
          filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-[#e6e2d8] rounded-2xl p-4 shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-[#1c1b18]">{c.name}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {c.provider === 'google' ? 'Google' : 'Verified'}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Last login: {formatDateTime(c.lastLogin || c.last_sign_in_at)}</span>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-1.5 text-gray-600 text-[11px]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <a href={`mailto:${c.email}`} className="text-gray-800 hover:text-[#cda851] truncate">
                    {c.email}
                  </a>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <a href={`tel:${c.phone}`} className="text-gray-800 font-mono hover:text-[#cda851]">
                      {c.phone}
                    </a>
                  </div>
                )}
                {c.defaultAddress?.street ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {c.defaultAddress.street} (PIN: {c.defaultAddress.pincode})
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Total Spend:</span>
                  <div className="font-serif font-bold text-sm text-[#1c1b18]">
                    ₹{c.totalSpent.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Orders:</span>
                  <div className="font-bold text-sm text-gray-800">{c.totalOrders} placed</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setSelectedCustomer(c)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#1c1b18] text-[#cda851] text-xs font-bold hover:bg-[#2c2924] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details &amp; Orders</span>
                </button>
                <button
                  onClick={() => setTogglingCustomer(c)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    c.status === 'active'
                      ? 'border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50'
                      : 'border-emerald-200 text-emerald-700 bg-emerald-50'
                  }`}
                  title={c.status === 'active' ? 'Block Patron' : 'Unblock Patron'}
                >
                  {c.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. DESKTOP CUSTOMERS TABLE (>= 768px) */}
      {/* ========================================================================= */}
      <div className="hidden md:block bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#faf8f5] border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4 text-left">Patron Name &amp; SSO</th>
                <th className="py-3 px-3 text-left">Contact Info</th>
                <th className="py-3 px-3 text-left">Last Login / Active</th>
                <th className="py-3 px-3 text-left">Registered Date</th>
                <th className="py-3 px-3 text-center">Orders</th>
                <th className="py-3 px-3 text-right">Lifetime Spend</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-gray-600">No patrons found</p>
                    <p className="text-[11px]">No registered users matching this view or search filter</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                    {/* Patron Name & SSO Badge */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1c1b18] to-[#3a3731] text-[#cda851] font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#1c1b18] flex items-center gap-1.5">
                            <span>{c.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {c.provider === 'google' ? 'Google' : 'SSO'}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {c.memberTier || 'Verified Patron'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <a href={`mailto:${c.email}`} className="hover:text-[#cda851] truncate max-w-[180px]">
                          {c.email}
                        </a>
                      </div>
                      {c.phone ? (
                        <div className="flex items-center gap-1.5 text-gray-500 mt-0.5 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No phone added</span>
                      )}
                    </td>

                    {/* Last Login / Active (For Traffic Analytics) */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="font-semibold text-gray-900 text-[11px]">
                          {formatDateTime(c.lastLogin || c.last_sign_in_at)}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-medium pl-3.5 block">
                        Verified Login Recorded
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-3 text-gray-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{c.registeredDate ? c.registeredDate.split(' ')[0] : 'Recent'}</span>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-gray-100 text-gray-800">
                        {c.totalOrders}
                      </span>
                    </td>

                    {/* Lifetime Spend */}
                    <td className="py-3.5 px-3 text-right font-bold text-[#1c1b18]">
                      ₹{c.totalSpent.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1.5 text-gray-500 hover:text-[#1c1b18] hover:bg-amber-100/60 rounded-lg transition-colors cursor-pointer"
                          title="View Patron Profile & Orders"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTogglingCustomer(c)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            c.status === 'active'
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={c.status === 'active' ? 'Block Account' : 'Activate Account'}
                        >
                          {c.status === 'active' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CUSTOMER DETAILED PROFILE & ORDERS MODAL */}
      {/* ========================================================================= */}
      {selectedCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCustomer(null)}
          title={`Patron Profile: ${selectedCustomer.name}`}
          subtitle={`Registered: ${selectedCustomer.registeredDate} • Total Spend: ₹${selectedCustomer.totalSpent.toLocaleString()}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Identity & Authentication Card */}
            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-2">
                <div className="font-bold text-[#1c1b18] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#cda851]" />
                  <span>Authentication &amp; Account Details</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {selectedCustomer.provider === 'google' ? 'Google OAuth' : 'Verified SSO'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Email Address</span>
                  <a href={`mailto:${selectedCustomer.email}`} className="font-semibold text-gray-800 hover:text-[#cda851]">
                    {selectedCustomer.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Mobile Number</span>
                  <span className="font-semibold text-gray-800 font-mono">
                    {selectedCustomer.phone || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Latest Login Activity</span>
                  <span className="font-semibold text-emerald-700">
                    {formatDateTime(selectedCustomer.lastLogin || selectedCustomer.last_sign_in_at)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Registration Date</span>
                  <span className="font-semibold text-gray-700">
                    {selectedCustomer.registeredDate || 'Recent'}
                  </span>
                </div>
              </div>

              {selectedCustomer.defaultAddress?.street && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Saved Shipping Location</span>
                  <p className="text-gray-700 mt-0.5">
                    {selectedCustomer.defaultAddress.street}
                    {selectedCustomer.defaultAddress.pincode ? ` - PIN: ${selectedCustomer.defaultAddress.pincode}` : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1c1b18]">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#cda851]" />
                  <span>Order History ({customerOrders.length})</span>
                </div>
                <span className="text-gray-500 text-[11px] font-normal">
                  Lifetime Value: <strong>₹{selectedCustomer.totalSpent.toLocaleString()}</strong>
                </span>
              </div>

              {customerOrders.length > 0 ? (
                <div className="divide-y divide-[#e6e2d8] border border-[#e6e2d8] rounded-xl overflow-hidden text-xs max-h-60 overflow-y-auto">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                      <div>
                        <span className="font-mono font-bold text-[#1c1b18]">
                          {ord.orderNumber}
                        </span>
                        <div className="text-[11px] text-gray-500">
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} item(s)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#1c1b18]">
                          ₹{ord.totalAmount.toLocaleString()}
                        </span>
                        <div>
                          <StatusBadge status={ord.orderStatus} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-gray-400 bg-[#faf8f5] rounded-xl">
                  No orders recorded for this patron yet.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 6. BLOCK / UNBLOCK CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      <ConfirmationDialog
        isOpen={!!togglingCustomer}
        onClose={() => setTogglingCustomer(null)}
        onConfirm={() => {
          if (togglingCustomer) {
            toggleCustomerStatus(togglingCustomer.id);
            setTogglingCustomer(null);
          }
        }}
        title={`${togglingCustomer?.status === 'active' ? 'Block' : 'Unblock'} Customer Account`}
        message={`Are you sure you want to ${
          togglingCustomer?.status === 'active' ? 'block' : 'unblock'
        } ${togglingCustomer?.name}?`}
        confirmLabel={`Yes, ${togglingCustomer?.status === 'active' ? 'Block' : 'Unblock'}`}
        confirmVariant={togglingCustomer?.status === 'active' ? 'danger' : 'primary'}
      />
    </div>
  );
};
