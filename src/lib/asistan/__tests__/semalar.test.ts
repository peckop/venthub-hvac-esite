import { describe, expect, it } from 'vitest'

import { IZINLI_SPEC_ANAHTARLARI } from '../izinListesi'
import {
  GEREKCE_KODLARI,
  karsilastirmaCoz,
  karsilastirmaDogrula,
  MAKS_BASVURU,
  MAKS_JSON_UZUNLUGU,
  NIYET_SINIFLARI,
  niyetCoz,
  niyetDogrula,
} from '../semalar'
import { ADH_225_ID, SEAT_20_ID, STORM_16_ID } from './fikstur'

const json = (v: unknown) => JSON.stringify(v)

describe('niyetCoz: geçerli çıktılar', () => {
  it('süz sınıfı izinli eksenlerle', () => {
    const sonuc = niyetCoz(json({ sinif: 'suz', suzgec: { debiMinM3h: 2000, ipMin: 'IP55', capMaksMm: 160 } }))
    expect(sonuc).toEqual({ ok: true, veri: { sinif: 'suz', suzgec: { debiMinM3h: 2000, ipMin: 'IP55', capMaksMm: 160 } } })
  })

  it('boş süzgeç geçerlidir ("çok geniş" yolu karşılar)', () => {
    expect(niyetCoz(json({ sinif: 'suz', suzgec: {} })).ok).toBe(true)
  })

  it('hesap, konu_disi ve kotu_niyet yalnız sınıfla geçerlidir', () => {
    for (const sinif of ['hesap', 'konu_disi', 'kotu_niyet']) {
      expect(niyetCoz(json({ sinif })), sinif).toEqual({ ok: true, veri: { sinif } })
    }
  })

  it('dört sınıfın hepsi tanımlı', () => {
    expect([...NIYET_SINIFLARI]).toEqual(['suz', 'hesap', 'konu_disi', 'kotu_niyet'])
  })

  it('IPX7 gibi X\'li yazım ve atexGerekli kabul edilir', () => {
    expect(niyetCoz(json({ sinif: 'suz', suzgec: { ipMin: 'IPX7', atexGerekli: true } })).ok).toBe(true)
  })
})

