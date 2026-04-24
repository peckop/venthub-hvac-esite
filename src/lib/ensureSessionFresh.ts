import { supabase } from './supabase'

const REFRESH_MARGIN_SEC = 60 // 60 saniye kala yenile

/**
 * Checks the current Supabase authentication token's expiration and refreshes it if necessary.
 * Designed to be called immediately prior to critical API requests to prevent "Token Expired" errors.
 *
 * If the session is within 60 seconds of expiring (or has already expired), a refresh is triggered.
 * If the refresh fails (e.g., network error or revoked token), it silently logs a warning to the console
 * rather than throwing, preventing it from strictly blocking the subsequent data request.
 *
 * @returns A promise that resolves to void once the session check (and potential refresh) is complete.
 *
 * @example
 * await ensureSessionFresh()
 * const { data } = await supabase.from('secured_table').select()
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
