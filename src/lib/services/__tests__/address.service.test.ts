import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../address.service'
import { supabase } from '../../supabase'

vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis()
    }))
  }
}))

describe('address.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listAddresses', () => {
    it('should list user addresses ordered by default shipping and created_at', async () => {
      const mockAddresses = [{ id: 'addr-1', is_default_shipping: true }]

      const mockOrder2 = vi.fn().mockResolvedValue({ data: mockAddresses, error: null })
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: mockSelect
      }))

      const result = await listAddresses()

      expect(result).toEqual(mockAddresses)
      expect(supabase.from).toHaveBeenCalledWith('user_addresses')
      expect(mockOrder1).toHaveBeenCalledWith('is_default_shipping', { ascending: false })
      expect(mockOrder2).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should throw an error if fetch fails', async () => {
      const mockOrder2 = vi.fn().mockResolvedValue({ data: null, error: new Error('Fetch error') })
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: mockSelect
      }))

      await expect(listAddresses()).rejects.toThrow('Fetch error')
    })
  })

  describe('createAddress', () => {
    it('should throw an error if user is not authenticated', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: null }, error: null })
      await expect(createAddress({ title: 'Home', address_line: '123 St', city: 'City', country: 'Country', district: 'dist', full_name: 'Name', phone: '123', address_type: 'shipping', user_id: 'user-1' } as unknown as Parameters<typeof createAddress>[0])).rejects.toThrow('Not authenticated')
    })

    it('should create an address and return it', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

      const mockAddress = { id: 'addr-1', title: 'Home' }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockAddress, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        insert: mockInsert
      }))

      const result = await createAddress({ title: 'Home', address_line: '123 St', city: 'City', country: 'Country', district: 'dist', full_name: 'Name', phone: '123', address_type: 'shipping', user_id: 'user-1' } as unknown as Parameters<typeof createAddress>[0])

      expect(result).toEqual(mockAddress)
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1' }))
    })

    it('should set default address if flags are provided', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

      const mockAddress = { id: 'addr-1', title: 'Home' }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockAddress, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

      ;(supabase.from as import('vitest').Mock).mockImplementation((table) => {
        if (table === 'user_addresses') {
          return { insert: mockInsert, update: mockUpdate }
        }
        return {}
      })

      // The createAddress sets up clear/update for defaults too
      // The update clear mock for setDefaultAddress
      mockEq.mockResolvedValueOnce({ error: null }) // clear mock

      const result = await createAddress({ address_line: '123 St', city: 'City', country: 'Country', is_default_shipping: true, full_name: 'Name', phone: '123', district: 'd', address_type: 'shipping', user_id: 'user-1' })

      expect(result).toEqual(mockAddress)
    })
  })

  describe('updateAddress', () => {
    it('should update and return an address', async () => {
      const mockAddress = { id: 'addr-1', city: 'New City' }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockAddress, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        update: mockUpdate
      }))

      const result = await updateAddress('addr-1', { city: 'New City' } as unknown as Parameters<typeof updateAddress>[1])

      expect(result).toEqual(mockAddress)
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ city: 'New City' }))
      expect(mockEq).toHaveBeenCalledWith('id', 'addr-1')
    })
  })

  describe('deleteAddress', () => {
    it('should delete an address', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        delete: mockDelete
      }))

      const result = await deleteAddress('addr-1')

      expect(result).toBe(true)
      expect(mockEq).toHaveBeenCalledWith('id', 'addr-1')
    })
  })

  describe('setDefaultAddress', () => {
    it('should throw an error if user is not authenticated', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: null }, error: null })
      await expect(setDefaultAddress('shipping', 'addr-1')).rejects.toThrow('Not authenticated')
    })

    it('should clear old defaults and set new default', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

      const mockAddress = { id: 'addr-1', is_default_shipping: true }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockAddress, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEqSet = vi.fn().mockReturnValue({ select: mockSelect })

      const mockEqClear = vi.fn().mockResolvedValue({ error: null })

      const mockUpdate = vi.fn().mockImplementation((patch) => {
        if (patch.is_default_shipping === false) {
          return { eq: mockEqClear }
        }
        if (patch.is_default_shipping === true) {
          return { eq: mockEqSet }
        }
        return {}
      })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        update: mockUpdate
      }))

      const result = await setDefaultAddress('shipping', 'addr-1')

      expect(result).toEqual(mockAddress)
    })
  })
})
