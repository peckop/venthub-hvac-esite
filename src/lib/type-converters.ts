import type { CategoryMetadata, DbCategory, DbProduct, LocalizedCategoryMetadata } from '../types/db-rows'
import type { DomainCategory, DomainProduct } from '../types/ui-models'

// Re-export domain types so they can be accessed through this module (as expected by other files)
export type { CategoryMetadata, DomainCategory, DomainProduct, LocalizedCategoryMetadata }

import type { Json } from '../types/database.types'

/**
 * Safely converts complex TypeScript types to Supabase's exact Json type without unsafe casts.
 * Achieved by using JSON parsing, which cleanly satisfies TypeScript's type inference.
 */
export const toSupabaseJson = <T>(data: T): Json => {
  return JSON.parse(JSON.stringify(data)) as Json
}

/**
 * Type guard to safely check if an unknown value is a generic Record<string, unknown>
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}


/**
 * Safely converts a Database Category row to a UI-ready Category model.
 * Centralizes the handling of potential Json/Text mismatches from Supabase, ensuring required strings are not null.
 *
 * @param dbCat - The raw category data row from Supabase database
 * @returns The UI-ready DomainCategory object with resolved strings
 *
 * @example
 * const dbRow = { id: '1', name: 'Fanlar', menu_label: null }
 * const uiCategory = mapDatabaseCategoryToDomain(dbRow)
 * // returns { id: '1', name: 'Fanlar', menu_label: 'Fanlar', marketing_title: 'Fanlar', description: '' }
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
 * Resolves the localized description from the JSONB column based on Turkish default.
 *
 * @param dbProd - The raw product data row from Supabase database
 * @returns The UI-ready DomainProduct object with resolved names and fallback brand
 *
 * @example
 * const dbRow = { id: 'p1', name: 'Jet Fan', description_i18n: { tr: 'Güçlü jet fan' }, brand: null }
 * const uiProduct = mapDatabaseProductToDomain(dbRow)
 * // returns { id: 'p1', name: 'Jet Fan', description: 'Güçlü jet fan', brand: 'Venthub' }
 */
export const mapDatabaseProductToDomain = (dbProd: DbProduct): DomainProduct => {
  return {
    ...dbProd,
    name: String(dbProd.name || ''),
    // F5-B D4: legacy `description` kolonu DROP edildi — description_i18n (JSONB
    // {tr,en}) tek kaynak. (DROP öncesi 374/374 satırda birebir kopyaydı.)
    description: String(dbProd.description_i18n?.tr ?? ''),
    brand: String(dbProd.brand || 'Venthub'),
  }
}

/**
 * List converters for bulk data.
 */
export const toUICategoryList = (cats: DbCategory[]): DomainCategory[] => {
  return cats.map(mapDatabaseCategoryToDomain)
}
/**
 * Converts an array of database product models into an array of UI domain product models.
 * Applies mapping functions over each item to extract correctly typed values and nested JSONB data.
 *
 * @param prods - The array of raw database products returned from Supabase
 * @returns An array of domain product objects suitable for use in UI components
 *
 * @example
 * const dbProducts = await fetchProducts();
 * const uiProducts = toUIProductList(dbProducts);
 * console.log(uiProducts[0].translations.name); // Access mapped domain fields
 */
export const toUIProductList = (prods: DbProduct[]): DomainProduct[] => {
  return prods.map(mapDatabaseProductToDomain)
}

/**
 * Maps a DbCategory to DomainCategory while resolving localized category metadata fields
 * based on the active language ('tr' | 'en') to avoid runtime undefined errors.
 */
export const mapCategoryWithLocale = (
  dbCat: DbCategory,
  lang: 'tr' | 'en' = 'tr'
): DomainCategory => {
  const base = mapDatabaseCategoryToDomain(dbCat)
  if (!dbCat.metadata) return base

  const meta = dbCat.metadata
  // Retrieve the localized object or fallback to base metadata fields
  const localized = (meta[lang] || meta['tr'] || meta) as CategoryMetadata

  return {
    ...base,
    metadata: {
      ...meta,
      ...localized,
    } as LocalizedCategoryMetadata
  }
}
