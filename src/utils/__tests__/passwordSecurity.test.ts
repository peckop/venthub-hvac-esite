import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sha1Hex, hibpPwnedCount } from '../passwordSecurity'

describe('passwordSecurity', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('sha1Hex', () => {
    it('should correctly hash a string to SHA-1 hex', async () => {
      // Hashing "password" results in 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
      const hash = await sha1Hex('password')
      expect(hash).toBe('5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8')
    })
  })

  describe('hibpPwnedCount', () => {
    it('should return the correct count when a match is found', async () => {
      // Prefix for "password": 5BAA6, Suffix: 1E4C9B93F3F0682250B6CF8331B7EE68FD8
      const mockResponseText = '00000000000000000000000000000000000:1\n1E4C9B93F3F0682250B6CF8331B7EE68FD8:9999\nFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:2'
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockResponseText)
      } as Response)

      const count = await hibpPwnedCount('password')
      expect(count).toBe(9999)
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.pwnedpasswords.com/range/5BAA6',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should return 0 when no match is found', async () => {
      const mockResponseText = '00000000000000000000000000000000000:1\nFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:2'
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockResponseText)
      } as Response)

      const count = await hibpPwnedCount('password')
      expect(count).toBe(0)
    })

    it('should retry once if the first request fails', async () => {
      const mockResponseText = '1E4C9B93F3F0682250B6CF8331B7EE68FD8:500'
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: false } as Response)
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockResponseText)
        } as Response)

      const count = await hibpPwnedCount('password')
      expect(count).toBe(500)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should return -1 if both API attempts fail', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: false } as Response)
        .mockResolvedValueOnce({ ok: false } as Response)

      const count = await hibpPwnedCount('password')
      expect(count).toBe(-1)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should return -1 if an exception is thrown during fetch', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const count = await hibpPwnedCount('password')
      expect(count).toBe(-1)
    })

    it('should handle malformed API response', async () => {
      const mockResponseText = 'INVALID_FORMAT_NO_COLON\n1E4C9B93F3F0682250B6CF8331B7EE68FD8:NaN'
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockResponseText)
      } as Response)

      const count = await hibpPwnedCount('password')
      expect(count).toBe(0) // parseInt('NaN') is NaN, Number.isFinite(NaN) is false -> returns 0
    })
  })
})
