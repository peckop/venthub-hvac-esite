import { supabase } from '../supabase'
import type { Category } from '../supabase'
import type { DbCategory } from '../../types/db-rows'
import { toUICategoryList } from '../type-converters'

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true) // Sadece aktif kategorileri getir
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return toUICategoryList((data as (typeof data & DbCategory[])) || [])
}
