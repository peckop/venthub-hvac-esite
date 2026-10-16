/**
 * URN-135 (U4 · Design D4) — Lineo Quiet aile sayfası metinleri (title / H1 / ilk paragraf / meta).
 *
 *  (a) slug eşleşmesi: yalnız Lineo Quiet ailesi geçersiz kılınır; diğer her slug null (bugünkü zincir AYNEN)
 *  (b) TR/EN parite: iki dilin şablonları aynı alanlara, aynı yer tutuculara ve aynı aday sayısına sahip
 *  (c) 12 canlı kod: ses etiketi `sesEtiketi` çıktısıdır, model sayısı 12; yer tutucu kalıntısı yok
 *  (d) ses verisi yok / model sayısı 0 kolları: sayısız şablon, ham `{…}` yok
 *  (e) meta ≤155 (veri var, veri yok, uç sayılar); sığmayan meta KULLANILMAZ (null)
 *  (f) katalog doğrulamasında çıkarılan ifadeler geri gelmez
 *  (g) koşulsuz dB(A) yok: her dB(A) yanında "3 m" mesafe koşulu
 */
import { describe, expect, it } from 'vitest'

import { sesEtiketSozlugu } from '@/components/category/sections/silent-fan/sesMetni'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'

import {
  AILE_SABLONLARI,
  type AileMetniBaglam,
  aileMetniGecersizKil,
  LINEO_QUIET_AILE_SLUG,
  META_AZAMI,
} from '../aileMetinleri'
import { SESSIZ_FAN_SERI_SLUGLARI } from '../sesOzeti'
import { seriOzeti, sesEtiketi } from '../sesVerisi'

const KODLAR = [
  '17160', '17161', '17162', '17164', '17165', '17166',
  '17170', '17171', '17172', '17174', '17175', '17176',
]
const SKULAR = KODLAR.map((k) => `VRT-${k}`)
const SOZLUK = { tr: sesEtiketSozlugu(tr.categorySilentFan.ses), en: sesEtiketSozlugu(en.categorySilentFan.ses) }

type BaglamEk = Partial<Omit<AileMetniBaglam, 'varyantlar'>> & { skular?: ReadonlyArray<string | null | undefined> }

/** Testlerde SKU listesi (`skular`) yazmak kolay; bağlam varyant nesnesi ister. */
function baglam(dil: 'tr' | 'en', ek: BaglamEk = {}): AileMetniBaglam {
  const { skular = SKULAR, ...diger } = ek
  return { varyantlar: skular.map((sku) => ({ sku })), nModel: 12, sesSozlugu: SOZLUK[dil], ...diger }
}

const uzunluk = (s: string) => [...s].length
const yerTutucular = (s: string) => [...s.matchAll(/\{[A-Z_]+\}/g)].map((m) => m[0]).sort()

describe('(a) slug eşleşmesi', () => {
  it('slug sabiti görünüm/veri tarafındaki seri slug listesiyle aynı', () => {
    expect(LINEO_QUIET_AILE_SLUG).toBe('vortice-lineo-quiet-sessiz-kanal-fanlari')
    expect(SESSIZ_FAN_SERI_SLUGLARI[0]).toBe(LINEO_QUIET_AILE_SLUG)
  })

  it.each(['avens-bvu-ls', 'vortice-lineo-quiet', 'vortice-lineo-quiet-sessiz-kanal-fanlari-2', '', 'Vortice-Lineo-Quiet-Sessiz-Kanal-Fanlari'])(
    'eşleşmeyen slug "%s": null',
    (slug) => {
      expect(aileMetniGecersizKil(slug, 'tr', baglam('tr'))).toBeNull()
      expect(aileMetniGecersizKil(slug, 'en', baglam('en'))).toBeNull()
    },
  )

  it('eşleşen slug: iki dilde de dolu sonuç; tanınmayan dil TR sayılır', () => {
    expect(aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, 'tr', baglam('tr'))).not.toBeNull()
    expect(aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, 'en', baglam('en'))).not.toBeNull()
    expect(aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, 'de', baglam('tr'))).toEqual(
      aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, 'tr', baglam('tr')),
    )
  })
})

