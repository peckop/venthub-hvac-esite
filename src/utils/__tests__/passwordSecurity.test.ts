import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sha1Hex, hibpPwnedCount } from '../passwordSecurity'

describe('passwordSecurity', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sha1Hex', () => {
    it('should correctly hash the password to SHA-1 hex', async () => {
      const hash = await sha1Hex('password')
      expect(hash).toBe('5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8')
    })
  })

  describe('hibpPwnedCount', () => {
    const mockHashPrefix = '5BAA6'
    const mockHashSuffix = '1E4C9B93F3F0682250B6CF8331B7EE68FD8'

    it('should return matching count when suffix is found', async () => {
      const mockText = `00000000000000000000000000000000000:1\n${mockHashSuffix}:3861493\nFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:2`
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: async () => mockText
      } as Response)

      const count = await hibpPwnedCount('password')
      expect(count).toBe(3861493)
      expect(fetch).toHaveBeenCalledWith(`https://api.pwnedpasswords.com/range/${mockHashPrefix}`, expect.any(Object))
    })

    it('should return 0 when suffix is not found', async () => {
      const mockText = `00000000000000000000000000000000000:1\nFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:2`
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: async () => mockText
      } as Response)

      const count = await hibpPwnedCount('password')
      expect(count).toBe(0)
    })

    it('should return -1 when the first request fails and retry fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false
      } as Response)

      const count = await hibpPwnedCount('password')
      expect(count).toBe(-1)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should retry and return count if the first request fails but second succeeds', async () => {
      const mockText = `${mockHashSuffix}:42`
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: false } as Response)
        .mockResolvedValueOnce({ ok: true, text: async () => mockText } as Response)

      const count = await hibpPwnedCount('password')
      expect(count).toBe(42)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should return -1 when fetch throws an error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const count = await hibpPwnedCount('password')
      expect(count).toBe(-1)
    })
  })
})
