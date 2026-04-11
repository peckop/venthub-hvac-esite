import { supabase } from '../supabase'
import type { DbUserProject, DbProjectItem, DbProduct } from '../../types/db-rows'
import type { TablesInsert } from '../../types/database.types'
import type { ProjectItem } from '../supabase'
import { mapDatabaseProductToDomain } from '../type-converters'

export async function listUserProjects(): Promise<DbUserProject[]> {
  const { data, error } = await supabase.from('user_projects')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw (error as Error)
  
  return (data as DbUserProject[]) || []
}

export async function createProject(project: TablesInsert<'user_projects'>): Promise<DbUserProject> {
  const { data, error } = await supabase.from('user_projects')
    .insert(project)
    .select()
    .single()

  if (error) throw (error as Error)
  
  return data as DbUserProject
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from('user_projects')
    .delete()
    .eq('id', id)

  if (error) throw (error as Error)
  return true
}

export async function addProductToProject(projectId: string, productId: string, quantity: number = 1): Promise<DbProjectItem> {
  const { data, error } = await supabase.from('project_items')
    .insert({ project_id: projectId, product_id: productId, quantity })
    .select()
    .single()

  if (error) throw (error as Error)
  
  return data as DbProjectItem
}

export async function removeProductFromProject(projectId: string, productId: string): Promise<boolean> {
  const { error } = await supabase.from('project_items')
    .delete()
    .match({ project_id: projectId, product_id: productId })

  if (error) throw (error as Error)
  return true
}

export async function listProjectItems(projectId: string): Promise<ProjectItem[]> {
  const { data, error } = await supabase.from('project_items')
    .select('*, product:products(*)')
    .eq('project_id', projectId)

  if (error) throw (error as Error)
  
  
  const items = (data as (DbProjectItem & { product: DbProduct | null })[]) || []
  return items.map(item => ({
    ...item,
    product: item.product ? mapDatabaseProductToDomain(item.product) : undefined
  }))
}
