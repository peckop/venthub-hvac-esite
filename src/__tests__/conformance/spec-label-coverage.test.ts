import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { specFieldLabel, specGroupLabel } from '../../utils/specLabel'

/**
 * INV-SPEC-LABEL-1 — vitrinde görünen teknik özellik etiketleri SÖZLÜKTEN gelmeli.
 *
 * NİÇİN DOĞDU (2026-08-22 ölçümü):
 * `specLabel.ts` sözlük-önce bir zincir kurmuş — `pdp.specs.<anahtar>` → küratörlü harita →
 * insancıl etiket. Mimari doğruydu. AMA `pdp.specs` ve `pdp.specGroups` yolları HER İKİ
 * SÖZLÜKTE DE HİÇ YOKTU: sıfır giriş. Sonuç, canlı vitrinde iki ayrı yanlış:
 *   · 62 anahtar `humanizeSpecKey`'e düşüp TR sayfada İNGİLİZCE basıyordu
 *     ("Nominal Delivery (m³/h)"),
 *   · küratörlü haritada karşılığı olan 11 anahtar ise HER İKİ DİLDE TÜRKÇE basıyordu —
 *     yani EN sayfada Türkçe (CLAUDE.md Kural 7 ihlali).
 *
 * Hiçbir kapı görmedi çünkü çıktı BOZUK GÖRÜNMÜYOR: ham anahtar yolu da değil, boş da değil.
 * Yalnızca yanlış dilde. Bu kapı tam o boşluğu ölçer.
 */

type SpecManifest = {
  _olcum: { tekil_anahtar: number; tarih: string }
  anahtarlar: Record<string, number>
}

const manifest = JSON.parse(
  readFileSync(join(process.cwd(), 'src/i18n/spec-keys.manifest.json'), 'utf8'),
) as SpecManifest

const canliAnahtarlar = Object.keys(manifest.anahtarlar)

function sozlukSpecs(d: unknown): Record<string, string> {
  const pdp = (d as Record<string, Record<string, unknown>>).pdp
  return (pdp?.specs ?? {}) as Record<string, string>
}
function sozlukGruplar(d: unknown): Record<string, string> {
  const pdp = (d as Record<string, Record<string, unknown>>).pdp
  return (pdp?.specGroups ?? {}) as Record<string, string>
}

/** `specLabel.ts`'in gerçekten kullandığı `t()` davranışını taklit eder (nokta-yol çözümü). */
function tFor(dict: unknown) {
  return (path: string): string => {
    const parcalar = path.split('.')
    let cur: unknown = dict
    for (const p of parcalar) {
      if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[p]
      } else {
        return path
      }
    }
    return typeof cur === 'string' ? cur : path
  }
}

/**
 * TR ve EN etiketi meşru olarak AYNI olan anahtarlar.
 * Liste ADIYLA sınırlıdır ve yalnız KÜÇÜLEBİLİR: yeni bir isim eklemek uzunluk iddiasını
 * bozar ve diff'te görünür. Amaç, "EN sözlüğüne Türkçesini kopyaladım" kusurunu yakalarken
 * gerçek ödünç sözcüklere yanlış kırmızı vermemek.
 */
const AYNI_OLMASI_MESRU = ['has_bypass'] as const

