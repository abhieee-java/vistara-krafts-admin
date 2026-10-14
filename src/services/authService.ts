import { OwnerSession } from '../types';

const AUTH_STORAGE_KEY = 'vk_owner_session_v1';

export interface OwnerAuthUser {
  email: string;
  name: string;
  role: 'Owner';
  lastLogin: string;
}

export const authService = {
  getStoredSession(): OwnerAuthUser | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  async login(email: string, pass: string): Promise<OwnerAuthUser> {
    // Simulate real auth handshake delay
    await new Promise((res) => setTimeout(res, 400));

    if (!email || !pass) {
      throw new Error('Please enter both email and password.');
    }

    if (pass.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const user: OwnerAuthUser = {
      email,
      name: 'Vistāra Krafts Owner',
      role: 'Owner',
      lastLogin: new Date().toISOString()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async loginWithGoogle(): Promise<OwnerAuthUser> {
    await new Promise((res) => setTimeout(res, 600));
    const user: OwnerAuthUser = {
      email: 'owner@vistarakrafts.in',
      name: 'Vistāra Krafts Owner (Google)',
      role: 'Owner',
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getSessions(): OwnerSession[] {
    return [
      {
        id: 'sess-active',
        loginTime: new Date().toLocaleString(),
        ipAddress: 'Cloudflare Edge (vistara-krafts-admin.vercel.app)',
        userAgent: navigator.userAgent,
        status: 'active'
      },
      {
        id: 'sess-prev-01',
        loginTime: '2026-10-13 14:22:10',
        ipAddress: '106.51.78.192 (Bengaluru, IN)',
        userAgent: 'Chrome 120.0 (Windows NT 10.0)',
        status: 'expired'
      }
    ];
  }
};
