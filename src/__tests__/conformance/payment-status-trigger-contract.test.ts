import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-PAYMENT-TRIGGER-1 — `sync_payment_status_with_status` DOLU bir ödeme durumunu ezemez.
 *
 * NİÇİN VAR (T114-VH · 2026-08-19)
 *
 * Tetiğin eski gövdesi şuydu:
 *
 *   IF NEW.status IN ('paid','confirmed') AND COALESCE(NEW.payment_status,'') <> 'refunded'
 *     THEN NEW.payment_status := 'paid';
 *
 * `iyzico-refund` kısmi iadede `payment_status='partial_refunded'` yazar ve `status`'ü
 * DEĞİŞTİRMEDEN aynı PATCH'in SET listesine koyar. Tetik `BEFORE UPDATE OF status`
 * olduğu için kolon SET listesindeyken değer değişmese de ateşlenir; koruma yalnız
 * `'refunded'` değerini tanıdığından `partial_refunded` korumasız kalır ve satır
 * **`paid`** olur. Para çıkar, kayıt "tam ödendi" der, hiçbir hata düşmez.
 *
 * Gerçek fonksiyonla geçici tabloda ölçüldü (prod'a yazmadan): `confirmed` +
 * `partial_refunded` → `paid`. Diğer statülerde (shipped/processing/delivered/cancelled)
 * sorun yok — pencere dar ama en olağan iade senaryosu tam da orada: kargolanmamış,
 * onaylanmış siparişin kısmi iadesi.
 *
 * Bu kapı STATİKTİR: migration metnini kilitler, canlı DB'yi göremez. Canlı davranışı
 * migration'ın kendi doğrulama bloğu ölçer (geçici tabloya gerçek fonksiyonu bağlayıp
 * yedi satırlık matrisi sınar ve tutmazsa migration çöker).
 *
 * Ölçüm: docs/audits/t114-payment-status-trigger-2026-08-19.md
 */

const KOK = path.resolve(__dirname, '../../..')
const MIGRATIONS = path.join(KOK, 'supabase/migrations')

const FN_RE = /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.sync_payment_status_with_status/i

/**
 * SQL yorumlarını sil. ŞART: bu migration'ın YORUMU eski gövdeyi olduğu gibi alıntılıyor
 * (niçin değiştiğini anlatmak için). Yorum sıyrılmazsa kapı kendi açıklamasını kusur sanır —
 * bu tuzağa bir kez düşüldü, o yüzden burada adıyla yazıyor. Depo CRLF: [^\r\n] şart.
 */
function yorumsuz(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\r\n]*/g, ' ')
}

/** Fonksiyonu tanımlayan migration dosyaları, dosya adına göre KRONOLOJİK sırada. */
function tanimlayanDosyalar(): Array<{ ad: string; sql: string }> {
  return readdirSync(MIGRATIONS)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort()
    .map((ad) => ({ ad, sql: readFileSync(path.join(MIGRATIONS, ad), 'utf8') }))
    .map((d) => ({ ...d, sql: yorumsuz(d.sql) }))
    .filter((d) => FN_RE.test(d.sql))
}

describe('INV-PAYMENT-TRIGGER-1 — ödeme durumu tetiği sözleşmesi', () => {
  const tanimlar = tanimlayanDosyalar()

  it('R0 — tarayıcı fonksiyonu tanımlayan migration buluyor (sahte-yeşil kilidi)', () => {
    expect(
      tanimlar.length,
      'sync_payment_status_with_status tanımlayan HİÇ migration bulunamadı — desen tutmuyor',
    ).toBeGreaterThanOrEqual(1)
  })

  it('R1 — SON tanım dolu ödeme durumunu ezmez (izin listesi yerinde)', () => {
    const son = tanimlar[tanimlar.length - 1]

    expect(
      /COALESCE\s*\(\s*NEW\.payment_status[^)]*\)\s+IN\s*\(\s*''\s*,\s*'pending'\s*\)/i.test(son.sql),
      `\n${son.ad}: izin listesi yok. Tetik yalnızca payment_status BOŞ ya da 'pending' iken ` +
        "yazmalı; dolu bir değeri ezerse kısmi iade sessizce 'paid' olur (T114-VH).",
    ).toBe(true)
  })

  it('R2 — SON tanımda ölü dallar geri gelmemiş', () => {
    const son = tanimlar[tanimlar.length - 1]

    expect(
      /NEW\.status\s+IN\s*\(\s*'paid'/i.test(son.sql),
      `\n${son.ad}: status='paid' dalı geri gelmiş. venthub_orders_status_check bu değeri ` +
        'kabul etmiyor — dal ÖLÜ ve okuyanı yanıltıyor.',
    ).toBe(false)

    expect(
      /NEW\.status\s*=\s*'failed'/i.test(son.sql),
      `\n${son.ad}: status='failed' dalı geri gelmiş. Bu değer de kısıtta yok; ` +
        "payment_status='failed' yazan yer edge fonksiyonlarıdır, tetik değil.",
    ).toBe(false)
  })

  it('R3 — SON tanım davranışını kendi içinde kanıtlıyor', () => {
    const son = tanimlar[tanimlar.length - 1]

    expect(
      /RAISE\s+EXCEPTION/i.test(son.sql),
      `\n${son.ad}: doğrulama bloğu yok. Migration "SUCCESS" demekle yetinmemeli, ` +
        'nesnenin kendi davranışını ölçüp tutmazsa çökmeli.',
    ).toBe(true)

    expect(
      son.sql.includes('partial_refunded'),
      `\n${son.ad}: doğrulama matrisinde partial_refunded yok — kusurun TAM kendisi o değerdi.`,
    ).toBe(true)
  })
})
