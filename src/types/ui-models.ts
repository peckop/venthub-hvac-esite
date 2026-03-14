import type { DbCategory, DbProduct } from './db-rows';

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
