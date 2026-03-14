import type { Database, Json } from './database.types';

export type PublicSchema = Database['public'];
export type Tables = PublicSchema['Tables'];
export type Enums = PublicSchema['Enums'];

// Metadata structure for categories
export interface CategoryMetadata {
  hero_title?: string;
  hero_description?: string;
  technical_summary?: string;
  hide_price?: boolean;
  model_type?: string;
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
  [key: string]: any; // Allow other fields
}

// Common Table Row Aliases
export type DbProduct = Omit<Tables['products']['Row'], 'technical_specs'> & {
  technical_specs: Record<string, any> | null;
};

// Refine DbCategory to ensure 'name' and 'description' are strings, and metadata is typed
export type DbCategory = Omit<Tables['categories']['Row'], 'name' | 'description' | 'metadata'> & {
  name: string;
  description: string | null;
  metadata: CategoryMetadata | null;
};

export type DbUserAddress = Tables['user_addresses']['Row'];
export type DbInvoiceProfile = Tables['user_invoice_profiles']['Row'];
export type DbShoppingCart = Tables['shopping_carts']['Row'];
export type DbCartItem = Tables['cart_items']['Row'];
export type DbOrder = Tables['venthub_orders']['Row'];
export type DbOrderItem = Tables['venthub_order_items']['Row'];

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
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: DbProduct | null;
}

export type DbProductInsert = Tables['products']['Insert'];
export type DbCategoryInsert = Tables['categories']['Insert'];
export type DbUserAddressInsert = Tables['user_addresses']['Insert'];
export type DbInvoiceProfileInsert = Tables['user_invoice_profiles']['Insert'];

export type DbProductUpdate = Tables['products']['Update'];
export type DbUserAddressUpdate = Tables['user_addresses']['Update'];
export type DbInvoiceProfileUpdate = Tables['user_invoice_profiles']['Update'];

export type DbJson = Json;
