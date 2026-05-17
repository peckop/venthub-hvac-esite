import { supabase } from '../supabase'
import type { Category } from '../supabase'
import type { DbCategory } from '../../types/db-rows'
import { toUICategoryList } from '../type-converters'

/**
 * Retrieves a comprehensive list of all active categories.
 * Orders the result hierarchically by level (ascending) and alphabetically by name.
 * Maps the raw database rows to the domain-specific Category UI models.
 *
 * @returns A promise that resolves to an array of mapped, active Category objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const activeCategories = await getCategories();
 * const rootCategories = activeCategories.filter(c => c.level === 0);
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
