import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { systemService, DetailedServiceCheck } from '../services/systemService';
import {
  Store,
  Truck,
  Instagram,
  Mail,
  Phone,
  Bell,
  Save,
  Database,
  Cloud,
  CreditCard,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Key,
  ShieldCheck
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings, products, refreshFromDb, isLoadingDb, addToast } = useStore();

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

  // Live API Telemetry State
  const [apiChecks, setApiChecks] = useState<DetailedServiceCheck[]>([]);
  const [isTestingApis, setIsTestingApis] = useState<boolean>(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  const runApiDiagnostics = async () => {
    setIsTestingApis(true);
    try {
      const results = await systemService.runAllHealthChecks();
      setApiChecks(results);
      setLastCheckTime(new Date().toLocaleTimeString());
      addToast('Live API handshake diagnostics complete!', 'success');
    } catch (err: any) {
      addToast('API health check error: ' + (err?.message || 'Network timeout'), 'error');
    } finally {
      setIsTestingApis(false);
    }
  };

  useEffect(() => {
    runApiDiagnostics();
  }, []);

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

  const getServiceIcon = (id: string) => {
    if (id.includes('supabase-db')) return Database;
    if (id.includes('supabase-auth')) return ShieldCheck;
    if (id.includes('cloudinary')) return Cloud;
    if (id.includes('razorpay')) return CreditCard;
    return Radio;
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="font-serif font-bold text-lg text-[#1c1b18]">
          Settings &amp; Infrastructure
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Live API connections, cloud services telemetry, and atelier operational parameters
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. LIVE API & CLOUD CONNECTIONS HEALTH CARD */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#23211d] text-[#cda851] flex items-center justify-center shrink-0 shadow-sm">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-sm text-[#1c1b18]">
                  Live API Connections &amp; Database Health
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Zero Mock Data Active
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Real-time connection verification for Supabase, Cloudinary, Razorpay, and Storefront Bridge
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={refreshFromDb}
              disabled={isLoadingDb}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e6e2d8] text-xs font-semibold text-[#1c1b18] hover:bg-[#faf8f5] transition-colors"
              title="Pull latest live catalog from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#cda851] ${isLoadingDb ? 'animate-spin' : ''}`} />
              <span>{isLoadingDb ? 'Syncing...' : 'Sync Catalog'}</span>
            </button>

            <button
              type="button"
              onClick={runApiDiagnostics}
              disabled={isTestingApis}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#23211d] text-[#cda851] text-xs font-bold hover:bg-[#33302a] transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingApis ? 'animate-spin' : ''}`} />
              <span>{isTestingApis ? 'Testing Handshakes...' : 'Test Connections'}</span>
            </button>
          </div>
        </div>

        {/* Catalog DB Real Count Banner */}
        <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-[#cda851] shrink-0" />
            <div>
              <span className="font-bold text-[#1c1b18]">Active Catalog: </span>
              <span className="font-semibold text-gray-700">
                {products.length} product{products.length === 1 ? '' : 's'} stored in database
              </span>
              {products.length === 0 && (
                <span className="ml-2 text-[11px] text-amber-700 font-medium">
                  (Clean catalog. No mock data injected. Add your first product to display.)
                </span>
              )}
            </div>
          </div>
          {lastCheckTime && (
            <span className="text-[11px] font-mono text-gray-400">
              Last Ping: {lastCheckTime}
            </span>
          )}
        </div>

        {/* API Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {apiChecks.map((svc) => {
            const Icon = getServiceIcon(svc.id);
            const isOk = svc.status === 'connected';

            return (
              <div
                key={svc.id}
                className="p-4 rounded-xl border border-[#e6e2d8] bg-[#ffffff] hover:border-[#cda851]/60 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#faf8f5] border border-[#e6e2d8] flex items-center justify-center text-[#cda851]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-[#1c1b18]">{svc.name}</h5>
                      <span className="text-[10px] text-gray-400">{svc.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isOk
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isOk ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>CONNECTED</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>READY</span>
                        </>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {svc.latencyMs}ms
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#faf8f5] border border-[#e6e2d8] text-[11px] text-gray-600 font-mono truncate">
                  <span className="text-gray-400 select-none">Endpoint: </span>
                  {svc.endpoint}
                </div>

                <p className="text-[11px] text-gray-600 leading-snug">
                  {svc.message}
                </p>
              </div>
            );
          })}
        </div>

        {/* Environment Variable Guide */}
        <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] space-y-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#cda851]" />
            <h5 className="font-bold text-xs text-[#1c1b18]">Vercel Environment Variables Status</h5>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            The admin portal supports both standard names (<code>SUPABASE_URL</code>, <code>CLOUDINARY_CLOUD_NAME</code>, etc.) and Vite-prefixed names (<code>VITE_SUPABASE_URL</code>). All configured variables in Vercel are automatically bound without needing code alterations.
          </p>
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

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#23211d] text-[#cda851] text-xs font-bold hover:bg-[#33302a] transition-all flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Operational Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
