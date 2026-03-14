import type { DbCategory, DbProduct } from './db-rows';

/**
 * UICategory: The sanitized, UI-ready version of a category.
 * Guaranteed to have strings for name and description.
 */
export interface UICategory extends Omit<DbCategory, 'name' | 'description'> {
  name: string;
  description: string;
}

/**
 * UIProduct: The sanitized, UI-ready version of a product.
 */
export interface UIProduct extends Omit<DbProduct, 'name' | 'description' | 'brand'> {
  name: string;
  description: string;
  brand: string;
}
