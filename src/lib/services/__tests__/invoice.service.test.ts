import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listInvoiceProfiles,
  createInvoiceProfile,
  updateInvoiceProfile,
  deleteInvoiceProfile,
  setDefaultInvoiceProfile,
  fetchDefaultInvoiceProfile
} from '../invoice.service'
import { supabase } from '../../supabase'

vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    }))
  }
}))

describe('invoice.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listInvoiceProfiles', () => {
    it('should return invoice profiles', async () => {
      const mockProfiles = [{ id: 'ip1', profile_type: 'individual' }];
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        mockResolvedValueOnce: { data: mockProfiles, error: null }
      }));
      const orderMock2 = vi.fn().mockResolvedValue({ data: mockProfiles, error: null });
      const orderMock1 = vi.fn().mockReturnValue({ order: orderMock2 });
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: orderMock1
      }));

      const res = await listInvoiceProfiles();
      expect(res).toEqual(mockProfiles);
    });

    it('should return empty array on specific table not found error', async () => {
      const orderMock2 = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST205', message: 'Not found' } });
      const orderMock1 = vi.fn().mockReturnValue({ order: orderMock2 });
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: orderMock1
      }));
      const res = await listInvoiceProfiles();
      expect(res).toEqual([]);
    });
  });

  describe('createInvoiceProfile', () => {
    it('should throw error if user not authenticated', async () => {
      (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: null }, error: null });
      await expect(createInvoiceProfile({ profile_type: 'individual', address_line: 'x', city: 'x', district: 'x', user_id: 'u1' })).rejects.toThrow('Not authenticated');
    });

    it('should return created profile', async () => {
      const mockProfile = { id: 'ip1', profile_type: 'individual', user_id: 'u1' };
      (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
      }));
      const res = await createInvoiceProfile({ profile_type: 'individual', address_line: 'x', city: 'x', district: 'x', user_id: 'u1' });
      expect(res).toEqual(mockProfile);
    });
  });

  describe('updateInvoiceProfile', () => {
    it('should update and return profile', async () => {
      const mockProfile = { id: 'ip1', profile_type: 'corporate' };
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
      }));
      const res = await updateInvoiceProfile('ip1', { profile_type: 'corporate' });
      expect(res).toEqual(mockProfile);
    });
  });

  describe('deleteInvoiceProfile', () => {
    it('should delete and return true', async () => {
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }));
      const res = await deleteInvoiceProfile('ip1');
      expect(res).toBe(true);
    });
  });

  describe('setDefaultInvoiceProfile', () => {
    it('should set default and clear others', async () => {
      const mockProfile = { id: 'ip1', is_default: true };
      (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

      (supabase.from as import('vitest').Mock).mockImplementation(( _table ) => {
        return {
          update: vi.fn().mockImplementation((payload) => {
             if (payload.is_default === false) {
                 return { eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) }
             } else {
                 return { eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }) }) }) }
             }
          })
        }
      });

      const res = await setDefaultInvoiceProfile('ip1');
      expect(res).toEqual(mockProfile);
    });
  });

  describe('fetchDefaultInvoiceProfile', () => {
    it('should return default profile', async () => {
      const mockProfile = { id: 'ip1', is_default: true };
      (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

      const limitMock = vi.fn().mockResolvedValue({ data: [mockProfile], error: null });

      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue({
             eq: vi.fn().mockReturnValue({
                 order: vi.fn().mockReturnValue({
                     limit: limitMock
                 })
             })
        })
      }));

      const res = await fetchDefaultInvoiceProfile();
      expect(res).toEqual(mockProfile);
    });
  });
});
