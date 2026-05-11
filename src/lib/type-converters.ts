import type { DbCategory, DbProduct } from '../types/db-rows'
import type { DomainCategory, DomainProduct } from '../types/ui-models'

// Re-export domain types so they can be accessed through this module (as expected by other files)
export type { DomainCategory, DomainProduct }

import type { Json } from '../types/database.types'

/**
 * Safely converts complex TypeScript types to Supabase's exact Json type without unsafe casts.
 *
 * Achieved by using JSON parsing, which cleanly satisfies TypeScript's type inference.
 *
 * @param data - The generic data object to be converted
 * @returns The converted data strongly typed as Supabase Json
 *
 * @example
 * const jsonVal = toSupabaseJson({ key: 'value', num: 42 });
 */
export const toSupabaseJson = <T>(data: T): Json => JSON.parse(JSON.stringify(data)) as Json

/**
 * Safely checks if an unknown value is a generic Record<string, unknown>.
 *
 * @param value - The unknown value to check
 * @returns True if the value is a non-null object and not an array, false otherwise
 *
 * @example
 * if (isRecord(myVar)) { console.log(myVar.someKey); }
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}


/**
 * Safely converts a Database Category row to a UI-ready Category model.
 *
 * Centralizes the handling of potential Json/Text mismatches from Supabase by ensuring string values.
 *
 * @param dbCat - The raw category record fetched from the database
 * @returns The domain-ready category model with guaranteed string fields
 *
 * @example
 * const uiCategory = mapDatabaseCategoryToDomain(rawDbCategoryRow);
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
 * Safely converts a Database Product row to a UI-ready Product model.
 *
 * Ensures fallback values for missing required strings like brand.
 *
 * @param dbProd - The raw product record fetched from the database
 * @returns The domain-ready product model
 *
 * @example
 * const uiProduct = mapDatabaseProductToDomain(rawDbProductRow);
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
 * Maps an array of database category rows into an array of UI-ready category models.
 *
 * @param cats - The array of raw category records from the database
 * @returns An array of domain-ready category models
 *
 * @example
 * const uiCategories = toUICategoryList(rawDbCategoryRows);
 */
export const toUICategoryList = (cats: DbCategory[]): DomainCategory[] => cats.map(mapDatabaseCategoryToDomain)

/**
 * Maps an array of database product rows into an array of UI-ready product models.
 *
 * @param prods - The array of raw product records from the database
 * @returns An array of domain-ready product models
 *
 * @example
 * const uiProducts = toUIProductList(rawDbProductRows);
 */
export const toUIProductList = (prods: DbProduct[]): DomainProduct[] => prods.map(mapDatabaseProductToDomain)
