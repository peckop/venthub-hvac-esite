import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Lists all invoice profiles for the currently authenticated user.
 *
 * @param supabase - The authenticated Supabase client instance
 * @returns A promise resolving to an array of invoice profiles, ordered by default status then creation date
 * @throws {PostgrestError} If the database query fails (unless the table is missing, which returns an empty array)
 *
 * @example
 * const profiles = await listInvoiceProfiles(supabase)
 * // returns [{ id: '1', title: 'Home', is_default: true, ... }]
 */
export async function listInvoiceProfiles(supabase: SupabaseClient<Database>): Promise<DbInvoiceProfile[]> {
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
 * @param supabase - The authenticated Supabase client instance
 * @param payload - The invoice profile data to insert
 * @returns A promise resolving to the newly created invoice profile
 * @throws {Error} If no user is authenticated
 * @throws {PostgrestError} If the database insert fails
 *
 * @example
 * const newProfile = await createInvoiceProfile(supabase, { title: 'Office', tax_office: 'Sisli', tax_number: '1234567890' })
 * // returns { id: '2', user_id: 'user-1', title: 'Office', ... }
 */
export async function createInvoiceProfile(
  supabase: SupabaseClient<Database>,
  payload: DbInvoiceProfileInsert
): Promise<DbInvoiceProfile> {
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
 *
 * @param supabase - The authenticated Supabase client instance
 * @param id - The ID of the invoice profile to update
 * @param payload - The partial invoice profile data to update
 * @returns A promise resolving to the updated invoice profile
 * @throws {PostgrestError} If the database update fails
 *
 * @example
 * const updated = await updateInvoiceProfile(supabase, '1', { title: 'New Office' })
 * // returns { id: '1', title: 'New Office', ... }
 */
export async function updateInvoiceProfile(
  supabase: SupabaseClient<Database>,
  id: string,
  payload: DbInvoiceProfileUpdate
): Promise<DbInvoiceProfile> {
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
 * @param supabase - The authenticated Supabase client instance
 * @param id - The ID of the invoice profile to delete
 * @returns A promise resolving to true if successful
 * @throws {PostgrestError} If the database deletion fails
 *
 * @example
 * await deleteInvoiceProfile(supabase, '1')
 * // returns true
 */
export async function deleteInvoiceProfile(supabase: SupabaseClient<Database>, id: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_invoice_profiles')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

/**
 * Sets a specific invoice profile as the default for the currently authenticated user.
 * Removes the default status from all other profiles for the user.
 *
 * @param supabase - The authenticated Supabase client instance
 * @param id - The ID of the invoice profile to set as default
 * @returns A promise resolving to the updated invoice profile
 * @throws {Error} If no user is authenticated
 * @throws {PostgrestError} If updating the default status fails
 *
 * @example
 * const newDefault = await setDefaultInvoiceProfile(supabase, '2')
 * // returns { id: '2', is_default: true, ... }
 */
export async function setDefaultInvoiceProfile(supabase: SupabaseClient<Database>, id: string): Promise<DbInvoiceProfile> {
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
 * Fetches the currently authenticated user's default invoice profile.
 *
 * @param supabase - The authenticated Supabase client instance
 * @returns A promise resolving to the default invoice profile, or null if none exists
 * @throws {Error} If no user is authenticated
 * @throws {PostgrestError} If the database query fails (unless the table is missing, which returns null)
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile(supabase)
 * // returns { id: '2', is_default: true, ... } or null
 */
export async function fetchDefaultInvoiceProfile(supabase: SupabaseClient<Database>): Promise<DbInvoiceProfile | null> {
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
