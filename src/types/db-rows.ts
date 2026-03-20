import type { Database, Json } from './database.types';
import type { AuthorityContent as DynamicAuthorityContent } from './authority';

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
export interface CategoryMetadata {
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
  [key: string]: Json | AuthorityContent | undefined; 
}

// Common Table Row Aliases
export type DbProduct = Omit<Tables['products']['Row'], 'technical_specs'> & {
  technical_specs: Record<string, Json> | null;
};

// Refine DbCategory to ensure 'name' and 'description' are strings, and metadata is typed
export type DbCategory = Omit<Tables['categories']['Row'], 'name' | 'description' | 'metadata' | 'authority_content'> & {
  name: string;
  description: string | null;
  metadata: CategoryMetadata | null;
  authority_content: AuthorityContent | null;
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
  service: string;
  status: string;
  payload: Json;
  request_body?: Json;
  response_body?: Json;
  error_message?: string;
  created_at: string;
}

// RPC Return Types
export interface DbProductEnrichedRow {
  id: string;
  name: string;
  brand: string;
  price: number;
  sku: string;
  slug: string;
  model_code: string;
  category_id: string;
  subcategory_id: string;
  status: string;
  is_featured: boolean;
  description: string;
  image_url: string;
  image_alt: string;
  stock_qty: number;
  low_stock_threshold: number;
  low_stock_override: boolean;
  technical_specs: Record<string, Json>;
  airflow_capacity: number;
  noise_level: number;
  pressure_rating: number;
  created_at: string;
  updated_at: string;
  warehouse_location: string;
  supplier_name: string;
}

export interface DbFtsSearchResult extends DbProduct {
  rank: number;
  is_fuzzy_match?: boolean;
}

export interface DbAdminSearchResult extends DbProduct {
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
  tc_id?: string;
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
