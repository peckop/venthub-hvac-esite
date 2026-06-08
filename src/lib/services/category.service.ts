import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { DbCategory } from '../../types/db-rows'
import type { Category } from '../../types/ui-models'
import { toUICategoryList } from '../type-converters'

export async function getCategories(supabase: SupabaseClient<Database>): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, parent_id, name, slug, image_url, level, is_active, metadata, created_at, updated_at, menu_label, marketing_title, translation_key, description, authority_content, display_mode, is_featured, seo_desc, seo_title, sort_order')
    .eq('is_active', true) // Sadece aktif kategorileri getir
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return toUICategoryList((data as (typeof data & DbCategory[])) || [])
}
