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
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    }))
  }
}))

describe('address.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listAddresses', () => {
    it('should return addresses list', async () => {
      const mockAddresses = [{ id: 'addr1', street_address: '123 Main' }];
      const orderMock2 = vi.fn().mockResolvedValue({ data: mockAddresses, error: null });
      const orderMock1 = vi.fn().mockReturnValue({ order: orderMock2 });
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: orderMock1
      }));
      const res = await listAddresses();
      expect(res).toEqual(mockAddresses);
    });

    it('should throw error on failure', async () => {
      const orderMock2 = vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') });
      const orderMock1 = vi.fn().mockReturnValue({ order: orderMock2 });
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: orderMock1
      }));
      await expect(listAddresses()).rejects.toThrow('DB error');
    });
  });

  describe('createAddress', () => {
    it('should throw error if user not authenticated', async () => {
      (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: null }, error: null });
      await expect(createAddress({ address_line: '123 Main', city: 'Istanbul', district: 'Besiktas', street_address: '123 Main', user_id: 'u1' } as unknown as Parameters<typeof createAddress>[0])).rejects.toThrow('Not authenticated');
    });

    it('should return created address', async () => {
      const mockAddr = { id: 'addr1', title: 'Home', user_id: 'u1' };
      (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAddr, error: null })
      }));
      const res = await createAddress({ address_line: '123 Main', city: 'Istanbul', district: 'Besiktas', street_address: '123 Main', user_id: 'u1' } as unknown as Parameters<typeof createAddress>[0]);
      expect(res).toEqual(mockAddr);
    });

    it('should set default if requested', async () => {
      const mockAddr = { id: 'addr1', title: 'Home', user_id: 'u1' };
      (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

      const fromMock = vi.fn();

      // Mocks for both create and setDefaultAddress chain calls
      fromMock.mockImplementation(( _table ) => {
         return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockAddr, error: null }),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockImplementation(() => ({
               select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockAddr, error: null }) }),
               error: null // return error null for clear default eq block
            }))
         }
      });
      (supabase.from as import('vitest').Mock).mockImplementation(fromMock);

      const res = await createAddress({ address_line: '123 Main', city: 'Istanbul', district: 'Besiktas', street_address: '123 Main', user_id: 'u1', is_default_shipping: true } as unknown as Parameters<typeof createAddress>[0]);
      expect(res).toEqual(mockAddr);
    });
  });

  describe('updateAddress', () => {
    it('should update and return address', async () => {
      const mockAddr = { id: 'addr1', title: 'Home' };
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAddr, error: null })
      }));
      const res = await updateAddress('addr1', { address_line: '123 Main', city: 'Istanbul', district: 'Besiktas', street_address: '123 Main', user_id: 'u1' });
      expect(res).toEqual(mockAddr);
    });
  });

  describe('deleteAddress', () => {
    it('should delete address and return true', async () => {
      (supabase.from as import('vitest').Mock).mockImplementation(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }));
      const res = await deleteAddress('addr1');
      expect(res).toBe(true);
    });
  });

  describe('setDefaultAddress', () => {
    it('should throw error if user not authenticated', async () => {
      (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: null }, error: null });
      await expect(setDefaultAddress('shipping', 'addr1')).rejects.toThrow('Not authenticated');
    });

    it('should clear old defaults and set new default', async () => {
      const mockAddr = { id: 'addr1', is_default_shipping: true };
      (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

      const fromMock = vi.fn();

      fromMock.mockImplementation(( _table ) => {
         return {
            update: vi.fn().mockImplementation((payload) => {
               if (payload.is_default_shipping === false) {
                  return { eq: vi.fn().mockResolvedValue({ error: null }) };
               } else {
                  return { eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockAddr, error: null }) }) }) };
               }
            })
         }
      });
      (supabase.from as import('vitest').Mock).mockImplementation(fromMock);

      const res = await setDefaultAddress('shipping', 'addr1');
      expect(res).toEqual(mockAddr);
    });
  });
});
