import type { DbCategory, DbProduct } from '../types/db-rows'
import type { DomainCategory, DomainProduct } from '../types/ui-models'

// Re-export domain types so they can be accessed through this module (as expected by other files)
export type { DomainCategory, DomainProduct }

import type { Json } from '../types/database.types'

/**
 * Safely converts complex TypeScript types to Supabase's exact Json type without unsafe casts.
 * Achieved by using JSON parsing, which cleanly satisfies TypeScript's type inference.
 *
 * @param data - The data object to be converted, must be JSON serializable
 * @returns The converted object strictly typed as Supabase Json
 *
 * @example
 * const dbJson = toSupabaseJson({ key: 'value', count: 1 }) // Returns valid Json type for Supabase insert
 */
export const toSupabaseJson = <T>(data: T): Json => JSON.parse(JSON.stringify(data)) as Json

/**
 * Type guard to safely check if an unknown value is a generic plain object Record<string, unknown>.
 * Excludes arrays and null values to prevent unexpected behavior when iterating or accessing properties.
 *
 * @param value - The unknown value to check
 * @returns True if the value is a plain object, false otherwise
 *
 * @example
 * if (isRecord(unknownData)) {
 *   console.log(unknownData.property); // TypeScript allows property access
 * }
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}


/**
 * Safely converts a raw database Category row into a strictly-typed, UI-ready Category model.
 * Centralizes the handling of potential Json/Text mismatches from Supabase by ensuring core text fields are strings.
 *
 * @param dbCat - The raw category row from the Supabase database
 * @returns The mapped category model guaranteed to have string values for text fields
 *
 * @example
 * const domainCategory = mapDatabaseCategoryToDomain(rawSupabaseData)
 */
export const mapDatabaseCategoryToDomain = (dbCat: DbCategory): DomainCategory => {
  return {
    ...dbCat,
    name: String(dbCat.name || ''),
    menu_label: String(dbCat.menu_label || dbCat.name || ''),
    marketing_title: String(dbCat.marketing_title || dbCat.name || ''),
    description: String(dbCat.description || ''),
  }
}

/**
 * Safely converts a raw database Product row into a strictly-typed, UI-ready Product model.
 * Guarantees string types for text fields and provides fallback values (like 'Venthub' for brand).
 *
 * @param dbProd - The raw product row from the Supabase database
 * @returns The mapped product model guaranteed to have string values for text fields
 *
 * @example
 * const domainProduct = mapDatabaseProductToDomain(rawSupabaseData)
 */
export const mapDatabaseProductToDomain = (dbProd: DbProduct): DomainProduct => {
  return {
    ...dbProd,
    name: String(dbProd.name || ''),
    description: String(dbProd.description || ''),
    brand: String(dbProd.brand || 'Venthub'),
  }
}

/**
 * Converts an array of raw database Category rows into an array of UI-ready Category models.
 *
 * @param cats - The array of raw database categories
 * @returns The array of safely mapped domain categories
 *
 * @example
 * const uiCategories = toUICategoryList(dbCategoriesArray)
 */
export const toUICategoryList = (cats: DbCategory[]): DomainCategory[] => cats.map(mapDatabaseCategoryToDomain)

/**
 * Converts an array of raw database Product rows into an array of UI-ready Product models.
 *
 * @param prods - The array of raw database products
 * @returns The array of safely mapped domain products
 *
 * @example
 * const uiProducts = toUIProductList(dbProductsArray)
 */
export const toUIProductList = (prods: DbProduct[]): DomainProduct[] => prods.map(mapDatabaseProductToDomain)
