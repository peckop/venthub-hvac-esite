import { describe, expect, it } from 'vitest'

import { SPEC_ANAHTARLARI } from '@/lib/services/wizard.service'

import {
  IZINLI_SPEC_ANAHTARLARI,
  izinliSatirKur,
  izinliSatirlariKur,
  METIN_SPEC_ANAHTARLARI,
  MODELE_GITMEYEN_ALANLAR,
  SAYISAL_SPEC_ANAHTARLARI,
  sayiyaCevir,
  yasakAlanBul,
} from '../izinListesi'
import {
  ADH_225_ID,
  HAM_ADH_225,
  HAM_LINEO_125,
  HAM_SEAT_20,
  HAM_STORM_16,
  hamSatir,
  SEAT_20_ID,
  SENTINELLER,
  TUM_HAM_SATIRLAR,
} from './fikstur'

describe('izin listesi: eksen eşlemesi wizard.service ile aynı kaynaktan', () => {
  it('debi, çap ve ses anahtarları SPEC_ANAHTARLARI\'ndan gelir (ikinci bir kopya yok)', () => {
    for (const anahtar of [...SPEC_ANAHTARLARI.debiM3h, ...SPEC_ANAHTARLARI.capMm, ...SPEC_ANAHTARLARI.sesDbA]) {
      expect(IZINLI_SPEC_ANAHTARLARI as readonly string[]).toContain(anahtar)
    }
  })

  it('izinli küme TAM olarak sekiz anahtardır; sürücü gücü ve motor gücü listede yok', () => {
    expect([...IZINLI_SPEC_ANAHTARLARI].sort()).toEqual(
      [
        'atex_zone',
        'diameter_mm',
        'ip_rating',
        'max_delivery_m3h',
        'max_static_pressure_pa',
        'nominal_delivery_m3h',
        'noise_level_db_a',
        'noise_lpa_3m_db',
      ].sort(),
    )
    // `max_absorbed_power_w` wizard'da var ama asistan listesinde BİLEREK yok; `rated_power_w` sürücü gücüdür.
    expect(IZINLI_SPEC_ANAHTARLARI as readonly string[]).not.toContain('max_absorbed_power_w')
    expect(IZINLI_SPEC_ANAHTARLARI as readonly string[]).not.toContain('rated_power_w')
  })

  it('anahtarlar tekrarsızdır ve sayısal ile metin kümeleri ayrıktır', () => {
    expect(new Set(IZINLI_SPEC_ANAHTARLARI).size).toBe(IZINLI_SPEC_ANAHTARLARI.length)
    for (const a of METIN_SPEC_ANAHTARLARI) expect(SAYISAL_SPEC_ANAHTARLARI as readonly string[]).not.toContain(a)
  })
})