describe('(b) TR/EN parite', () => {
  const t = AILE_SABLONLARI.tr
  const e = AILE_SABLONLARI.en

  it('aynı alanlar, aynı yer tutucu kümeleri', () => {
    expect(Object.keys(t).sort()).toEqual(Object.keys(e).sort())
    expect(yerTutucular(t.title.n)).toEqual(yerTutucular(e.title.n))
    expect(yerTutucular(t.title.nsiz)).toEqual([])
    expect(yerTutucular(e.title.nsiz)).toEqual([])
    expect(yerTutucular(t.ilkParagraf.ses)).toEqual(yerTutucular(e.ilkParagraf.ses))
    expect(yerTutucular(t.ilkParagraf.sayisiz)).toEqual([])
    expect(yerTutucular(e.ilkParagraf.sayisiz)).toEqual([])
    expect(t.h1).not.toBe('')
    expect(e.h1).not.toBe('')
  })

  it.each(['sesVeN', 'sesli', 'nli', 'yok'] as const)('meta adayları "%s": aynı sayıda, aynı yer tutucular', (kol) => {
    expect(t.meta[kol].length).toBeGreaterThan(0)
    expect(t.meta[kol].length).toBe(e.meta[kol].length)
    t.meta[kol].forEach((aday, i) => expect(yerTutucular(aday)).toEqual(yerTutucular(e.meta[kol][i])))
  })

  it('TR ve EN metinleri birbirinin kopyası değil', () => {
    expect(t.h1).not.toBe(e.h1)
    expect(t.title.n).not.toBe(e.title.n)
    expect(t.ilkParagraf.ses).not.toBe(e.ilkParagraf.ses)
  })
})

describe('(c) 12 canlı kod, 12 model', () => {
  const ozet = seriOzeti(KODLAR)

  it.each(['tr', 'en'] as const)('%s: ses etiketi sesEtiketi çıktısı, model sayısı 12, yer tutucu kalıntısı yok', (dil) => {
    expect(ozet).not.toBeNull()
    if (!ozet) return
    const etiket = sesEtiketi(ozet.enDusukGovde, dil, SOZLUK[dil])
    const s = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, dil, baglam(dil))
    expect(s).not.toBeNull()
    if (!s) return
    expect(s.title).toContain('12')
    expect(s.ilkParagraf).toContain(etiket)
    expect(s.meta).toContain(etiket)
    expect(s.meta).toContain('12')
    for (const alan of [s.title, s.h1, s.ilkParagraf, s.meta ?? '']) {
      expect(alan).not.toMatch(/[{}]/)
      expect(alan).not.toContain('undefined')
      expect(alan).not.toContain('NaN')
    }
  })

  it('TR çıktıları Design D4 metniyle birebir (veriden gelen sayı: 9,9 · 4 V · gövde)', () => {
    const s = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, 'tr', baglam('tr'))
    expect(s?.title).toBe('Vortice Lineo Quiet Sessiz Kanal Fanı: 12 Model | VentHub')
    expect(s?.h1).toBe('Vortice Lineo Quiet Sessiz Kanal Tipi Fan')
    expect(s?.ilkParagraf).toContain('katalogdaki en düşük değer 9,9 dB(A) · 4 V · gövde, 3 m.')
    expect(s?.meta).toBe(
      'Vortice Lineo Quiet, ses emici gövdeli bir kanal fanıdır; ses değeri 9,9 dB(A) · 4 V · gövde, 3 m değerinden başlar ve AC ile EC motorlu 12 modeli vardır.',
    )
  })

  it('EN çıktıları Design D4 metniyle birebir (9.9 ondalık noktası, casing)', () => {
    const s = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, 'en', baglam('en'))
    expect(s?.title).toBe('Vortice Lineo Quiet Silent Duct Fan: 12 Models | VentHub')
    expect(s?.h1).toBe('Vortice Lineo Quiet Silent In-Line Duct Fan')
    expect(s?.ilkParagraf).toContain('the lowest catalogue value is 9.9 dB(A) · 4 V ·')
    expect(s?.meta).toMatch(/^Vortice Lineo Quiet is a duct fan with a sound-absorbing casing; its sound values start at 9\.9 dB\(A\)/)
    expect(s?.meta).toMatch(/across 12 AC and EC motor models\.$/)
  })

  it('verisi olmayan / siteye ait olmayan kod sayıya girmez (kesişim)', () => {
    // 17163 ve 17173 veri modülünde olabilir ama sitede satılmıyor; yalnız canlı SKU'lar sayılır.
    const yalnizDusuk = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, 'tr', baglam('tr', { skular: ['VRT-17166', 'VRT-99999', null, undefined, 'XYZ'] }))
    const beklenen = seriOzeti(['17166'])
    expect(beklenen).not.toBeNull()
    if (!beklenen) return
    expect(yalnizDusuk?.ilkParagraf).toContain(sesEtiketi(beklenen.enDusukGovde, 'tr', SOZLUK.tr))
  })
})