describe('INV-SPEC-LABEL-1 · teknik özellik etiketleri sözlükten gelir', () => {
  it('canlı manifestteki HER anahtarın iki sözlükte de karşılığı var', () => {
    // KAPSAM KANARYASI: manifest boş okunursa aşağıdaki döngü boş kümede doğrulanır ve
    // kapı hiçbir şeye bakmadan yeşil kalır. Sıfırın "ihlal yok" mu "hiçbir yere bakmadım"
    // mı olduğunu ayıran tek satır budur.
    expect(canliAnahtarlar.length, 'spec-keys.manifest.json boş okundu').toBeGreaterThanOrEqual(70)
    expect(canliAnahtarlar.length).toBe(manifest._olcum.tekil_anahtar)

    const trSpecs = sozlukSpecs(tr)
    const enSpecs = sozlukSpecs(en)
    const eksikTr = canliAnahtarlar.filter((k) => !trSpecs[k]?.trim())
    const eksikEn = canliAnahtarlar.filter((k) => !enSpecs[k]?.trim())

    expect(
      { eksikTr, eksikEn },
      'Canlı DB\'de bulunan bu spec anahtarlarının sözlükte etiketi YOK. Etiketsiz anahtar ' +
        'sayfada İngilizce fallback ile basılır ve bozuk görünmediği için kimse fark etmez.',
    ).toEqual({ eksikTr: [], eksikEn: [] })
  })

  it('ZİNCİR GERÇEKTEN ÇÖZÜLÜYOR: specFieldLabel sözlük değerini döndürür, fallback\'e düşmez', () => {
    // Bu kol DAVRANIŞI ölçer, veriyi değil. Kusur tam da buradaydı: sözlükte giriş olsaydı
    // bile yol yanlış olsa zincir sessizce fallback'e düşerdi ve kimse görmezdi.
    const hatalar: string[] = []
    for (const [ad, sozluk] of [['tr', tr], ['en', en]] as const) {
      const t = tFor(sozluk)
      const specs = sozlukSpecs(sozluk)
      for (const key of canliAnahtarlar) {
        const etiket = specFieldLabel(key, t)
        if (etiket !== specs[key]) hatalar.push(`${ad}/${key}: '${etiket}' != sözlük '${specs[key]}'`)
      }
    }
    expect(
      hatalar,
      'specFieldLabel sözlükteki değeri döndürmedi — zincir fallback\'e düşüyor demektir. ' +
        'Muhtemel sebep: specLabel.ts\'teki anahtar yolu (pdp.specs.<key>) ile sözlükteki ' +
        'yapı ayrışmış.',
    ).toEqual([])
  })

  it('grup başlıkları da sözlükten gelir (EN sayfada Türkçe basmasın)', () => {
    const gruplar = ['performance', 'physical', 'electrical', 'other']
    const hatalar: string[] = []
    for (const [ad, sozluk] of [['tr', tr], ['en', en]] as const) {
      const t = tFor(sozluk)
      const dictGroups = sozlukGruplar(sozluk)
      for (const g of gruplar) {
        // fallbackLabel olarak groupTechnicalSpecs'in HARDCODED Türkçesini veriyoruz:
        // sözlük çözülmezse kapı tam da o Türkçeyi görür ve kırmızı olur.
        const etiket = specGroupLabel(g, t, 'HARDCODED_TR_FALLBACK')
        if (etiket !== dictGroups[g]) hatalar.push(`${ad}/${g}: '${etiket}'`)
      }
    }
    expect(hatalar, 'grup başlığı sözlükten gelmedi').toEqual([])
  })

  it('hiçbir etiket ham anahtar yolu, boş dize ya da anahtarın kendisi olmasın', () => {
    const hatalar: string[] = []
    for (const [ad, sozluk] of [['tr', tr], ['en', en]] as const) {
      const specs = sozlukSpecs(sozluk)
      for (const [k, v] of Object.entries(specs)) {
        if (!v || !v.trim()) hatalar.push(`${ad}/${k}: boş`)
        else if (v.includes('pdp.')) hatalar.push(`${ad}/${k}: ham yol '${v}'`)
        else if (v === k) hatalar.push(`${ad}/${k}: etiket anahtarın kendisi`)
      }
    }
    expect(hatalar).toEqual([])
  })

  it('EN sözlüğüne Türkçe kopyalanmamış (adıyla sınırlı meşru istisna dışında)', () => {
    const trSpecs = sozlukSpecs(tr)
    const enSpecs = sozlukSpecs(en)
    const ayni = Object.keys(trSpecs).filter(
      (k) => trSpecs[k]?.trim() === enSpecs[k]?.trim() && !AYNI_OLMASI_MESRU.includes(k as never),
    )
    expect(
      ayni,
      'Bu anahtarlarda EN etiketi TR ile birebir aynı. Gerçek bir ödünç sözcükse ' +
        'AYNI_OLMASI_MESRU listesine ADIYLA ekleyin; değilse çeviri eksik demektir.',
    ).toEqual([])
    // Muafiyet listesi yalnız KÜÇÜLEBİLİR: uzunluk iddiası, sessizce büyümeyi diff'e taşır.
    expect(AYNI_OLMASI_MESRU.length, 'muafiyet listesi büyümüş').toBe(1)
  })
})
