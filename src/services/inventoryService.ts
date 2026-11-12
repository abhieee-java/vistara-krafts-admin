import { InventoryMovement } from '../types';
import { productService } from './productService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const MOVEMENTS_STORAGE_KEY = 'vk_admin_movements_v1';

type UIReason = 'Manual Restock' | 'Order Deduction' | 'Damaged / Spoilage' | 'Correction' | 'Return Restock';
type DBReason = 'RESTOCK' | 'SALE' | 'DAMAGE' | 'AUDIT' | 'RETURN' | 'MANUAL_ADJUSTMENT';

function mapUIToDBReason(reason: UIReason): DBReason {
  switch (reason) {
    case 'Manual Restock':
      return 'RESTOCK';
    case 'Order Deduction':
      return 'SALE';
    case 'Damaged / Spoilage':
      return 'DAMAGE';
    case 'Return Restock':
      return 'RETURN';
    case 'Correction':
    default:
      return 'MANUAL_ADJUSTMENT';
  }
}

function mapDBToUIReason(reason: string): UIReason {
  switch (reason) {
    case 'RESTOCK':
      return 'Manual Restock';
    case 'SALE':
      return 'Order Deduction';
    case 'DAMAGE':
      return 'Damaged / Spoilage';
    case 'RETURN':
      return 'Return Restock';
    case 'AUDIT':
    case 'MANUAL_ADJUSTMENT':
    default:
      return 'Correction';
  }
}

export const inventoryService = {
  /**
   * Synchronous getter from local storage cache.
   */
  getMovements(): InventoryMovement[] {
    try {
      const data = localStorage.getItem(MOVEMENTS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load movements from local cache', e);
    }
    return [];
  },

  /**
   * Fetches live audit logs directly from Supabase PostgreSQL inventory_logs table.
   * Merges and caches locally for offline resilience and instant rendering.
   */
  async fetchFromSupabase(): Promise<InventoryMovement[]> {
    if (!isSupabaseConfigured) {
      return this.getMovements();
    }

    try {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('[InventoryService] Supabase inventory_logs fetch notice:', error.message);
        return this.getMovements();
      }

      if (Array.isArray(data)) {
        const products = productService.getProducts();
        const productMap = new Map(products.map((p) => [p.id, p]));

        const movements: InventoryMovement[] = data.map((row: any) => {
          const prod = productMap.get(row.product_id);
          return {
            id: row.id || 'mov-' + Date.now().toString(36),
            timestamp: row.created_at || new Date().toISOString(),
            productId: row.product_id,
            productName: prod?.shortName || prod?.name || row.sku || 'Atelier Product',
            sku: row.sku,
            change: Number(row.change || 0),
            newStock: Number(row.new_stock || 0),
            reason: mapDBToUIReason(row.reason),
            performedBy: row.created_by || 'Store Owner'
          };
        });

        localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(movements));
        return movements;
      }
    } catch (err: any) {
      console.error('[InventoryService] Supabase inventory_logs sync exception:', err?.message || err);
    }

    return this.getMovements();
  },

  /**
   * Adjusts stock quantity on the product, writes to Supabase products & inventory_logs,
   * records local audit movement, and broadcasts update across browser tabs.
   */
  adjustStock(
    productId: string,
    change: number,
    reason: UIReason
  ): void {
    const products = productService.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const previousStock = product.stockQuantity;
    const newStock = Math.max(0, previousStock + change);

    // 1. Update product stock level (syncs to Supabase products table + broadcasts PRODUCTS_UPDATED)
    productService.updateProduct(productId, {
      stockQuantity: newStock,
      inStock: newStock > 0
    });

    const movement: InventoryMovement = {
      id: 'mov-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      productId: product.id,
      productName: product.shortName || product.name,
      sku: product.sku,
      change,
      newStock,
      reason,
      performedBy: 'Kakoli Borah (Store Owner)'
    };

    // 2. Persist to local movements cache
    const movements = this.getMovements();
    const updated = [movement, ...movements];
    localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(updated));

    // 3. Persist audit log row into Supabase PostgreSQL inventory_logs table
    if (isSupabaseConfigured) {
      const dbReason = mapUIToDBReason(reason);
      supabase
        .from('inventory_logs')
        .insert([
          {
            product_id: product.id,
            sku: product.sku,
            change,
            previous_stock: previousStock,
            new_stock: newStock,
            reason: dbReason,
            notes: `Stock adjusted by ${change > 0 ? '+' : ''}${change} units (${reason})`,
            created_by: 'Kakoli Borah (Store Owner)'
          }
        ])
        .then(
          ({ error }) => {
            if (error) {
              console.warn('[InventoryService] Supabase inventory_logs insert notice:', error.message);
            } else {
              console.log(`[InventoryService] Stock movement logged in Supabase for SKU ${product.sku}`);
            }
          },
          (err: any) => {
            console.error('[InventoryService] Supabase inventory_logs exception:', err);
          }
        );
    }
  }
};
