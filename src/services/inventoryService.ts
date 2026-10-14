import { InventoryMovement } from '../types';
import { INITIAL_MOVEMENTS } from '../mock/initialData';
import { productService } from './productService';

const MOVEMENTS_STORAGE_KEY = 'vk_admin_movements_v1';

export const inventoryService = {
  getMovements(): InventoryMovement[] {
    try {
      const data = localStorage.getItem(MOVEMENTS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load movements', e);
    }
    localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(INITIAL_MOVEMENTS));
    return INITIAL_MOVEMENTS;
  },

  adjustStock(
    productId: string,
    change: number,
    reason: 'Manual Restock' | 'Order Deduction' | 'Damaged / Spoilage' | 'Correction' | 'Return Restock'
  ): void {
    const products = productService.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const newStock = Math.max(0, product.stockQuantity + change);
    productService.updateProduct(productId, {
      stockQuantity: newStock,
      inStock: newStock > 0
    });

    const movement: InventoryMovement = {
      id: 'mov-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      change,
      newStock,
      reason,
      performedBy: 'Store Owner'
    };

    const movements = this.getMovements();
    const updated = [movement, ...movements];
    localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(updated));
  }
};
