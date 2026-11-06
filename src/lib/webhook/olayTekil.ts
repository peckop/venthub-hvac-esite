import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

/**
 * ALT-76 PR 3 · Supabase → Next webhook'unun KALICI tekrar koruması (CLAUDE.md kural 11).
 *
 * Tetik gövdeye rastgele `event_id` koyar (gövde imzalı olduğu için kimlik de imzalıdır).
 * Rota imzayı doğruladıktan sonra bu fonksiyonu çağırır; `webhook_olay_tuket` RPC'si imzayı
 * Vault sırrıyla YENİDEN doğrular, zaman penceresini ölçer ve kimliği `webhook_olaylari`
 * tablosuna yazar. Aynı kimlik ikinci kez gelirse — hangi sunucusuz örneğe düşerse düşsün —
 * 'tekrar' döner. Bellek içi küme (imza.ts) yalnız aynı örnekteki tekrarı DB'ye gitmeden keser.
 *
 * DI (kural 2): istemci parametre olarak gelir; modül düzeyinde istemci yok.
 */

export type OlaySonucu = 'yeni' | 'tekrar' | 'reddedildi' | 'hata'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Çözülmüş gövdeden olay kimliğini alır; yoksa ya da UUID değilse null. */
export function olayKimligi(govde: unknown): string | null {
  if (govde === null || typeof govde !== 'object') return null
  const deger = (govde as Record<string, unknown>).event_id
  return typeof deger === 'string' && UUID.test(deger) ? deger : null
}

/**
 * 'yeni'      → işle.
 * 'tekrar'    → aynı olay daha önce işlendi; reddet.
 * 'reddedildi'→ DB imzayı/zamanı kabul etmedi (rota ile DB sırrı ayrışmış olabilir); reddet.
 * 'hata'      → RPC'ye ulaşılamadı ya da DB yapılandırması eksik; FAIL-CLOSED, işleme.
 */
export async function olayTuket(
  supabase: SupabaseClient<Database>,
  args: { zamanSn: string; hamGovde: string; imza: string },
): Promise<OlaySonucu> {
  try {
    const { data, error } = await supabase.rpc('webhook_olay_tuket', {
      p_zaman: args.zamanSn,
      p_govde: args.hamGovde,
      p_imza: args.imza,
    })
    if (error) {
      console.error(`[Webhook olay] webhook_olay_tuket hatası: ${error.message}`)
      return 'hata'
    }
    if (data === 'yeni' || data === 'tekrar') return data
    if (data === 'gecersiz' || data === 'bayat') return 'reddedildi'
    console.error(`[Webhook olay] webhook_olay_tuket beklenmeyen sonuç: ${String(data)}`)
    return 'hata'
  } catch (e) {
    console.error(`[Webhook olay] webhook_olay_tuket çağrısı düştü: ${e instanceof Error ? e.message : String(e)}`)
    return 'hata'
  }
}
