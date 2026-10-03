// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'

/**
 * INV-HESAPLAYICI-ALT-METIN-1 (URN-18) — her hesaplayıcı sayfası yalnız KENDİ sözlük
 * ad alanındaki metinleri gösterir ve sözlüğe bağlı olmayan görünür metin taşımaz.
 *
 * NİÇİN VAR (2026-10-02, mobil ölçümde görüldü): kanal ve HRV hesaplayıcı sayfaları hava
 * perdesi sayfasından kopyalanmıştı ve alt metinleri `calculators.airCurtain.*` anahtarlarına
 * bağlı kalmıştı. Müşteri kanal sayfasında "Hava perdesinin kullanım amacını seçin", HRV
 * sayfasında "Önerilen hava perdesi özellikleri" okuyordu. HRV sonuç alanında ayrıca sepetin
 * "Toplam" anahtarı ve sabit İngilizce "Annual Energy Saving" başlıkları görünüyordu. Derleyici
 * ve sözlük eşliği (parity) testleri bunu görmedi: anahtar var, iki dilde de dolu, yalnız yanlış
 * sayfaya ait ya da hiç sözlükte değil.
 *
 * Dört yönü sabitler: (1) sayfa başka hesaplayıcının (ya da `cart.` gibi başka alanın)
 * anahtarını kullanamaz; tek, çift tırnak ve şablon dizesi aynı kuralla taranır, (2) kullandığı
 * her anahtar iki dilde çözülür, (3) aynı alt metin anahtarı iki başlığa yapıştırılamaz,
 * (4) title/aria-label/placeholder/unit gibi niteliklerde ve JSX metin düğümlerinde sözlüğe
 * bağlı olmayan harfli metin yoktur (SI birim simgeleri gerekçeli izin listesinde).
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

/**
 * Sözlüğe bağlanmadan yazılabilen TEK görünür metinler: dilden bağımsız birim simgeleri.
 * Gerekçe: SI/mühendislik simgeleri (m, mm, Pa, W, N, ACH, m³/h …) Türkçede de İngilizcede de
 * aynı yazılır; çeviri anahtarı açmak yalnız gürültü olur. Dile göre değişen her şey
 * ("people", "years", "kWh/y" → "kişi", "yıl", "kWh/yıl") sözlükte durur, burada YOK.
 */
const SABIT_BIRIM_SIMGELERI: ReadonlySet<string> = new Set([
  'm', 'mm', 'm²', 'm³/h', 'm/s', 'W', 'Pa', 'Pa/m', 'N', 'h', 'ACH', '₺/kWh',
])

const GORUNUR_NITELIKLER = [
  'title', 'aria-label', 'placeholder', 'label', 'description', 'unit', 'alt', 'subtitle',
  'tooltip', 'hint', 'helperText', 'text',
]

function kaynak(dosya: string): string {
  return readFileSync(join(process.cwd(), 'src', 'views', 'calculators', dosya), 'utf8')
}

interface CevirmeCagrisi {
  /** Tırnak içindeki ham metin; şablon dizesinde `${…}` dahil. */
  anahtar: string
  dinamik: boolean
  /** Dinamik anahtarda `${` öncesi, değilse anahtarın kendisi. */
  onEk: string
}