describe('(d) veri yok ve model sayısı 0 kolları', () => {
  it.each(['tr', 'en'] as const)('%s: ses kesişimi boş → sayısız ilk paragraf ve meta; başlık yine model sayısını söyler', (dil) => {
    const s = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, dil, baglam(dil, { skular: [] }))
    expect(s).not.toBeNull()
    if (!s) return
    expect(s.title).toContain('12')
    expect(s.ilkParagraf).not.toContain('dB')
    expect(s.meta ?? '').not.toContain('dB')
    expect(s.meta ?? '').toContain('12')
    for (const alan of [s.title, s.h1, s.ilkParagraf, s.meta ?? '']) expect(alan).not.toMatch(/[{}]/)
  })

  it('TR sayısız fallback: title ve meta tam cümle, ses cümlesi atılmış', () => {
    const s = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, 'tr', baglam('tr', { skular: [] }))
    expect(s?.title).toBe('Vortice Lineo Quiet Sessiz Kanal Fanı: 12 Model | VentHub')
    expect(s?.meta).toBe('Vortice Lineo Quiet, ses emici gövdeli bir kanal fanıdır; AC ile EC motorlu 12 modeli vardır.')
    expect(s?.ilkParagraf.endsWith('yatay ya da dikey kurulumla kullanılır.')).toBe(true)
    expect(s?.ilkParagraf).toContain('optimize edilmiştir. Ø100–Ø315 mm')
  })

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])('model sayısı %s: sayı geçen kısım atılır', (n) => {
    for (const dil of ['tr', 'en'] as const) {
      const s = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, dil, baglam(dil, { nModel: n }))
      expect(s).not.toBeNull()
      if (!s) continue
      expect(s.title).not.toMatch(/\d/)
      expect(s.title.endsWith('| VentHub')).toBe(true)
      expect(s.meta ?? '').not.toContain('12')
      expect(s.meta ?? '').not.toMatch(/\b\d+ (modeli|models?)\b/)
      // ses var → ses cümlesi durur
      expect(s.ilkParagraf).toContain('dB(A)')
      for (const alan of [s.title, s.h1, s.ilkParagraf, s.meta ?? '']) expect(alan).not.toMatch(/[{}]/)
    }
  })

  it('ikisi birden yok: yine ham yer tutucu ve rakam çıkmaz', () => {
    for (const dil of ['tr', 'en'] as const) {
      const s = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, dil, baglam(dil, { skular: [], nModel: 0 }))
      expect(s).not.toBeNull()
      if (!s) continue
      expect(`${s.title} ${s.ilkParagraf} ${s.meta ?? ''}`).not.toMatch(/[{}]|dB\(A\)/)
      expect(s.title).not.toMatch(/\d/)
      expect(s.meta).not.toBeNull()
    }
  })
})

