import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Coupon } from '../types';
import { Modal } from '../components/common/Modal';
import { Ticket, Plus, Trash2, Megaphone, CheckCircle2, XCircle } from 'lucide-react';

export const Promotions: React.FC = () => {
  const { coupons, addCoupon, toggleCoupon, deleteCoupon, settings, updateSettings } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(200);
  const [minOrderValue, setMinOrderValue] = useState<number>(1500);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(500);

  const [announcementText, setAnnouncementText] = useState(settings.announcementBarText);
  const [isBarActive, setIsBarActive] = useState(settings.announcementBarActive);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    addCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      expiryDate,
      usageLimit: Number(usageLimit),
      isActive: true
    });

    setIsAddModalOpen(false);
    setCode('');
    setDiscountValue(200);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      announcementBarText: announcementText,
      announcementBarActive: isBarActive
    });
  };

  return (
    <div className="space-y-6">
      {/* Storefront Announcement Bar CMS Card */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#faf8f5] text-[#cda851] border border-[#e6e2d8]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1c1b18]">
                Storefront Top Announcement Ribbon
              </h3>
              <p className="text-xs text-gray-500">
                Directly updates the ribbon displayed across all customer storefront pages
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBarActive}
              onChange={(e) => setIsBarActive(e.target.checked)}
              className="w-4 h-4 accent-[#cda851] rounded"
            />
            <span className="text-xs font-bold text-[#1c1b18]">Active on Store</span>
          </label>
        </div>

        <form onSubmit={handleSaveAnnouncement} className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700">
            Banner Announcement Message
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. ✨ Vistāra Krafts • 24h Bridal Varmala Doorstep Pickup • Free Express Shipping"
              className="flex-1 h-10 px-3.5 rounded-xl border border-[#e6e2d8] bg-[#faf8f5] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
            />
            <button
              type="submit"
              className="px-5 h-10 rounded-xl bg-[#1c1b18] text-[#cda851] text-xs font-bold hover:bg-[#2d2a24] transition-colors shrink-0"
            >
              Push to Live Storefront
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-base text-[#1c1b18]">
            Discount Coupons &amp; Vouchers
          </h3>
          <p className="text-xs text-gray-500">
            Active promo codes validated during customer checkout
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#cda851] text-[#1c1b18] text-xs font-bold hover:bg-[#dfc27d] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#faf8f5] border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4 text-left">Coupon Code</th>
                <th className="py-3 px-3 text-left">Discount Offer</th>
                <th className="py-3 px-3 text-right">Min Order Value</th>
                <th className="py-3 px-3 text-center">Expiry Date</th>
                <th className="py-3 px-3 text-center">Redemptions</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-sm text-[#1c1b18]">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#faf8f5] border border-[#e6e2d8]">
                      <Ticket className="w-3.5 h-3.5 text-[#cda851]" />
                      <span>{c.code}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-800">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% OFF`
                      : `Flat ₹${c.discountValue} OFF`}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-700">
                    ₹{c.minOrderValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center text-gray-500 font-mono">{c.expiryDate}</td>
                  <td className="py-3 px-3 text-center font-bold text-[#1c1b18]">
                    {c.usageCount} / {c.usageLimit}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => toggleCoupon(c.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-gray-500" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteCoupon(c.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Coupon Voucher"
          subtitle="Configure discount rules, order thresholds, and expiry limits"
          maxWidth="md"
        >
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. DIWALI300 or FESTIVE15"
                className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] font-mono font-bold text-xs uppercase focus:ring-2 focus:ring-[#cda851] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs bg-white focus:ring-2 focus:ring-[#cda851] outline-none"
                >
                  <option value="fixed">Flat Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder="200"
                  className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                  Min. Order Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs focus:ring-2 focus:ring-[#cda851] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#1c1b18] bg-[#cda851] hover:bg-[#dfc27d]"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
