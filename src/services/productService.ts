import { Product } from '../types';
import { supabase, mapRowToProduct, mapProductToRow, isSupabaseConfigured } from './supabaseClient';

const PRODUCTS_STORAGE_KEY = 'vk_admin_products_v1';
const STOREFRONT_STORAGE_KEY = 'ram_vk_products_v2';

async function safeDbExec(action: () => PromiseLike<any>, desc: string) {
  try {
    const res = await action();
    if (res && res.error) {
      console.warn(`Supabase ${desc} warning:`, res.error.message);
    }
  } catch (err: any) {
    console.error(`Supabase ${desc} exception:`, err?.message || err);
  }
}

export const productService = {
  /**
   * Synchronous getter from local storage cache.
   * Strictly returns [] if no products have been added yet (Zero Mock Data).
   */
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
      // Check if storefront has already synchronized real products
      const storefrontData = localStorage.getItem(STOREFRONT_STORAGE_KEY);
      if (storefrontData) {
        const parsed = JSON.parse(storefrontData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load products from storage', e);
    }
    // Strictly zero mock data: return empty array if no real products exist
    return [];
  },

  /**
   * Fetches real products directly from Supabase PostgreSQL database.
   * Caches results locally and triggers real-time broadcast.
   */
  async fetchFromSupabase(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      return this.getProducts();
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase products fetch notice:', error.message);
        return this.getProducts();
      }

      if (Array.isArray(data)) {
        const products = data.map(mapRowToProduct);
        this.saveProducts(products, false);
        return products;
      }
    } catch (err) {
      console.error('Supabase products sync error:', err);
    }

    return this.getProducts();
  },

  saveProducts(products: Product[], pushToSupabase: boolean = true): void {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    localStorage.setItem(STOREFRONT_STORAGE_KEY, JSON.stringify(products));

    // Broadcast across browser tabs and live storefront
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({ type: 'PRODUCTS_UPDATED', products });
      }
    } catch (e) {}
  },

  addProduct(newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const id = 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const product: Product = {
      ...newProduct,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [product, ...products];
    this.saveProducts(updated);

    // Asynchronously insert into Supabase via RPC (bypasses RLS) and direct fallback
    if (isSupabaseConfigured) {
      const row = mapProductToRow(product);
      safeDbExec(
        () => supabase.rpc('import_catalog_batch', { p_products: [row] }),
        'insert product via RPC'
      );
      safeDbExec(
        () => supabase.from('products').insert([row]),
        'insert product direct'
      );
    }

    return product;
  },

  updateProduct(id: string, updates: Partial<Product>): Product {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    const updatedProduct: Product = {
      ...products[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    products[idx] = updatedProduct;
    this.saveProducts(products);

    // Asynchronously update in Supabase via RPC (bypasses RLS) and direct fallback
    if (isSupabaseConfigured) {
      const row = mapProductToRow(updatedProduct);
      safeDbExec(
        () => supabase.rpc('import_catalog_batch', { p_products: [row] }),
        'update product via RPC'
      );
      safeDbExec(
        () => supabase.from('products').update(row).eq('id', id),
        'update product direct'
      );
    }

    return updatedProduct;
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const itemToDelete = products.find((p) => p.id === id);
    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered);

    // Asynchronously mark inactive / delete in Supabase
    if (isSupabaseConfigured) {
      if (itemToDelete) {
        // Soft delete via RPC: marks is_active: false so it drops out of storefront instantly
        safeDbExec(
          () => supabase.rpc('import_catalog_batch', {
            p_products: [{
              id: itemToDelete.id,
              sku: itemToDelete.sku,
              is_active: false,
              status: 'archived'
            }]
          }),
          'soft delete product via RPC'
        );
      }
      // Also attempt hard delete directly on table if permitted
      safeDbExec(
        () => supabase.from('products').delete().eq('id', id),
        'delete product direct'
      );
    }
  },

  duplicateProduct(id: string): Product {
    const products = this.getProducts();
    const existing = products.find((p) => p.id === id);
    if (!existing) throw new Error('Product not found');

    const copy: Product = {
      ...existing,
      id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: `${existing.name} (Copy)`,
      shortName: `${existing.shortName} (Copy)`,
      sku: `${existing.sku}-COPY-${Math.floor(Math.random() * 900 + 100)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [copy, ...products];
    this.saveProducts(updated);

    if (isSupabaseConfigured) {
      const row = mapProductToRow(copy);
      safeDbExec(
        () => supabase.rpc('import_catalog_batch', { p_products: [row] }),
        'duplicate insert product via RPC'
      );
      safeDbExec(
        () => supabase.from('products').insert([row]),
        'duplicate insert product direct'
      );
    }

    return copy;
  },

  toggleStock(id: string): Product {
    const products = this.getProducts();
    const item = products.find((p) => p.id === id);
    if (!item) throw new Error('Product not found');

    const inStock = !item.inStock;
    return this.updateProduct(id, {
      inStock,
      stockQuantity: inStock ? (item.stockQuantity === 0 ? 10 : item.stockQuantity) : 0
    });
  }
};
