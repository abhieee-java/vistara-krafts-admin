import { Product } from '../types';
import { supabase, mapRowToProduct, mapProductToRow, isSupabaseConfigured } from './supabaseClient';

const PRODUCTS_STORAGE_KEY = 'vk_admin_products_v1';
const STOREFRONT_STORAGE_KEY = 'ram_vk_products_v2';
const DELETED_PRODUCTS_KEY = 'vk_admin_deleted_products_v1';

export function getDeletedProductIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map(String));
    }
  } catch (_e) {}
  return new Set();
}

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
   * Automatically filters out permanently deleted and archived products.
   */
  getProducts(): Product[] {
    const deletedIds = getDeletedProductIds();
    const filterValid = (arr: Product[]) =>
      arr.filter(
        (p) =>
          !deletedIds.has(String(p.id)) &&
          p.isActive !== false &&
          p.status !== 'archived'
      );

    try {
      const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return filterValid(parsed);
      }
      // Check if storefront has already synchronized real products
      const storefrontData = localStorage.getItem(STOREFRONT_STORAGE_KEY);
      if (storefrontData) {
        const parsed = JSON.parse(storefrontData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = filterValid(parsed);
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(valid));
          return valid;
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
   * Enforces strict filtering against deleted and archived products.
   */
  async fetchFromSupabase(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      return this.getProducts();
    }

    const deletedIds = getDeletedProductIds();

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase products fetch notice:', error.message);
        return this.getProducts();
      }

      if (Array.isArray(data)) {
        const products = data
          .map(mapRowToProduct)
          .filter(
            (p) =>
              !deletedIds.has(String(p.id)) &&
              p.isActive !== false &&
              p.status !== 'archived'
          );
        this.saveProducts(products, false);
        return products;
      }
    } catch (err) {
      console.error('Supabase products sync error:', err);
    }

    return this.getProducts();
  },

  saveProducts(products: Product[], pushToSupabase: boolean = true, deletedId?: string): void {
    const deletedIds = getDeletedProductIds();
    const cleanProducts = products.filter(
      (p) =>
        !deletedIds.has(String(p.id)) &&
        p.isActive !== false &&
        p.status !== 'archived'
    );
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(cleanProducts));
    localStorage.setItem(STOREFRONT_STORAGE_KEY, JSON.stringify(cleanProducts));

    // Broadcast across browser tabs and live storefront
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({
          type: 'PRODUCTS_UPDATED',
          products: cleanProducts,
          deletedId
        });
        channel.close();
      }
    } catch (e) {}
  },

  addProduct(newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const id = 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newPrice = Number(newProduct.price || 0);
    const newRegularPrice = Number(newProduct.regularPrice || Math.round(newPrice * 1.25));

    let variantsToSave = newProduct.variants || [];
    if (Array.isArray(variantsToSave) && variantsToSave.length > 0) {
      variantsToSave = variantsToSave.map((v, i) => {
        if (i === 0) {
          return { ...v, price: newPrice, regularPrice: newRegularPrice };
        }
        return v;
      });
    }

    const product: Product = {
      ...newProduct,
      price: newPrice,
      regularPrice: newRegularPrice,
      variants: variantsToSave,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [product, ...products];
    this.saveProducts(updated);

    // Asynchronously insert into Supabase directly
    if (isSupabaseConfigured) {
      const row = mapProductToRow(product);
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

    const oldProduct = products[idx];
    const oldBasePrice = oldProduct.price;
    const newPrice = updates.price !== undefined ? Number(updates.price) : oldProduct.price;
    const newRegularPrice = updates.regularPrice !== undefined
      ? Number(updates.regularPrice)
      : (oldProduct.regularPrice || Math.round(newPrice * 1.25));

    let variantsToSave = updates.variants !== undefined ? updates.variants : (oldProduct.variants || []);
    if (Array.isArray(variantsToSave) && variantsToSave.length > 0) {
      variantsToSave = variantsToSave.map((v, i) => {
        // Base variant (index 0) or variants that matched old base price are synced to new price
        if (i === 0 || (oldBasePrice !== undefined && Number(v.price) === Number(oldBasePrice))) {
          return { ...v, price: newPrice, regularPrice: Math.max(newPrice, newRegularPrice) };
        }
        return v;
      });
    }

    const updatedProduct: Product = {
      ...oldProduct,
      ...updates,
      price: newPrice,
      regularPrice: newRegularPrice,
      variants: variantsToSave,
      updatedAt: new Date().toISOString()
    };
    products[idx] = updatedProduct;
    this.saveProducts(products);

    // Asynchronously update in Supabase directly
    if (isSupabaseConfigured) {
      const row = mapProductToRow(updatedProduct);
      safeDbExec(
        () => supabase.from('products').update(row).eq('id', id),
        'update product direct'
      );
    }

    return updatedProduct;
  },

  deleteProduct(id: string): void {
    const deletedIds = getDeletedProductIds();
    deletedIds.add(String(id));
    try {
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(deletedIds)));
    } catch (_e) {}

    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id && !deletedIds.has(String(p.id)));
    this.saveProducts(filtered, false, id);

    // 1. Permanently delete from Supabase PostgreSQL database
    if (isSupabaseConfigured) {
      safeDbExec(
        () => supabase.from('products').delete().eq('id', id),
        'delete product direct'
      );
      // 2. Fallback archive in case hard delete encounters a constraint
      safeDbExec(
        () => supabase.from('products').update({
          is_active: false,
          status: 'archived',
          updated_at: new Date().toISOString()
        }).eq('id', id),
        'fallback archive product direct'
      );
    }
  },

  async purgeArchivedProducts(): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      await supabase
        .from('products')
        .delete()
        .or('is_active.eq.false,status.eq.archived');
    } catch (e) {
      console.warn('Purge archived products error:', e);
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
