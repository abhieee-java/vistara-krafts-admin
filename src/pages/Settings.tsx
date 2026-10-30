import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import {
  Store,
  Truck,
  Instagram,
  Mail,
  Phone,
  Bell,
  Save,
  Key,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { ChangePasswordModal } from '../components/common/ChangePasswordModal';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    lastPublishedVersion,
    lastPublishedAt
  } = useStore();
  const { navigate } = useRouter();

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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    setStoreName(settings.storeName);
    setBrandTagline(settings.brandTagline);
    setInstagramHandle(settings.instagramHandle);
    setContactEmail(settings.contactEmail);
    setContactPhone(settings.contactPhone);
    setFreeShippingThreshold(settings.freeShippingThreshold);
    setDefaultCourier(settings.defaultCourier);
    setLowStockAlertThreshold(settings.lowStockAlertThreshold);
  }, [settings]);

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
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#1c1b18]">
            Store &amp; Operational Settings
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure atelier parameters, brand identity, logistics, and storefront release deployments
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('system')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e6e2d8] text-xs font-semibold text-gray-700 hover:bg-[#faf8f5] hover:text-[#1c1b18] transition-colors shrink-0 shadow-2xs"
        >
          <Activity className="w-3.5 h-3.5 text-[#cda851]" />
          <span>View System Health</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. MASTER ACCESS & SECURITY CREDENTIALS */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1c1b18] text-[#cda851]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#1c1b18]">
                Master Admin Access Security
              </h4>
              <p className="text-xs text-gray-500">
                Encrypted master password with 5-attempt rate limit and automated Resend security alerts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c1b18] hover:bg-black text-[#f9f8f5] text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-[#cda851]" />
            <span>Change Master Password</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BRAND & OPERATIONAL SETTINGS FORM */}
      {/* ========================================================================= */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Identity Card */}
        <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e6e2d8] pb-3">
            <Store className="w-5 h-5 text-[#cda851]" />
            <h4 className="font-serif font-bold text-sm text-[#1c1b18]">Brand Identity &amp; Social</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-[#e6e2d8] rounded-xl focus:outline-none focus:border-[#cda851]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Tagline</label>
              <input
                type="text"
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                className="w-full px-3 py-2 border border-[#e6e2d8] rounded-xl focus:outline-none focus:border-[#cda851]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5" /> Instagram Handle
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full px-3 py-2 border border-[#e6e2d8] rounded-xl focus:outline-none focus:border-[#cda851]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Support Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#e6e2d8] rounded-xl focus:outline-none focus:border-[#cda851]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Support Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-[#e6e2d8] rounded-xl focus:outline-none focus:border-[#cda851]"
              />
            </div>
          </div>
        </div>

        {/* Logistics & Inventory Settings */}
        <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e6e2d8] pb-3">
            <Truck className="w-5 h-5 text-[#cda851]" />
            <h4 className="font-serif font-bold text-sm text-[#1c1b18]">Logistics &amp; Inventory</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#e6e2d8] rounded-xl focus:outline-none focus:border-[#cda851]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Default Courier</label>
              <select
                value={defaultCourier}
                onChange={(e) => setDefaultCourier(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#e6e2d8] rounded-xl focus:outline-none focus:border-[#cda851] bg-white"
              >
                <option value="Delhivery">Delhivery Surface/Air</option>
                <option value="BlueDart">Blue Dart Apex</option>
                <option value="DTDC">DTDC Express</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" /> Low Stock Threshold
              </label>
              <input
                type="number"
                value={lowStockAlertThreshold}
                onChange={(e) => setLowStockAlertThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#e6e2d8] rounded-xl focus:outline-none focus:border-[#cda851]"
              />
            </div>
          </div>
        </div>

        {/* Live Storefront Deployment Section */}
        <div className="bg-gradient-to-br from-[#ffffff] via-[#faf8f5] to-[#f4f0e6] border-2 border-[#9e3322]/20 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9e3322] to-[#7f2617] text-white flex items-center justify-center shrink-0 shadow-md">
                <Rocket className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-sm text-[#1c1b18]">
                    Live Storefront Release Deployment
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Zero-Downtime Live Drop
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Publish authoritative releases to Supabase (<code>store_published_version</code>) and broadcast across customer browser tabs in real-time.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-white border border-[#e6e2d8] shadow-sm text-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-gray-700">
                Trigger releases via <strong className="text-[#9e3322]">🚀 Publish</strong> in top navigation
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#e6e2d8]">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Release Version</span>
              <span className="font-mono font-bold text-[#1c1b18]">
                {lastPublishedVersion ? `v${lastPublishedVersion}` : 'Not yet deployed this session'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#e6e2d8]">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Last Published</span>
              <span className="font-semibold text-gray-700">
                {lastPublishedAt ? new Date(lastPublishedAt).toLocaleString() : 'Pending publish'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#e6e2d8]">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Storefront Sync Method</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Realtime + BroadcastChannel
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="interactive-btn px-6 py-2.5 rounded-xl bg-[#23211d] text-[#cda851] text-xs font-bold hover:bg-[#33302a] transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Operational Settings</span>
          </button>
        </div>
      </form>

      {/* Change Master Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
