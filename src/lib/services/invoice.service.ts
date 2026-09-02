import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Fetches all invoice profiles for the currently authenticated user.
 * Results are ordered by default profile first, then by creation date descending.
 *
 * @param supabase - The Supabase client instance
 * @returns A promise that resolves to an array of invoice profiles
 * @throws {PostgrestErrorExtended} If a database error occurs (except for missing table which returns [])
 *
 * @example
 * const profiles = await listInvoiceProfiles(supabase)
 * console.log(profiles[0].is_default) // true (if one exists)
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
 * @param supabase - The Supabase client instance
 * @param payload - The invoice profile data to insert (excluding user_id which is auto-filled)
 * @returns A promise that resolves to the newly created invoice profile
 * @throws {Error} If the user is not authenticated or a database error occurs
 *
 * @example
 * const newProfile = await createInvoiceProfile(supabase, { title: 'My Company', tax_office: 'Kadikoy' })
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
 * Updates an existing invoice profile by ID.
 *
 * @param supabase - The Supabase client instance
 * @param id - The UUID of the invoice profile to update
 * @param payload - The partial profile data to update
 * @returns A promise that resolves to the updated invoice profile
 * @throws {PostgrestError} If a database error occurs
 *
 * @example
 * const updated = await updateInvoiceProfile(supabase, 'profile-123', { title: 'Updated Company' })
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
 * Deletes an invoice profile by ID.
 *
 * @param supabase - The Supabase client instance
 * @param id - The UUID of the invoice profile to delete
 * @returns A promise that resolves to true if successful
 * @throws {PostgrestError} If a database error occurs
 *
 * @example
 * await deleteInvoiceProfile(supabase, 'profile-123')
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
 * Automatically clears the default flag from any other profiles owned by the user.
 *
 * @param supabase - The Supabase client instance
 * @param id - The UUID of the invoice profile to make default
 * @returns A promise that resolves to the updated default invoice profile
 * @throws {Error} If the user is not authenticated or a database error occurs
 *
 * @example
 * const newDefault = await setDefaultInvoiceProfile(supabase, 'profile-123')
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
 * Retrieves the current default invoice profile for the authenticated user.
 *
 * @param supabase - The Supabase client instance
 * @returns A promise that resolves to the default invoice profile, or null if none exists
 * @throws {Error} If the user is not authenticated, or if a database error occurs (except missing table)
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile(supabase)
 * if (defaultProfile) console.log(defaultProfile.tax_no)
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
