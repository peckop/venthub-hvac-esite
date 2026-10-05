// @vitest-environment node
import { gzipSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import { envanterUret } from '../envanter'
import { EDGE_GZIP_SINIRI_BAYT } from '../haritaTipi'
import { FIKSTUR_DOSYASI, fiksturHaritasi, modelSlugluHarita } from './fikstur'

/**
 * INV-ADRES-HARITA-1 (plan §7): haritanın tanıdığı her eski adres TEK hop; hedefte query yok; hiçbir
 * hedef yine haritada kaynak değil (döngü yok); dilli kaynak 308. Bu CI kolu fikstürle koşar; DB kolu
 * (harita DB ile birebir) zamanlanmış iş olarak prod'a karşı ölçülür (plan §4.1).
 */
describe('INV-ADRES-HARITA-1 — envanter', () => {
  it.each([
    ['fikstür (model adres metni yok, Faz 2 öncesi)', fiksturHaritasi()],
    ['fikstür + model adres metni (Faz 2 sonrası)', modelSlugluHarita()],
  ])('%s: ihlal 0, envanter boş değil', (_ad, harita) => {
    for (const dil of ['tr', 'en'] as const) {
      const { satirlar, ihlaller } = envanterUret(harita, dil)
      expect(ihlaller).toEqual([])
      // Kör dedektör "temiz" değildir: en az her kategori slug'ı ve her eski aile bir satır üretmeli.
      expect(satirlar.length).toBeGreaterThan(Object.keys(harita.kategoriSluglari).length)
    }
  })

  it('envanterde plan §6\'nın örnek satırları var', () => {
    const { satirlar } = envanterUret(modelSlugluHarita(), 'tr')
    const bul = (eski: string, sku: string | null = null) => satirlar.find((s) => s.eski === eski && s.sku === sku)
    expect(bul('/category/fanlar')).toMatchObject({ yeni: '/tr/kategori/fanlar', durum: 308 })
    expect(bul('/tr/category/fans')).toMatchObject({ yeni: '/tr/kategori/fanlar', durum: 308 })
    expect(bul('/en/category/duct-fans')).toMatchObject({ yeni: '/en/category/fans/duct-fans', durum: 308 })
    expect(bul('/tr/products/storm-serisi', 'SEA-61143003')).toMatchObject({
      yeni: '/tr/urun/storm-14-atex-cati-fani-p-sea-61143003',
      durum: 308,
    })
  })
})

describe('Edge boyutu (plan §4: Vercel Edge middleware gzip sonrası Hobby 1 MB)', () => {
  it('fikstür haritanın gzip boyutu sınırın çok altında', () => {
    // 2026-09-24 ölçümü: fikstür 1.319 bayt; canlı DB dökümüyle (441 ürün, 47 aile, 31 kategori) üretilen
    // gerçek harita 8.439 bayt, Faz 2 model adres metinleriyle tahmini ~11.6 kB. Bugünkü middleware 103 kB.
    const bayt = gzipSync(JSON.stringify(FIKSTUR_DOSYASI)).length
    expect(bayt).toBeLessThan(EDGE_GZIP_SINIRI_BAYT)
  })
})
