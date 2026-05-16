import { supabase } from './supabase'

const REFRESH_MARGIN_SEC = 60 // 60 saniye kala yenile

/**
 * Checks the current session token and automatically refreshes it if it is about to expire.
 * The refresh is triggered if the token expires in less than 60 seconds or has already expired.
 * Any errors during refresh are silently logged to avoid blocking subsequent operations.
 *
 * @returns A promise that resolves when the check (and potential refresh) is complete.
 *
 * @example
 * await ensureSessionFresh()
 * const { data } = await supabase.from('table').select()
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
