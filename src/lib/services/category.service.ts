import { supabase } from '../supabase'
import type { Category } from '../supabase'
import type { DbCategory } from '../../types/db-rows'
import { toUICategoryList } from '../type-converters'

/**
 * Fetches all active categories from the database and maps them to the UI domain model.
 * Categories are ordered by their hierarchical level and then alphabetically by name.
 *
 * @returns A promise resolving to an array of active Category objects mapped for the UI.
 * @throws {Error} If the database query fails.
 *
 * @example
 * const categories = await getCategories()
 * const rootCategories = categories.filter(c => c.level === 0)
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, parent_id, name, slug, image_url, level, is_active, metadata, created_at, updated_at, menu_label, marketing_title, translation_key, description, authority_content, display_mode, is_featured, seo_desc, seo_title, sort_order')
    .eq('is_active', true) // Sadece aktif kategorileri getir
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return toUICategoryList((data as (typeof data & DbCategory[])) || [])
}
