import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Retrieves all invoice profiles for the current database context.
 * Profiles are ordered primarily by default status (default first) and secondarily by creation date (newest first).
 *
 * @returns A promise resolving to an array of DbInvoiceProfile objects
 * @throws {Error} If the database query fails with an unexpected error
 *
 * @example
 * const profiles = await listInvoiceProfiles()
 * console.log(`Found ${profiles.length} profiles, first one is default: ${profiles[0]?.is_default}`)
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
 * It automatically injects the user's ID into the payload.
 *
 * @param payload - The data required to insert a new invoice profile, excluding user_id
 * @returns A promise resolving to the newly created DbInvoiceProfile
 * @throws {Error} If no user is authenticated or the database insert fails
 *
 * @example
 * const newProfile = await createInvoiceProfile({ title: 'Company Inc.', tax_office: 'Sisli', tax_number: '1234567890' })
 * console.log(`Created profile with ID: ${newProfile.id}`)
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
 * Updates an existing invoice profile with the given data.
 *
 * @param id - The UUID of the invoice profile to update
 * @param payload - A partial object containing the fields to update
 * @returns A promise resolving to the updated DbInvoiceProfile
 * @throws {Error} If the database update fails
 *
 * @example
 * const updated = await updateInvoiceProfile('profile-uuid', { address: 'New Street 123' })
 * console.log(`Profile ${updated.id} updated to new address`)
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
 * Deletes a specific invoice profile by its ID.
 *
 * @param id - The UUID of the invoice profile to delete
 * @returns A promise resolving to true if successful
 * @throws {Error} If the database deletion fails
 *
 * @example
 * const success = await deleteInvoiceProfile('profile-uuid')
 * if (success) console.log('Profile successfully deleted')
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
 * Automatically clears the `is_default` flag from all other profiles owned by the user.
 *
 * @param id - The UUID of the invoice profile to set as default
 * @returns A promise resolving to the updated default DbInvoiceProfile
 * @throws {Error} If no user is authenticated or any database operation fails
 *
 * @example
 * const defaultProfile = await setDefaultInvoiceProfile('profile-uuid')
 * console.log(`Profile ${defaultProfile.id} is now the default`)
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
 * If multiple defaults exist erroneously, it returns the most recently updated one.
 *
 * @returns A promise resolving to the default DbInvoiceProfile, or null if none exists
 * @throws {Error} If no user is authenticated or an unexpected database error occurs
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile()
 * if (defaultProfile) console.log(`Using default profile: ${defaultProfile.title}`)
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
