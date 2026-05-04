/**
 * ensureSessionFresh — Akıllı oturum yenileme yardımcısı
 *
 * Girdi: Yok (Supabase client'ı modül seviyesinde import eder)
 * İşlem: Token'ın expires_at değerini kontrol eder. Son 60 saniyeye
 *        girildiyse veya süresi zaten dolmuşsa refreshSession() çağırır.
 * Çıktı: void (hata varsa sessizce loglar, uygulamayı bloklayamaz)
 *
 * Kullanım: Veri çekmeden hemen önce çağrılır.
 *   await ensureSessionFresh()
 *   const { data } = await supabase.from('table').select()
 */
import { supabase } from './supabase'

const REFRESH_MARGIN_SEC = 60 // 60 saniye kala yenile

/**
 * Automatically checks the current Supabase session and refreshes the authentication token
 * if it is expired or within 60 seconds of expiring. Designed to be called right before
 * critical database operations.
 *
 * @returns A promise that resolves when the session check (and potential refresh) is complete.
 * Does not throw errors on failure to prevent blocking the UI, but will log a warning.
 *
 * @example
 * await ensureSessionFresh();
 * const { data } = await supabase.from('secure_table').select();
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
