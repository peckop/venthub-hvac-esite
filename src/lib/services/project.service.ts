import { supabase } from '../supabase'
import type { DbUserProject, DbProjectItem, DbProduct } from '../../types/db-rows'
import type { TablesInsert } from '../../types/database.types'
import type { ProjectItem } from '../supabase'
import { mapDatabaseProductToDomain } from '../type-converters'

/**
 * Retrieves all projects associated with the currently authenticated user.
 * Projects are returned in descending order based on their last updated timestamp.
 *
 * @returns An array of user project records, empty if none exist.
 * @throws {Error} If the database query fails.
 *
 * @example
 * const projects = await listUserProjects()
 * console.log(projects[0].name) // 'My HVAC Setup'
 */
export async function listUserProjects(): Promise<DbUserProject[]> {
  const { data, error } = await supabase.from('user_projects')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw (error as Error)
  
  return (data as DbUserProject[]) || []
}

/**
 * Creates a new project for the authenticated user.
 *
 * @param project - The project details to insert, matching the database schema.
 * @returns The newly created user project record.
 * @throws {Error} If the database insertion fails.
 *
 * @example
 * const newProject = await createProject({ name: 'Office Renovation', user_id: 'user-uuid' })
 */
export async function createProject(project: TablesInsert<'user_projects'>): Promise<DbUserProject> {
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
 * @param id - The unique identifier of the project to delete.
 * @returns True if the project was successfully deleted.
 * @throws {Error} If the database deletion fails.
 *
 * @example
 * await deleteProject('project-123')
 */
export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from('user_projects')
    .delete()
    .eq('id', id)

  if (error) throw (error as Error)
  return true
}

/**
 * Adds a specific product to a user project with an optional quantity.
 *
 * @param projectId - The unique identifier of the target project.
 * @param productId - The unique identifier of the product being added.
 * @param quantity - The number of units to add (defaults to 1).
 * @returns The newly created project item record.
 * @throws {Error} If the database insertion fails.
 *
 * @example
 * const item = await addProductToProject('project-123', 'product-456', 2)
 */
export async function addProductToProject(projectId: string, productId: string, quantity: number = 1): Promise<DbProjectItem> {
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
 * @param projectId - The unique identifier of the target project.
 * @param productId - The unique identifier of the product to remove.
 * @returns True if the deletion was successful.
 * @throws {Error} If the database deletion fails.
 *
 * @example
 * await removeProductFromProject('project-123', 'product-456')
 */
export async function removeProductFromProject(projectId: string, productId: string): Promise<boolean> {
  const { error } = await supabase.from('project_items')
    .delete()
    .match({ project_id: projectId, product_id: productId })

  if (error) throw (error as Error)
  return true
}

/**
 * Retrieves all items within a project, joined with their corresponding domain product data.
 *
 * @param projectId - The unique identifier of the target project.
 * @returns An array of project items, each enriched with its full product details.
 * @throws {Error} If the database query fails.
 *
 * @example
 * const items = await listProjectItems('project-123')
 * items.forEach(i => console.log(i.product?.name, i.quantity))
 */
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
