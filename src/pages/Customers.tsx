import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { StatusBadge } from '../components/common/Badge';
import { Search, Mail, Phone, MapPin, UserX, UserCheck, Eye, ShoppingBag } from 'lucide-react';

export const Customers: React.FC = () => {
  const { customers, orders, toggleCustomerStatus } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [togglingCustomer, setTogglingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) =>
          o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase() ||
          o.customerPhone === selectedCustomer.phone
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Top Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registered patrons by name, email, or mobile..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e6e2d8] bg-white text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Total Registered Patrons: <strong>{customers.length}</strong>
        </div>
      </div>

      {/* Mobile Patron Cards (Phone Screens < 768px) */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-[#e6e2d8] rounded-2xl p-4 shadow-sm space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#1c1b18]">{c.name}</h4>
                <div className="text-[10px] text-gray-400">Joined {c.registeredDate}</div>
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
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <a href={`tel:${c.phone}`} className="text-gray-800 font-mono hover:text-[#cda851]">
                  {c.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  {c.defaultAddress?.city || 'Bengaluru'}, {c.defaultAddress?.state || 'KA'}{' '}
                  ({c.defaultAddress?.pincode || '560001'})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Lifetime Spend:</span>
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
                className="flex-1 py-2 px-3 rounded-xl bg-[#1c1b18] text-[#cda851] text-xs font-bold hover:bg-[#2c2924] transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Orders &amp; Address</span>
              </button>
              <button
                onClick={() => setTogglingCustomer(c)}
                className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
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

      {/* Desktop Customers Table (Hidden on Mobile) */}
      <div className="hidden md:block bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#faf8f5] border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4 text-left">Patron Name</th>
                <th className="py-3 px-3 text-left">Contact Info</th>
                <th className="py-3 px-3 text-left">Primary Delivery Location</th>
                <th className="py-3 px-3 text-center">Orders</th>
                <th className="py-3 px-3 text-right">Lifetime Spend</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#1c1b18]">{c.name}</div>
                    <div className="text-[10px] text-gray-400">Registered {c.registeredDate}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{c.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{c.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-600 max-w-xs truncate">
                    {c.defaultAddress ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#cda851] shrink-0" />
                        <span>
                          {c.defaultAddress.city}, PIN: {c.defaultAddress.pincode}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No saved address</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-[#1c1b18]">
                    {c.totalOrders}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#1c1b18]">
                    ₹{c.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Orders & Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTogglingCustomer(c)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          c.status === 'active'
                            ? 'text-red-500 hover:bg-red-50'
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

      {/* Customer Orders Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCustomer(null)}
          title={`Patron Profile: ${selectedCustomer.name}`}
          subtitle={`Registered: ${selectedCustomer.registeredDate} • Total Spend: ₹${selectedCustomer.totalSpent.toLocaleString()}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] space-y-2 text-xs">
              <div className="font-bold text-[#1c1b18]">Contact &amp; Shipping Details</div>
              <p className="text-gray-600">
                Email: <strong>{selectedCustomer.email}</strong> • Phone:{' '}
                <strong>{selectedCustomer.phone}</strong>
              </p>
              {selectedCustomer.defaultAddress && (
                <p className="text-gray-600">
                  Address: {selectedCustomer.defaultAddress.street},{' '}
                  {selectedCustomer.defaultAddress.city}, {selectedCustomer.defaultAddress.state} -{' '}
                  <strong>{selectedCustomer.defaultAddress.pincode}</strong>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1b18]">
                <ShoppingBag className="w-4 h-4 text-[#cda851]" />
                <span>Order History ({customerOrders.length})</span>
              </div>
              {customerOrders.length > 0 ? (
                <div className="divide-y divide-[#e6e2d8] border border-[#e6e2d8] rounded-xl overflow-hidden text-xs">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <span className="font-mono font-bold text-[#1c1b18] whitespace-nowrap">
                          {ord.orderNumber}
                        </span>
                        <div className="text-[11px] text-gray-500">
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} items
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

      {/* Block/Unblock Confirmation */}
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
