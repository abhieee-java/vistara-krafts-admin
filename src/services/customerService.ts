import { Customer } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const CUSTOMERS_KEY = 'vk_admin_customers_v1';

export const customerService = {
  getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Strictly zero mock customers
    return [];
  },

  async fetchFromSupabase(): Promise<Customer[]> {
    if (!isSupabaseConfigured) return this.getCustomers();

    try {
      // 1. Primary: Use dedicated SECURITY DEFINER RPC to query live auth.users and profiles
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_customer_directory');

      if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
        const customers: Customer[] = rpcData.map((row: any) => ({
          id: row.id,
          name: row.name || 'Vistāra Patron',
          email: row.email,
          phone: row.phone || '',
          registeredDate: row.registeredDate || (row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent'),
          lastLogin: row.lastLogin || (row.last_sign_in_at ? new Date(row.last_sign_in_at).toLocaleDateString() : 'Recent'),
          last_sign_in_at: row.last_sign_in_at,
          created_at: row.created_at,
          provider: row.provider || 'google',
          memberTier: row.memberTier || 'Verified Patron',
          totalOrders: Number(row.totalOrders || 0),
          totalSpent: Number(row.totalSpent || 0),
          status: (row.status as 'active' | 'blocked') || 'active',
          defaultAddress: row.defaultAddress || undefined
        }));

        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
        return customers;
      }

      if (rpcError) {
        console.warn('[customerService] RPC notice:', rpcError.message);
      }

      // 2. Fallback: Standard profiles query
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[customerService] Profiles fetch notice:', error.message);
        return this.getCustomers();
      }

      if (Array.isArray(data)) {
        const customers: Customer[] = data.map((row: any) => ({
          id: row.id,
          name: row.full_name || 'Vistāra Patron',
          email: row.email,
          phone: row.phone || '',
          registeredDate: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent',
          lastLogin: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'Recent',
          totalOrders: 0,
          totalSpent: 0,
          status: 'active'
        }));
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
        return customers;
      }
    } catch (e) {
      console.error('[customerService] Customer sync exception:', e);
    }

    return this.getCustomers();
  },

  toggleCustomerStatus(customerId: string): Customer {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.id === customerId);
    if (idx === -1) throw new Error('Customer not found');

    const customer = customers[idx];
    const newStatus = customer.status === 'active' ? 'blocked' : 'active';
    const updated = { ...customer, status: newStatus as 'active' | 'blocked' };
    customers[idx] = updated;
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    return updated;
  }
};
