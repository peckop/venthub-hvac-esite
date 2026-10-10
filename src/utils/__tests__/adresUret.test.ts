/**
 * Adres üreticinin iki kipi (REC-300 Faz 3, plan §2).
 *
 * KAPALI kip bugünkü canlı adresleri BİREBİR üretmeli — yüzeyler adresUret'e bağlandıkça canlıda
 * hiçbir adres değişmesin diye. Buradaki beklenen dizeler canlıdan okunan biçimlerdir
 * (2026-09-24: `/tr/products/storm-serisi?sku=SEA-61143003`, `/tr/category/<dal>` tek seviye).
 * AÇIK kip plan §2 tablosunun satır satır karşılığıdır.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { modellerdenVeri, yayindaVeriAyarla } from '../../config/__tests__/yayindaTestKiti'
import { ADRES_SEMASI_K3B } from '../../config/features'
import { adresUret, MODEL_AYIRICI, modelAdresiCoz } from '../adresUret'

// URN-31: model adresi YALNIZ yayındaki listedeki SKU için üretilir; bu dosya listeye tek model koyar ve adres
// metinleri (slug_tr/slug_en) eski beklentilerle aynı seçilir.
vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())
beforeEach(() =>
  yayindaVeriAyarla(
    modellerdenVeri([{ aile: 'storm-serisi', sku: 'SEA-61143003', tr: 'storm-10-kanal-fani', en: 'storm-10-duct-fan' }]),
  ),
)

describe('bayrak', () => {
  it('Faz 3-C öncesi KAPALI — açılışı yalnız Faz 4 onaylı tek PR yapar', () => {
    expect(ADRES_SEMASI_K3B).toBe(false)
  })
})

describe('adresUret — KAPALI kip = bugünkü canlı adresler', () => {
  const k = false
  it('tüm ürünler', () => {
    expect(adresUret({ tur: 'urunler' }, 'tr', k)).toBe('/tr/products')
    expect(adresUret({ tur: 'urunler' }, 'en', k)).toBe('/en/products')
  })
  it('kategori: kök tek seviye; dal verilirse YALNIZ dal (REC-205 bugünkü kanonik)', () => {
    expect(adresUret({ tur: 'kategori', kok: 'fanlar' }, 'tr', k)).toBe('/tr/category/fanlar')
    expect(adresUret({ tur: 'kategori', kok: 'fanlar', dal: 'kanal-tipi-fanlar' }, 'tr', k)).toBe(
      '/tr/category/kanal-tipi-fanlar',
    )
    expect(adresUret({ tur: 'kategori', kok: 'fans', dal: 'duct-fans' }, 'en', k)).toBe('/en/category/duct-fans')
  })
  it('aile ve model (?sku=)', () => {
    expect(adresUret({ tur: 'aile', slug: 'storm-serisi' }, 'tr', k)).toBe('/tr/products/storm-serisi')
    expect(
      adresUret({ tur: 'model', aileSlug: 'storm-serisi', sku: 'SEA-61143003', slug: 'storm-10-x' }, 'tr', k),
    ).toBe('/tr/products/storm-serisi?sku=SEA-61143003')
  })
  it('marka', () => {
    expect(adresUret({ tur: 'marka', slug: 'vortice' }, 'tr', k)).toBe('/tr/brands/vortice')
  })
  it('marka listesi: iki dilde de bugünkü /brands', () => {
    expect(adresUret({ tur: 'markalar' }, 'tr', k)).toBe('/tr/brands')
    expect(adresUret({ tur: 'markalar' }, 'en', k)).toBe('/en/brands')
  })
})

describe('adresUret — AÇIK kip = plan §2 hedef şeması', () => {
  const a = true
  it.each([
    [{ tur: 'urunler' } as const, '/tr/urunler', '/en/products'],
    [{ tur: 'kategori', kok: 'fanlar' } as const, '/tr/kategori/fanlar', '/en/category/fanlar'],
    [
      { tur: 'kategori', kok: 'fanlar', dal: 'kanal-tipi-fanlar' } as const,
      '/tr/kategori/fanlar/kanal-tipi-fanlar',
      '/en/category/fanlar/kanal-tipi-fanlar',
    ],
    [{ tur: 'aile', slug: 'storm-serisi' } as const, '/tr/urun/storm-serisi', '/en/products/storm-serisi'],
    [{ tur: 'marka', slug: 'vortice' } as const, '/tr/markalar/vortice', '/en/brands/vortice'],
    [{ tur: 'markalar' } as const, '/tr/markalar', '/en/brands'],
  ])('%o', (n, tr, en) => {
    expect(adresUret(n, 'tr', a)).toBe(tr)
    expect(adresUret(n, 'en', a)).toBe(en)
  })

  it('model: <slug>-p-<sku küçük harf>, ?sku= YOK; metin yayındaki listeden (dil başına)', () => {
    const n = { tur: 'model', aileSlug: 'storm-serisi', sku: 'SEA-61143003' } as const
    expect(adresUret(n, 'tr', a)).toBe('/tr/urun/storm-10-kanal-fani-p-sea-61143003')
    expect(adresUret(n, 'en', a)).toBe('/en/products/storm-10-duct-fan-p-sea-61143003')
    expect(adresUret(n, 'tr', a)).not.toContain('?')
  })

  it('liste DIŞI model: model sayfası yok → AİLE adresi + ?sku= (yeni şemada bugünkü ?sku= seçiminin karşılığı)', () => {
    const n = { tur: 'model', aileSlug: 'storm-serisi', sku: 'SEA-YOK-1', slug: 'storm-10' } as const
    expect(adresUret(n, 'tr', a)).toBe('/tr/urun/storm-serisi?sku=SEA-YOK-1')
    expect(adresUret(n, 'en', a)).toBe('/en/products/storm-serisi?sku=SEA-YOK-1')
  })

  it('segmentler kodlanır (adrese boşluk/eğik çizgi sızmaz)', () => {
    expect(adresUret({ tur: 'aile', slug: 'a b/c' }, 'tr', a)).toBe('/tr/urun/a%20b%2Fc')
  })
})

describe('modelAdresiCoz', () => {
  it('son -p-\'den böler; SKU DB biçimine (büyük harf) döner', () => {
    expect(modelAdresiCoz('kanal-fani-p-vrt-253490106xn')).toEqual({
      slugMetni: 'kanal-fani',
      sku: 'VRT-253490106XN',
      skuKanonik: true,
    })
  })
  it('büyük harfli SKU çözülür ama kanonik DEĞİL (çağıran 308 verir)', () => {
    expect(modelAdresiCoz('kanal-fani-p-VRT-1')?.skuKanonik).toBe(false)
  })
  it('büyük harfte İngilizce harfe dönüşen başka harfler (ſ, ı) kanonik DEĞİL: aynı SKU\'ya çözülür, çağıran 308 verir', () => {
    expect(modelAdresiCoz('fan-p-vrt-1ſ')).toMatchObject({ sku: 'VRT-1S', skuKanonik: false })
    expect(modelAdresiCoz('fan-p-vırt-1')).toMatchObject({ sku: 'VIRT-1', skuKanonik: false })
    expect(modelAdresiCoz('fan-p-vrt-1s')?.skuKanonik).toBe(true)
  })
  it('-p- yoksa aile adresi → null', () => {
    expect(modelAdresiCoz('storm-serisi')).toBeNull()
  })
  it('boş parça ya da bozuk kodlama → null', () => {
    expect(modelAdresiCoz('-p-abc')).toBeNull()
    expect(modelAdresiCoz('abc-p-')).toBeNull()
    expect(modelAdresiCoz('%E0%A4%A')).toBeNull()
  })
  it('birden çok -p- → SON ayırıcı kazanır', () => {
    expect(modelAdresiCoz('a-p-b-p-sku1')).toMatchObject({ slugMetni: 'a-p-b', sku: 'SKU1' })
  })
  it('gidiş-dönüş: üretilen model adresinin son segmenti aynı SKU\'ya çözülür', () => {
    const adres = adresUret({ tur: 'model', aileSlug: 'x', sku: 'SEA-61143003' }, 'tr', true)
    const son = adres.split('/').pop() ?? ''
    expect(son).toContain(MODEL_AYIRICI)
    expect(modelAdresiCoz(son)).toMatchObject({ sku: 'SEA-61143003', skuKanonik: true, slugMetni: 'storm-10-kanal-fani' })
  })
})
