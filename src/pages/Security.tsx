import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Laptop, Lock, AlertCircle, FileText, Key, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authService } from '../services/authService';
import { ChangePasswordModal } from '../components/common/ChangePasswordModal';

export const Security: React.FC = () => {
  const { auditLogs } = useStore();
  const { user, status } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const sessions = authService.getSessions();

  return (
    <div className="space-y-6">
      {/* Owner Security Banner */}
      <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e6e2d8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1c1b18] text-[#cda851]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-[#1c1b18]">
              Single-Owner Protected Console
            </h3>
            <p className="text-xs text-gray-500">
              Authenticated Owner: <strong>{user?.email || 'ad4064773@gmail.com'}</strong> • Mode: Isolated Master Admin Auth
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>PostgreSQL Bcrypt Guarded</span>
        </div>
      </div>

      {/* Master Password & Rate Limit Credentials Card */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e2d8]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] text-[#cda851]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1c1b18]">
                Master Admin Access Credentials
              </h3>
              <p className="text-xs text-gray-500">
                Salted bcrypt hash stored securely in PostgreSQL <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">public.admin_auth</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c1b18] hover:bg-black text-[#f9f8f5] text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-[#cda851]" />
            <span>Change Master Password</span>
          </button>
        </div>

        {/* Security Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] space-y-1.5">
            <div className="text-gray-400 font-medium text-[11px] uppercase tracking-wider">
              Verification Engine
            </div>
            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Server-Side PostgreSQL</span>
            </div>
            <div className="text-gray-500 text-[11px]">
              Bcrypt Blowfish (bf-10) with pgcrypto
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] space-y-1.5">
            <div className="text-gray-400 font-medium text-[11px] uppercase tracking-wider">
              Rate Limit Shield
            </div>
            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>5 Attempts / 15-Min Lock</span>
            </div>
            <div className="text-gray-500 text-[11px]">
              Status: {status?.locked ? 'Locked' : 'Active & Guarding'} (0/5 Violations)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] space-y-1.5">
            <div className="text-gray-400 font-medium text-[11px] uppercase tracking-wider">
              Security Hamper Alert
            </div>
            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Resend Transactional API</span>
            </div>
            <div className="text-gray-500 text-[11px] font-mono truncate" title="ad4064773@gmail.com">
              Target: ad4064773@gmail.com
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions Grid */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-[#1c1b18] flex items-center gap-2">
          <Laptop className="w-4 h-4 text-[#cda851]" />
          <span>Active &amp; Previous Owner Sessions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`p-4 rounded-xl border ${
                sess.status === 'active'
                  ? 'border-[#cda851] bg-[#faf8f5]'
                  : 'border-[#e6e2d8] bg-white'
              } space-y-2 text-xs`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1c1b18]">
                  {sess.status === 'active' ? 'Current Session (This Device)' : 'Previous Session'}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    sess.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {sess.status}
                </span>
              </div>
              <div className="text-gray-600 font-mono text-[11px]">{sess.ipAddress}</div>
              <div className="text-gray-400 text-[10px] truncate">{sess.userAgent}</div>
              <div className="text-[10px] text-gray-400">Signed in: {sess.loginTime}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#e6e2d8] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e6e2d8] bg-[#faf8f5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#cda851]" />
            <h3 className="font-serif font-bold text-sm text-[#1c1b18]">
              Administrative Audit Trail
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">
            {auditLogs.length} events recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4 text-left">Timestamp</th>
                <th className="py-3 px-3 text-left">Action</th>
                <th className="py-3 px-3 text-left">Target Resource</th>
                <th className="py-3 px-4 text-left">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-gray-800 px-2 py-0.5 rounded bg-gray-100">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#1c1b18]">{log.target}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-md truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