describe('(e) meta uzunluğu', () => {
  const durumlar: Array<[string, BaglamEk]> = [
    ['veri var, 12 model', {}],
    ['veri yok, 12 model', { skular: [] }],
    ['veri var, model sayısı yok', { nModel: 0 }],
    ['veri yok, model sayısı yok', { skular: [], nModel: 0 }],
    ['uç model sayısı (7 hane)', { nModel: 1234567 }],
  ]

  it.each(durumlar)('TR ve EN: %s → meta ≤ 155 karakter ve tam cümle', (_ad, ek) => {
    for (const dil of ['tr', 'en'] as const) {
      const s = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, dil, baglam(dil, ek))
      expect(s?.meta, `${dil}`).toBeTruthy()
      expect(uzunluk(s?.meta ?? ''), `${dil}: ${s?.meta}`).toBeLessThanOrEqual(META_AZAMI)
      expect(s?.meta?.endsWith('.')).toBe(true)
      expect(s?.meta).toMatch(/^Vortice Lineo Quiet/)
    }
  })

  it('155 sabiti aciklamaKirp üst sınırıyla aynı', async () => {
    const { ACIKLAMA_AZAMI } = await import('@/lib/seo/aciklamaKirp')
    expect(META_AZAMI).toBe(ACIKLAMA_AZAMI)
  })

  it('uzun aday sığmazsa kısa aday seçilir (AC/EC ibaresi atılır), kısa da sığmazsa null', () => {
    // Gerçek metin 12 model için en çok 155'e yakındır; sözlük sözcüğü uzayınca uzun aday taşar.
    const uzunGovde = { ...SOZLUK.tr, yer: { ...SOZLUK.tr.yer, govde: 'gövde yüzeyi' } }
    const kisa = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, 'tr', baglam('tr', { sesSozlugu: uzunGovde }))
    expect(kisa?.meta).not.toBeNull()
    expect(kisa?.meta).not.toContain('AC ile EC motorlu')
    expect(uzunluk(kisa?.meta ?? '')).toBeLessThanOrEqual(META_AZAMI)

    const devasa = { ...SOZLUK.tr, yer: { ...SOZLUK.tr.yer, govde: 'g'.repeat(200) } }
    const yok = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, 'tr', baglam('tr', { sesSozlugu: devasa }))
    // Hiçbir ses adayı sığmadı: 155'i aşan meta KULLANILMAZ (çağıran mevcut zincire düşer).
    expect(yok?.meta).toBeNull()
    expect(yok?.title).toBeTruthy()
  })
})

describe('(f) katalog doğrulamasında çıkarılan ifadeler geri gelmez', () => {
  const YASAKLI = [
    /helmholtz/i,
    /sessizliğin kaynağı/i,
    /yatak odası/i,
    /toplantı odası/i,
    /\bofis/i,
    /\boffice/i,
    /bedroom/i,
    /meeting room/i,
    /dört kademe/i,
    /four (speed|step|level)/i,
    /kabuk içindeki/i,
  ]

  it('ham şablonlar ve doldurulmuş çıktılar yasaklı ifade içermez', () => {
    const tum = [
      JSON.stringify(AILE_SABLONLARI),
      ...(['tr', 'en'] as const).flatMap((dil) => {
        const s = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, dil, baglam(dil))
        return s ? [s.title, s.h1, s.ilkParagraf, s.meta ?? ''] : []
      }),
    ].join('\n')
    for (const kalip of YASAKLI) expect(tum, String(kalip)).not.toMatch(kalip)
  })
})

describe('(g) koşulsuz dB(A) yok', () => {
  it('her dB(A) hemen arkasından kademe, yer ve 3 m mesafe koşuluyla yazılır', () => {
    for (const dil of ['tr', 'en'] as const) {
      const s = aileMetniGecersizKil(LINEO_QUIET_AILE_SLUG, dil, baglam(dil))
      const metin = [s?.title, s?.h1, s?.ilkParagraf, s?.meta].join('\n')
      const bulunan = [...metin.matchAll(/dB\(A\)/g)]
      expect(bulunan.length).toBeGreaterThan(0)
      for (const m of bulunan) {
        const kuyruk = metin.slice(m.index, (m.index ?? 0) + 40)
        expect(kuyruk, `${dil}: ${kuyruk}`).toMatch(/^dB\(A\) · [^,]+, 3 m/)
      }
    }
  })

  it('şablonların kendisinde sabit dB(A) sayısı yok (sayı yalnız yer tutucudan)', () => {
    expect(JSON.stringify(AILE_SABLONLARI)).not.toMatch(/\d[.,]?\d* ?dB/)
  })
})
