import type { DbCategory, DbProduct } from '../types/db-rows'
import type { DomainCategory, DomainProduct } from '../types/ui-models'

// Re-export domain types so they can be accessed through this module (as expected by other files)
export type { DomainCategory, DomainProduct }

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
 * Inverse converters for legacy component support.
 */
export const mapDomainCategoryToDatabase = (domainCat: DomainCategory): DbCategory => {
  return domainCat as Partial<DbCategory> as DbCategory
}

export const mapDomainProductToDatabase = (domainProd: DomainProduct): DbProduct => {
  return domainProd as Partial<DbProduct> as DbProduct
}

/**
 * List converters for bulk data.
 */
export const toUICategoryList = (cats: DbCategory[]): DomainCategory[] => cats.map(mapDatabaseCategoryToDomain)
export const toUIProductList = (prods: DbProduct[]): DomainProduct[] => prods.map(mapDatabaseProductToDomain)
