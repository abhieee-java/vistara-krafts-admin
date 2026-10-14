import React, { useState } from 'react';
import { systemService } from '../services/systemService';
import { SystemServiceStatus } from '../types';
import { Activity, Wifi, Database, HardDrive, CreditCard, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SystemHealth: React.FC = () => {
  const [services, setServices] = useState<SystemServiceStatus[]>(systemService.getServices());
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTest = async (service: SystemServiceStatus) => {
    setTestingService(service.name);
    setTestResult(null);
    try {
      const res = await systemService.testConnection(service.name);
      setTestResult(res.message);
      setServices((prev) =>
        prev.map((s) => (s.name === service.name ? { ...s, latencyMs: res.latency } : s))
      );
    } finally {
      setTestingService(null);
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'cloudflare-d1':
        return Database;
      case 'cloudflare-r2':
        return HardDrive;
      case 'razorpay':
        return CreditCard;
      default:
        return Wifi;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#e6e2d8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#cda851]" />
            <h3 className="font-serif font-bold text-lg text-[#1c1b18]">
              Cloudflare &amp; Payment Service Health
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Current execution mode: <strong>Modular Mock/Service Abstraction Layer</strong>. Fully functional without live keys.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All Services Operational</span>
        </div>
      </div>

      {testResult && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium">
          {testResult}
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => {
          const Icon = getServiceIcon(svc.service);
          const isTesting = testingService === svc.name;

          return (
            <div
              key={svc.name}
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
                      Latency: {svc.latencyMs}ms
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    svc.status === 'connected'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {svc.status === 'connected' ? 'LIVE' : 'MOCK READY'}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-[#faf8f5] p-3 rounded-xl border border-[#e6e2d8]">
                {svc.details}
              </p>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleTest(svc)}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6e2d8] text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing Ping...' : 'Test Connection'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Production Migration Roadmap */}
      <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#e6e2d8] space-y-3">
        <h4 className="font-serif font-bold text-sm text-[#1c1b18]">
          One-Click Cloudflare / Razorpay Credentials Switch Guide
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          When you are ready to ship this to production with client or personal credentials:
        </p>
        <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1.5 pl-2">
          <li>
            <strong>Authentication:</strong> Point <code>authService.ts</code> to your Cloudflare Access or Supabase Auth project URL.
          </li>
          <li>
            <strong>Database (D1):</strong> Replace <code>productService.ts</code> storage calls with <code>fetch('/api/products')</code> routed to Cloudflare Workers Pages Functions connected to D1.
          </li>
          <li>
            <strong>Storage (R2):</strong> Configure S3-compatible R2 endpoint and credentials in <code>storageService.ts</code>.
          </li>
          <li>
            <strong>Payments:</strong> Add your <code>RAZORPAY_KEY_ID</code> to trigger checkout popups.
          </li>
        </ol>
      </div>
    </div>
  );
};
