import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listInvoiceProfiles, createInvoiceProfile, updateInvoiceProfile, deleteInvoiceProfile, setDefaultInvoiceProfile, fetchDefaultInvoiceProfile } from '../invoice.service'
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
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis()
    }))
  }
}))

describe('invoice.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listInvoiceProfiles', () => {
    it('should list invoice profiles ordered by default and created_at', async () => {
      const mockProfiles = [{ id: 'inv-1', is_default: true }]

      const mockOrder2 = vi.fn().mockResolvedValue({ data: mockProfiles, error: null })
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: mockSelect
      }))

      const result = await listInvoiceProfiles()

      expect(result).toEqual(mockProfiles)
      expect(supabase.from).toHaveBeenCalledWith('user_invoice_profiles')
      expect(mockOrder1).toHaveBeenCalledWith('is_default', { ascending: false })
      expect(mockOrder2).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should handle missing table gracefully', async () => {
      const mockError = new Error("Could not find the table 'public.user_invoice_profiles'")
      const mockOrder2 = vi.fn().mockResolvedValue({ data: null, error: mockError })
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: mockSelect
      }))

      const result = await listInvoiceProfiles()

      expect(result).toEqual([])
    })
  })

  describe('createInvoiceProfile', () => {
    it('should throw an error if user is not authenticated', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: null }, error: null })
      await expect(createInvoiceProfile({ type: 'individual', first_name: 'John', last_name: 'Doe', tc_no: '12345678901', address_line: 'test', city: 'c', district: 'd' } as unknown as Parameters<typeof createInvoiceProfile>[0])).rejects.toThrow('Not authenticated')
    })

    it('should create an invoice profile and set default if requested', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

      const mockProfile = { id: 'inv-1', type: 'individual' }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

      const mockEqSet = vi.fn().mockReturnValue({ select: mockSelect })
      const mockEqClear = vi.fn().mockResolvedValue({ error: null })

      const mockUpdate = vi.fn().mockImplementation((patch) => {
        if (patch.is_default === false) {
           return { eq: vi.fn().mockReturnValue({ eq: mockEqClear }) }
        }
        if (patch.is_default === true) {
           return { eq: mockEqSet }
        }
        return {}
      })

      ;(supabase.from as import('vitest').Mock).mockImplementation((table) => {
        if (table === 'user_invoice_profiles') {
          return { insert: mockInsert, update: mockUpdate }
        }
        return {}
      })

      const result = await createInvoiceProfile({ type: 'individual', first_name: 'John', last_name: 'Doe', is_default: true, address_line: 'test', city: 'c', district: 'd' } as unknown as Parameters<typeof createInvoiceProfile>[0])

      expect(result).toEqual(mockProfile)
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1', type: 'individual' }))
    })
  })

  describe('updateInvoiceProfile', () => {
    it('should update and return an invoice profile', async () => {
      const mockProfile = { id: 'inv-1', full_name: 'Jane Doe' }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        update: mockUpdate
      }))

      const result = await updateInvoiceProfile('inv-1', { first_name: 'Jane', last_name: 'Doe' } as unknown as Parameters<typeof updateInvoiceProfile>[1])

      expect(result).toEqual(mockProfile)
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ first_name: 'Jane', last_name: 'Doe' }))
      expect(mockEq).toHaveBeenCalledWith('id', 'inv-1')
    })
  })

  describe('deleteInvoiceProfile', () => {
    it('should delete an invoice profile', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        delete: mockDelete
      }))

      const result = await deleteInvoiceProfile('inv-1')

      expect(result).toBe(true)
      expect(mockEq).toHaveBeenCalledWith('id', 'inv-1')
    })
  })

  describe('setDefaultInvoiceProfile', () => {
    it('should throw an error if user is not authenticated', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: null }, error: null })
      await expect(setDefaultInvoiceProfile('inv-1')).rejects.toThrow('Not authenticated')
    })

    it('should clear old defaults and set new default', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

      const mockProfile = { id: 'inv-1', is_default: true }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEqSet = vi.fn().mockReturnValue({ select: mockSelect })

      const mockEqClear = vi.fn().mockResolvedValue({ error: null })

      const mockUpdate = vi.fn().mockImplementation((patch) => {
        if (patch.is_default === false) {
          return { eq: vi.fn().mockReturnValue({ eq: mockEqClear }) }
        }
        if (patch.is_default === true) {
          return { eq: mockEqSet }
        }
        return {}
      })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        update: mockUpdate
      }))

      const result = await setDefaultInvoiceProfile('inv-1')

      expect(result).toEqual(mockProfile)
    })
  })

  describe('fetchDefaultInvoiceProfile', () => {
    it('should fetch the default invoice profile', async () => {
      ;(supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

      const mockProfile = { id: 'inv-1', is_default: true }

      const mockLimit = vi.fn().mockResolvedValue({ data: [mockProfile], error: null })
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockEqIsDefault = vi.fn().mockReturnValue({ order: mockOrder })
      const mockEqUserId = vi.fn().mockReturnValue({ eq: mockEqIsDefault })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEqUserId })

      ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: mockSelect
      }))

      const result = await fetchDefaultInvoiceProfile()

      expect(result).toEqual(mockProfile)
      expect(mockEqUserId).toHaveBeenCalledWith('user_id', 'user-1')
      expect(mockEqIsDefault).toHaveBeenCalledWith('is_default', true)
    })
  })
})
