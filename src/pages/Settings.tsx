import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Store, Truck, Instagram, Mail, Phone, Bell, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [brandTagline, setBrandTagline] = useState(settings.brandTagline);
  const [instagramHandle, setInstagramHandle] = useState(settings.instagramHandle);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    settings.freeShippingThreshold
  );
  const [defaultCourier, setDefaultCourier] = useState(settings.defaultCourier);
  const [lowStockAlertThreshold, setLowStockAlertThreshold] = useState(
    settings.lowStockAlertThreshold
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      brandTagline,
      instagramHandle,
      contactEmail,
      contactPhone,
      freeShippingThreshold: Number(freeShippingThreshold),
      defaultCourier,
      lowStockAlertThreshold: Number(lowStockAlertThreshold)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="font-serif font-bold text-base text-[#1c1b18]">
          Store &amp; Operational Brand Settings
        </h3>
        <p className="text-xs text-gray-500">
          Core settings synchronized across the Vistāra Krafts storefront and administrative console
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Identity Card */}
        <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e6e2d8] pb-3">
            <Store className="w-5 h-5 text-[#cda851]" />
            <h4 className="font-serif font-bold text-sm text-[#1c1b18]">Brand Identity &amp; Social</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs bg-[#faf8f5] focus:ring-2 focus:ring-[#cda851] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                Instagram Handle
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e6e2d8] text-xs bg-[#faf8f5] focus:ring-2 focus:ring-[#cda851] outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs bg-[#faf8f5] focus:ring-2 focus:ring-[#cda851] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact & Dispatch Card */}
        <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e6e2d8] pb-3">
            <Truck className="w-5 h-5 text-[#cda851]" />
            <h4 className="font-serif font-bold text-sm text-[#1c1b18]">
              Contact &amp; Express Shipping Rules
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                Atelier Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e6e2d8] text-xs bg-[#faf8f5] focus:ring-2 focus:ring-[#cda851] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                Studio WhatsApp / Mobile
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e6e2d8] text-xs bg-[#faf8f5] focus:ring-2 focus:ring-[#cda851] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                Free Express Delivery Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs bg-[#faf8f5] focus:ring-2 focus:ring-[#cda851] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
                Preferred Courier Partner
              </label>
              <select
                value={defaultCourier}
                onChange={(e) => setDefaultCourier(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs bg-[#faf8f5] focus:ring-2 focus:ring-[#cda851] outline-none"
              >
                <option value="Delhivery Express">Delhivery Express (Pan-India)</option>
                <option value="BlueDart Air">BlueDart Air (24h Bridal Floral Pickup)</option>
                <option value="DTDC Priority">DTDC Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Operational Inventory Alerts */}
        <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e6e2d8] pb-3">
            <Bell className="w-5 h-5 text-[#cda851]" />
            <h4 className="font-serif font-bold text-sm text-[#1c1b18]">
              Operational Thresholds
            </h4>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-[#1c1b18] mb-1">
              Default Low Stock Alert Threshold (Units)
            </label>
            <input
              type="number"
              min="1"
              value={lowStockAlertThreshold}
              onChange={(e) => setLowStockAlertThreshold(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-[#e6e2d8] text-xs bg-[#faf8f5] focus:ring-2 focus:ring-[#cda851] outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#cda851] text-[#1c1b18] text-xs font-bold hover:bg-[#dfc27d] shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Save Store Settings
          </button>
        </div>
      </form>
    </div>
  );
};
