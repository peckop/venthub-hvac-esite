import type { DbCategory, DbProduct, DbUserProject, DbProjectItem, DbUserAddress, DbInvoiceProfile } from './db-rows';
import type { Json } from './database.types';

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

export interface GetProductsParams {
  categoryIds?: string[];
  searchQuery?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

// Project types moved from src/lib/supabase.ts
export type UserProject = DbUserProject;
export type ProjectItem = DbProjectItem & { product?: Product };

// Address and Invoice types
export type UserAddress = DbUserAddress;
export type InvoiceProfile = DbInvoiceProfile;
