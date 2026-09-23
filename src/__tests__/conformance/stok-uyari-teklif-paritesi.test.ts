/**
 * INV-STOK-UYARI-1 (REC-376): stok uyarısı, vitrinin teklif modu hükmüyle AYNI evreni kullanır.
 *
 * Edge `src/`'yi içe aktaramadığı için `supabase/functions/stock-alert/teklif_modu.ts` vitrinin
 * `quoteModeHesapla`'sının aynasıdır. Bu kapı ikisini aynı doğruluk tablosunda karşılaştırır: biri
 * değişip diğeri değişmezse (ör. vitrine yeni bir teklif dalı eklenir) KIRMIZI verir — ikinci kural
 * sessizce ayrışamaz. Ayrıca uyarı fonksiyonunun süzgeci GERÇEKTEN çağırdığı ve özet/tekrar
 * korumasının yerinde olduğu kaynaktan doğrulanır (2026-09-22: 68 teklif ürünü → günde 60 sahte e-posta).
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { teklifModundaMi } from '../../../supabase/functions/stock-alert/teklif_modu'
import { quoteModeHesapla } from '../../lib/pricing/quoteMode'

const KATEGORILER = [
  null,
  { metadata: null },
  { metadata: {} },
  { metadata: { hide_price: true } },
  { metadata: { hide_price: false } },
  { metadata: { hide_price: 'evet' } },
  { metadata: { hide_price: 0 } },
]
const FIYATLAR: (number | string | null | undefined)[] = [null, undefined, 0, -5, 0.01, 1250, '0', '1250.50', 'abc', Number.NaN]

const kaynak = fs.readFileSync(path.resolve(__dirname, '../../../supabase/functions/stock-alert/index.ts'), 'utf8')

describe('INV-STOK-UYARI-1 teklif modu paritesi + özet', () => {
  it('her kategori × fiyat birleşiminde edge süzgeci vitrinle aynı cevabı verir', () => {
    let vaka = 0
    for (const kategori of KATEGORILER) {
      for (const fiyat of FIYATLAR) {
        const vitrin = quoteModeHesapla(kategori, { price: fiyat as number | string | null })
        const edge = teklifModundaMi({ kategori, fiyat })
        expect(edge, `ayrıştı: kategori=${JSON.stringify(kategori)} fiyat=${String(fiyat)}`).toBe(vitrin)
        vaka++
      }
    }
    expect(vaka).toBe(KATEGORILER.length * FIYATLAR.length)
  })

  it('2026-09-22 vakası: hide_price kategorisindeki fiyatsız ürün uyarı evreninde DEĞİL', () => {
    expect(teklifModundaMi({ kategori: { metadata: { hide_price: true } }, fiyat: null })).toBe(true)
    // sabotaj kolu: fiyatlı, gizlenmemiş kategori → uyarı evreninde KALIR
    expect(teklifModundaMi({ kategori: { metadata: { hide_price: false } }, fiyat: 1250 })).toBe(false)
  })

  it('stock-alert süzgeci çağırıyor, fiyatı vitrin kaynağından (display_price) okuyor, ailenin ana kategorisini kullanıyor', () => {
    expect(kaynak).toMatch(/import \{ teklifModundaMi \} from '\.\/teklif_modu\.ts'/)
    expect(kaynak).toMatch(/display_price/)
    expect(kaynak).toMatch(/from\('product_families'\)[\s\S]{0,120}category_id/)
    expect(kaynak).toMatch(/teklifModundaMi\(\{ kategori, fiyat: u\.display_price \}\)/)
    // toplu yol + sipariş sonrası tek ürün yolu AYNI süzgeçten geçer (tanım + 2 çağrı)
    expect((kaynak.match(/teklifModuHaritasi\(/g) ?? []).length).toBeGreaterThanOrEqual(3)
  })

  it('toplu yol ürün başına değil TEK ÖZET gönderir, Idempotency anahtarı olay kimliğidir, başarısız gönderim görünür', () => {
    const toplu = kaynak.slice(kaynak.indexOf('async function checkAllProducts'), kaynak.indexOf('async function checkSpecificProduct'))
    expect(toplu).not.toMatch(/for \(const product of/)
    expect(toplu).toMatch(/ozetGonder\(/)
    expect(kaynak).toMatch(/stok-ozet\/\$\{/)
    expect(kaynak).not.toMatch(/idempotencyKey:[^\n]*(randomUUID|Date\.now)/)
    // B4: özet gönderilemezse çağırana hata döner (cron kırmızı), 200'e gömülmez
    expect(toplu).toMatch(/throw new Error\(`Stok ozeti gonderilemedi/)
  })
})
