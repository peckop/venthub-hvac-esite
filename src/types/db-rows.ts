import type { AuthorityContent as DynamicAuthorityContent } from './authority';
import type { Database, Json } from './database.types';

export type PublicSchema = Database['public'];
export type Tables = PublicSchema['Tables'];
export type Enums = PublicSchema['Enums'];

/**
 * @deprecated Eski statik otorite yapısı. Yeni projelerde DynamicAuthorityContent kullanılmalıdır.
 */
export type LegacyAuthorityContent = {
  brand?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    badges?: string[];
    stats?: Array<{ label: string; value: string }>;
    [key: string]: Json | undefined;
  };
  technical?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    points?: Array<{ title: string; desc: string }>;
    [key: string]: Json | undefined;
  };
  problem?: {
    title?: string;
    subtitle?: string;
    painPoints?: Array<{ title: string; description: string }>;
    visual?: {
      difference: string;
      without: string;
      withoutVal: string;
      withoutPoints: string[];
      with: string;
      withVal: string;
      withPoints: string[];
      note?: string;
      [key: string]: Json | undefined;
    };
    [key: string]: Json | undefined;
  };
  [key: string]: Json | undefined;
};

export type AuthorityContent = DynamicAuthorityContent;

// Metadata structure for categories
export type CategoryMetadata = {
  hero_title?: string;
  hero_description?: string;
  technical_summary?: string;
  hide_price?: boolean;
  model_type?: string;
  authority_content?: AuthorityContent | Json;
  features?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  showcase_images?: Array<{
    desktop: string;
    mobile?: string;
  }>;
  display_mode?: string;
  metric1?: { label: string; value: string };
  metric2?: { label: string; value: string };
  sort_order?: number;
  /**
   * Dile göre görünen kategori slug'ı. Kanonik kimlik daima `categories.slug`
   * kolonudur (= EN); burada tutulan `en` onun kopyasıdır, `tr` ise TR URL'idir.
   * Migration uygulanmamışsa alan yoktur → kanonik slug'a düşülür.
   */
  slug?: { tr?: string; en?: string };
  [key: string]: Json | AuthorityContent | undefined; 
}

export type LocalizedCategoryMetadata = {
  tr?: CategoryMetadata;
  en?: CategoryMetadata;
} & CategoryMetadata;

/**
 * Yerelleştirilmiş ürün açıklaması. Kolon 2026-08-11'de `products` tablosuna
 * eklendi; `database.types.ts` henüz yeniden üretilmediği için burada
 * yapısal olarak tanımlanır (generated dosya elle düzenlenmez).
 */
export type ProductDescriptionI18n = {
  tr?: string | null;
  en?: string | null;
} | null;

// Common Table Row Aliases
// NOT: family_id / description_i18n her zaman Omit+re-add ile tanımlanır — bu,
// database.types.ts henüz yeniden üretilmemişken (alanlar Row'da yok) VEYA
// üretildikten sonra (alanlar Row'da var, description_i18n jenerik Json tipinde)
// her iki durumda da güvenli çalışır; ham intersection (`&`) generated tipte
// aynı alan zaten varsa tip çakışmasına yol açabilirdi.
// F5-B D4: legacy kolonlar DB'den DROP edildi; tip düzeyinde de Omit'lenir ki
// generated types yeniden üretilene dek bile hiçbir okuyucu derlenemesin
// (zorlayıcı). Regen sonrası Omit listesi no-op'a düşer, zarar vermez.
type DroppedLegacyProductColumns =
  | 'description'
  | 'image_url'
  | 'airflow_capacity'
  | 'noise_level'
  | 'pressure_rating'
  | 'meta_title'
  | 'meta_description'
  | 'is_category_manual';

export type DbProduct = Omit<
  Tables['products']['Row'],
  'technical_specs' | 'family_id' | 'description_i18n' | DroppedLegacyProductColumns
