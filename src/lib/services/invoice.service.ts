import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Fetches all invoice profiles for the authenticated user.
 * Results are ordered with the default profile first, followed by newest profiles.
 * Safe fallback: returns an empty array if the table doesn't exist yet.
 *
 * @returns An array of invoice profile records, or an empty array if none found/table missing
 * @throws {Error} If a Supabase query error occurs (other than table not found)
 *
 * @example
 * const profiles = await listInvoiceProfiles()
 * if (profiles.length > 0) {
 *   console.log('Default profile:', profiles[0])
 * }
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
 * Automatically injects the authenticated user's ID into the payload before insertion.
 *
 * @param payload - The invoice profile data to insert (without user_id)
 * @returns The newly created invoice profile record
 * @throws {Error} If the user is not authenticated or a database error occurs
 *
 * @example
 * const newProfile = await createInvoiceProfile({
 *   title: 'My Company',
 *   tax_id: '1234567890',
 *   tax_office: 'Besiktas',
 *   address: 'Main St 1',
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
 * Updates an existing invoice profile by ID.
 * Note: Does not verify if the profile belongs to the authenticated user (relies on RLS).
 *
 * @param id - The UUID of the invoice profile to update
 * @param payload - The partial profile data to update
 * @returns The updated invoice profile record
 * @throws {Error} If the database update fails
 *
 * @example
 * const updated = await updateInvoiceProfile('profile-uuid-123', {
 *   address: 'New St 42',
 *   tax_office: 'Sisli'
 * })
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
 * Deletes an existing invoice profile by ID.
 * Note: Relies on RLS policies to ensure users can only delete their own profiles.
 *
 * @param id - The UUID of the invoice profile to delete
 * @returns true if the deletion was successful
 * @throws {Error} If the database deletion fails
 *
 * @example
 * await deleteInvoiceProfile('profile-uuid-123')
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
 * Automatically clears the default status from all other profiles belonging to this user.
 *
 * @param id - The UUID of the invoice profile to set as default
 * @returns The newly updated default invoice profile
 * @throws {Error} If the user is not authenticated or a database error occurs during either step
 *
 * @example
 * const newDefault = await setDefaultInvoiceProfile('profile-uuid-123')
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
 * Fetches the current default invoice profile for the authenticated user.
 * If multiple profiles are flagged as default (which shouldn't happen), returns the most recently updated one.
 * Safe fallback: returns null if the profile doesn't exist or if the table is missing.
 *
 * @returns The default invoice profile record, or null if none exists
 * @throws {Error} If the user is not authenticated or a query error occurs (other than table not found)
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile()
 * if (defaultProfile) {
 *   prefillCheckoutForm(defaultProfile)
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
