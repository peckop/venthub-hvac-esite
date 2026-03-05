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