describe('niyetCoz: tipli hata sonuçları (fırlatma yok)', () => {
  it('geçersiz JSON → GECERSIZ_JSON', () => {
    for (const ham of ['{', 'merhaba', "{'sinif':'suz'}", '{"sinif":"suz",}', '```json\n{"sinif":"hesap"}\n```']) {
      expect(niyetCoz(ham), ham).toMatchObject({ ok: false, hata: 'GECERSIZ_JSON' })
    }
  })

  it('metin olmayan ya da boş çıktı → BOS_CIKTI', () => {
    for (const ham of ['', '   ', null, undefined, 42, {}, []]) {
      expect(niyetCoz(ham), String(ham)).toMatchObject({ ok: false, hata: 'BOS_CIKTI' })
    }
  })

  it('MAKS_JSON_UZUNLUGU\'nu aşan çıktı → COK_UZUN (ayrıştırılmaz bile)', () => {
    const uzun = json({ sinif: 'suz', suzgec: {}, not: 'x'.repeat(MAKS_JSON_UZUNLUGU) })
    expect(niyetCoz(uzun)).toMatchObject({ ok: false, hata: 'COK_UZUN' })
  })

  it('bilinmeyen kategori → BILINMEYEN_SINIF', () => {
    expect(niyetCoz(json({ sinif: 'sohbet' }))).toEqual({ ok: false, hata: 'BILINMEYEN_SINIF', yol: 'sinif' })
    expect(niyetCoz(json({ sinif: 'SUZ' }))).toMatchObject({ ok: false, hata: 'BILINMEYEN_SINIF' })
    expect(niyetCoz(json({ sinif: 'suz ' }))).toMatchObject({ ok: false, hata: 'BILINMEYEN_SINIF' })
  })

  it('sinif eksik ya da metin değil → SEMA_DISI', () => {
    for (const v of [{}, { suzgec: {} }, { sinif: 1 }, { sinif: null }, [], 'x', 7, null, true]) {
      expect(niyetCoz(json(v)), json(v)).toMatchObject({ ok: false, hata: 'SEMA_DISI' })
    }
  })

  it('şema dışı alan → SEMA_DISI (üst düzeyde, süzgeçte, hesap sınıfında)', () => {
    const vakalar = [
      { sinif: 'suz', suzgec: {}, aciklama: 'serbest metin' },
      { sinif: 'suz', suzgec: { sku: 'X-1' } },
      { sinif: 'suz', suzgec: { fiyatMaks: 100 } },
      { sinif: 'hesap', suzgec: {} },
      { sinif: 'konu_disi', cevap: 'merhaba' },
    ]
    for (const v of vakalar) expect(niyetCoz(json(v)), json(v)).toMatchObject({ ok: false, hata: 'SEMA_DISI' })
  })

  it('süz sınıfında süzgeç eksikse SEMA_DISI', () => {
    expect(niyetCoz(json({ sinif: 'suz' }))).toMatchObject({ ok: false, hata: 'SEMA_DISI' })
  })

  it('negatif, sıfır, aşırı büyük, sayı olmayan değerler → SEMA_DISI ve yol hangi alan olduğunu söyler', () => {
    const vakalar: Array<[Record<string, unknown>, string]> = [
      [{ debiMinM3h: -1 }, 'suzgec.debiMinM3h'],
      [{ debiMinM3h: 0 }, 'suzgec.debiMinM3h'],
      [{ debiMinM3h: 1e12 }, 'suzgec.debiMinM3h'],
      [{ debiMinM3h: '2000' }, 'suzgec.debiMinM3h'],
      [{ capMinMm: -5 }, 'suzgec.capMinMm'],
      [{ statikBasincMinPa: null }, 'suzgec.statikBasincMinPa'],
      [{ sesMaksDb3m: 500 }, 'suzgec.sesMaksDb3m'],
      [{ ipMin: 'IP5' }, 'suzgec.ipMin'],
      [{ ipMin: 'ip55' }, 'suzgec.ipMin'],
      [{ ipMin: 'IP75' }, 'suzgec.ipMin'],
      [{ atexGerekli: 'evet' }, 'suzgec.atexGerekli'],
    ]
    for (const [suzgec, yol] of vakalar) {
      expect(niyetCoz(json({ sinif: 'suz', suzgec })), json(suzgec)).toEqual({ ok: false, hata: 'SEMA_DISI', yol })
    }
  })

  it('çap alt sınırı üst sınırı aşarsa SEMA_DISI', () => {
    expect(niyetCoz(json({ sinif: 'suz', suzgec: { capMinMm: 300, capMaksMm: 100 } }))).toMatchObject({
      ok: false,
      hata: 'SEMA_DISI',
    })
    expect(niyetCoz(json({ sinif: 'suz', suzgec: { capMinMm: 100, capMaksMm: 100 } })).ok).toBe(true)
  })

  it('prototip kirletme girişimi reddedilir', () => {
    expect(niyetCoz('{"sinif":"suz","suzgec":{},"__proto__":{"sinif":"hesap"}}')).toMatchObject({ ok: false })
    expect(niyetCoz('{"sinif":"suz","suzgec":{"__proto__":{"debiMinM3h":1}}}')).toMatchObject({ ok: false })
  })

  it('yol alanı modelin yazdığı anahtar adını güvenli ve kısa biçimde taşır', () => {
    const sonuc = niyetCoz(json({ sinif: 'suz', suzgec: { ['<script>' + 'a'.repeat(200)]: 1 } }))
    expect(sonuc.ok).toBe(false)
    if (!sonuc.ok) expect(sonuc.yol.length).toBeLessThanOrEqual(80)
  })

  it('hiçbir girdide fırlatmaz', () => {
    const girdiler: unknown[] = [undefined, null, 0, NaN, {}, [], 'null', '[]', '"x"', 'true', '{"sinif":{}}', Symbol('s').toString()]
    for (const g of girdiler) expect(() => niyetCoz(g)).not.toThrow()
    expect(() => niyetDogrula(Object.create(null))).not.toThrow()
  })
})

