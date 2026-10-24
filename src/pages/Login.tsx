import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginWithGoogle, isLoading, status, refreshStatus } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState<string | null>(null);

  // Periodically refresh security status / countdown if locked
  useEffect(() => {
    refreshStatus();
  }, []);

  useEffect(() => {
    if (!status?.locked || !status?.locked_until) {
      setLockoutCountdown(null);
      return;
    }

    const updateTimer = () => {
      const lockTime = new Date(status.locked_until!).getTime();
      const now = Date.now();
      const diffMs = lockTime - now;

      if (diffMs <= 0) {
        setLockoutCountdown(null);
        refreshStatus();
      } else {
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        setLockoutCountdown(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [status?.locked, status?.locked_until]);

  const isLocked = Boolean(status?.locked && (!lockoutCountdown || lockoutCountdown !== '0m 00s'));
  const remainingAttempts = status?.remaining_attempts ?? 5;
  const failedAttempts = status?.failed_attempts ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setError(null);
    try {
      await login(password);
    } catch (err: any) {
      const authData = err?.authData;
      if (authData?.locked) {
        setError(
          authData?.error ||
          'Rate limit exceeded: 5/5 failed attempts. Account locked. A security hamper alert has been dispatched to ad4064773@gmail.com.'
        );
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
      refreshStatus();
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1b18] text-[#f9f8f5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#cda851]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#9e3322]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#24221d] border border-[#3b372e] rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#cda851] to-[#99792e] text-[#1c1b18] font-serif font-black text-2xl shadow-lg mb-2">
            VK
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#f9f8f5] tracking-tight">
            Vistāra Krafts
          </h1>
          <p className="text-xs text-[#cda851] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Owner Operations Portal
          </p>
          <p className="text-[11px] text-gray-400">
            Resin Art Memories × Bespoke Keepsakes Atelier
          </p>
        </div>

        {/* Security Shield Status Badge */}
        <div className="mb-6">
          {isLocked ? (
            <div className="p-4 rounded-2xl bg-red-950/70 border border-red-700/80 text-red-200 text-xs shadow-lg space-y-2.5 animate-pulse">
              <div className="flex items-center gap-2 font-bold text-red-300 uppercase tracking-wider text-[11px]">
                <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                <span>Security Hamper Protocol Active</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-100">
                Rate limit exceeded: <strong>5 consecutive failed attempts</strong>. Access to the owner deck is temporarily locked.
              </p>
              <div className="pt-2 border-t border-red-800/60 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-red-300">
                  <Clock className="w-3.5 h-3.5" /> Cooldown Active:
                </span>
                <span className="font-mono font-bold text-amber-300 bg-red-900/60 px-2 py-0.5 rounded">
                  {lockoutCountdown || '15m 00s'}
                </span>
              </div>
              <p className="text-[10px] text-red-300/80 italic">
                A security alert has been dispatched to <strong>ad4064773@gmail.com</strong> via Resend.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#2d2a24] border border-[#454035] text-[11px] text-[#dfc27d] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <Shield className="w-4 h-4 text-[#cda851] shrink-0" />
                  <span>Single-Owner Protected Access</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {remainingAttempts} / 5 Left
                </span>
              </div>

              {/* Rate Limit Dots */}
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const isExhausted = idx <= failedAttempts;
                  return (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        isExhausted
                          ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                          : 'bg-[#cda851]/60'
                      }`}
                      title={isExhausted ? 'Attempt used' : 'Attempt available'}
                    />
                  );
                })}
              </div>

              {failedAttempts > 0 && (
                <p className="text-[10px] text-amber-400/90 font-medium pt-0.5">
                  ⚠️ {failedAttempts} failed attempt{failedAttempts > 1 ? 's' : ''} recorded. Exceeding 5 attempts triggers an automated security alert to ad4064773@gmail.com.
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs font-medium flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#d4cebe] mb-1.5">
              Owner Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLocked || isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLocked ? 'Access Locked' : 'Enter Master Password'}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#1c1b18] border border-[#3b372e] text-xs text-[#f9f8f5] focus:border-[#cda851] focus:ring-1 focus:ring-[#cda851] outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className={`w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
              isLocked
                ? 'bg-[#3b372e] text-gray-400 cursor-not-allowed opacity-60'
                : 'bg-[#cda851] hover:bg-[#dfc27d] text-[#1c1b18] active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[#1c1b18] border-t-transparent rounded-full animate-spin" />
                <span>Verifying Hash in Database...</span>
              </span>
            ) : isLocked ? (
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>Locked ({lockoutCountdown || '15m'})</span>
              </span>
            ) : (
              <>
                <span>Verify &amp; Enter Atelier Deck</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3b372e]" />
          </div>
          <span className="relative px-3 bg-[#24221d] text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            Or Authorized Single Sign-On
          </span>
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading || isLocked}
          className="w-full h-11 rounded-xl bg-[#1c1b18] hover:bg-[#2d2a24] border border-[#3b372e] text-xs font-semibold text-[#f9f8f5] flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google (Supabase Auth)</span>
        </button>

        <div className="mt-6 text-center space-y-1">
          <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#cda851]" />
            <span>Supabase Bcrypt Hash Guard • Resend Alert Active</span>
          </div>
          <div className="text-[9px] text-gray-600">
            Intrusion alerts dispatched to ad4064773@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
};
