import { supabase } from './supabase'

const REFRESH_MARGIN_SEC = 60 // 60 saniye kala yenile

/**
 * Ensures the user's Supabase session token is fresh before making API requests.
 * Automatically triggers a background token refresh if expiration is within 60 seconds.
 *
 * @returns A promise that resolves immediately (returning void). Errors are logged silently to prevent blocking critical data fetching.
 *
 * @example
 * await ensureSessionFresh()
 * const { data } = await supabase.from('products').select()
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
