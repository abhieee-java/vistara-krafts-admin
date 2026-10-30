import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Coupon } from '../types';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Ticket, Plus, Trash2, Megaphone, CheckCircle2, XCircle, Sliders } from 'lucide-react';

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
  const [floralActive, setFloralActive] = useState<boolean>(Boolean(settings.enableFloralTransformationSection));

  useEffect(() => {
    setAnnouncementText(settings.announcementBarText);
    setIsBarActive(settings.announcementBarActive);
    setFloralActive(Boolean(settings.enableFloralTransformationSection));
  }, [settings.announcementBarText, settings.announcementBarActive, settings.enableFloralTransformationSection]);

  const handleToggleFloralSection = (active: boolean) => {
    setFloralActive(active);
    updateSettings({
      enableFloralTransformationSection: active
    });
  };

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
      <div className="luxury-card p-6 space-y-4">
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

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isBarActive}
              onChange={(e) => setIsBarActive(e.target.checked)}
              className="w-4 h-4 accent-[#cda851] rounded cursor-pointer"
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
              className="interactive-btn px-5 h-10 rounded-xl bg-[#1c1b18] text-[#cda851] text-xs font-bold hover:bg-[#2d2a24] transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm"
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
        {coupons.length > 0 && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#cda851] text-[#1c1b18] text-xs font-bold hover:bg-[#dfc27d] transition-colors shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create New Coupon
          </button>
        )}
      </div>

      {/* Empty Coupons State */}
      {coupons.length === 0 && (
        <div className="my-4">
          <EmptyState
            icon={Ticket}
            title="No Promotional Coupons Yet"
            description="Create discount vouchers or promo codes for customers to apply at checkout."
            action={{
              label: 'Create First Coupon',
              onClick: () => setIsAddModalOpen(true),
              icon: Plus
            }}
          />
        </div>
      )}

      {/* Mobile Coupon Cards (Phone Screens < 768px) */}
      {coupons.length > 0 && (
        <div className="md:hidden space-y-3">
          {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-[#e6e2d8] rounded-2xl p-4 shadow-sm space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#1c1b18] text-[#cda851] font-mono font-bold text-xs shadow-sm">
                <Ticket className="w-3.5 h-3.5" />
                <span>{c.code}</span>
              </div>
              <button
                onClick={() => toggleCoupon(c.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
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
                    <span>Paused</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Benefit:</span>
                <div className="font-bold text-sm text-[#1c1b18]">
                  {c.discountType === 'percentage'
                    ? `${c.discountValue}% OFF`
                    : `₹${c.discountValue} FLAT OFF`}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400">Min Order:</span>
                <div className="font-medium text-gray-700">₹{c.minOrderValue.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500">
              <div>Expires: <strong className="text-gray-700">{c.expiryDate}</strong></div>
              <div>Used: <strong className="text-gray-700">{c.usageCount} / {c.usageLimit}</strong></div>
              <button
                onClick={() => deleteCoupon(c.id)}
                className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Desktop Coupons Table (Hidden on Mobile) */}
      {coupons.length > 0 && (
        <div className="hidden md:block bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
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
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer ${
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
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
      )}

      {/* Storefront Feature Modules & Sections Toggle Card */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#faf8f5] text-[#cda851] border border-[#e6e2d8]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1c1b18]">
                Storefront Homepage Interactive Modules
              </h3>
              <p className="text-xs text-gray-500">
                Instantly enable or disable optional promotional sections on the customer storefront
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#e6e2d8] bg-[#faf8f5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#1c1b18]">
                21-Day Cryo-Silica Floral Transformation (Interactive Before/After Slider)
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                floralActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {floralActive ? 'Active on Home' : 'Disabled / Hidden'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
              When disabled, the storefront homepage remains focused strictly on the authentic 19-product catalog (Epoxy Kits, Silicone Molds, and Studio Supplies) without the floral slider. You can re-enable it here at any time.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggleFloralSection(!floralActive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              floralActive
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-[#1c1b18] text-[#cda851] hover:bg-[#2d2a24]'
            }`}
          >
            {floralActive ? 'Disable & Hide Section' : 'Enable on Home'}
          </button>
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
