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
 * Centralizes the handling of potential Json/Text mismatches from Supabase.
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
 * List converters for bulk data.
 */
export const toUICategoryList = (cats: DbCategory[]): DomainCategory[] => {
  return cats.map(mapDatabaseCategoryToDomain)
}
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
