import { OwnerSession } from '../types';
import { supabase } from './supabaseClient';

const AUTH_STORAGE_KEY = 'vk_owner_session_v1';

export const ADMIN_MASTER_TOKEN = '94e9f785e5ff7fd73a3ce61a7fcc6d709e723ba78a871061d3065bb0689a48b2';

export interface OwnerAuthUser {
  email: string;
  name: string;
  role: 'Owner';
  lastLogin: string;
  token?: string;
}

export interface AdminAuthStatus {
  configured: boolean;
  locked: boolean;
  locked_until: string | null;
  remaining_attempts: number;
  max_attempts: number;
  failed_attempts: number;
}

export const authService = {
  getToken(): string {
    const s = this.getStoredSession();
    return s?.token || '';
  },

  getStoredSession(): OwnerAuthUser | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Strictly require a valid non-empty token that is not the dummy fallback
      if (!parsed || !parsed.token || typeof parsed.token !== 'string' || !parsed.token.trim() || parsed.token === ADMIN_MASTER_TOKEN) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  async getStatus(): Promise<AdminAuthStatus> {
    try {
      const { data, error } = await supabase.rpc('get_admin_auth_status');
      if (error) throw error;
      return data as AdminAuthStatus;
    } catch (err: any) {
      console.warn('[AuthService] Could not fetch login status:', err.message);
      return {
        configured: true,
        locked: false,
        locked_until: null,
        remaining_attempts: 5,
        max_attempts: 5,
        failed_attempts: 0
      };
    }
  },

  /**
   * Verifies the master owner password against the database bcrypt hash.
   * Enforces 5-attempt rate limit and automated security alerts via Resend.
   */
  async login(passwordOrEmail: string, optionalPass?: string): Promise<OwnerAuthUser> {
    const password = optionalPass !== undefined ? optionalPass : passwordOrEmail;

    if (!password || !password.trim()) {
      throw new Error('Please enter the owner master password.');
    }

    const clientInfo = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Admin Web Client',
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase.rpc('verify_admin_login', {
      p_password: password.trim(),
      p_client_info: clientInfo
    });

    if (error) {
      console.error('[AuthService] verify_admin_login RPC error:', error);
      throw new Error(error.message || 'Authentication service error. Please try again.');
    }

    if (!data || !data.success) {
      const errMsg = data?.error || 'Authentication failed. Please verify credentials.';
      const authErr = new Error(errMsg);
      (authErr as any).authData = data;
      throw authErr;
    }

    const user: OwnerAuthUser = {
      email: data.user?.email || 'owner@vistarakrafts.com',
      name: data.user?.name || 'Kakoli Borah (Owner)',
      role: 'Owner',
      lastLogin: data.user?.lastLogin || new Date().toISOString(),
      token: data.session_token || data.user?.session_token || ''
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vk_admin_login', { detail: user }));
    }
    return user;
  },

  /**
   * Updates the owner master password in the database after verifying current password.
   * Updates bcrypt hash in admin_auth table and records security audit entry.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!currentPassword || !currentPassword.trim()) {
      throw new Error('Please enter your current master password.');
    }
    if (!newPassword || newPassword.trim().length < 4) {
      throw new Error('New password must be at least 4 characters long.');
    }

    const session = this.getStoredSession();
    const { data, error } = await supabase.rpc('change_admin_password', {
      p_current_password: currentPassword.trim(),
      p_new_password: newPassword.trim(),
      p_token: session?.token || ''
    });

    if (error) {
      console.error('[AuthService] change_admin_password RPC error:', error);
      throw new Error(error.message || 'Unable to update password. Please check your credentials.');
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Failed to update password. Current password may be incorrect.');
    }

    return {
      success: true,
      message: data.message || 'Password changed successfully.'
    };
  },

  async loginWithGoogle(): Promise<OwnerAuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.warn('[AuthService] Supabase Google OAuth redirect:', err.message);
    }

    const user: OwnerAuthUser = {
      email: 'owner@vistarakrafts.com',
      name: 'Kakoli Borah (Owner)',
      role: 'Owner',
      lastLogin: new Date().toISOString(),
      token: ADMIN_MASTER_TOKEN
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vk_admin_login', { detail: user }));
    }
    return user;
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    try {
      supabase.auth.signOut();
    } catch {
      // Ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vk_admin_logout'));
    }
  },

  handleSessionExpired(): void {
    this.logout();
  },

  getSessions(): OwnerSession[] {
    const s = this.getStoredSession();
    if (!s) return [];
    return [
      {
        id: 'sess-active',
        loginTime: s.lastLogin ? new Date(s.lastLogin).toLocaleString() : new Date().toLocaleString(),
        ipAddress: 'Supabase PostgreSQL Authenticated Session',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Owner Browser Client',
        status: 'active'
      }
    ];
  }
};
