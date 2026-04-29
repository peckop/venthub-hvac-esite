import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Retrieves all invoice profiles for the authenticated user.
 * Results are sorted with the default profile first, then by creation date descending.
 * Returns an empty array if the table does not exist yet.
 *
 * @returns A promise that resolves to an array of invoice profiles
 * @throws {Error} If a database error occurs (other than missing table)
 *
 * @example
 * const profiles = await listInvoiceProfiles()
 * if (profiles.length > 0) console.log('Default profile:', profiles[0])
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
 * @param payload - The invoice profile data to insert (omitting user_id)
 * @returns A promise that resolves to the newly created invoice profile
 * @throws {Error} If the user is not authenticated or the insertion fails
 *
 * @example
 * const newProfile = await createInvoiceProfile({
 *   profile_type: 'individual',
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   identity_number: '12345678901'
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
 * @param payload - The partial profile data to apply
 * @returns A promise that resolves to the updated invoice profile
 * @throws {Error} If the update operation fails
 *
 * @example
 * const updated = await updateInvoiceProfile('profile-123', {
 *   address_line1: 'Yeni Mahalle 123 Sokak'
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
 * Deletes an invoice profile by its ID.
 *
 * @param id - The unique identifier of the invoice profile to delete
 * @returns A promise that resolves to true upon successful deletion
 * @throws {Error} If the deletion operation fails
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
 * Sets a specific invoice profile as the default for the authenticated user.
 * Automatically clears the default status from any other profiles owned by the user.
 *
 * @param id - The unique identifier of the invoice profile to set as default
 * @returns A promise that resolves to the newly defaulted invoice profile
 * @throws {Error} If the user is not authenticated or the update fails
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
 * Retrieves the currently authenticated user's default invoice profile.
 * Returns null if no default profile exists or if the table doesn't exist yet.
 *
 * @returns A promise that resolves to the default invoice profile, or null
 * @throws {Error} If the user is not authenticated or a generic database error occurs
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile()
 * if (defaultProfile) {
 *   console.log('Billing to:', defaultProfile.first_name || defaultProfile.company_name)
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
