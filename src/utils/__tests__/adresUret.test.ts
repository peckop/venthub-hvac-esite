/**
 * Adres üreticinin iki kipi (REC-300 Faz 3, plan §2).
 *
 * KAPALI kip bugünkü canlı adresleri BİREBİR üretmeli — yüzeyler adresUret'e bağlandıkça canlıda
 * hiçbir adres değişmesin diye. Buradaki beklenen dizeler canlıdan okunan biçimlerdir
 * (2026-09-24: `/tr/products/storm-serisi?sku=SEA-61143003`, `/tr/category/<dal>` tek seviye).
 * AÇIK kip plan §2 tablosunun satır satır karşılığıdır.
 */
import { describe, expect, it } from 'vitest'

import { ADRES_SEMASI_K3B } from '../../config/features'
import { adresUret, MODEL_AYIRICI, modelAdresiCoz } from '../adresUret'

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
  ])('%o', (n, tr, en) => {
    expect(adresUret(n, 'tr', a)).toBe(tr)
    expect(adresUret(n, 'en', a)).toBe(en)
  })

  it('model: <slug>-p-<sku küçük harf>, ?sku= YOK', () => {
    const n = { tur: 'model', aileSlug: 'storm-serisi', sku: 'SEA-61143003', slug: 'storm-10-kanal-fani' } as const
    expect(adresUret(n, 'tr', a)).toBe('/tr/urun/storm-10-kanal-fani-p-sea-61143003')
    expect(adresUret({ ...n, slug: 'storm-10-duct-fan' }, 'en', a)).toBe('/en/products/storm-10-duct-fan-p-sea-61143003')
    expect(adresUret(n, 'tr', a)).not.toContain('?')
  })

  it('model slug yoksa (Faz 2 öncesi veri) kırık adres değil AİLE adresi', () => {
    const n = { tur: 'model', aileSlug: 'storm-serisi', sku: 'SEA-61143003', slug: null } as const
    expect(adresUret(n, 'tr', a)).toBe('/tr/urun/storm-serisi')
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
    const adres = adresUret({ tur: 'model', aileSlug: 'x', sku: 'SEA-61143003', slug: 'storm-10' }, 'tr', true)
    const son = adres.split('/').pop() ?? ''
    expect(son).toContain(MODEL_AYIRICI)
    expect(modelAdresiCoz(son)).toMatchObject({ sku: 'SEA-61143003', skuKanonik: true, slugMetni: 'storm-10' })
  })
})
