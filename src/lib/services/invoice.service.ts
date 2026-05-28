import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Retrieves all invoice profiles associated with the currently authenticated user.
 * Results are ordered with the default profile first, followed by newest profiles.
 *
 * @returns A promise resolving to an array of invoice profiles, or an empty array if none exist
 * @throws {Error} If the database query fails with an unexpected error
 *
 * @example
 * const profiles = await listInvoiceProfiles()
 * if (profiles.length > 0) console.log(profiles[0].company_name)
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
 *
 * @param payload - The invoice profile data to insert, excluding the user ID
 * @returns A promise resolving to the newly created invoice profile
 * @throws {Error} If the user is not authenticated or the database insert fails
 *
 * @example
 * const newProfile = await createInvoiceProfile({
 *   profile_type: 'individual',
 *   tax_number: '12345678901',
 *   is_default: true
 * })
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
 * Updates an existing invoice profile by its ID.
 *
 * @param id - The unique identifier of the invoice profile to update
 * @param payload - The partial invoice profile data to apply
 * @returns A promise resolving to the updated invoice profile
 * @throws {Error} If the database update fails
 *
 * @example
 * const updated = await updateInvoiceProfile('profile-123', { company_name: 'New Corp' })
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
 * Deletes an existing invoice profile by its ID.
 *
 * @param id - The unique identifier of the invoice profile to delete
 * @returns A promise resolving to true upon successful deletion
 * @throws {Error} If the database deletion fails
 *
 * @example
 * await deleteInvoiceProfile('profile-123')
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
 * Sets a specific invoice profile as the default for the currently authenticated user.
 * This automatically clears the default status from any other profiles owned by the user.
 *
 * @param id - The unique identifier of the invoice profile to make default
 * @returns A promise resolving to the updated default invoice profile
 * @throws {Error} If the user is not authenticated or the database updates fail
 *
 * @example
 * const newDefault = await setDefaultInvoiceProfile('profile-123')
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
 * Retrieves the default invoice profile for the currently authenticated user.
 * If multiple defaults exist (which shouldn't happen), returns the most recently updated one.
 *
 * @returns A promise resolving to the default invoice profile, or null if none is found
 * @throws {Error} If the user is not authenticated or the database query fails unexpectedly
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile()
 * if (defaultProfile) fillForm(defaultProfile)
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
