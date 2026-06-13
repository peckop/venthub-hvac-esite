import { supabase } from './supabase'

const REFRESH_MARGIN_SEC = 60 // 60 saniye kala yenile

/**
 * Ensures the active Supabase authentication session remains valid by proactively refreshing it.
 * It evaluates the token's expiration timestamp and invokes `refreshSession()` if the expiration is within the next 60 seconds.
 *
 * @returns A promise that resolves when the session check/refresh is complete.
 * @throws Never throws; session refresh errors are caught and logged silently to avoid blocking data requests.
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
