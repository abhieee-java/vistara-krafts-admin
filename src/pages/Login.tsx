import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Clock,
  KeyRound
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isLoading, status, refreshStatus } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isLoading) return;

    setError(null);
    try {
      await login(password);
    } catch (err: any) {
      const authData = err?.authData;
      if (authData?.locked) {
        setError('Access temporarily paused for security. Please try again shortly.');
      } else {
        setError('Incorrect master password. Please verify your access key.');
      }
      refreshStatus();
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0d0b] text-[#f9f8f5] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Cinematic Ambient Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-[#cda851]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-[28rem] h-[28rem] bg-[#9e3322]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />

      {/* Luxury Glassmorphic Card */}
      <div className="relative w-full max-w-md bg-[#161412]/85 border border-[#cda851]/25 rounded-3xl p-7 sm:p-9 shadow-[0_24px_70px_-12px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300">
        {/* Subtle Top Specular Inner Rim */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#cda851]/40 to-transparent" />

        {/* Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-[#cda851]/30 to-[#9e3322]/20 blur-md" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#dfc27d] via-[#cda851] to-[#99792e] text-[#1c1b18] font-serif font-black text-2xl shadow-xl flex items-center justify-center border border-[#fff2cb]/40">
              VK
            </div>
          </div>

          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#f9f8f5] tracking-tight">
              Vistāra Krafts
            </h1>
            <p className="text-[11px] text-[#cda851] uppercase font-bold tracking-[0.22em] mt-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Atelier Executive Console
            </p>
          </div>
        </div>

        {/* Lockout Notification (Quiet & Elegant) */}
        {isLocked && (
          <div className="mb-6 p-4 rounded-2xl bg-[#241c14] border border-[#cda851]/30 text-xs text-[#eedcb2] space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold text-[#f9f8f5]">
                <Clock className="w-4 h-4 text-[#cda851]" />
                <span>Security Cooldown Active</span>
              </span>
              <span className="font-mono font-bold text-[#cda851] bg-[#161412] px-2.5 py-0.5 rounded-full border border-[#cda851]/30">
                {lockoutCountdown || '15m 00s'}
              </span>
            </div>
            <p className="text-[11px] text-[#d4cebe] leading-relaxed">
              Access is temporarily paused for security. Please try again when the timer completes.
            </p>
          </div>
        )}

        {/* Discreet Error Alert */}
        {error && !isLocked && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
            <KeyRound className="w-4 h-4 text-red-400 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Password Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#d4cebe] tracking-wide">
              Master Access Key
            </label>
            <div className="relative group">
              <Lock className="w-4 h-4 text-[#8a8474] absolute left-3.5 top-3.5 transition-colors group-focus-within:text-[#cda851]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLocked || isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLocked ? 'Access Paused' : 'Enter Master Password'}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#0e0d0b]/80 border border-[#3b372e] text-xs text-[#f9f8f5] placeholder-[#6b6659] focus:border-[#cda851] focus:ring-2 focus:ring-[#cda851]/15 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
                className="absolute right-3 top-3 text-[#8a8474] hover:text-[#f9f8f5] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className={`group relative w-full h-11 rounded-xl font-bold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 shadow-lg transition-all overflow-hidden ${
              isLocked
                ? 'bg-[#24221d] text-gray-500 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-[#dfc27d] via-[#cda851] to-[#b08d57] hover:brightness-105 active:scale-[0.985] text-[#1c1b18] cursor-pointer shadow-[#cda851]/15'
            }`}
          >
            {/* Shimmer sweep */}
            {!isLocked && !isLoading && (
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
            )}

            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[#1c1b18] border-t-transparent rounded-full animate-spin" />
                <span>Verifying Access Key...</span>
              </span>
            ) : isLocked ? (
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>Paused ({lockoutCountdown || '15m'})</span>
              </span>
            ) : (
              <>
                <span>Enter Atelier Console</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Minimalist Luxury Footer */}
        <div className="mt-8 pt-5 border-t border-[#3b372e]/60 text-center">
          <p className="text-[10px] text-[#8a8474] tracking-wider uppercase font-medium">
            Protected Executive Console • Guwahati, Assam
          </p>
        </div>
      </div>
    </div>
  );
};
