import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Fetches all invoice profiles associated with the currently authenticated user.
 * Results are ordered with the default profile first, followed by newest profiles.
 *
 * @returns An array of invoice profiles, or an empty array if none exist or the table is missing
 * @throws {Error} If a Supabase query error occurs (other than table not found)
 *
 * @example
 * const profiles = await listInvoiceProfiles();
 * console.log(profiles[0].is_default); // typically true if profiles exist
 */
export async function listInvoiceProfiles(): Promise<DbInvoiceProfile[]> {
  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (error) {
    interface PostgrestErrorExtended { code?: string; message?: string }
    const e = error as PostgrestErrorExtended
    if (e?.code === 'PGRST205' || (e?.message || '').includes("Could not find the table 'public.user_invoice_profiles'")) {
      return []
    }
    throw error
  }
  return (data as DbInvoiceProfile[]) || []
}

/**
 * Creates a new invoice profile for the currently authenticated user.
 * Automatically injects the authenticated user's ID into the payload.
 *
 * @param payload - The invoice profile data to insert (excluding user_id)
 * @returns The newly created invoice profile record
 * @throws {Error} If the user is not authenticated or the insert fails
 *
 * @example
 * const newProfile = await createInvoiceProfile({
 *   title: 'Company HQ',
 *   tax_id: '1234567890',
 *   is_default: false
 * });
 */
export async function createInvoiceProfile(payload: DbInvoiceProfileInsert): Promise<DbInvoiceProfile> {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const dbPayload: DbInvoiceProfileInsert = {
    ...payload,
    user_id: user.id
  }

  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .insert(dbPayload)
    .select('*')
    .single()
  
  if (error) throw error
  return data as DbInvoiceProfile
}

/**
 * Updates an existing invoice profile by its unique identifier.
 *
 * @param id - The UUID of the invoice profile to update
 * @param payload - The partial data to update on the profile
 * @returns The updated invoice profile record
 * @throws {Error} If the update operation fails
 *
 * @example
 * const updated = await updateInvoiceProfile('profile-uuid', { title: 'Updated HQ' });
 */
export async function updateInvoiceProfile(id: string, payload: DbInvoiceProfileUpdate): Promise<DbInvoiceProfile> {
  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) throw error
  return data as DbInvoiceProfile
}

/**
 * Deletes an invoice profile by its unique identifier.
 *
 * @param id - The UUID of the invoice profile to delete
 * @returns True if the deletion was successful
 * @throws {Error} If the delete operation fails
 *
 * @example
 * await deleteInvoiceProfile('profile-uuid');
 */
export async function deleteInvoiceProfile(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_invoice_profiles')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

/**
 * Sets a specific invoice profile as the default for the authenticated user.
 * Automatically clears the default status from all other profiles belonging to the user.
 *
 * @param id - The UUID of the invoice profile to set as default
 * @returns The updated invoice profile record with is_default set to true
 * @throws {Error} If the user is not authenticated or any update operation fails
 *
 * @example
 * const defaultProfile = await setDefaultInvoiceProfile('profile-uuid');
 */
export async function setDefaultInvoiceProfile(id: string): Promise<DbInvoiceProfile> {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  // Clear other defaults for this user
  const clear = await supabase
    .from('user_invoice_profiles')
    .update({ is_default: false })
    .eq('user_id', user.id)
    .eq('is_default', true)
  if (clear.error) throw clear.error

  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .update({ is_default: true })
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) throw error
  return data as DbInvoiceProfile
}

/**
 * Retrieves the current default invoice profile for the authenticated user.
 * If multiple profiles are erroneously marked as default, returns the most recently updated one.
 *
 * @returns The default invoice profile, or null if none exists or the table is missing
 * @throws {Error} If the user is not authenticated or a query error occurs (other than table not found)
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile();
 * if (defaultProfile) {
 *   // Auto-fill checkout form
 * }
 */
export async function fetchDefaultInvoiceProfile(): Promise<DbInvoiceProfile | null> {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_invoice_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .order('updated_at', { ascending: false })
    .limit(1)
  
  if (error) {
    interface PostgrestErrorExtended { code?: string; message?: string }
    const e = error as PostgrestErrorExtended
    if (e?.code === 'PGRST205' || (e?.message || '').includes("Could not find the table 'public.user_invoice_profiles'")) {
      return null
    }
    throw error
  }
  
  return (data && data.length > 0) ? (data[0] as DbInvoiceProfile) : null
}
