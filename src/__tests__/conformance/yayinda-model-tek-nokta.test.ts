// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

import { MODEL_AYIRICI } from '../../utils/modelAdresBicimi'

/**
 * INV-YAYINDA-MODEL-6 — TEK NOKTA (URN-31).
 *
 *  a) Model adresinin BİÇİMİ (ayırıcı metni, segment üretimi, ayrıştırma) YALNIZ `utils/modelAdresBicimi.ts`'te.
 *     Başka hiçbir üretim dosyasında ayırıcı metni yazılmaz; `modelSegmentiUret` yalnız `adresUret`'ten çağrılır
 *     (adres üretiminin tek kapısı). Karar 286 (biçim) değişirse tek dosya değişir.
 *  b) "Model sayfası var mı" kararı YALNIZ `config/yayindaModeller.ts`'te (+ veri dosyası). Veri dosyasını yalnız
 *     o modül okur; modülü içe aktarabilen dosyalar AÇIK listededir — yeni bir yüzey bu listeye bilerek eklenir
 *     (sessizce kendi `-p-` ya da liste kararını yazamaz).
 *
 * Tarayıcı DUYARLI: aynı tarama sentetik kötü kaynakta ihlal bulur (aşağıda).
 */

const KOK = process.cwd()
const SRC = join(KOK, 'src')

function dosyalar(dizin: string, cikti: string[] = []): string[] {
  for (const girdi of readdirSync(dizin, { withFileTypes: true })) {
    const yol = join(dizin, girdi.name)
    if (girdi.isDirectory()) {
      if (['node_modules', '__tests__', 'generated', 'fikstur'].includes(girdi.name)) continue
      dosyalar(yol, cikti)
    } else if (/\.(ts|tsx|mjs|js|cjs)$/.test(girdi.name) && !/\.test\.|\.d\.ts$/.test(girdi.name)) {
      cikti.push(yol)
    }
  }
  return cikti
}

/** Yorumları siler (ayırıcı metni yorumlarda serbestçe geçer; kod değildir). */
const yorumsuz = (kaynak: string): string => kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

/** Kaynakta ayırıcı metnini TIRNAK/ŞABLON içinde yazan satırlar. */
function ayiriciKullanimlari(kaynak: string): string[] {
  const kacis = MODEL_AYIRICI.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const desen = new RegExp(`['"\`][^'"\`\\n]*${kacis}`)
  return yorumsuz(kaynak).split('\n').filter((satir) => desen.test(satir))
}

const gor = (yol: string) => relative(KOK, yol).split(sep).join('/')
const URETIM = dosyalar(SRC)
const okun = new Map(URETIM.map((d) => [gor(d), readFileSync(d, 'utf8')]))

const BICIM_MODULU = 'src/utils/modelAdresBicimi.ts'
const ADRES_URETICI = 'src/utils/adresUret.ts'
const LISTE_MODULU = 'src/config/yayindaModeller.ts'
const VERI_DOSYASI = 'yayindaModeller.veri.json'

/** Liste modülünü içe aktarabilen üretim dosyaları (kararı verenler ve yol/süzgeç tüketenler). */
const LISTE_TUKETICILERI = new Set([
  'src/utils/adresUret.ts', // adres üretimi (model sayfası mı, slug metni)
  'src/utils/yuzeyAdresleri.ts', // model seçimi hedefi (handleSelectVariant kararı)
  'src/lib/data/urunSegmenti.ts', // rota: liste dışı → 404, slug metni yanlış → 308
  'src/lib/adres/yayindaModelYollari.ts', // webhook tazeleme yolları (ALTYAPI bağlar)
  'src/lib/seo/jsonld.ts', // yapısal veri: yalnız dizine açık model adresi
  'src/app/sitemap.ts', // site haritası süzgeci
  'src/app/_components/aileSayfasi.tsx', // canonical: sürüm → temel model
])

