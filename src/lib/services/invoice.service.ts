import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Fetches all invoice profiles for the authenticated user.
 * Results are ordered with the default profile first, followed by the most recently created.
 *
 * @returns An array of invoice profiles, or an empty array if none are found
 * @throws {Error} If the database query fails with an unexpected error
 *
 * @example
 * const profiles = await listInvoiceProfiles();
 * console.log(profiles[0].is_default); // typically true for the first item
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
 * Creates a new invoice profile for the authenticated user.
 * Automatically associates the profile with the current user's ID.
 *
 * @param payload - The invoice profile data to insert (omitting user_id)
 * @returns The newly created invoice profile record
 * @throws {Error} If the user is not authenticated or the database insert fails
 *
 * @example
 * const newProfile = await createInvoiceProfile({
 *   title: 'My Company',
 *   tax_number: '1234567890',
 *   tax_office: 'Sisli'
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
 * Updates an existing invoice profile.
 * Only the fields provided in the payload will be updated.
 *
 * @param id - The unique identifier of the invoice profile to update
 * @param payload - The fields to update in the invoice profile
 * @returns The updated invoice profile record
 * @throws {Error} If the database update operation fails
 *
 * @example
 * const updated = await updateInvoiceProfile('profile-123', { is_default: false });
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
 * Deletes an invoice profile permanently.
 *
 * @param id - The unique identifier of the invoice profile to delete
 * @returns True if the deletion was successful
 * @throws {Error} If the database deletion operation fails
 *
 * @example
 * await deleteInvoiceProfile('profile-123'); // returns true
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
 * @param id - The unique identifier of the invoice profile to set as default
 * @returns The updated invoice profile record, now marked as default
 * @throws {Error} If the user is not authenticated or the database operations fail
 *
 * @example
 * const defaultProfile = await setDefaultInvoiceProfile('profile-123');
 * console.log(defaultProfile.is_default); // returns true
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
 * Retrieves the currently active default invoice profile for the authenticated user.
 * If multiple defaults accidentally exist, it returns the most recently updated one.
 *
 * @returns The default invoice profile, or null if none exists or the table is missing
 * @throws {Error} If the user is not authenticated or a generic database error occurs
 *
 * @example
 * const activeProfile = await fetchDefaultInvoiceProfile();
 * if (activeProfile) console.log(activeProfile.tax_number);
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
