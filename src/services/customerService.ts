import { Customer } from '../types';
import { INITIAL_CUSTOMERS } from '../mock/initialData';

const CUSTOMERS_KEY = 'vk_admin_customers_v1';

export const customerService = {
  getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
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
