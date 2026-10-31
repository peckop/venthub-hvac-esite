import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-WEBHOOK-2 · `handle_supabase_webhook()` imzalı gönderir (ALT-76 PR 2, CLAUDE.md kural 11).
 *
 * Fonksiyonu en son tanımlayan migration okunur (sıra = dosya adı damgası). Ölçülen: düz secret
 * başlığı gitmiyor, zaman + imza başlıkları gidiyor, mesaj biçimi sunucudaki `imzaUret` ile aynı
 * (`<zaman>.<ham gövde>`), imza hatası veri yazımını engellemiyor. Davranışın kendisi (canlıda
 * pg_net → rota) birleştirme sonrası net._http_response ile ölçülür; bu kapı yalnız kaynağın
 * geri dönmesini (düz secret'e dönüş, başlık adı kayması) yakalar.
 */

const DIR = join(process.cwd(), 'supabase', 'migrations')
const FN = /create\s+or\s+replace\s+function\s+public\.handle_supabase_webhook\s*\(/i

function sonTanim(): { dosya: string; govde: string } {
  const adaylar = readdirSync(DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((dosya) => ({ dosya, sql: readFileSync(join(DIR, dosya), 'utf8') }))
    .filter((d) => FN.test(d.sql))
  expect(adaylar.length).toBeGreaterThan(0)
  const son = adaylar[adaylar.length - 1]
  const bas = son.sql.search(FN)
  return { dosya: son.dosya, govde: son.sql.slice(bas) }
}

describe('INV-WEBHOOK-2 imzalı gönderim', () => {
  const { dosya, govde } = sonTanim()
  // Yorum satırları (-- ...) çıkarılır: açıklama metni "x-webhook-secret" adını anabilir.
  const kod = govde
    .split('\n')
    .filter((s) => !s.trim().startsWith('--'))
    .join('\n')

  it('son tanım imzalı migration’dır', () => {
    expect(dosya).toBe('20261031230000_webhook_imzali_gonderim.sql')
  })

  it('düz secret başlığını GÖNDERMEZ', () => {
    expect(kod).not.toMatch(/x-webhook-secret/i)
  })

  it('zaman ve imza başlıklarını gönderir', () => {
    expect(kod).toMatch(/'x-webhook-timestamp'\s*,\s*zaman_sn/)
    expect(kod).toMatch(/'x-webhook-signature'\s*,\s*imza/)
  })

  it('mesaj biçimi sunucuyla aynı: <zaman>.<ham gövde> (payload::text), HMAC-SHA256, hex', () => {
    expect(kod).toMatch(/extensions\.hmac\(\s*zaman_sn\s*\|\|\s*'\.'\s*\|\|\s*payload::text\s*,\s*webhook_secret\s*,\s*'sha256'\s*\)/)
    expect(kod).toMatch(/encode\([\s\S]*?'hex'\s*\)/)
  })

  it('imza hatası veri yazımını engellemez (EXCEPTION → WARNING, RETURN NEW)', () => {
    expect(kod).toMatch(/EXCEPTION\s+WHEN\s+OTHERS\s+THEN\s+RAISE\s+WARNING/i)
    expect(kod).toMatch(/RETURN\s+NEW/i)
  })

  it('search_path extensions şemasını içerir ve fonksiyon SECURITY DEFINER kalır', () => {
    expect(govde).toMatch(/set\s+search_path\s+to[^\n]*'extensions'/i)
    expect(govde).toMatch(/security\s+definer/i)
  })
})
