import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState('owner@vistarakrafts.com');
  const [password, setPassword] = useState('vistara2026');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
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
        <div className="text-center space-y-2 mb-8">
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

        {/* Demo Credentials Notice */}
        <div className="mb-6 p-3 rounded-xl bg-[#2d2a24] border border-[#454035] text-[11px] text-[#dfc27d] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#cda851] shrink-0" />
          <span>
            Single-Owner Demo Credentials Pre-filled. Click <strong>Sign In</strong> below.
          </span>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#d4cebe] mb-1.5">
              Owner Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@vistarakrafts.com"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#1c1b18] border border-[#3b372e] text-xs text-[#f9f8f5] focus:border-[#cda851] focus:ring-1 focus:ring-[#cda851] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#d4cebe] mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#1c1b18] border border-[#3b372e] text-xs text-[#f9f8f5] focus:border-[#cda851] focus:ring-1 focus:ring-[#cda851] outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-[#cda851] hover:bg-[#dfc27d] text-[#1c1b18] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Owner Portal</span>
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
            Or Sign In With
          </span>
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-[#1c1b18] hover:bg-[#2d2a24] border border-[#3b372e] text-xs font-semibold text-[#f9f8f5] flex items-center justify-center gap-3 transition-colors"
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
          <span>Continue with Google (Cloudflare Access)</span>
        </button>

        <div className="mt-6 text-center text-[10px] text-gray-500">
          Protected by Cloudflare Turnstile &amp; Single-Owner Session Guard
        </div>
      </div>
    </div>
  );
};
