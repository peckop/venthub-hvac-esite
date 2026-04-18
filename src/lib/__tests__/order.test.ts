import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateServerCart } from '../order';

describe('validateServerCart', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('should throw an error if environment variables are missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    await expect(validateServerCart({ cartId: 'cart1', userId: 'user1' })).rejects.toThrow('Missing Supabase envs');
  });

  it('should call fetch with correct parameters and return the response json', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    const mockResponse = {
      ok: true,
      items: [],
      mismatches: [],
      totals: { subtotal: 100 },
      cart_id: 'cart1'
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await validateServerCart({ cartId: 'cart1', userId: 'user1' });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:54321/functions/v1/order-validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: 'test-anon-key',
        Authorization: 'Bearer test-anon-key'
      },
      body: JSON.stringify({ cart_id: 'cart1', user_id: 'user1' })
    });
  });

  it('should throw an error with response text if fetch is not ok', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue('Edge function failed'),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(validateServerCart({ cartId: 'cart1', userId: 'user1' })).rejects.toThrow('Edge function failed');
  });
});
