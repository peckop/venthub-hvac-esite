import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Retrieves all invoice profiles associated with the currently authenticated user.
 * Results are ordered by default status first, then by creation date.
 * If the table does not exist, it safely returns an empty array.
 *
 * @returns A promise resolving to an array of invoice profiles.
 * @throws {Error} If the database query fails with an unexpected error.
 *
 * @example
 * const profiles = await listInvoiceProfiles()
 * console.log(`Found ${profiles.length} profiles`)
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
 * Automatically injects the user's ID into the payload before insertion.
 *
 * @param payload - The data for the new invoice profile, omitting the user_id.
 * @returns A promise resolving to the newly created invoice profile.
 * @throws {Error} If the user is not authenticated or the insertion fails.
 *
 * @example
 * const newProfile = await createInvoiceProfile({ company_name: 'Acme Corp', tax_id: '1234567890' })
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
 * Updates an existing invoice profile with the provided data.
 *
 * @param id - The unique identifier of the invoice profile to update.
 * @param payload - The partial data to update the profile with.
 * @returns A promise resolving to the updated invoice profile.
 * @throws {Error} If the update operation fails.
 *
 * @example
 * const updatedProfile = await updateInvoiceProfile('profile-123', { is_default: false })
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
 * Deletes an invoice profile from the database.
 *
 * @param id - The unique identifier of the invoice profile to delete.
 * @returns A promise resolving to true upon successful deletion.
 * @throws {Error} If the deletion operation fails.
 *
 * @example
 * const success = await deleteInvoiceProfile('profile-123')
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
 * Automatically clears the default status from any other profiles owned by the user.
 *
 * @param id - The unique identifier of the invoice profile to set as default.
 * @returns A promise resolving to the newly set default invoice profile.
 * @throws {Error} If the user is not authenticated or the update operations fail.
 *
 * @example
 * const defaultProfile = await setDefaultInvoiceProfile('profile-123')
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
 * Retrieves the currently authenticated user's default invoice profile.
 * If multiple defaults exist (which shouldn't happen), it returns the most recently updated one.
 * If the table does not exist, it safely returns null.
 *
 * @returns A promise resolving to the default invoice profile, or null if none exists.
 * @throws {Error} If the user is not authenticated or an unexpected query error occurs.
 *
 * @example
 * const profile = await fetchDefaultInvoiceProfile()
 * if (profile) console.log(`Default profile: ${profile.company_name}`)
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
