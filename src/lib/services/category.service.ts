import { supabaseBrowserClient } from '../supabase/client'
import { supabaseStaticClient } from '../supabase/static'
import type { Category } from '../../types/ui-models'
import type { DbCategory } from '../../types/db-rows'
import { toUICategoryList } from '../type-converters'

const defaultClient = typeof window !== 'undefined' ? supabaseBrowserClient : supabaseStaticClient

export async function getCategories(supabase = defaultClient): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, parent_id, name, slug, image_url, level, is_active, metadata, created_at, updated_at, menu_label, marketing_title, translation_key, description, authority_content, display_mode, is_featured, seo_desc, seo_title, sort_order')
    .eq('is_active', true) // Sadece aktif kategorileri getir
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return toUICategoryList((data as (typeof data & DbCategory[])) || [])
}
