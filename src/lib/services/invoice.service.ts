import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Retrieves all invoice profiles for the authenticated user, ordered by default status and creation date.
 * Soft-fails and returns an empty array if the table does not exist or a specific Postgrest error occurs.
 *
 * @returns A promise resolving to an array of invoice profiles, or an empty array if none found or table is missing
 * @throws {Error} If an unexpected database query error occurs
 *
 * @example
 * const profiles = await listInvoiceProfiles()
 * if (profiles.length > 0) console.log(profiles[0].tax_number)
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
 * Creates a new invoice profile associated with the currently authenticated user.
 *
 * @param payload - The invoice profile details to insert
 * @returns A promise resolving to the newly created invoice profile
 * @throws {Error} If the user is not authenticated or the database insertion fails
 *
 * @example
 * const newProfile = await createInvoiceProfile({ company_name: 'Acme Corp', tax_number: '1234567890' })
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
 * Updates an existing invoice profile with new details.
 *
 * @param id - The unique identifier of the invoice profile to update
 * @param payload - The partial profile details to apply
 * @returns A promise resolving to the updated invoice profile
 * @throws {Error} If the database update fails
 *
 * @example
 * const updated = await updateInvoiceProfile('profile-123', { company_name: 'Acme Inc.' })
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
 * Deletes a specific invoice profile by its identifier.
 *
 * @param id - The unique identifier of the invoice profile to delete
 * @returns A promise resolving to true if deletion is successful
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
 * Automatically clears the default status from all other profiles owned by the user.
 *
 * @param id - The unique identifier of the invoice profile to set as default
 * @returns A promise resolving to the updated invoice profile
 * @throws {Error} If the user is not authenticated or a database update fails
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
 * Retrieves the currently active default invoice profile for the authenticated user.
 * Soft-fails and returns null if the table does not exist or a specific Postgrest error occurs.
 *
 * @returns A promise resolving to the default invoice profile, or null if none exists or table is missing
 * @throws {Error} If the user is not authenticated or an unexpected database query error occurs
 *
 * @example
 * const profile = await fetchDefaultInvoiceProfile()
 * if (profile) console.log(`Default billing entity: ${profile.company_name}`)
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
