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
/**
 * W4b: `price` BİLİNÇLİ olarak domain tipinden çıkarıldı. Satış fiyatını artık fiyat motoru
 * üretiyor (`display_price` → `WithDisplayPrice.displayPrice`); ham kolon müşteri yolunda
 * SELECT bile edilmiyor. Tip `price: number` demeye devam etseydi kaçan her okuma derlenir
 * ve runtime'da `undefined` alırdı — yani sessizce 0 ₺ / boş fiyat. Omit, derleyiciyi
 * zorlayıcı yapar (F5-B D4'teki emekli-kolon deseninin aynısı).
 * Admin ham alanı meşru görebilir; oraya `DbProduct` üzerinden erişilir.
 */
export type DomainProduct = Omit<DbProduct, 'name' | 'description' | 'brand' | 'price'> & {
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

/**
 * `fts_search_products` RPC'sinin GERÇEK satır modeli.
 *
 * Eskiden `extends DomainProduct` yazıyordu: tip 30 alan vaat ediyor, RPC 6 alan
 * döndürüyordu. Bu yalan canlı bir hatayı gizledi — arama sonucu `r.slug!` ile
 * yönlendiriliyordu ve slug hiç gelmediği için `/products/undefined` açılıyordu.
 * (W4b'de domain tipi dürüstleşince derleyici ortaya çıkardı.)
 *
 * `family_slug` / `cover_image_path` opsiyonel: RPC'yi genişleten migration prod'a
 * inene kadar gelmezler; indikten sonra doğal olarak dolar.
 */
export interface FtsProductResult {
  id: string;
  name: string;
  sku: string;
  brand: string;
  /** Motor fiyatı (`display_price`); fiyat yoksa null → "Teklif Alın". */
  price: number | null;
  rank?: number;
  is_fuzzy_match?: boolean;
  /** PDP bir AİLE slug'ı bekler; varyant `?sku=` ile seçilir. */
  family_slug?: string | null;
  cover_image_path?: string | null;
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
// W4b: `DbProjectItem` gömülü ürünü ham satır olarak taşır; UI modelinde onun yerine
// domain ürünü (fiyatsız) geçer. Omit olmadan kesişim çelişkili olurdu.
export type ProjectItem = Omit<DbProjectItem, 'product'> & { product?: Product };

// Address and Invoice types
export type UserAddress = DbUserAddress;
export type InvoiceProfile = DbInvoiceProfile;
