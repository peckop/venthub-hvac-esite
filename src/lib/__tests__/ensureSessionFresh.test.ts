import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ensureSessionFresh } from '../ensureSessionFresh'
import { supabase } from '../supabase'
import type { Session } from '@supabase/supabase-js'

// Mock supabase client
vi.mock('../supabase', () => {
    return {
        supabase: {
            auth: {
                getSession: vi.fn(),
                refreshSession: vi.fn(),
            }
        }
    }
})

describe('ensureSessionFresh', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        // Set fixed current time to 1000 seconds (1,000,000 ms) for predictable testing
        vi.setSystemTime(1000000)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should do nothing if there is no session', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
            data: { session: null },
            error: null
        })

        await ensureSessionFresh()

        expect(supabase.auth.getSession).toHaveBeenCalledTimes(1)
        expect(supabase.auth.refreshSession).not.toHaveBeenCalled()
    })

    it('should do nothing if session lacks expires_at', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
            data: { session: { expires_at: undefined } as unknown as Session },
            error: null
        })

        await ensureSessionFresh()

        expect(supabase.auth.refreshSession).not.toHaveBeenCalled()
    })

    it('should not refresh if remaining time is well above margin (e.g. 100 seconds)', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
            data: { session: { expires_at: 1100 } as unknown as Session }, // 1100 - 1000 = 100s remaining
            error: null
        })

        await ensureSessionFresh()

        expect(supabase.auth.refreshSession).not.toHaveBeenCalled()
    })

    it('should refresh if remaining time is below or equal to margin (e.g. 59 seconds)', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
            data: { session: { expires_at: 1059 } as unknown as Session }, // 1059 - 1000 = 59s remaining
            error: null
        })

        await ensureSessionFresh()

        expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1)
    })

    it('should refresh if token is already expired', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
            data: { session: { expires_at: 900 } as unknown as Session }, // 900 - 1000 = -100s remaining
            error: null
        })

        await ensureSessionFresh()

        expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1)
    })

    it('should gracefully catch and log errors without throwing', async () => {
        const error = new Error('Network error')
        vi.mocked(supabase.auth.getSession).mockRejectedValueOnce(error)
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        await expect(ensureSessionFresh()).resolves.toBeUndefined()

        expect(warnSpy).toHaveBeenCalledWith('[ensureSessionFresh] refresh failed:', error)

        warnSpy.mockRestore()
    })
})
