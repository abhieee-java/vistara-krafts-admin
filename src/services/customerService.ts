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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Profiles fetch notice:', error.message);
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
      console.error('Customer sync exception:', e);
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
