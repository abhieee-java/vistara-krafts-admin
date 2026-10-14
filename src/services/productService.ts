import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../mock/initialData';

const PRODUCTS_STORAGE_KEY = 'vk_admin_products_v1';
const STOREFRONT_STORAGE_KEY = 'ram_vk_products_v2';

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
