import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Retrieves all invoice profiles for the authenticated user.
 * Results are ordered with the default profile first, followed by the most recently created.
 *
 * @returns A promise that resolves to an array of invoice profiles, or an empty array if none exist
 * @throws {PostgrestError} If the database query fails for reasons other than table not found
 *
 * @example
 * const profiles = await listInvoiceProfiles()
 * if (profiles.length > 0) console.log(profiles[0].id)
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
 * Automatically injects the user's ID into the payload.
 *
 * @param payload - The invoice profile data to insert (excluding user_id)
 * @returns A promise resolving to the newly created invoice profile
 * @throws {Error} If the user is not authenticated or if the database insertion fails
 *
 * @example
 * const newProfile = await createInvoiceProfile({ title: 'My Company', tax_number: '123' })
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
 *
 * @param id - The UUID of the invoice profile to update
 * @param payload - The partial profile data to update
 * @returns A promise resolving to the updated invoice profile
 * @throws {Error} If the database update fails
 *
 * @example
 * const updated = await updateInvoiceProfile('uuid-123', { is_default: false })
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
 * Deletes an invoice profile by its ID.
 *
 * @param id - The UUID of the invoice profile to delete
 * @returns A promise resolving to true upon successful deletion
 * @throws {Error} If the database deletion fails
 *
 * @example
 * await deleteInvoiceProfile('uuid-123')
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
 * @returns A promise resolving to the updated default invoice profile
 * @throws {Error} If the user is not authenticated or if the database updates fail
 *
 * @example
 * const newDefault = await setDefaultInvoiceProfile('uuid-123')
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
 * If multiple defaults mistakenly exist, it returns the most recently updated one.
 *
 * @returns A promise resolving to the default profile, or null if none exists
 * @throws {Error} If the user is not authenticated or a query error occurs (other than missing table)
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile()
 * if (defaultProfile) console.log(defaultProfile.title)
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
