/**
 * INV-REHBER-KISA-KATMAN-1 · yayındaki HER rehber yazısı R3 kısa katmanından geçer (BLG-52, rehber-yazisi-standard.md v0.20).
 *
 * Neden ayrı test: `rehber-denetim.test.ts` kapının kolunu uydurma örnekle sınar; bu test kapıyı GERÇEK yayın listesine
 * (`YAZILAR`) bağlar. Yeni bir yazı kısa katmansız eklenirse (ya da yayındaki bir yazının katmanı bozulursa) CI burada düşer.
 * 8 Kasım 2026 ölçümü: 11 yazıdan dördü kırmızıydı (radyal/aksiyel ve sessiz fanda katman yok; çatı tipi 129 ve ATEX 127 kelime).
 */
import { describe, it, expect } from 'vitest'
import { YAZILAR } from '../../../src/data/bilgiMerkezi/yazilar'
import { kisaKatmanDenetle, kisaKatmanAyir } from '../rehber-denetim.mjs'

const metinler = YAZILAR.flatMap((y) =>
  (Object.entries(y.diller) as [string, { govde: string }][]).map(([dil, m]) => ({ ad: `${y.kimlik} (${dil})`, govde: m.govde })),
)

describe('INV-REHBER-KISA-KATMAN-1 · yayındaki yazılar', () => {
  it('yayın listesi boş değil (sessiz sıfır değil)', () => {
    expect(metinler.length).toBeGreaterThanOrEqual(11)
  })
  it.each(metinler)('$ad kısa katmandan geçer', ({ govde }) => {
    expect(kisaKatmanDenetle(govde)).toEqual([])
  })
  it('sabotaj kolu: her yazının Kısaca satırı silinirse kapı KISA-KATMAN-YOK verir (kapı kör değil)', () => {
    for (const { ad, govde } of metinler) {
      const bozuk = govde.replace(/\r?\nKısaca:\r?\n/, '\n')
      expect(bozuk, ad).not.toBe(govde)
      expect(kisaKatmanDenetle(bozuk).map((k: { sinif: string }) => k.sinif), ad).toContain('KISA-KATMAN-YOK')
    }
  })
  it('katman H1 ile ilk H2 arasındadır; ilk H2 den sonraki "Kısaca" sayılmaz', () => {
    for (const { ad, govde } of metinler) {
      const k = kisaKatmanAyir(govde)
      expect(k, ad).not.toBeNull()
      expect(k!.maddeler.length, ad).toBeGreaterThanOrEqual(3)
    }
  })
})