const GECERLI_KARSILASTIRMA = {
  basvurular: [
    { urunId: SEAT_20_ID, alan: 'max_delivery_m3h' },
    { urunId: STORM_16_ID, alan: 'max_delivery_m3h' },
  ],
  gerekceKodlari: ['EN_YUKSEK_DEBI'],
}

describe('karsilastirmaCoz', () => {
  it('geçerli başvuru ve gerekçe kodu kabul edilir', () => {
    expect(karsilastirmaCoz(json(GECERLI_KARSILASTIRMA))).toEqual({ ok: true, veri: GECERLI_KARSILASTIRMA })
  })

  it('izinli sekiz alanın hepsi başvurulabilir; her gerekçe kodu geçerlidir', () => {
    const basvurular = IZINLI_SPEC_ANAHTARLARI.map((alan) => ({ urunId: ADH_225_ID, alan }))
    expect(karsilastirmaDogrula({ basvurular, gerekceKodlari: [...GEREKCE_KODLARI] }).ok).toBe(true)
  })

  it('izinli olmayan alan reddedilir (sku, price, description_i18n, bilinmeyen)', () => {
    for (const alan of ['sku', 'model_code', 'price', 'stock_qty', 'description_i18n', 'max_absorbed_power_w', 'rated_power_w']) {
      const sonuc = karsilastirmaCoz(json({ ...GECERLI_KARSILASTIRMA, basvurular: [{ urunId: SEAT_20_ID, alan }] }))
      expect(sonuc, alan).toMatchObject({ ok: false, hata: 'SEMA_DISI' })
    }
  })

  it('MAKS_BASVURU\'dan fazla başvuru reddedilir, tam sınır kabul edilir', () => {
    const baslik = (n: number) => ({
      ...GECERLI_KARSILASTIRMA,
      basvurular: Array.from({ length: n }, () => ({ urunId: SEAT_20_ID, alan: 'diameter_mm' })),
    })
    expect(MAKS_BASVURU).toBe(10)
    expect(karsilastirmaCoz(json(baslik(MAKS_BASVURU))).ok).toBe(true)
    expect(karsilastirmaCoz(json(baslik(MAKS_BASVURU + 1)))).toMatchObject({ ok: false, hata: 'SEMA_DISI' })
    expect(karsilastirmaCoz(json(baslik(0)))).toMatchObject({ ok: false, hata: 'SEMA_DISI' })
  })

  it('bilinmeyen gerekçe kodu, serbest metin alanı ve ürün kimliği biçimi reddedilir', () => {
    const vakalar = [
      { ...GECERLI_KARSILASTIRMA, gerekceKodlari: ['EN_UYGUN'] },
      { ...GECERLI_KARSILASTIRMA, gerekceKodlari: ['en_yuksek_debi'] },
      { ...GECERLI_KARSILASTIRMA, aciklama: 'bu ürün en iyisi' },
      { ...GECERLI_KARSILASTIRMA, basvurular: [{ urunId: SEAT_20_ID, alan: 'diameter_mm', deger: 125 }] },
      { ...GECERLI_KARSILASTIRMA, basvurular: [{ urunId: 'seat-20', alan: 'diameter_mm' }] },
      { basvurular: GECERLI_KARSILASTIRMA.basvurular },
      { gerekceKodlari: [] },
    ]
    for (const v of vakalar) expect(karsilastirmaCoz(json(v)), json(v)).toMatchObject({ ok: false, hata: 'SEMA_DISI' })
  })

  it('geçersiz JSON ve boş çıktı tipli hata verir', () => {
    expect(karsilastirmaCoz('{')).toMatchObject({ ok: false, hata: 'GECERSIZ_JSON' })
    expect(karsilastirmaCoz('')).toMatchObject({ ok: false, hata: 'BOS_CIKTI' })
    expect(karsilastirmaCoz(null)).toMatchObject({ ok: false, hata: 'BOS_CIKTI' })
  })

  it('gerekçe kodu listesinde "uygun" ya da yargı bildiren kod yok', () => {
    for (const kod of GEREKCE_KODLARI) expect(kod).not.toMatch(/UYGUN|EN_IYI|ONERI/)
  })
})
