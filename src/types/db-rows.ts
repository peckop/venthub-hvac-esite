import type { Database, Json } from './database.types';

export type PublicSchema = Database['public'];
export type Tables = PublicSchema['Tables'];
export type Enums = PublicSchema['Enums'];

// Common Table Row Aliases
export type DbProduct = Tables['products']['Row'];

// Override DbCategory to ensure 'name' and 'description' are strings (Supabase sometimes misinterprets them as Json)
export interface DbCategory extends Omit<Tables['categories']['Row'], 'name' | 'description'> {
  name: string;
  description: string | null;
}
// brands table doesn't exist in types, it's likely a column in products
export type DbUserAddress = Tables['user_addresses']['Row'];
export type DbInvoiceProfile = Tables['user_invoice_profiles']['Row'];
export type DbShoppingCart = Tables['shopping_carts']['Row'];
export type DbCartItem = Tables['cart_items']['Row'];
export type DbOrder = Tables['venthub_orders']['Row'];
export type DbOrderItem = Tables['venthub_order_items']['Row'];
// user_projects and project_items are missing from generated DB types
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

// Common Table Insert Aliases
export type DbProductInsert = Tables['products']['Insert'];
export type DbCategoryInsert = Tables['categories']['Insert'];
export type DbUserAddressInsert = Tables['user_addresses']['Insert'];
export type DbInvoiceProfileInsert = Tables['user_invoice_profiles']['Insert'];

// Common Table Update Aliases
export type DbProductUpdate = Tables['products']['Update'];
export type DbUserAddressUpdate = Tables['user_addresses']['Update'];
export type DbInvoiceProfileUpdate = Tables['user_invoice_profiles']['Update'];

// Helper for JSON fields
export type DbJson = Json;
