import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { TablesInsert } from '../../types/database.types'
import type { DbProduct,DbProjectItem, DbUserProject } from '../../types/db-rows'
import type { ProjectItem } from '../../types/ui-models'
import { mapDatabaseProductToDomain } from '../type-converters'

/**
 * Retrieves all projects associated with the currently authenticated user.
 * Projects are returned in descending order based on their last updated timestamp.
 *
 * @param supabase - The active Supabase client instance.
 * @returns An array of user project records, empty if none exist.
 * @throws {Error} If the database query fails.
 */
export async function listUserProjects(supabase: SupabaseClient<Database>): Promise<DbUserProject[]> {
  const { data, error } = await supabase.from('user_projects')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw (error as Error)
  
  return (data as DbUserProject[]) || []
}

/**
 * Creates a new project for the authenticated user.
 *
 * @param supabase - The active Supabase client instance.
 * @param project - The project details to insert, matching the database schema.
 * @returns The newly created user project record.
 * @throws {Error} If the database insertion fails.
 */
export async function createProject(
  supabase: SupabaseClient<Database>,
  project: TablesInsert<'user_projects'>
): Promise<DbUserProject> {
  const { data, error } = await supabase.from('user_projects')
    .insert(project)
    .select()
    .single()

  if (error) throw (error as Error)
  
  return data as DbUserProject
}

/**
 * Deletes a user project and all its associated items (cascade typically handled by DB).
 *
 * @param supabase - The active Supabase client instance.
 * @param id - The unique identifier of the project to delete.
 * @returns True if the project was successfully deleted.
 * @throws {Error} If the database deletion fails.
 */
export async function deleteProject(supabase: SupabaseClient<Database>, id: string): Promise<boolean> {
  const { error } = await supabase.from('user_projects')
    .delete()
    .eq('id', id)

  if (error) throw (error as Error)
  return true
}

/**
 * Adds a specific product to a user project with an optional quantity.
 *
 * @param supabase - The active Supabase client instance.
 * @param projectId - The unique identifier of the target project.
 * @param productId - The unique identifier of the product being added.
 * @param quantity - The number of units to add (defaults to 1).
 * @returns The newly created project item record.
 * @throws {Error} If the database insertion fails.
 */
export async function addProductToProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
  productId: string,
  quantity: number = 1
): Promise<DbProjectItem> {
  const { data, error } = await supabase.from('project_items')
    .insert({ project_id: projectId, product_id: productId, quantity })
    .select()
    .single()

  if (error) throw (error as Error)
  
  return data as DbProjectItem
}

/**
 * Removes a specific product from a user project.
 *
 * @param supabase - The active Supabase client instance.
 * @param projectId - The unique identifier of the target project.
 * @param productId - The unique identifier of the product to remove.
 * @returns True if the deletion was successful.
 * @throws {Error} If the database deletion fails.
 */
export async function removeProductFromProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
  productId: string
): Promise<boolean> {
  const { error } = await supabase.from('project_items')
    .delete()
    .match({ project_id: projectId, product_id: productId })

  if (error) throw (error as Error)
  return true
}

/**
 * Retrieves all items within a project, joined with their corresponding domain product data.
 *
 * @param supabase - The active Supabase client instance.
 * @param projectId - The unique identifier of the target project.
 * @returns An array of project items, each enriched with its full product details.
 * @throws {Error} If the database query fails.
 */
export async function listProjectItems(supabase: SupabaseClient<Database>, projectId: string): Promise<ProjectItem[]> {
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
