import type { Json } from '@/types/database.types';
import { DbProduct, DbCategory } from '@/types/db-rows';

type JsonObject = Record<string, Json | undefined>;

/**
 * Ürün teknik özellikleri için iç yapı tanımı.
 */
export interface ProductTechnicalSpecs {
  airflow_capacity?: number | string | null;
  noise_level?: number | string | null;
  pressure_rating?: number | string | null;
  max_height?: number | string | null;
  max_yukseklik?: number | string | null;
  maksimum_yukseklik?: number | string | null;
  montaj_yuksekligi?: number | string | null;
  [key: string]: Json | undefined;
}

/**
 * Kategori metadata yapısı.
 */
export interface CategoryMetadata {
  display_mode?: 'showcase' | 'series' | 'list';
  showcase_images?: { desktop: string; mobile: string }[];
  features?: { icon: string; title: string; description: string }[];
  [key: string]: Json | undefined;
}

/**
 * Uygulama genelinde kullanılacak Kategori tipi.
 */
export interface DomainCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  description: string | null;
  image_url: string | null;
  seo_title: string | null;
  seo_desc: string | null;
  sort_order: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  metadata: CategoryMetadata | null;
}

/**
 * Uygulama genelinde kullanılacak Ürün tipi.
 */
export interface DomainProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  sku: string;
  slug: string | null;
  model_code: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  status: string;
  is_featured: boolean;
  description: string | null;
  image_url: string | null;
  image_alt?: string | null;
  stock_qty: number | null;
  low_stock_threshold?: number | null;
  low_stock_override?: boolean;
  technical_specs: ProductTechnicalSpecs | null;
  airflow_capacity?: number | null;
  noise_level?: number | null;
  pressure_rating?: number | null;
  created_at: string;
  updated_at: string;
  warehouse_location: string | null;
  supplier_name: string | null;
}

/**
 * Type Guard: Verilen değerin bir Record (object) olup olmadığını kontrol eder.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Veritabanından gelen ham 'Json' verisini güvenli bir şekilde objeye dönüştürür.
 */
export function parseJsonField<T extends JsonObject>(
  data: unknown,
  guard?: (value: JsonObject) => value is T,
): T | null {
  if (!data) return null;
  if (isRecord(data)) {
    const jsonObject = data as JsonObject;
    if (guard && !guard(jsonObject)) {
      return null;
    }
    return jsonObject as T;
  }
  return null;
}

/**
 * Veritabanı Product Row nesnesini Domain nesnesine dönüştürür.
 */
export function mapDatabaseProductToDomain(dbProduct: DbProduct): DomainProduct {
  return {
    ...dbProduct,
    price: Number(dbProduct.price || 0),
    stock_qty: dbProduct.stock_qty ?? 0,
    technical_specs: parseJsonField<ProductTechnicalSpecs>(dbProduct.technical_specs),
    is_featured: !!dbProduct.is_featured,
    low_stock_threshold: dbProduct.low_stock_threshold ?? null,
    low_stock_override: !!dbProduct.low_stock_override,
    airflow_capacity: dbProduct.airflow_capacity ?? null,
    noise_level: dbProduct.noise_level ?? null,
    pressure_rating: dbProduct.pressure_rating ?? null,
    warehouse_location: dbProduct.warehouse_location ?? null,
    supplier_name: dbProduct.supplier_name ?? null,
  };
}

/**
 * Veritabanı Category Row nesnesini Domain nesnesine dönüştürür.
 */
export function mapDatabaseCategoryToDomain(dbCategory: DbCategory): DomainCategory {
  return {
    ...dbCategory,
    metadata: parseJsonField<CategoryMetadata>(dbCategory.metadata),
    is_active: dbCategory.is_active ?? true,
    is_featured: !!dbCategory.is_featured,
  };
}
