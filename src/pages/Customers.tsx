import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Customer, DpdpTicket } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton, MobileCardSkeleton } from '../components/common/Skeleton';
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
  CheckCircle2,
  Copy,
  AlertCircle,
  FileText,
  Calendar,
  Check
} from 'lucide-react';

export const Customers: React.FC = () => {
  const {
    customers,
    orders,
    toggleCustomerStatus,
    refreshFromDb,
    isLoadingDb,
    addToast,
    dpdpTickets,
    updateDpdpTicketStatus,
    refreshDpdpTickets
  } = useStore();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'recent' | 'ordered' | 'dpdp'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [togglingCustomer, setTogglingCustomer] = useState<Customer | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<DpdpTicket | null>(null);
  const [ticketStatusInput, setTicketStatusInput] = useState<string>('open');
  const [ticketNotesInput, setTicketNotesInput] = useState<string>('');
  const [isSavingTicket, setIsSavingTicket] = useState<boolean>(false);

  // Analytical calculations
  const totalPatrons = customers.length;
  const patronsWithOrders = customers.filter((c) => c.totalOrders > 0).length;
  const totalPatronSpend = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalOrdersCount = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
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

  // DPDP Grievance metrics & filtering
  const openDpdpCount = dpdpTickets.filter(
    (t) => t.status === 'open' || t.status === 'In Review (SLA <= 7 Days)'
  ).length;

  const filteredTickets = dpdpTickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.ticketId.toLowerCase().includes(q) ||
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.mobile && t.mobile.includes(q)) ||
      (t.orderId && t.orderId.toLowerCase().includes(q)) ||
      t.requestType.toLowerCase().includes(q) ||
      t.details.toLowerCase().includes(q) ||
      (t.status && t.status.toLowerCase().includes(q))
    );
  });

  const getSlaBadge = (createdAtStr?: string, status?: string) => {
    const isResolved = status === 'resolved' || String(status).toLowerCase().includes('resolved');
    if (isResolved) {
      return {
        label: 'Resolved (SLA Met)',
        classes: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    }

    if (!createdAtStr) {
      return {
        label: '7-Day SLA Active',
        classes: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    }

    try {
      const createdTime = new Date(createdAtStr).getTime();
      const elapsedDays = (Date.now() - createdTime) / (1000 * 60 * 60 * 24);
      const remainingDays = Math.max(0, Math.ceil(7 - elapsedDays));

      if (elapsedDays > 7) {
        const overdueDays = Math.floor(elapsedDays - 7);
        return {
          label: `SLA Overdue (+${overdueDays}d past 7d)`,
          classes: 'bg-red-50 text-red-800 border-red-300 font-bold animate-pulse'
        };
      }
      if (remainingDays <= 2) {
        return {
          label: `Urgent: ${remainingDays}d left of 7d SLA`,
          classes: 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
        };
      }
      return {
        label: `${remainingDays}d left (7-day SLA)`,
        classes: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    } catch {
      return {
        label: '7-Day SLA Active',
        classes: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    }
  };

  const handleOpenTicketModal = (ticket: DpdpTicket) => {
    setSelectedTicket(ticket);
    setTicketStatusInput(ticket.status === 'In Review (SLA <= 7 Days)' ? 'open' : (ticket.status || 'open'));
    setTicketNotesInput(ticket.resolutionNotes || '');
  };

  const handleSaveTicketStatus = async () => {
    if (!selectedTicket) return;
    setIsSavingTicket(true);
    try {
      await updateDpdpTicketStatus(selectedTicket.ticketId, ticketStatusInput, ticketNotesInput);
      setSelectedTicket(null);
    } catch {
      addToast('Failed to update ticket. Please try again.', 'error');
    } finally {
      setIsSavingTicket(false);
    }
  };

  const handleManualRefresh = async () => {
    try {
      await Promise.all([refreshFromDb(), refreshDpdpTickets()]);
      addToast('Customer directory & DPDP tickets synced with live records.', 'success');
    } catch {
      addToast('Unable to refresh live records. Please try again.', 'error');
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
        <div className="p-4 rounded-2xl luxury-card space-y-1 cursor-default group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider group-hover:text-[#1c1b18] transition-colors">Registered Patrons</span>
            <div className="p-2 rounded-xl bg-amber-50 text-[#cda851] border border-[#e6e2d8] group-hover:border-[#cda851]/60 group-hover:scale-105 transition-all">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1c1b18] group-hover:text-[#cda851] transition-colors">
            {totalPatrons}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>100% Live Supabase Auth</span>
          </div>
        </div>

        {/* Metric 2: Active / Logged-in Patrons */}
        <div className="p-4 rounded-2xl luxury-card space-y-1 cursor-default group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider group-hover:text-[#1c1b18] transition-colors">Logged-In Traffic</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-[#e6e2d8] group-hover:border-emerald-300 group-hover:scale-105 transition-all">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1c1b18] group-hover:text-emerald-900 transition-colors">
            {customers.filter((c) => Boolean(c.lastLogin || c.last_sign_in_at)).length}
          </div>
          <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Verified Sessions Tracked</span>
          </div>
        </div>

        {/* Metric 3: Converting Patrons */}
        <div className="p-4 rounded-2xl luxury-card space-y-1 cursor-default group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider group-hover:text-[#1c1b18] transition-colors">Ordering Patrons</span>
            <div className="p-2 rounded-xl bg-[#faf8f5] text-[#b08d57] border border-[#e6e2d8] group-hover:border-[#b08d57]/50 group-hover:scale-105 transition-all">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1c1b18] group-hover:text-[#b08d57] transition-colors">
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
        <div className="p-4 rounded-2xl luxury-card space-y-1 cursor-default group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider group-hover:text-[#1c1b18] transition-colors">Patron Lifetime Spend</span>
            <div className="p-2 rounded-xl bg-[#faf8f5] text-[#9e3322] border border-[#e6e2d8] group-hover:border-[#9e3322]/40 group-hover:scale-105 transition-all">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1c1b18] group-hover:text-[#9e3322] transition-colors">
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
            <button
              onClick={() => setFilterTab('dpdp')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                filterTab === 'dpdp'
                  ? 'bg-[#1c1b18] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${openDpdpCount > 0 ? 'text-amber-400' : ''}`} />
              <span>DPDP Grievances ({dpdpTickets.length})</span>
              {openDpdpCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {openDpdpCount}
                </span>
              )}
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
      {/* 2B. DPDP STATUTORY GRIEVANCES TAB VIEW */}
      {/* ========================================================================= */}
      {filterTab === 'dpdp' ? (
        <div className="space-y-4">
          {/* Statutory Alert & Compliance Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1c1b18] flex items-center gap-2">
                  <span>DPDP Act 2023 Statutory Rights &amp; Grievance Portal</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Section 13 Compliance
                  </span>
                </h3>
                <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
                  Digital Personal Data Protection Act, 2023 mandates statutory redressal within <strong>7 calendar days</strong>. Patrons can submit grievances, exercise rights to access/correction, and request full erasure of session and patron records.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs shrink-0 self-end md:self-center font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-800">
                Total: <strong>{dpdpTickets.length}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                Open: <strong>{openDpdpCount}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                Resolved: <strong>{dpdpTickets.filter(t => t.status === 'resolved').length}</strong>
              </span>
            </div>
          </div>

          {/* Empty Tickets State */}
          {dpdpTickets.length === 0 ? (
            <div className="my-6">
              <EmptyState
                icon={ShieldCheck}
                title="No DPDP Grievance Tickets Recorded"
                description="When patrons submit a statutory grievance, data correction, or erasure request via the storefront DPDP Portal, tickets will appear here with live 7-day SLA countdowns."
                compact
              />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-4">
              <EmptyState
                icon={Search}
                title="No Matching DPDP Tickets"
                description="No grievance tickets match your current search criteria."
                compact
                secondaryAction={{
                  label: 'Clear Search',
                  onClick: () => setSearch('')
                }}
              />
            </div>
          ) : (
            <>
              {/* Mobile Ticket Cards */}
              <div className="md:hidden space-y-3">
                {filteredTickets.map((t) => {
                  const sla = getSlaBadge(t.createdAt, t.status);
                  const isResolved = t.status === 'resolved';
                  return (
                    <div
                      key={t.ticketId}
                      className="bg-white border border-[#e6e2d8] rounded-2xl p-4 shadow-sm space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#1c1b18]">{t.ticketId}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sla.classes}`}>
                              {sla.label}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-gray-700 mt-1">{t.requestType}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-800'
                              : (t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900')
                          }`}
                        >
                          {t.status === 'In Review (SLA <= 7 Days)' ? 'Open' : t.status}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Principal:</span>
                          <span className="font-semibold text-gray-900">{t.fullName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Email:</span>
                          <span className="font-mono text-gray-800">{t.email}</span>
                        </div>
                        {t.mobile && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">Mobile:</span>
                            <span className="font-mono text-gray-800">{t.mobile}</span>
                          </div>
                        )}
                        {t.orderId && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">Order Ref:</span>
                            <span className="font-mono font-bold text-[#1c1b18]">{t.orderId}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 text-xs line-clamp-2 bg-[#faf8f5] p-2.5 rounded-xl border border-[#e6e2d8]/60">
                        "{t.details}"
                      </p>

                      {t.resolutionNotes && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-[11px] text-emerald-900">
                          <strong>Resolution:</strong> {t.resolutionNotes}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-[10px] text-gray-400">
                          Raised: {formatDateTime(t.createdAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenTicketModal(t)}
                          className="px-3 py-1.5 rounded-xl bg-[#1c1b18] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Review &amp; Respond
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Tickets Table */}
              <div className="hidden md:block bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#faf8f5] border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4 text-left">Ticket ID &amp; SLA</th>
                        <th className="py-3 px-3 text-left">Data Principal</th>
                        <th className="py-3 px-3 text-left">Request Type &amp; Order</th>
                        <th className="py-3 px-3 text-left">Grievance Summary</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-left">Submitted Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTickets.map((t) => {
                        const sla = getSlaBadge(t.createdAt, t.status);
                        const isResolved = t.status === 'resolved';
                        return (
                          <tr key={t.ticketId} className="hover:bg-[#faf8f5]/80 transition-colors">
                            {/* Ticket ID & SLA */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#1c1b18]">{t.ticketId}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(t.ticketId);
                                    addToast(`Copied Ticket ID: ${t.ticketId}`, 'success');
                                  }}
                                  className="text-gray-400 hover:text-[#cda851]"
                                  title="Copy Ticket ID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="mt-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${sla.classes}`}>
                                  {sla.label}
                                </span>
                              </div>
                            </td>

                            {/* Data Principal */}
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-[#1c1b18]">{t.fullName}</div>
                              <div className="text-[11px] text-gray-500 font-mono">{t.email}</div>
                              {t.mobile && (
                                <div className="text-[10px] text-gray-400 font-mono">{t.mobile}</div>
                              )}
                            </td>

                            {/* Request Type & Order */}
                            <td className="py-3.5 px-3">
                              <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold text-[11px]">
                                {t.requestType}
                              </span>
                              {t.orderId ? (
                                <div className="font-mono text-[10.5px] text-[#cda851] font-bold mt-1">
                                  Order: {t.orderId}
                                </div>
                              ) : (
                                <div className="text-[10px] text-gray-400 mt-0.5">No order specified</div>
                              )}
                            </td>

                            {/* Grievance Summary */}
                            <td className="py-3.5 px-3 max-w-xs">
                              <p className="text-gray-700 truncate" title={t.details}>
                                {t.details}
                              </p>
                              {t.resolutionNotes && (
                                <p className="text-[10px] text-emerald-700 truncate mt-0.5">
                                  <strong>Resolution:</strong> {t.resolutionNotes}
                                </p>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                  isResolved
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : (t.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-amber-100 text-amber-900 border border-amber-200')
                                }`}
                              >
                                {t.status === 'In Review (SLA <= 7 Days)' ? 'Open' : t.status}
                              </span>
                            </td>

                            {/* Submitted Date */}
                            <td className="py-3.5 px-3 text-gray-500 text-[11px]">
                              {formatDateTime(t.createdAt)}
                            </td>

                            {/* Action */}
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenTicketModal(t)}
                                className="px-3 py-1.5 rounded-xl bg-[#1c1b18] hover:bg-black text-white font-bold text-xs transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                              >
                                <span>Review</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Loading Skeletons during live database sync */}
      {isLoadingDb && customers.length === 0 && (
        <div className="space-y-4">
          <div className="md:hidden">
            <MobileCardSkeleton count={3} />
          </div>
          <div className="hidden md:block bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden p-2">
            <TableSkeleton rows={5} columns={8} />
          </div>
        </div>
      )}

      {/* Zero Registered Patrons State */}
      {!isLoadingDb && customers.length === 0 && (
        <div className="my-6">
          <EmptyState
            icon={Users}
            title="Patron Directory Initialized"
            description="Real-time customer signups and authentications via Google SSO or email on the live storefront will synchronize here automatically."
            secondaryAction={{
              label: isLoadingDb ? 'Checking DB...' : 'Sync from Supabase',
              onClick: handleManualRefresh,
              icon: RefreshCw,
              loading: isLoadingDb
            }}
          />
        </div>
      )}

      {/* Empty Filter State (Mobile & Desktop) */}
      {customers.length > 0 && filteredCustomers.length === 0 && (
        <div className="py-4">
          <EmptyState
            icon={Search}
            title="No Matching Patrons"
            description="No patrons found matching your search criteria. Try adjusting your search term or switching to 'All Patrons'."
            compact
            secondaryAction={{
              label: 'Reset Filters',
              onClick: () => {
                setSearch('');
                setFilterTab('all');
              }
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MOBILE PATRON CARDS (< 768px) */}
      {/* ========================================================================= */}
      {filteredCustomers.length > 0 && (
        <div className="md:hidden space-y-3">
          {filteredCustomers.map((c) => (
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

              {/* Mobile User ID Display */}
              <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100 font-mono text-[10.5px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[9.5px] uppercase font-bold text-gray-400 shrink-0">User ID:</span>
                  <span className="text-gray-800 font-semibold truncate select-all">{c.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(c.id);
                    addToast(`Copied User ID: ${c.id.slice(0, 8)}...`, 'success');
                  }}
                  className="p-1 px-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-[#cda851] text-[10px] font-bold shrink-0 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                  title="Copy User ID"
                >
                  <Copy className="w-2.5 h-2.5 text-[#cda851]" />
                  <span>Copy</span>
                </button>
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
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DESKTOP CUSTOMERS TABLE (>= 768px) */}
      {/* ========================================================================= */}
      {filteredCustomers.length > 0 && (
        <div className="hidden md:block bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#faf8f5] border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4 text-left">Patron Name &amp; User ID</th>
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
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                    {/* Patron Name & User ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1c1b18] to-[#3a3731] text-[#cda851] font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#1c1b18] flex items-center gap-1.5">
                            <span className="truncate">{c.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                              {c.provider === 'google' ? 'Google' : 'SSO'}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {c.memberTier || 'Verified Patron'}
                          </div>
                          {/* Desktop User ID Badge */}
                          <div className="flex items-center gap-1.5 mt-1 font-mono text-[10.5px]">
                            <span className="text-[9px] uppercase font-bold text-gray-400 shrink-0">UID:</span>
                            <span
                              className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-900 border border-gray-200 hover:border-amber-300 font-semibold cursor-pointer transition-all select-all flex items-center gap-1 group/uid truncate max-w-[210px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(c.id);
                                addToast(`Copied User ID: ${c.id.slice(0, 8)}...`, 'success');
                              }}
                              title={`Click to copy User ID: ${c.id}`}
                            >
                              <span className="truncate">{c.id}</span>
                              <Copy className="w-2.5 h-2.5 opacity-60 group-hover/uid:opacity-100 text-[#cda851] shrink-0" />
                            </span>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

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

              {/* Full User ID Card */}
              <div className="p-3 rounded-xl bg-white border border-[#e6e2d8] flex items-center justify-between gap-3 shadow-2xs">
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">
                    Customer / User ID (Supabase Auth UID)
                  </span>
                  <code className="font-mono text-xs font-bold text-[#1c1b18] select-all break-all mt-0.5 block">
                    {selectedCustomer.id}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedCustomer.id);
                    addToast(`Copied User ID: ${selectedCustomer.id}`, 'success');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                  title="Copy Full User ID"
                >
                  <Copy className="w-3.5 h-3.5 text-[#cda851]" />
                  <span>Copy UID</span>
                </button>
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
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#1c1b18]">
                            {ord.orderNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(ord.orderNumber);
                              addToast(`Copied Order #${ord.orderNumber}`, 'success');
                            }}
                            className="p-1 text-gray-400 hover:text-[#cda851] rounded"
                            title="Copy Order Number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {ord.id && ord.id !== ord.orderNumber && (
                          <div className="flex items-center gap-1.5 text-[10.5px] text-gray-500 font-mono mt-0.5">
                            <span className="text-[9px] uppercase font-bold text-gray-400">Order ID:</span>
                            <span className="text-gray-700 font-semibold">{ord.id}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(ord.id);
                                addToast(`Copied Order ID: ${ord.id}`, 'success');
                              }}
                              className="text-gray-400 hover:text-[#cda851]"
                              title="Copy Order ID"
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                        <div className="text-[11px] text-gray-500 mt-0.5">
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
      {/* 5B. DPDP GRIEVANCE REVIEW & STATUTORY RESOLUTION MODAL */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          title={`DPDP Statutory Grievance: ${selectedTicket.ticketId}`}
          subtitle={`Type: ${selectedTicket.requestType} • Principal: ${selectedTicket.fullName}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* SLA Alert banner */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  DPDP Act 2023 Statutory SLA Tracking
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSlaBadge(selectedTicket.createdAt, selectedTicket.status).classes}`}>
                  {getSlaBadge(selectedTicket.createdAt, selectedTicket.status).label}
                </span>
              </div>
              <p className="text-amber-800/90 text-[11px]">
                Under Section 13 of the Digital Personal Data Protection Act 2023, data principals must receive a formal grievance response within a statutory timeline of 7 calendar days.
              </p>
            </div>

            {/* Principal Information */}
            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] space-y-3 text-xs">
              <div className="font-bold text-[#1c1b18] border-b border-[#e6e2d8] pb-1.5">
                Data Principal Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Full Name</span>
                  <span className="font-bold text-gray-900">{selectedTicket.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Email Address</span>
                  <a href={`mailto:${selectedTicket.email}`} className="font-semibold text-gray-800 hover:text-[#cda851]">
                    {selectedTicket.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Mobile Number</span>
                  <span className="font-semibold text-gray-800 font-mono">
                    {selectedTicket.mobile || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Associated Order</span>
                  <span className="font-mono font-bold text-[#1c1b18]">
                    {selectedTicket.orderId || 'General Inquiry'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Submitted Date</span>
                  <span className="font-medium text-gray-700">
                    {formatDateTime(selectedTicket.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Current Status</span>
                  <span className="font-bold uppercase text-xs">
                    {selectedTicket.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Full Grievance Request Description */}
            <div className="p-4 rounded-xl bg-white border border-[#e6e2d8] space-y-1.5 text-xs">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                Statutory Grievance &amp; Request Details
              </span>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                {selectedTicket.details}
              </div>
            </div>

            {/* Resolution Form */}
            <div className="p-4 rounded-xl bg-white border border-[#e6e2d8] space-y-3 text-xs">
              <div className="font-bold text-[#1c1b18]">
                Official Atelier Grievance Resolution
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Update Ticket Status:
                </label>
                <div className="flex items-center gap-2">
                  {(['open', 'in_progress', 'resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTicketStatusInput(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        ticketStatusInput === st
                          ? (st === 'resolved' ? 'bg-emerald-600 text-white' : (st === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'))
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {st === 'open' ? 'Open' : (st === 'in_progress' ? 'In Progress' : 'Resolved')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Resolution Notes / Formal Communication:
                </label>
                <textarea
                  value={ticketNotesInput}
                  onChange={(e) => setTicketNotesInput(e.target.value)}
                  placeholder="Record resolution notes, statutory data erasure actions taken, or patron communication notes..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-[#e6e2d8] bg-gray-50/60 text-xs focus:ring-2 focus:ring-[#cda851] focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingTicket}
                  onClick={handleSaveTicketStatus}
                  className="px-4 py-2 rounded-xl bg-[#1c1b18] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingTicket ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Save &amp; Sync Resolution</span>
                </button>
              </div>
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
