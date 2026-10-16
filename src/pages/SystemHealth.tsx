import React, { useState, useEffect } from 'react';
import { systemService, DetailedServiceCheck } from '../services/systemService';
import { useStore } from '../context/StoreContext';
import { Activity, Database, Cloud, CreditCard, Radio, RefreshCw, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { SUPABASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/env';

export const SystemHealth: React.FC = () => {
  const { products, refreshFromDb, isLoadingDb } = useStore();
  const [checks, setChecks] = useState<DetailedServiceCheck[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const loadHealth = async () => {
    setIsChecking(true);
    try {
      const results = await systemService.runAllHealthChecks();
      setChecks(results);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleTest = async (service: DetailedServiceCheck) => {
    setTestingService(service.id);
    setTestResult(null);
    try {
      const res = await systemService.testConnection(service.id);
      setTestResult(res.message);
      setChecks((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, latencyMs: res.latency, message: res.message } : s))
      );
    } finally {
      setTestingService(null);
    }
  };

  const getServiceIcon = (id: string) => {
    if (id.includes('supabase-db')) return Database;
    if (id.includes('supabase-auth')) return ShieldCheck;
    if (id.includes('cloudinary')) return Cloud;
    if (id.includes('razorpay')) return CreditCard;
    return Radio;
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#cda851]" />
            <h3 className="font-serif font-bold text-lg text-[#1c1b18]">
              Cloud Infrastructure &amp; API Connectivity
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time telemetry and network ping across Supabase, Cloudinary, Razorpay &amp; Storefront Bridge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshFromDb}
            disabled={isLoadingDb}
            className="px-3 py-2 rounded-xl border border-[#e6e2d8] text-xs font-semibold text-[#1c1b18] hover:bg-[#faf8f5] transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#cda851] ${isLoadingDb ? 'animate-spin' : ''}`} />
            <span>{isLoadingDb ? 'Syncing...' : 'Sync Catalog'}</span>
          </button>

          <button
            type="button"
            onClick={loadHealth}
            disabled={isChecking}
            className="px-4 py-2 rounded-xl bg-[#23211d] text-[#cda851] text-xs font-bold hover:bg-[#33302a] transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Running Pings...' : 'Run Diagnostics'}</span>
          </button>
        </div>
      </div>

      {/* Catalog Status Quick Bar */}
      <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-medium text-gray-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>Catalog Mode: <strong>Live Database Only (Strict Zero Mock Data)</strong></span>
          <span className="text-gray-400">|</span>
          <span>{products.length} product(s) active</span>
        </div>
      </div>

      {testResult && (
        <div className="p-4 rounded-xl text-xs font-medium border bg-emerald-50 border-emerald-200 text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((svc) => {
          const Icon = getServiceIcon(svc.id);
          const isTesting = testingService === svc.id;
          const isOk = svc.status === 'connected';

          return (
            <div
              key={svc.id}
              className="p-5 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#faf8f5] text-[#1c1b18] border border-[#e6e2d8]">
                    <Icon className="w-5 h-5 text-[#cda851]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1c1b18]">{svc.name}</h4>
                    <span className="text-[10px] font-mono text-gray-400">
                      Latency: {svc.latencyMs}ms | {svc.category}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    isOk ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isOk ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>LIVE</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>READY</span>
                    </>
                  )}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#faf8f5] border border-[#e6e2d8] text-[11px] font-mono text-gray-500 truncate">
                {svc.endpoint}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-[#faf8f5] p-3 rounded-xl border border-[#e6e2d8]">
                {svc.message}
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-gray-400 font-mono">
                  {svc.id === 'supabase-db' && `PostgreSQL REST & Realtime • ${SUPABASE_URL}`}
                  {svc.id === 'cloudinary' && `Cloud: ${CLOUDINARY_CLOUD_NAME} • Preset: ${CLOUDINARY_UPLOAD_PRESET}`}
                  {svc.id === 'storefront-bridge' && 'BroadcastChannel & Polling'}
                  {svc.id === 'supabase-auth' && 'GoTrue JWT Single-Owner Guard'}
                  {svc.id === 'razorpay' && 'Standard Checkout Modal'}
                </span>

                <button
                  type="button"
                  onClick={() => handleTest(svc)}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6e2d8] text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Pinging API...' : 'Ping Test'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Production Architecture Summary */}
      <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#e6e2d8] space-y-3">
        <h4 className="font-serif font-bold text-sm text-[#1c1b18] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#cda851]" />
          <span>Active Production Architecture (Zero Mock Data)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-gray-700">
          <div className="p-3 bg-white rounded-xl border border-[#e6e2d8]">
            <span className="font-bold text-[#1c1b18] block mb-1">Database &amp; Ledger:</span>
            <span>Supabase PostgreSQL instance at <code>{SUPABASE_URL}</code>. Zero mock records.</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#e6e2d8]">
            <span className="font-bold text-[#1c1b18] block mb-1">Media CDN &amp; Storage:</span>
            <span>Cloudinary cloud <code>{CLOUDINARY_CLOUD_NAME}</code> with preset <code>{CLOUDINARY_UPLOAD_PRESET}</code>.</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#e6e2d8]">
            <span className="font-bold text-[#1c1b18] block mb-1">Storefront Synchronization:</span>
            <span>Automated 2-way CDC sync engine between Owner Portal and Storefront catalog.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
