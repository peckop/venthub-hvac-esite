// @vitest-environment node
import { gzipSync } from 'node:zlib'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { modellerdenVeri, yayindaVeriAyarla } from '@/config/__tests__/yayindaTestKiti'

import { envanterUret } from '../envanter'
import { EDGE_GZIP_SINIRI_BAYT } from '../haritaTipi'
import { FIKSTUR_DOSYASI, fiksturHaritasi, modelSlugluHarita } from './fikstur'

// URN-31: model hedefi yalnız yayındaki listedeki SKU için üretilir; adres metni listeden (fikstürdeki Faz 2 metinleri).
vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())
beforeEach(() =>
  yayindaVeriAyarla(
    modellerdenVeri([
      { aile: 'storm-serisi', sku: 'SEA-61143003', tr: 'storm-14-atex-cati-fani', en: 'storm-14-atex-roof-fan' },
      { aile: 'vortice-vort-commercial-in-line-rectangular', sku: 'VRT-CA-IL-4020-ES-RECT', tr: 'vortice-ca-il-4020-kanal-fani', en: 'vortice-ca-il-4020-duct-fan' },
    ]),
  ),
)

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
    // SEO-35 B-1: kanonik adres TEK segment — alt kategorinin tek segmentli EN adresi kanoniktir (satır yok),
    // iç içe adresler tek sıçramayla tek segmentli adrese gider.
    expect(bul('/en/category/duct-fans')).toBeUndefined()
    expect(bul('/en/category/fans/duct-fans')).toMatchObject({ yeni: '/en/category/duct-fans', durum: 308 })
    expect(bul('/tr/category/fanlar/kanal-tipi-fanlar')).toMatchObject({
      yeni: '/tr/kategori/kanal-tipi-fanlar',
      durum: 308,
    })
    expect(bul('/tr/products/storm-serisi', 'SEA-61143003')).toMatchObject({
      yeni: '/tr/urun/storm-14-atex-cati-fani-p-sea-61143003',
      durum: 308,
    })
  })

  it('hiçbir kategori hedefi iç içe değildir (B-1): /<dil>/(kategori|category)/<slug> — tam üç parça', () => {
    for (const dil of ['tr', 'en'] as const) {
      const { satirlar } = envanterUret(modelSlugluHarita(), dil)
      const kategoriHedefleri = satirlar.map((s) => s.yeni).filter((y) => /^\/(tr\/kategori|en\/category)\//.test(y))
      expect(kategoriHedefleri.length).toBeGreaterThan(0)
      expect(kategoriHedefleri.filter((y) => y.split('/').filter(Boolean).length !== 3)).toEqual([])
    }
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
