import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Retrieves a list of all invoice profiles for the authenticated user.
 * Profiles are ordered by default status first, then by creation date.
 *
 * @returns A promise resolving to an array of invoice profiles, or an empty array if none exist.
 * @throws {Error} If the database query fails.
 *
 * @example
 * const profiles = await listInvoiceProfiles()
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
 * @param payload - The invoice profile data to insert.
 * @returns A promise resolving to the newly created invoice profile.
 * @throws {Error} If the user is not authenticated or the insertion fails.
 *
 * @example
 * const newProfile = await createInvoiceProfile({ title: 'Company Profile', tax_id: '123' })
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
 * Updates an existing invoice profile with the provided data.
 *
 * @param id - The unique identifier of the invoice profile to update.
 * @param payload - Partial data to update on the profile.
 * @returns A promise resolving to the updated invoice profile.
 * @throws {Error} If the update operation fails.
 *
 * @example
 * const updated = await updateInvoiceProfile('profile-uuid', { title: 'Updated Title' })
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
 * Deletes an invoice profile by its identifier.
 *
 * @param id - The unique identifier of the invoice profile to delete.
 * @returns A promise resolving to true upon successful deletion.
 * @throws {Error} If the deletion operation fails.
 *
 * @example
 * await deleteInvoiceProfile('profile-uuid')
 */
export async function deleteInvoiceProfile(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_invoice_profiles')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

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
