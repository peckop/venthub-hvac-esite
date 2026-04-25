import { supabase } from '../supabase'
import type { DbInvoiceProfile, DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '../../types/db-rows'

/**
 * Retrieves all invoice profiles associated with the currently authenticated user.
 * Results are ordered first by their default status, then by creation date.
 *
 * @returns A promise resolving to an array of database invoice profiles
 * @throws {Error} If the database query fails unexpectedly
 *
 * @example
 * const profiles = await listInvoiceProfiles()
 * console.log(profiles[0]?.company_name)
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
 * Creates a new invoice profile and links it to the currently authenticated user.
 *
 * @param payload - The data required to insert a new invoice profile
 * @returns A promise resolving to the newly created invoice profile record
 * @throws {Error} If the user is not authenticated or the database insert fails
 *
 * @example
 * const newProfile = await createInvoiceProfile({ company_name: 'Tech Corp', tax_number: '123' })
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
 * Updates an existing invoice profile by its unique ID.
 *
 * @param id - The UUID of the invoice profile to update
 * @param payload - The partial data used to update the profile
 * @returns A promise resolving to the updated invoice profile record
 * @throws {Error} If the database update operation fails
 *
 * @example
 * const updated = await updateInvoiceProfile('profile-123', { tax_office: 'Sisli' })
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
 * Deletes an invoice profile from the database using its unique ID.
 *
 * @param id - The UUID of the invoice profile to remove
 * @returns A promise resolving to true on successful deletion
 * @throws {Error} If the database deletion operation fails
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
 * Sets a specific invoice profile as the default for the current user.
 * Automatically clears the default flag from any other profiles owned by the user.
 *
 * @param id - The UUID of the invoice profile to mark as default
 * @returns A promise resolving to the updated invoice profile record
 * @throws {Error} If the user is unauthenticated or the database operations fail
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
 * If no default profile is explicitly set, or the table is missing, returns null.
 *
 * @returns A promise resolving to the default database invoice profile, or null if none exists
 * @throws {Error} If the user is unauthenticated or an unexpected database error occurs
 *
 * @example
 * const defaultProfile = await fetchDefaultInvoiceProfile()
 * if (defaultProfile) console.log(`Default billing entity: ${defaultProfile.company_name}`)
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
