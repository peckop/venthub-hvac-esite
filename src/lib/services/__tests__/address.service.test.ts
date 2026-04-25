import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../address.service'
import { supabase } from '../../supabase'

vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

describe('address.service', () => {
  const mockUser = { id: 'user-123' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listAddresses', () => {
    it('should list addresses correctly', async () => {
      const mockAddresses = [{ id: 'addr-1' }, { id: 'addr-2' }]

      const mockOrder2 = vi.fn().mockResolvedValue({ data: mockAddresses, error: null })
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as unknown as never)

      const result = await listAddresses()

      expect(result).toEqual(mockAddresses)
      expect(supabase.from).toHaveBeenCalledWith('user_addresses')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder1).toHaveBeenCalledWith('is_default_shipping', { ascending: false })
      expect(mockOrder2).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should throw error if query fails', async () => {
      const dbError = new Error('DB Error')
      const mockOrder2 = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as unknown as never)

      await expect(listAddresses()).rejects.toThrow('DB Error')
    })
  })

  describe('createAddress', () => {
    it('should create an address and set it as default shipping if requested', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null } as unknown as never)

      const mockPayload = { address_line: '123 Main St', city: 'Istanbul', country: 'TR', is_default_shipping: true }
      const mockCreatedAddress = { id: 'addr-1', ...mockPayload, user_id: mockUser.id }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockCreatedAddress, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

      // We also mock the setDefaultAddress calls
      // It uses update under the hood, we must mock it carefully if it's called
      const mockUpdateSingle = vi.fn().mockResolvedValue({ data: mockCreatedAddress, error: null })
      const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle })
      const mockUpdateEq2 = vi.fn().mockReturnValue({ select: mockUpdateSelect })
      const mockUpdateEq1 = vi.fn().mockResolvedValue({ error: null })
      const mockUpdate = vi.fn().mockImplementation((payload) => {
        if ('is_default_shipping' in payload && payload.is_default_shipping === false) {
           return { eq: mockUpdateEq1 } // Clear patch
        }
        return { eq: mockUpdateEq2 } // Set patch
      })

      vi.mocked(supabase.from).mockImplementation((table: unknown) => {
        if (table === 'user_addresses') {
          return {
            insert: mockInsert,
            update: mockUpdate,
          } as unknown as never
        }
        return {} as unknown as never
      })

      const result = await createAddress(mockPayload as unknown as never)

      expect(result).toEqual(mockCreatedAddress)
      expect(supabase.auth.getUser).toHaveBeenCalled()
      expect(mockInsert).toHaveBeenCalledWith({
         ...mockPayload,
         user_id: mockUser.id,
         street_address: '123 Main St',
         address_type: 'shipping'
      })
    })

    it('should throw if not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: null } as unknown as never)

      await expect(createAddress({} as unknown as never)).rejects.toThrow('Not authenticated')
    })
  })

  describe('updateAddress', () => {
     it('should update address properties', async () => {
      const mockPayload = { city: 'Ankara', address_line: '456 New St' }
      const mockUpdatedAddress = { id: 'addr-1', city: 'Ankara', street_address: '456 New St' }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedAddress, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })

      vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as unknown as never)

      const result = await updateAddress('addr-1', mockPayload)

      expect(result).toEqual(mockUpdatedAddress)
      expect(mockUpdate).toHaveBeenCalledWith({ ...mockPayload, street_address: '456 New St' })
      expect(mockEq).toHaveBeenCalledWith('id', 'addr-1')
     })
  })

  describe('deleteAddress', () => {
     it('should delete an address', async () => {
        const mockEq = vi.fn().mockResolvedValue({ error: null })
        const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
        vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as unknown as never)

        const result = await deleteAddress('addr-1')

        expect(result).toBe(true)
        expect(supabase.from).toHaveBeenCalledWith('user_addresses')
        expect(mockDelete).toHaveBeenCalled()
        expect(mockEq).toHaveBeenCalledWith('id', 'addr-1')
     })
  })

  describe('setDefaultAddress', () => {
     it('should clear old defaults and set new one', async () => {
       vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null } as unknown as never)

       const mockSetData = { id: 'addr-1', is_default_shipping: true }

       const mockSetSingle = vi.fn().mockResolvedValue({ data: mockSetData, error: null })
       const mockSetSelect = vi.fn().mockReturnValue({ single: mockSetSingle })
       const mockSetEq = vi.fn().mockReturnValue({ select: mockSetSelect })

       const mockClearEq = vi.fn().mockResolvedValue({ error: null })

       const mockUpdate = vi.fn().mockImplementation((payload) => {
         if (payload.is_default_shipping === false) {
            return { eq: mockClearEq }
         }
         return { eq: mockSetEq }
       })

       vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as unknown as never)

       const result = await setDefaultAddress('shipping', 'addr-1')

       expect(result).toEqual(mockSetData)
       expect(mockUpdate).toHaveBeenCalledWith({ is_default_shipping: false })
       expect(mockClearEq).toHaveBeenCalledWith('user_id', mockUser.id)

       expect(mockUpdate).toHaveBeenCalledWith({ is_default_shipping: true })
       expect(mockSetEq).toHaveBeenCalledWith('id', 'addr-1')
     })
  })
})
