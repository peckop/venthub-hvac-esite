/**
 * Ensures the Supabase authentication session is fresh before making critical API calls.
 * Checks the token's expiration time and silently refreshes it if it expires within the next 60 seconds.
 * Fails silently by logging a warning to prevent blocking the application if the refresh fails.
 *
 * @returns A promise that resolves when the session check and potential refresh are complete
 * @throws Does not throw; catches and logs internal Supabase errors
 *
 * @example
 * await ensureSessionFresh()
 * const { data } = await supabase.from('table').select()
 */
import { supabase } from './supabase'

const REFRESH_MARGIN_SEC = 60 // 60 saniye kala yenile

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
