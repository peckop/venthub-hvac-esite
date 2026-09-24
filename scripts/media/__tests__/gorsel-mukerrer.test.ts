/**
 * REC-282 · mükerrer görsel kapısı. Ağa, DB'ye çıkmaz; veri UYDURMA.
 *
 * Kilitlenenler:
 *   1. Aynı dosyayı paylaşan ≥2 ürün = grup; aynı ürünün iki kaydı grup DEĞİL.
 *   2. Kategori aşımı ayrı işaretlenir; aile içi paylaşım meşrudur (kapıyı kırmaz).
 *   3. Bilinen istisna (Recep 09-08: "aynen kalsınlar") YEŞİL; yeni aşım ya da bilinen grubun yeni
 *      ürüne yayılması KIRMIZI. Sabotaj yönü: istisna listesinden çıkarılan grup aynı veride KIRMIZI.
 */
import { describe, it, expect } from 'vitest'
import { mukerrerGruplari, mukerrerKapisi, BILINEN_KATEGORI_ASAN } from '../gorsel-mukerrer.mjs'

const urunler = new Map([
  ['hrv1', { sku: 'AVE-13010', name: 'ISI GERİ KAZANIM', kat: 'heat-recovery-vmc' }],
  ['sb1', { sku: 'AVE-13052', name: 'SULU BATARYA 11', kat: 'air-treatment' }],
  ['f1', { sku: 'VRT-1', name: 'Fan 1', kat: 'fans' }],
  ['f2', { sku: 'VRT-2', name: 'Fan 2', kat: 'fans' }],
])
const katOf = (u: { kat?: string } | undefined) => u?.kat ?? '(kategorisiz)'
const g = (product_id: string, path: string) => ({ product_id, path })

describe('mükerrer görsel grupları', () => {
  const gorseller = [
    g('hrv1', 'a.webp'), g('sb1', 'b.webp'),   // aynı dosya, iki kategori
    g('f1', 'c.webp'), g('f2', 'd.webp'),      // aynı dosya, aynı kategori (aile içi)
    g('f1', 'e.webp'), g('f1', 'e2.webp'),     // aynı dosya, AYNI ürün → grup değil
    g('f2', 'tekil.webp'),
  ]
  const hashOf = new Map([['a.webp', 'H_ASAN'], ['b.webp', 'H_ASAN'], ['c.webp', 'H_AILE'], ['d.webp', 'H_AILE'],
    ['e.webp', 'H_TEK'], ['e2.webp', 'H_TEK'], ['tekil.webp', 'H_X']])
  const gruplar = mukerrerGruplari(gorseller, hashOf, urunler, katOf)

  it('grup yalnız ≥2 FARKLI üründe; aşım önce sıralanır', () => {
    expect(gruplar.map((x) => [x.hash, x.urun_sayisi, x.kategori_sinirini_asiyor])).toEqual([
      ['H_ASAN', 2, true], ['H_AILE', 2, false]])
    expect(gruplar[0].urunler.map((u) => u.sku)).toEqual(['AVE-13010', 'AVE-13052'])
  })

  it('bilinen istisna YEŞİL; aile içi paylaşım kapıyı kırmaz', () => {
    expect(mukerrerKapisi(gruplar, { H_ASAN: 2 }).kirmizi).toBe(false)
  })

  it('sabotaj: istisna listesinde olmayan aşım KIRMIZI', () => {
    const k = mukerrerKapisi(gruplar, {})
    expect(k.kirmizi).toBe(true)
    expect(k.ihlal[0]).toMatch(/YENİ kategori aşımı H_ASAN: 2 ürün \(heat-recovery-vmc \+ air-treatment\)/)
  })

  it('bilinen grup yeni ürüne YAYILIRSA KIRMIZI', () => {
    const k = mukerrerKapisi(gruplar, { H_ASAN: 1 })
    expect(k.kirmizi).toBe(true)
    expect(k.ihlal[0]).toMatch(/YAYILDI H_ASAN: 2 > 1/)
  })

  it('canlı istisna listesi: 2026-09-24 ölçümündeki 3 grup, her biri 9 ürün', () => {
    expect(BILINEN_KATEGORI_ASAN).toEqual({ e5ebeadb41e3a5f0: 9, bac4bcd2c8666dbc: 9, '767e808a589d9668': 9 })
  })
})