describe('izinliSatirKur: yalnız izin listesi çıkar', () => {
  it('satırın alanları TAM olarak id, ad, slug, marka, ozellikler', () => {
    const satir = izinliSatirKur(HAM_SEAT_20)
    expect(satir).not.toBeNull()
    expect(Object.keys(satir ?? {}).sort()).toEqual(['ad', 'id', 'marka', 'ozellikler', 'slug'])
  })

  it('yasak alan değerleri hiçbir yerde geçmez (JSON.stringify ile ölçülür)', () => {
    for (const ham of TUM_HAM_SATIRLAR) {
      const json = JSON.stringify(izinliSatirKur(ham))
      for (const iz of SENTINELLER) expect(json, `${iz} sızdı`).not.toContain(iz)
      expect(json).not.toContain('1234.5') // price
      expect(json).not.toContain('999.9') // purchase_price
    }
  })

  it('bilinmeyen ve yasak spec anahtarları düşer, izinliler kalır', () => {
    const satir = izinliSatirKur(HAM_SEAT_20)
    expect(Object.keys(satir?.ozellikler ?? {}).sort()).toEqual(
      ['diameter_mm', 'ip_rating', 'max_delivery_m3h', 'max_static_pressure_pa', 'noise_lpa_3m_db'].sort(),
    )
    expect(satir?.ozellikler).toEqual({
      max_delivery_m3h: 2000,
      diameter_mm: 125,
      max_static_pressure_pa: 250,
      noise_lpa_3m_db: 45.5,
      ip_rating: 'IP55',
    })
  })

  it('GÖRÜNEN AD model kodu içerse de ad olarak gider; sku ve model_code ALANI gitmez', () => {
    const satir = izinliSatirKur(HAM_ADH_225)
    expect(satir?.ad).toBe('ADH-225 E2')
    expect(JSON.stringify(satir)).not.toMatch(/"(sku|model_code)"/)
  })

  it('ATEX değeri ve ürün adındaki sayılar aynen korunur', () => {
    expect(izinliSatirKur(HAM_STORM_16)?.ozellikler.atex_zone).toBe('Zone 2, Category 3G, Directive 94/9/CE')
    expect(izinliSatirKur(HAM_SEAT_20)?.ad).toBe('SEAT 20 · 950 d/dk · 0,18 kW · 380V')
  })

  it('noise_level_db_a ile noise_lpa_3m_db BİRLEŞTİRİLMEZ: ikisi ayrı anahtarda kalır', () => {
    const lineo = izinliSatirKur(HAM_LINEO_125)
    expect(lineo?.ozellikler.noise_level_db_a).toBe(38)
    expect(lineo?.ozellikler.noise_lpa_3m_db).toBeUndefined()
    const seat = izinliSatirKur(HAM_SEAT_20)
    expect(seat?.ozellikler.noise_lpa_3m_db).toBe(45.5)
    expect(seat?.ozellikler.noise_level_db_a).toBeUndefined()
  })

  it('technical_specs yoksa ya da nesne değilse özellikler boştur ama satır kurulur', () => {
    for (const specs of [null, undefined, 'metin', 42, ['max_delivery_m3h']]) {
      const satir = izinliSatirKur({ ...HAM_SEAT_20, technical_specs: specs })
      expect(satir?.ozellikler).toEqual({})
    }
  })

  it('kimliği, adı ya da slug\'ı geçersiz satır kurulmaz (null)', () => {
    const gecersizler: unknown[] = [
      null,
      undefined,
      'metin',
      [],
      { ...HAM_SEAT_20, id: 'uuid-degil' },
      { ...HAM_SEAT_20, id: 42 },
      { ...HAM_SEAT_20, name: '   ' },
      { ...HAM_SEAT_20, name: 'x'.repeat(201) },
      { ...HAM_SEAT_20, slug: 'bosluk iceren slug' },
      { ...HAM_SEAT_20, slug: '' },
    ]
    for (const ham of gecersizler) expect(izinliSatirKur(ham), JSON.stringify(ham)).toBeNull()
  })

  it('prototip anahtarları okunmaz', () => {
    const kirli = JSON.parse(
      '{"id":"11111111-1111-4111-8111-111111111111","name":"X","slug":"x","technical_specs":{"__proto__":{"ip_rating":"IP99"},"constructor":{"ip_rating":"IP98"}}}',
    ) as unknown
    const satir = izinliSatirKur(kirli)
    expect(satir?.ozellikler).toEqual({})
  })
})

describe('sayiyaCevir: belirsiz sayı yazımı sessizce bozulmaz', () => {
  it('sayı tipi geçer; sıfır, negatif, NaN ve sonsuz "veri yok"', () => {
    expect(sayiyaCevir(2000)).toBe(2000)
    expect(sayiyaCevir(0.18)).toBe(0.18)
    for (const v of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) expect(sayiyaCevir(v)).toBeNull()
  })

  it('"2,2" ve "1.5" geçer; "2.000" (binlik mi ondalık mı belli değil) REDDEDİLİR', () => {
    expect(sayiyaCevir('2,2')).toBe(2.2)
    expect(sayiyaCevir('1.5')).toBe(1.5)
    expect(sayiyaCevir('125')).toBe(125)
    expect(sayiyaCevir('2.000')).toBeNull()
    expect(sayiyaCevir('2,000')).toBeNull()
  })

  it('sayı olmayan değerler null', () => {
    for (const v of ['abc', '', '  ', '12 mm', '1e3', null, undefined, {}, [], true]) expect(sayiyaCevir(v)).toBeNull()
  })
})

