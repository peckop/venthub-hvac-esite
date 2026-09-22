/**
 * INV-EPOSTA-SESSIZ-DUSUS-1 · REC-368 — e-posta gönderimi hata alınca Resend DENEME göndericisine
 * (onboarding@resend.dev) düşmez.
 *
 * NİÇİN: order-confirmation ve shipping-notification, gönderici doğrulanmamışsa göndericiyi
 * sessizce `onboarding@resend.dev`'e çevirip yeniden deniyordu. Deneme göndericisi YALNIZ Resend
 * hesap sahibine teslim eder: sahibin kendi adresiyle yapılan denemede e-posta gider ve sistem
 * çalışıyor GÖRÜNÜR, aynı anda müşteriye hiçbir e-posta gitmez (2026-09-22 ölçümü: canlıda
 * order_email_events 0 satır, sipariş 5 — hepsi iptal; henüz müşteri kaybı yok).
 *
 * Kollar: (a) HİÇBİR edge fonksiyonu göndericiyi deneme adresine YENİDEN ATAMAZ (değişken = '…resend.dev')
 * — varsayılan değer (`x || '…resend.dev'`) bu kapının konusu değildir, REC-368'in gönderici kimliği
 * işidir · (b) iki gönderim ucu hata yolunda denetim kaydı (`email_send_failed`) yazar ve 2xx dönmez.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = resolve(__dirname, '../..')
const FONKSIYONLAR = join(KOK, 'supabase/functions')

/** Yorumları düşürür: açıklama metnindeki örnek adres ihlal sayılmaz. */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
}

function tsDosyalari(dizin: string): string[] {
  return readdirSync(dizin).flatMap((ad) => {
    const yol = join(dizin, ad)
    if (statSync(yol).isDirectory()) return ad === 'node_modules' ? [] : tsDosyalari(yol)
    return /\.ts$/.test(ad) && !/\.test\.ts$/.test(ad) ? [yol] : []
  })
}

// Yeniden atama: `emailFrom = '… <onboarding@resend.dev>'` — `const x = a || '…'` DEĞİL.
const YENIDEN_ATAMA = /(^|[^=!<>])\b[A-Za-z_$][\w$]*\s*=(?!=)\s*['"`][^'"`]*onboarding@resend\.dev/gm

describe('INV-EPOSTA-SESSIZ-DUSUS-1', () => {
  it('(a) hiçbir edge fonksiyonu göndericiyi deneme adresine yeniden atamaz', () => {
    const ihlaller = tsDosyalari(FONKSIYONLAR).flatMap((dosya) => {
      const kod = yorumsuz(readFileSync(dosya, 'utf8'))
      return [...kod.matchAll(YENIDEN_ATAMA)]
        // `const x = …` / `let x = …` bildirimi yeniden atama değildir (varsayılan değer).
        .filter((m) => !/\b(const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*$/.test(kod.slice(Math.max(0, (m.index ?? 0) - 40), (m.index ?? 0) + m[0].indexOf('=') + 1)))
        .map((m) => `${relative(KOK, dosya)}: ${m[0].trim()}`)
    })
    expect(ihlaller).toEqual([])
  })

  it('(a-çapa) desen eski kodu yakalar', () => {
    const eski = `
      let emailFrom = branding.emailFrom
      if (txt.includes('verify')) {
        emailFrom = 'VentHub Test <onboarding@resend.dev>'
      }
      const varsayilan = cfg.from || 'VentHub <onboarding@resend.dev>'
      // emailFrom = 'yorumdaki örnek <onboarding@resend.dev>'
    `
    const bulunan = [...yorumsuz(eski).matchAll(YENIDEN_ATAMA)].map((m) => m[0].trim())
    expect(bulunan).toHaveLength(1)
    expect(bulunan[0]).toContain("emailFrom = 'VentHub Test")
  })

  for (const uc of ['order-confirmation', 'shipping-notification']) {
    it(`(b) ${uc}: hata yolu denetim kaydı yazar ve başarı dönmez`, () => {
      const kod = yorumsuz(readFileSync(join(FONKSIYONLAR, uc, 'index.ts'), 'utf8'))
      const hataYolu = kod.slice(kod.indexOf('if (!resp.ok)'), kod.indexOf('if (!resp.ok)') + 2500)
      expect(hataYolu).toContain('/rest/v1/admin_audit_log')
      expect(hataYolu).toContain("action: 'email_send_failed'")
      expect(hataYolu).toContain('tenant_id: tenantId')
      expect(hataYolu).toMatch(/status: 50\d|throw new Error/)
      expect(hataYolu).not.toContain('onboarding@resend.dev')
    })
  }
})
