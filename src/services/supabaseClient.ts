import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, ProductVarietyOption, ProductGender } from '../types';

const env = (import.meta as any).env || {};

export const SUPABASE_URL: string =
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  'https://niamxrskqhjvzwxomxrx.supabase.co';

export const SUPABASE_ANON_KEY: string =
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  'sb_publishable_gK22Lr7xNqKI7VFAfnsQTA_7UD0S2iu';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('xyzcompany')
);

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'vk_admin_supabase_auth_token'
    }
  }
);

export interface SupabaseHealthResult {
  connected: boolean;
  latencyMs: number;
  productCount: number;
  url: string;
  authWorking: boolean;
  errorMessage?: string;
}

export async function testSupabaseConnection(): Promise<SupabaseHealthResult> {
  const start = performance.now();
  try {
    const [dbRes, authRes] = await Promise.allSettled([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.auth.getSession()
    ]);

    const latencyMs = Math.round(performance.now() - start);

    let connected = false;
    let productCount = 0;
    let errorMessage: string | undefined;

    if (dbRes.status === 'fulfilled') {
      if (dbRes.value.error) {
        // Table exists check or RLS
        errorMessage = dbRes.value.error.message;
        // If error is table not found, still technically connected to Supabase
        if (dbRes.value.error.code === '42P01') {
          errorMessage = 'Connected to Supabase, but "products" table not created yet. Run supabase/schema.sql.';
        }
      } else {
        connected = true;
        productCount = dbRes.value.count ?? 0;
      }
    } else {
      errorMessage = dbRes.reason?.message || 'Database network timeout';
    }

    const authWorking = authRes.status === 'fulfilled' && !authRes.value.error;

    return {
      connected,
      latencyMs: Math.max(latencyMs, 1),
      productCount,
      url: SUPABASE_URL,
      authWorking,
      errorMessage
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      connected: false,
      latencyMs,
      productCount: 0,
      url: SUPABASE_URL,
      authWorking: false,
      errorMessage: err?.message || 'Failed to connect to Supabase endpoint'
    };
  }
}

/**
 * Maps Supabase PostgreSQL snake_case row to Admin Portal TypeScript Product
 */
export function mapRowToProduct(row: any): Product {
  const parseJson = (val: any, fallback: any) => {
    if (!val) return fallback;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  const colors = parseJson(row.colors, []);
  const shapes = parseJson(row.shapes, []);
  const sizes = parseJson(row.sizes, []);
  const variants = parseJson(row.variants, []);
  const gallery = parseJson(row.gallery, []);
  const specs = parseJson(row.specs, {});

  return {
    id: String(row.id),
    sku: String(row.sku || ''),
    name: String(row.name || ''),
    shortName: String(row.short_name || row.name || ''),
    subtitle: String(row.subtitle || ''),
    category: (row.category || 'keepsakes') as any,
    subCategory: row.subcategory || '',
    badge: row.badge || '',
    price: Number(row.price || 0),
    regularPrice: Number(row.compare_at_price || row.price || 0),
    ratio: specs.ratio || row.ratio || '',
    viscosity: specs.viscosity || row.viscosity || 'low',
    cureTime: specs.cureTime || row.cureTime || '',
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 0),
    inStock: Boolean(row.in_stock ?? (Number(row.stock || 0) > 0)),
    stockQuantity: Number(row.stock || 0),
    lowStockThreshold: Number(row.low_stock_threshold || 5),
    isCustomizable: Boolean(row.is_customizable),
    image: String(row.image || ''),
    gallery: Array.isArray(gallery) ? gallery : [],
    variants: Array.isArray(variants) ? variants : [],
    colors: Array.isArray(colors) ? colors : [],
    shapes: Array.isArray(shapes) ? shapes : [],
    sizes: Array.isArray(sizes) ? sizes : [],
    gender: (row.gender || 'all') as ProductGender,
    genderAffinity: (row.gender_affinity || 'neutral') as any,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

/**
 * Maps Admin Portal Product to Supabase PostgreSQL snake_case row
 */
export function mapProductToRow(product: Product): any {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    short_name: product.shortName || product.name,
    subtitle: product.subtitle || '',
    category: product.category,
    subcategory: product.subCategory || '',
    badge: product.badge || '',
    price: product.price,
    compare_at_price: product.regularPrice || product.price,
    stock: product.stockQuantity ?? 0,
    low_stock_threshold: product.lowStockThreshold ?? 5,
    in_stock: product.inStock ?? ((product.stockQuantity ?? 0) > 0),
    is_customizable: Boolean(product.isCustomizable),
    rating: product.rating ?? 5.0,
    reviews_count: product.reviewsCount ?? 0,
    image: product.image || '',
    gallery: product.gallery || [],
    variants: product.variants || [],
    colors: product.colors || [],
    shapes: product.shapes || [],
    sizes: product.sizes || [],
    gender: product.gender || 'all',
    gender_affinity: product.genderAffinity || 'neutral',
    specs: {
      ratio: product.ratio || '',
      viscosity: product.viscosity || 'low',
      cureTime: product.cureTime || ''
    },
    updated_at: new Date().toISOString()
  };
}
