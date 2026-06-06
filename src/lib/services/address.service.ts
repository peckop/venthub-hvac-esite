import { supabaseBrowserClient } from '../supabase/client'
import { supabaseStaticClient } from '../supabase/static'
import type { DbUserAddress, DbUserAddressInsert, DbUserAddressUpdate } from '../../types/db-rows'

const defaultClient = typeof window !== 'undefined' ? supabaseBrowserClient : supabaseStaticClient

/**
 * Retrieves a list of all addresses for the authenticated user.
 * Addresses are ordered by default shipping status first, then by creation date descending.
 *
 * @returns A promise resolving to an array of user address objects
 * @throws {Error} If the database query fails
 *
 * @example
 * const addresses = await listAddresses();
 * console.log(`Found ${addresses.length} addresses.`);
 */
export async function listAddresses(supabase = defaultClient): Promise<DbUserAddress[]> {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .order('is_default_shipping', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DbUserAddress[]) || []
}

/**
 * Creates a new address for the authenticated user.
 * Automatically sets the address as default if specified in the payload.
 *
 * @param payload - The data for the new address to be created
 * @returns A promise resolving to the newly created address object
 * @throws {Error} If the user is not authenticated or the database insert fails
 *
 * @example
 * const newAddress = await createAddress({
 *   title: 'Home',
 *   address_line: '123 Main St',
 *   city: 'Istanbul',
 *   country: 'TR',
 *   is_default_shipping: true
 * });
 */
export async function createAddress(payload: DbUserAddressInsert, supabase = defaultClient): Promise<DbUserAddress> {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const dbPayload: DbUserAddressInsert = {
    ...payload,
    user_id: user.id,
    street_address: payload.street_address || payload.address_line,
    address_type: payload.address_type || (payload.is_default_shipping ? 'shipping' : 'billing')
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert(dbPayload)
    .select('*')
    .single()

  if (error) throw error

  if (payload.is_default_shipping) await setDefaultAddress('shipping', data.id, supabase)
  if (payload.is_default_billing) await setDefaultAddress('billing', data.id, supabase)

  return data as DbUserAddress
}

/**
 * Updates an existing address for the authenticated user.
 * Automatically handles setting the address as default if specified in the payload.
 *
 * @param id - The unique identifier of the address to update
 * @param payload - The partial data to update the address with
 * @returns A promise resolving to the updated address object
 * @throws {Error} If the database update fails
 *
 * @example
 * const updatedAddress = await updateAddress('address-123', {
 *   city: 'Ankara',
 *   is_default_billing: true
 * });
 */
export async function updateAddress(id: string, payload: DbUserAddressUpdate, supabase = defaultClient): Promise<DbUserAddress> {
  const updatePatch: DbUserAddressUpdate = { ...payload }
  if (payload.address_line) {
    updatePatch.street_address = payload.address_line
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .update(updatePatch)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  if (payload.is_default_shipping) await setDefaultAddress('shipping', id, supabase)
  if (payload.is_default_billing) await setDefaultAddress('billing', id, supabase)

  return data as DbUserAddress
}

/**
 * Deletes a specific address by its ID for the authenticated user.
 *
 * @param id - The unique identifier of the address to delete
 * @returns A promise resolving to true if the deletion was successful
 * @throws {Error} If the database deletion fails
 *
 * @example
 * await deleteAddress('address-123');
 */
export async function deleteAddress(id: string, supabase = defaultClient): Promise<boolean> {
  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

/**
 * Sets a specific address as the default shipping or billing address.
 * Automatically clears the default flag from any previously set default addresses of the same kind.
 *
 * @param kind - The type of default address to set ('shipping' or 'billing')
 * @param id - The unique identifier of the address to set as default
 * @returns A promise resolving to the updated address object
 * @throws {Error} If the user is not authenticated or the database updates fail
 *
 * @example
 * const defaultShipping = await setDefaultAddress('shipping', 'address-123');
 */
export async function setDefaultAddress(kind: 'shipping' | 'billing', id: string, supabase = defaultClient): Promise<DbUserAddress> {
  const { data: authData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const user = authData?.user
  if (!user) throw new Error('Not authenticated')

  const flag: 'is_default_shipping' | 'is_default_billing' = kind === 'shipping' ? 'is_default_shipping' : 'is_default_billing'

  // Clear others
  const clearPatch: DbUserAddressUpdate = { [flag]: false }
  const clear = await supabase
    .from('user_addresses')
    .update(clearPatch)
    .eq('user_id', user.id)

  if (clear.error) throw clear.error

  const setPatch: DbUserAddressUpdate = { [flag]: true }
  const { data, error } = await supabase
    .from('user_addresses')
    .update(setPatch)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as DbUserAddress
}
