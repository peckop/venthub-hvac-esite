import { supabase } from '../supabase'
import type { DbUserAddress, DbUserAddressInsert, DbUserAddressUpdate } from '../../types/db-rows'

export async function listAddresses(): Promise<DbUserAddress[]> {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .order('is_default_shipping', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DbUserAddress[]) || []
}

export async function createAddress(payload: DbUserAddressInsert): Promise<DbUserAddress> {
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

  if (payload.is_default_shipping) await setDefaultAddress('shipping', data.id)
  if (payload.is_default_billing) await setDefaultAddress('billing', data.id)

  return data as DbUserAddress
}

export async function updateAddress(id: string, payload: DbUserAddressUpdate): Promise<DbUserAddress> {
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

  if (payload.is_default_shipping) await setDefaultAddress('shipping', id)
  if (payload.is_default_billing) await setDefaultAddress('billing', id)

  return data as DbUserAddress
}

export async function deleteAddress(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function setDefaultAddress(kind: 'shipping' | 'billing', id: string): Promise<DbUserAddress> {
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
