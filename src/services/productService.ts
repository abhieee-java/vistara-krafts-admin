import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../mock/initialData';

const PRODUCTS_STORAGE_KEY = 'vk_admin_products_v1';
const STOREFRONT_STORAGE_KEY = 'ram_vk_products_v2';

const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || 'https://niamxrskqhjvzwxomxrx.supabase.co';
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_gK22Lr7xNqKI7VFAfnsQTA_7UD0S2iu';

async function syncToSupabase(products: Product[], isActive: boolean = true) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    const payload = products.map((p) => {
      const colorLabels = (p.colors || []).map((c) => (typeof c === 'string' ? c : c.label));
      const shapeLabels = (p.shapes || []).map((s) => (typeof s === 'string' ? s : s.label));
      const sizeLabels = (p.sizes || []).map((s) => (typeof s === 'string' ? s : s.label));
      const allImages = [p.image, ...(p.gallery || [])].filter(Boolean);

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        shortName: p.shortName || p.name,
        subtitle: p.subtitle || '',
        price: p.price,
        compareAtPrice: p.regularPrice || Math.round(p.price * 1.25),
        costPrice: Math.round(p.price * 0.4),
        stockQuantity: p.stockQuantity ?? 10,
        category: p.category,
        subCategory: p.subCategory || 'studio',
        badge: p.badge || '',
        featured: p.badge ? true : false,
        is_active: isActive,
        images: allImages,
        colors: colorLabels,
        shapes: shapeLabels,
        sizes: sizeLabels,
        gender: p.gender || 'all',
        description: p.subtitle || p.name
      };
    });

    await fetch(`${SUPABASE_URL}/rest/v1/rpc/import_catalog_batch`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_products: payload })
    });
  } catch (e) {
    console.warn('[Admin Supabase Sync Warning]', e);
  }
}

export const productService = {
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // Check if the storefront already saved products in localStorage
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
    // Default initial seed
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    // Also sync to storefront key so storefront automatically gets updated
    localStorage.setItem(STOREFRONT_STORAGE_KEY, JSON.stringify(products));

    // Broadcast across tabs to live storefront
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('RAM_STUDIO_LIVE_DROP_CHANNEL');
        channel.postMessage({ type: 'PRODUCTS_UPDATED', products });
      }
    } catch (e) {
      // ignore in environments without BroadcastChannel
    }

    // Two-way sync to Supabase PostgreSQL Database
    syncToSupabase(products, true);
  },

  addProduct(newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const id = 'vk-' + Date.now().toString(36);
    const product: Product = {
      ...newProduct,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [product, ...products];
    this.saveProducts(updated);
    return product;
  },

  updateProduct(id: string, updates: Partial<Product>): Product {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    const updatedProduct = {
      ...products[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    products[idx] = updatedProduct;
    this.saveProducts(products);
    return updatedProduct;
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const target = products.find((p) => p.id === id);
    if (target) {
      syncToSupabase([target], false);
    }
    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered);
  },

  duplicateProduct(id: string): Product {
    const products = this.getProducts();
    const existing = products.find((p) => p.id === id);
    if (!existing) throw new Error('Product not found');

    const copy: Product = {
      ...existing,
      id: 'vk-' + Date.now().toString(36),
      name: `${existing.name} (Copy)`,
      shortName: `${existing.shortName} (Copy)`,
      sku: `${existing.sku}-COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [copy, ...products];
    this.saveProducts(updated);
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
