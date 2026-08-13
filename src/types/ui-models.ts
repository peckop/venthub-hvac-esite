import type { Json } from './database.types';
import type { DbCategory, DbInvoiceProfile,DbProduct, DbProjectItem, DbUserAddress, DbUserProject } from './db-rows';

/**
 * DomainCategory: The sanitized, UI-ready version of a category.
 * Refines DbCategory to guarantee name and description are strings.
 */
export type DomainCategory = Omit<DbCategory, 'name' | 'description'> & {
  name: string;
  description: string;
};

/**
 * DomainProduct: The sanitized, UI-ready version of a product.
 * Refines DbProduct to guarantee name, description and brand are strings.
 */
export type DomainProduct = Omit<DbProduct, 'name' | 'description' | 'brand'> & {
  name: string;
  description: string;
  brand: string;
};

// Moved from src/lib/supabase.ts
export type Category = DomainCategory;
export type Product = DomainProduct;

export interface SearchSuggestion {
  text?: string;
  label: string;
  type: 'product' | 'category' | 'brand';
  slug?: string;
  url: string;
  metadata?: Json;
}

export interface FtsProductResult extends DomainProduct {
  rank?: number;
  is_fuzzy_match?: boolean;
}

/**
 * FamilyListItem: get_product_families_enriched RPC'sinin satır modeli (F5-B W0.2).
 * Aile-bazlı vitrin listelerinin (W2.1) veri birimi; varyant satırı listeye girmez.
 */
export interface FamilyListItem {
  id: string;
  name: string;
  slug: string;
  series_code: string | null;
  description: { tr?: string | null; en?: string | null } | null;
  brand_name: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  /** product_images.path (Storage yolu) — URL'e çevirme W1.1 resolver'ının işi. */
  cover_image_path: string | null;
  variant_count: number;
  /** Fiyat Motoru açılana dek fiilen hep null (Teklif Alın modeli). */
  min_price: number | null;
  /** Window count — sayfalama toplamı (her satırda aynı değer). */
  total_count: number;
}

// Project types moved from src/lib/supabase.ts
export type UserProject = DbUserProject;
export type ProjectItem = DbProjectItem & { product?: Product };

// Address and Invoice types
export type UserAddress = DbUserAddress;
export type InvoiceProfile = DbInvoiceProfile;
