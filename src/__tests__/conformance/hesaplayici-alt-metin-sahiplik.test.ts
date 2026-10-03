// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'

/**
 * INV-HESAPLAYICI-ALT-METIN-1 (URN-18) — her hesaplayıcı sayfası yalnız KENDİ sözlük
 * ad alanındaki metinleri gösterir.
 *
 * NİÇİN VAR (2026-10-02, mobil ölçümde görüldü): kanal ve HRV hesaplayıcı sayfaları hava
 * perdesi sayfasından kopyalanmıştı ve alt metinleri `calculators.airCurtain.*` anahtarlarına
 * bağlı kalmıştı. Müşteri kanal sayfasında "Hava perdesinin kullanım amacını seçin", HRV
 * sayfasında "Önerilen hava perdesi özellikleri" okuyordu. Hava perdesi sayfasının kendi
 * "Kapı Ölçüleri" adımı da aynı yanlış metni gösteriyordu. Derleyici ve sözlük eşliği (parity)
 * testleri bunu görmedi: anahtar var, iki dilde de dolu, yalnız yanlış sayfaya ait.
 *
 * Üç yönü sabitler: (1) sayfa başka hesaplayıcının anahtarını kullanamaz, (2) kullandığı her
 * anahtar iki dilde çözülür, (3) bir sayfa aynı alt metin anahtarını iki başlığa yapıştıramaz.
 */

const SAYFALAR = [
  { ad: 'hava perdesi', ns: 'airCurtain', dosya: 'AirCurtainCalcPage.tsx' },
  { ad: 'kanal', ns: 'duct', dosya: 'DuctCalcPage.tsx' },
  { ad: 'hrv', ns: 'hrv', dosya: 'HRVCalcPage.tsx' },
  { ad: 'jet fan', ns: 'jetFan', dosya: 'JetFanCalcPage.tsx' },
] as const

const SOZLUKLER = [
  ['tr', tr],
  ['en', en],
] as const

const HAVA_PERDESI_METNI = /hava perdesi|air curtain/i

function kaynak(dosya: string): string {
  return readFileSync(join(process.cwd(), 'src', 'views', 'calculators', dosya), 'utf8')
}

/** Sayfadaki tüm `t('calculators.<ns>.<yol>')` anahtarları (tam anahtar, ad alanı ayrı). */
function hesaplayiciAnahtarlari(src: string): { anahtar: string; ns: string }[] {
  return [...src.matchAll(/t\('(calculators\.([A-Za-z0-9]+)\.[A-Za-z0-9_.]+)'/g)].map((m) => ({
    anahtar: m[1],
    ns: m[2],
  }))
}

/** Alt metin = `<p className="text-sm text-steel-gray">{t('…')}</p>` içindeki anahtar. */
function altMetinAnahtarlari(src: string): string[] {
  return [...src.matchAll(/<p className="text-sm text-steel-gray">\{t\('([^']+)'\)\}<\/p>/g)].map((m) => m[1])
}

function altDal(kok: unknown, ...yol: string[]): unknown {
  return yol.reduce<unknown>(
    (dal, k) => (dal && typeof dal === 'object' ? Reflect.get(dal, k) : undefined),
    kok,
  )
}

function duzlestir(deger: unknown, yol: string[] = []): { yol: string; metin: string }[] {
  if (typeof deger === 'string') return [{ yol: yol.join('.'), metin: deger }]
  if (deger && typeof deger === 'object') {
    return Object.entries(deger).flatMap(([k, v]) => duzlestir(v, [...yol, k]))
  }
  return []
}

describe('INV-HESAPLAYICI-ALT-METIN-1 · kaynak taraması', () => {
  for (const s of SAYFALAR) {
    const src = kaynak(s.dosya)

    it(`${s.ad}: yalnız calculators.${s.ns}.* anahtarlarını kullanır`, () => {
      const anahtarlar = hesaplayiciAnahtarlari(src)
      expect(anahtarlar.length).toBeGreaterThan(0)
      const yabanci = anahtarlar.filter((a) => a.ns !== s.ns).map((a) => a.anahtar)
      expect(yabanci).toEqual([])
    })

    it(`${s.ad}: kullandığı her anahtar TR ve EN sözlükte dolu bir metne çözülür`, () => {
      for (const { anahtar } of hesaplayiciAnahtarlari(src)) {
        for (const [dil, sozluk] of SOZLUKLER) {
          // getDictValue çözülemeyen anahtarda anahtarın kendisini döndürür.
          const deger = getDictValue(sozluk, anahtar)
          expect(deger, `${dil}:${anahtar}`).not.toBe(anahtar)
          expect(deger.trim().length, `${dil}:${anahtar}`).toBeGreaterThan(0)
        }
      }
    })

    it(`${s.ad}: alt metinleri var ve hiçbiri iki başlığa yapıştırılmamış`, () => {
      const alt = altMetinAnahtarlari(src)
      expect(alt.length).toBeGreaterThan(0)
      expect(alt.filter((a, i) => alt.indexOf(a) !== i)).toEqual([])
    })
  }

  it('hava perdesi: "Kapı Ölçüleri" adımının alt metni adım açıklamasıdır, kullanım amacı değil', () => {
    expect(kaynak('AirCurtainCalcPage.tsx')).toMatch(
      /steps\.dimensions'\)\}<\/h2>\s*<p className="text-sm text-steel-gray">\{t\('calculators\.airCurtain\.steps\.dimensionsDesc'\)\}/,
    )
  })
})

describe('INV-HESAPLAYICI-ALT-METIN-1 · sözlük', () => {
  for (const s of SAYFALAR.filter((x) => x.ns !== 'airCurtain')) {
    for (const [dil, sozluk] of SOZLUKLER) {
      it(`${dil}: calculators.${s.ns} hiçbir metninde hava perdesi geçmez`, () => {
        const metinler = duzlestir(altDal(sozluk, 'calculators', s.ns))
        expect(metinler.length).toBeGreaterThan(0)
        const sizinti = metinler.filter((m) => HAVA_PERDESI_METNI.test(m.metin)).map((m) => `${m.yol}: ${m.metin}`)
        expect(sizinti).toEqual([])
      })
    }
  }
})
