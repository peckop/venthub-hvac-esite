// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { aileYollari, kategoriYollari } from '../tazelemeYollari'

/**
 * INV-TAZELEME-YOL-1 (REC-300 Faz 3g) — webhook, adres şeması bayrağı hangi değerde olursa olsun sayfanın GERÇEK
 * yolunu geçersiz kılar. KORUDUĞU KUSUR: sabit `/tr/products/<slug>` yolu; bayrak açılınca canlı adres
 * `/tr/urun/<slug>` olur, tazeleme yanlış yolu vurur, vitrin bayat kalır ve hiçbir test görmez.
 * ÖLÇMEDİĞİ: Next'in `revalidatePath`ının gerçekten önbelleği düşürmesi (yayın günü canlı ölçüm).
 */
describe('INV-TAZELEME-YOL-1 — tazeleme yolları iki şemada ve iki dilde', () => {
  it('aile: bugünkü ve yeni yol, TR ve EN', () => {
    expect(aileYollari('vortice-lineo-quiet').sort()).toEqual(
      [
        '/tr/products/vortice-lineo-quiet',
        '/en/products/vortice-lineo-quiet',
        '/tr/urun/vortice-lineo-quiet',
      ].sort(),
    )
  })

  it('kategori kökü: bugünkü + yeni, iki dil', () => {
    const yollar = kategoriYollari((d) => (d === 'tr' ? 'fanlar' : 'fans'))
    expect(yollar).toEqual(
      expect.arrayContaining(['/tr/category/fanlar', '/tr/kategori/fanlar', '/en/category/fans']),
    )
  })

  it('kategori dalı: üst/alt yolu her iki şemada; tek segmentli alt yol da durur (REC-205)', () => {
    const yollar = kategoriYollari(
      (d) => (d === 'tr' ? 'sessiz-kanal-fanlari' : 'quiet-duct-fans'),
      (d) => (d === 'tr' ? 'fanlar' : 'fans'),
    )
    expect(yollar).toEqual(
      expect.arrayContaining([
        '/tr/kategori/fanlar/sessiz-kanal-fanlari',
        '/tr/category/fanlar/sessiz-kanal-fanlari',
        '/en/category/fans/quiet-duct-fans',
        '/tr/category/sessiz-kanal-fanlari',
      ]),
    )
  })

  it('bugünkü şemanın iki segmentli alt yolu bire bir `/<dil>/category/<üst>/<alt>` (dil öneki rota yardımcısından)', () => {
    const yollar = kategoriYollari(
      (d) => (d === 'tr' ? 'alt-tr' : 'alt-en'),
      (d) => (d === 'tr' ? 'ust-tr' : 'ust-en'),
    )
    expect(yollar).toContain('/tr/category/ust-tr/alt-tr')
    expect(yollar).toContain('/en/category/ust-en/alt-en')
  })

  it('boş slug yol üretmez; yollar tekil', () => {
    expect(kategoriYollari(() => '')).toEqual([])
    const yollar = aileYollari('x')
    expect(new Set(yollar).size).toBe(yollar.length)
  })

  it('webhook route.ts sabit `/products/${…}` yoluyla revalidatePath çağırmaz (yollar yardımcıdan gelir)', () => {
    const kaynak = fs.readFileSync(
      path.resolve(__dirname, '../../../app/api/webhook/supabase/route.ts'),
      'utf8',
    )
    expect(kaynak, 'sabit aile yolu geri gelmiş: bayrak açılınca yanlış sayfayı tazeler').not.toMatch(
      /revalidatePath\(\s*`\/(?:tr|en|\$\{lang\})\/products\//,
    )
    expect(kaynak).not.toMatch(/revalidatePath\(\s*`\/(?:tr|en|\$\{lang\})\/category\//)
    expect(kaynak).toMatch(/aileYollari\(/)
    expect(kaynak).toMatch(/kategoriYollari\(/)
  })
})