/** Tek tırnak, çift tırnak ve şablon dizesiyle yazılmış tüm `t(...)` ilk argümanları. */
function cevirmeCagrilari(src: string): CevirmeCagrisi[] {
  return [...src.matchAll(/\bt\(\s*(['"`])((?:(?!\1)[\s\S])*)\1/g)].map((m) => {
    const anahtar = m[2]
    const i = anahtar.indexOf('${')
    return { anahtar, dinamik: i !== -1, onEk: i === -1 ? anahtar : anahtar.slice(0, i) }
  })
}

/** Alt metin = `<p className="text-sm text-steel-gray">{t('…')}</p>` içindeki anahtar. */
function altMetinAnahtarlari(src: string): string[] {
  return [...src.matchAll(/<p className="text-sm text-steel-gray">\{t\((['"])(.+?)\1\)\}<\/p>/g)].map((m) => m[2])
}

function yorumsuz(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const HARF_DIZISI = /\p{L}{2,}/u

/** Harfli sabit nitelik değerleri: `title="Annual …"` ve `title={'…'}`. Birim simgeleri hariç. */
function sabitNitelikMetinleri(src: string): string[] {
  const nitelik = GORUNUR_NITELIKLER.join('|')
  const dd = new RegExp(`(?<![\\w-])(?:${nitelik})=(["'])([^"']*)\\1`, 'g')
  const ifade = new RegExp(`(?<![\\w-])(?:${nitelik})=\\{\\s*(['"\`])([^'"\`$]*)\\1\\s*\\}`, 'g')
  const kod = yorumsuz(src)
  return [...kod.matchAll(dd), ...kod.matchAll(ifade)]
    .map((m) => m[2].trim())
    .filter((m) => HARF_DIZISI.test(m) && !SABIT_BIRIM_SIMGELERI.has(m))
}

/** JSX metin düğümleri (`>Düz metin<`); kod kalıntıları (`=>`, `>=`, `&&`) elenir. */
function sabitMetinDugumleri(src: string): string[] {
  const kod = yorumsuz(src)
  return [...kod.matchAll(/(?<![=\-])>([^<>{}]*)<(?=[/A-Za-z])/g)]
    .map((m) => m[1].trim())
    .filter((m) => HARF_DIZISI.test(m) && !/[=;()&|]/.test(m))
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

describe('INV-HESAPLAYICI-ALT-METIN-1 · tarayıcılar kör değil', () => {
  it('çeviri çağrısı: tek tırnak, çift tırnak ve şablon dizesi yakalanır', () => {
    const c = cevirmeCagrilari(
      "t('calculators.hrv.a') t(\"calculators.hrv.b\") t(`calculators.hrv.c.${x}`) format('x')",
    )
    expect(c.map((x) => x.onEk)).toEqual(['calculators.hrv.a', 'calculators.hrv.b', 'calculators.hrv.c.'])
    expect(c.map((x) => x.dinamik)).toEqual([false, false, true])
  })

  it('sabit nitelik: harfli metin yakalanır, birim simgesi ve sözlük bağı yakalanmaz', () => {
    const kod = `<ResultCard title="Annual Energy Saving" unit="mm" unit={'years'} title={t('a.b')} placeholder="1.5" />`
    expect(sabitNitelikMetinleri(kod)).toEqual(['Annual Energy Saving', 'years'])
  })

  it('sabit metin düğümü: harfli düz metin yakalanır, ifade ve karşılaştırma yakalanmaz', () => {
    const kod = `<h3>Annual Savings</h3><p>{t('a.b')}</p>\n const f = (a) => a\n if (ach >= 6 && ach <= 10) return 1`
    expect(sabitMetinDugumleri(kod)).toEqual(['Annual Savings'])
  })
})

describe('INV-HESAPLAYICI-ALT-METIN-1 · kaynak taraması', () => {
  for (const s of SAYFALAR) {
    const src = kaynak(s.dosya)

    it(`${s.ad}: yalnız calculators.${s.ns}.* ve common.* anahtarlarını kullanır`, () => {
      const cagrilar = cevirmeCagrilari(src)
      expect(cagrilar.length).toBeGreaterThan(0)
      const yabanci = cagrilar
        .filter((c) => !c.onEk.startsWith(`calculators.${s.ns}.`) && !c.onEk.startsWith('common.'))
        .map((c) => c.anahtar)
      expect(yabanci).toEqual([])
    })

    it(`${s.ad}: kullandığı her anahtar TR ve EN sözlükte çözülür`, () => {
      for (const c of cevirmeCagrilari(src)) {
        for (const [dil, sozluk] of SOZLUKLER) {
          if (c.dinamik) {
            // Şablon dizesinde ön ek bir sözlük dalına inmeli: `…applications.` → o dal,
            // `…results.efficiency` → `results` dalında `efficiency` ile başlayan en az bir anahtar.
            const son = c.onEk.lastIndexOf('.')
            const dal = altDal(sozluk, ...c.onEk.slice(0, son).split('.'))
            const kalan = c.onEk.slice(son + 1)
            const anahtarlar = dal && typeof dal === 'object' ? Object.keys(dal) : []
            expect(anahtarlar.some((k) => k.startsWith(kalan)), `${dil}:${c.anahtar}`).toBe(true)
          } else {
            // getDictValue çözülemeyen anahtarda anahtarın kendisini döndürür.
            const deger = getDictValue(sozluk, c.anahtar)
            expect(deger, `${dil}:${c.anahtar}`).not.toBe(c.anahtar)
            expect(deger.trim().length, `${dil}:${c.anahtar}`).toBeGreaterThan(0)
          }
        }
      }
    })

    it(`${s.ad}: alt metinleri var ve hiçbiri iki başlığa yapıştırılmamış`, () => {
      const alt = altMetinAnahtarlari(src)
      expect(alt.length).toBeGreaterThan(0)
      expect(alt.filter((a, i) => alt.indexOf(a) !== i)).toEqual([])
    })

    it(`${s.ad}: nitelik ve JSX metin düğümlerinde sözlüğe bağlı olmayan harfli metin yok`, () => {
      expect(sabitNitelikMetinleri(src)).toEqual([])
      expect(sabitMetinDugumleri(src)).toEqual([])
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