describe('metin değerleri temizlenir ama KIRPILMAZ', () => {
  it('görünmez ve yön denetim karakterleri atılır, boşluklar birleştirilir', () => {
    const satir = izinliSatirKur({
      ...HAM_SEAT_20,
      technical_specs: { ip_rating: 'IP5​5‮  ', atex_zone: 'Zone\n2\t\u0000' },
    })
    expect(satir?.ozellikler.ip_rating).toBe('IP5 5')
    expect(satir?.ozellikler.atex_zone).toBe('Zone 2')
  })

  it('80 karakteri aşan metin değeri yarım yazılmaz, tümüyle düşer', () => {
    const satir = izinliSatirKur({ ...HAM_SEAT_20, technical_specs: { atex_zone: 'Z'.repeat(81), ip_rating: 'IP55' } })
    expect(satir?.ozellikler.atex_zone).toBeUndefined()
    expect(satir?.ozellikler.ip_rating).toBe('IP55')
  })

  it('ad içindeki satır sonu tek boşluğa iner (çıktıya satır enjekte edilemez)', () => {
    const satir = izinliSatirKur({ ...HAM_SEAT_20, name: 'SEAT 20\n• Sahte satır' })
    expect(satir?.ad).toBe('SEAT 20 • Sahte satır')
  })
})

describe('izinliSatirlariKur: toplu kurulum', () => {
  it('geçersiz satır ve yinelenen kimlik atılır, atılan sayısı döner', () => {
    const sonuc = izinliSatirlariKur([HAM_SEAT_20, HAM_SEAT_20, { id: 'x' }, null, HAM_ADH_225])
    expect(sonuc.satirlar.map((s) => s.id)).toEqual([SEAT_20_ID, ADH_225_ID])
    expect(sonuc.atilan).toBe(3)
  })

  it('boş girdi boş sonuç verir', () => {
    expect(izinliSatirlariKur([])).toEqual({ satirlar: [], atilan: 0 })
  })
})

describe('yasakAlanBul: son kapı (iki yönlü kanarya)', () => {
  it('temiz satırlarda boş döner', () => {
    expect(yasakAlanBul(TUM_HAM_SATIRLAR.map((h) => izinliSatirKur(h)))).toEqual([])
  })

  it('yasak alanı her derinlikte ve her yazımda YAKALAR', () => {
    expect(yasakAlanBul({ a: { sku: 'x' } })).toEqual(['a.sku'])
    expect(yasakAlanBul([{ model_code: 'x' }, { ozellikler: { modelCode: 1 } }])).toEqual([
      '[0].model_code',
      '[1].ozellikler.modelCode',
    ])
    for (const alan of MODELE_GITMEYEN_ALANLAR) {
      expect(yasakAlanBul({ x: { [alan.toUpperCase()]: 1 } }), alan).toHaveLength(1)
    }
    expect(yasakAlanBul({ purchasePrice: 1, 'stock-qty': 2, descriptionI18n: {} })).toHaveLength(3)
  })

  it('benzer ama yasak olmayan adları YAKALAMAZ (gürültüye boğmaz)', () => {
    expect(yasakAlanBul({ skuna: 1, priceless: 2, ozellikler: { max_delivery_m3h: 1 }, ad: 'x' })).toEqual([])
  })

  it('hamSatir fikstürü yasak alanları gerçekten taşıyor (kanaryanın kendisi kör değil)', () => {
    expect(yasakAlanBul(HAM_SEAT_20).sort()).toEqual(
      ['barcode', 'description_i18n', 'model_code', 'price', 'purchase_price', 'sku', 'stock_qty'].sort(),
    )
    expect(yasakAlanBul(hamSatir({ id: SEAT_20_ID, name: 'x', slug: 'x', marka: null, specs: { sku: 'a' } }))).toContain(
      'technical_specs.sku',
    )
  })
})