describe('INV-YAYINDA-MODEL-6a — model adresi biçimi tek modülde', () => {
  it('ÖN KOŞUL: tarama evreni dolu ve ayırıcı gerçekten biçim modülünde yazılı', () => {
    expect(URETIM.length).toBeGreaterThan(200)
    expect(okun.has(BICIM_MODULU)).toBe(true)
    expect(MODEL_AYIRICI.length).toBeGreaterThan(1)
    expect(ayiriciKullanimlari(okun.get(BICIM_MODULU) ?? '')).not.toEqual([])
  })

  it('ayırıcı metni başka hiçbir üretim dosyasında kod olarak yazılmaz', () => {
    const ihlal = [...okun.entries()]
      .filter(([yol]) => yol !== BICIM_MODULU)
      .flatMap(([yol, kaynak]) => ayiriciKullanimlari(kaynak).map((s) => `${yol}: ${s.trim()}`))
    expect(ihlal).toEqual([])
  })

  it('MODEL_AYIRICI yalnız biçim modülü ve adres üreticisinin (yeniden dışa aktarım) içinde anılır', () => {
    const anan = [...okun.entries()].filter(([, k]) => k.includes('MODEL_AYIRICI')).map(([y]) => y).sort()
    expect(anan).toEqual([ADRES_URETICI, BICIM_MODULU].sort())
  })

  it('segment ÜRETİMİ yalnız adres üreticisinde (`modelSegmentiUret` çağrısı)', () => {
    const cagiran = [...okun.entries()]
      .filter(([yol, k]) => yol !== BICIM_MODULU && /modelSegmentiUret\s*\(/.test(yorumsuz(k)))
      .map(([y]) => y)
    expect(cagiran).toEqual([ADRES_URETICI])
  })

  it('DUYARLILIK: tarayıcı kötü kaynakta ihlali yakalar', () => {
    const kotu = `const h = \`/tr/urun/\${slug}${MODEL_AYIRICI}\${sku}\``
    expect(ayiriciKullanimlari(kotu).length).toBe(1)
    expect(ayiriciKullanimlari(`// yorumda ${MODEL_AYIRICI} serbest`)).toEqual([])
  })
})

describe('INV-YAYINDA-MODEL-6b — "model sayfası var mı" kararı tek beyaz listede', () => {
  const importEden = (modul: RegExp) =>
    [...okun.entries()].filter(([yol, k]) => yol !== LISTE_MODULU && modul.test(yorumsuz(k))).map(([y]) => y).sort()

  it('liste modülünü yalnız AÇIK listedeki dosyalar içe aktarır', () => {
    const fazla = importEden(/from\s+['"][^'"]*yayindaModeller['"]/).filter((y) => !LISTE_TUKETICILERI.has(y))
    expect(fazla).toEqual([])
  })

  it('açık listedeki her dosya GERÇEKTEN içe aktarır (ölü kayıt yok)', () => {
    const var_ = new Set(importEden(/from\s+['"][^'"]*yayindaModeller['"]/))
    expect([...LISTE_TUKETICILERI].filter((y) => !var_.has(y)).sort()).toEqual([])
  })

  it('veri dosyasını yalnız liste modülü okur', () => {
    const okuyan = [...okun.entries()].filter(([yol, k]) => yol !== LISTE_MODULU && k.includes(VERI_DOSYASI)).map(([y]) => y)
    expect(okuyan).toEqual([])
    expect(okun.get(LISTE_MODULU)).toContain(VERI_DOSYASI)
  })

  it('liste verisinin sabiti başka dosyada yinelenmez (SKU kümesi/harita tanımı yok)', () => {
    const tanimlayan = [...okun.entries()]
      .filter(([yol, k]) => yol !== LISTE_MODULU && /YAYINDA_(MODELLER|LISTE)\b/.test(yorumsuz(k)))
      .map(([y]) => y)
    expect(tanimlayan).toEqual([])
  })
})
