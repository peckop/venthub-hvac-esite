import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Retrieves all invoice profiles associated with the current user.
 * Profiles are ordered by default status first, then by creation date descending.
 *
 * @returns A promise that resolves to an array of invoice profiles, or an empty array if none exist or table is missing.
 * @throws {Error} If a database query fails due to an unexpected error.
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
 *
 * @param payload - The data required to create a new invoice profile (excluding user_id).
 * @returns A promise that resolves to the newly created invoice profile.
 * @throws {Error} If the user is not authenticated or the database insert fails.
 *
 * @example
 * const newProfile = await createInvoiceProfile({ title: 'Company Address', tax_no: '1234567890', tax_office: 'Sisli' });
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
 * @param id - The unique identifier of the invoice profile to update.
 * @param payload - The partial data to update in the invoice profile.
 * @returns A promise that resolves to the updated invoice profile.
 * @throws {Error} If the database update operation fails.
 *
 * @example
 * const updatedProfile = await updateInvoiceProfile('profile-123', { title: 'Updated Office Address' });
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
 * @param id - The unique identifier of the invoice profile to delete.
 * @returns A promise that resolves to true if the deletion was successful.
 * @throws {Error} If the database delete operation fails.
 *
 * @example
 * await deleteInvoiceProfile('profile-123');
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
 * It removes the default flag from all other profiles belonging to the user.
 *
 * @param id - The unique identifier of the invoice profile to set as default.
 * @returns A promise that resolves to the updated invoice profile that is now the default.
 * @throws {Error} If the user is not authenticated or the database updates fail.
 *
 * @example
 * const defaultProfile = await setDefaultInvoiceProfile('profile-123');
 * console.log(`Profile ${defaultProfile.id} is now the default.`);
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
 *
 * @returns A promise that resolves to the default invoice profile, or null if none is found or the table is missing.
 * @throws {Error} If the user is not authenticated or an unexpected database error occurs.
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile();
 * if (defaultProfile) console.log(`Default profile tax office: ${defaultProfile.tax_office}`);
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
