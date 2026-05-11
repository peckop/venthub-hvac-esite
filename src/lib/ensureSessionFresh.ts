import { supabase } from './supabase'

const REFRESH_MARGIN_SEC = 60 // 60 saniye kala yenile

/**
 * Ensures the current Supabase authentication session is fresh before performing data operations.
 *
 * Checks the session's expiration timestamp and silently refreshes the session if it expires
 * within the next 60 seconds. Any errors during the refresh are logged but do not throw,
 * preventing UI blocks during data fetching.
 *
 * @returns A promise that resolves when the session check and potential refresh are complete
 *
 * @example
 * await ensureSessionFresh();
 * const { data } = await supabase.from('products').select();
 */
export async function ensureSessionFresh(): Promise<void> {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return // Oturum yok, yapılacak bir şey yok

        const expiresAt = session.expires_at // Unix timestamp (saniye)
        if (!expiresAt) return

        const nowSec = Math.floor(Date.now() / 1000)
        const remaining = expiresAt - nowSec

        if (remaining < REFRESH_MARGIN_SEC) {
            // Token süresi dolmak üzere veya dolmuş — yenile
            await supabase.auth.refreshSession()
        }
    } catch (err) {
        // Sessizce logla, veri çekmeyi engelleme
        console.warn('[ensureSessionFresh] refresh failed:', err)
    }
}
