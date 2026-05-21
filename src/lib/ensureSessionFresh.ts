import { supabase } from './supabase'

const REFRESH_MARGIN_SEC = 60 // 60 saniye kala yenile

/**
 * Ensures the active Supabase authentication session remains valid by silently refreshing the token if it is close to expiration.
 * It checks the `expires_at` timestamp and triggers a refresh if the token will expire within the next 60 seconds, preventing unexpected authentication failures during subsequent database queries.
 *
 * @returns A promise that resolves when the check (and potential refresh) completes; catches and logs errors internally to avoid crashing the caller
 *
 * @example
 * await ensureSessionFresh();
 * const { data } = await supabase.from('venthub_orders').select('*');
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
