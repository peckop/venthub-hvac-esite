import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Retrieves all invoice profiles belonging to the authenticated user.
 * The list is ordered by the default profile first, followed by the most recently created profiles.
 * Suppresses database errors related to missing tables (e.g. PGRST205) by returning an empty array.
 *
 * @returns A promise that resolves to an array of invoice profiles, or an empty array if none exist
 * @throws {Error} If a Supabase query error occurs (other than missing table errors)
 *
 * @example
 * const profiles = await listInvoiceProfiles();
 * console.log(`User has ${profiles.length} invoice profiles.`);
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
 * Automatically attaches the authenticated user's ID to the provided payload before insertion.
 *
 * @param payload - The invoice profile data to be inserted, excluding the user ID
 * @returns A promise that resolves to the newly created invoice profile
 * @throws {Error} If the user is not authenticated or a database insertion error occurs
 *
 * @example
 * const newProfile = await createInvoiceProfile({ title: 'Company', tax_office: 'Sisli' });
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
 * @param id - The unique UUID of the invoice profile to update
 * @param payload - The partial data containing the fields to update
 * @returns A promise that resolves to the updated invoice profile
 * @throws {Error} If the database update fails
 *
 * @example
 * const updatedProfile = await updateInvoiceProfile('prof-123', { title: 'Updated Company' });
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
 * Deletes an invoice profile from the database by its unique identifier.
 *
 * @param id - The unique UUID of the invoice profile to delete
 * @returns A promise that resolves to true if the deletion was successful
 * @throws {Error} If the database deletion operation fails
 *
 * @example
 * await deleteInvoiceProfile('prof-123');
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
 * First, it clears the `is_default` flag from all other profiles belonging to the user,
 * then sets the target profile as the default.
 *
 * @param id - The unique UUID of the invoice profile to set as default
 * @returns A promise that resolves to the newly defaulted invoice profile
 * @throws {Error} If the user is not authenticated or a database error occurs during the updates
 *
 * @example
 * const defaultProfile = await setDefaultInvoiceProfile('prof-123');
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
 * If multiple profiles are flagged as default, it returns the most recently updated one.
 * Suppresses database errors related to missing tables by returning null.
 *
 * @returns A promise that resolves to the default invoice profile, or null if none is found or if an expected missing-table error occurs
 * @throws {Error} If the user is not authenticated or an unexpected Supabase query error occurs
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile();
 * if (defaultProfile) {
 *   console.log('Using default profile:', defaultProfile.title);
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
