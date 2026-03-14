import type { DbCategory, DbProduct } from '../types/db-rows'
import type { UICategory, UIProduct } from '../types/ui-models'

/**
 * Safely converts a Database Category row to a UI-ready Category model.
 * Centralizes the handling of potential Json/Text mismatches from Supabase.
 */
export const toUICategory = (dbCat: DbCategory): UICategory => {
  return {
    ...dbCat,
    name: String(dbCat.name || ''),
    description: String(dbCat.description || ''),
  }
}

/**
 * Safely converts a Database Product row to a UI-ready Product model.
 */
export const toUIProduct = (dbProd: DbProduct): UIProduct => {
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
export const toUICategoryList = (cats: DbCategory[]): UICategory[] => cats.map(toUICategory)
export const toUIProductList = (prods: DbProduct[]): UIProduct[] => prods.map(toUIProduct)