> & {
  technical_specs: Record<string, Json> | null;
  /** Ürün ailesi kimliği (varyant gruplama). */
  family_id: string | null;
  /** Çok dilli ürün açıklaması ({tr,en}). */
  description_i18n: ProductDescriptionI18n;
  /**
   * Ürün görseli D4 sonrası yalnız product_images'tan gelir; liste sorgusu kapak
   * join'i taşıyorsa bu alan dolar, resolver (resolveProductImageUrl) bunu okur.
   * Kolon products tablosunda YOKTUR — sorgu-zamanı zenginleştirme alanıdır.
   */
  cover_image_path?: string | null;
};

// Refine DbCategory to ensure 'name' and 'description' are strings, and metadata is typed
export type DbCategory = Omit<Tables['categories']['Row'], 'name' | 'description' | 'metadata' | 'authority_content'> & {
  name: string;
  menu_label: string | null;
  marketing_title: string | null;
  translation_key: string | null;
  description: string | null;
  metadata: LocalizedCategoryMetadata | null;
  authority_content: AuthorityContent | null;
};

// Ürün ailesi (Split-Model otoritesi) — description/meta_* JSONB {tr,en} yapısına daraltılır.
export type DbProductFamily = Omit<
  Tables['product_families']['Row'],
  'description' | 'meta_title' | 'meta_description'
> & {
  description: ProductDescriptionI18n;
  meta_title: ProductDescriptionI18n;
  meta_description: ProductDescriptionI18n;
};

export type DbUserAddress = Tables['user_addresses']['Row'];
export type DbInvoiceProfile = Tables['user_invoice_profiles']['Row'];
export type DbShoppingCart = Tables['shopping_carts']['Row'];
export type DbCartItem = Tables['cart_items']['Row'];
export type DbOrder = Tables['venthub_orders']['Row'];
export type DbOrderItem = Tables['venthub_order_items']['Row'];

// Manual Interface Definitions for Tables missing from database.types.ts
export interface DbUserProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProjectItem {
  id: string;
  project_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: DbProduct | null;
}

export interface DbAppSettings {
  id: string;
  key: string;
  value: Json;
  created_at?: string;
  updated_at?: string;
}

export interface DbWebhookEvent {
  id: string;
  event_type: string;
  provider: string;
  status: 'processed' | 'failed' | 'pending';
  payload: Json;
  request_body?: Json;
  response_body?: Json;
  error_message?: string;
  created_at: string;
}

export interface DbFtsSearchResult extends DbProduct {
  rank: number;
  is_fuzzy_match?: boolean;
}

export interface DbAdminSearchResult extends Omit<DbProduct, 'purchase_price'> {
  rank: number;
  total_count: number;
  purchase_price: number | null;
}

export type DbProductInsert = Tables['products']['Insert'];
export type DbCategoryInsert = Tables['categories']['Insert'];
export type DbUserAddressInsert = Tables['user_addresses']['Insert'];
export type DbInvoiceProfileInsert = Tables['user_invoice_profiles']['Insert'];

export type DbProductUpdate = Tables['products']['Update'];
export type DbUserAddressUpdate = Tables['user_addresses']['Update'];
export type DbInvoiceProfileUpdate = Tables['user_invoice_profiles']['Update'];

export type DbJson = Json;

// Unified Checkout & Payment Types
export interface CheckoutCustomerInfo {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  identityNumber?: string;
  [key: string]: Json | undefined;
}

export interface CheckoutAddressInfo {
  id?: string;
  full_name?: string;
  phone: string;
  city: string;
  district: string;
  full_address?: string;
  fullAddress?: string; // Standardized UI field
  postalCode?: string;
  postal_code?: string;
  [key: string]: Json | undefined;
}

export interface CheckoutInvoiceInfo {
  type: 'individual' | 'corporate';
  company_name?: string;
  companyName?: string; // Standardized UI field
  tax_office?: string;
  taxOffice?: string; // Standardized UI field
  tax_number?: string;
  taxNumber?: string; // Standardized UI field
  t_c_id?: string;
  tckn?: string;
  vkn?: string;
  vknNumber?: string;
  eInvoice?: boolean;
  [key: string]: Json | undefined;
}

export interface CheckoutLegalConsents {
  kvkk: boolean;
  sales_agreement: boolean;
  privacy_policy: boolean;
  distanceSales: boolean;
  preInfo: boolean;
  orderConfirm: boolean;
  marketing: boolean;
  [key: string]: Json | undefined;
}
