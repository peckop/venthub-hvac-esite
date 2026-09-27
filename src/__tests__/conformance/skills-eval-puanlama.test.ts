import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SKILLS-EVAL-1 · Skill yönlendirme sınavının PUANLAMASI ölçülür.
 *
 * ÖLÇÜLEN KUSUR (REC-303, 2026-09-12): `.claude/skills` 25/36 ve `.agent/skills` 35/35
 * dizininde `evals/evals.json` var ama `skills-evaluator.py` sorguları yalnız SAYIYOR —
 * hiçbirini bir yönlendiriciye sormuyor; `skills:verify` de hiçbir workflow dosyasında
 * değildi (ölçüldü: 0). Yani 60 dosyalık yatırım kâğıt üstündeydi.
 *
 * ⭐ASIL KOL "ÖLÇEMEDİ ≠ GEÇTİ" KOLUDUR. Model cevabı bozuk geldiğinde puanlayıcı sessizce
 * "doğru" saysa, sınav her koşuda yeşil verir ve hiçbir şey ölçmez — düzeltmeye çalıştığımız
 * kusurun aynısını üretir. Bu yüzden üç sonuç var (GECTI · DUSTU · OLCEMEDI) ve çözülemeyen
 * satır `null` döner.
 *
 * Ağ YOK: puanlama saf modülde (`scripts/skills-eval/lib.mjs`), koşucu ayrı dosyada. Ayrımın
 * sebebi ölçülebilirlik: ağa çıkan kodun eşiği test edilemez.
 *
 * Cetvel: `execution-method-standard.md` §8.1 (test aynı PR'da) ·
 * `.claude/skills/skills-creator/SKILL.md` (12/8 kuralı).
 */

interface Puan {
  ad: string
  durum: 'GECTI' | 'DUSTU' | 'OLCEMEDI'
  tetik: { dogru: number; toplam: number; oran: number }
  tetiklemez: { dogru: number; toplam: number; oran: number }
  olcemedi: number
}

interface Lib {
  ESIK: number
  cevabiCoz: (metin: unknown, adet: number) => Array<string | null>
  puanla: (
    skill: { ad: string; should_trigger: string[]; should_not_trigger: string[] },
    tetik: Array<string | null>,
    tetiklemez: Array<string | null>,
  ) => Puan
  ozet: (s: Puan[]) => { toplam: number; gecti: number; dustu: number; olcemedi: number; cikis: number }
  istemKur: (katalog: Array<{ ad: string; aciklama: string }>, sorgular: string[]) => string
  jetonTahmini: (m: string) => number
  frontmatterCoz: (ham: string) => { ad: string; aciklama: string } | null
  CLI_SADE_BAYRAKLAR: string[]
  maliyetTahmini: (a: {
    girisJetonu: number
    cikisJetonu: number
    girisUsdMilyon: number
    cikisUsdMilyon: number
  }) => number
}

const require_ = createRequire(import.meta.url)
const lib: Lib = require_(path.resolve(__dirname, '../../../scripts/skills-eval/lib.mjs'))

const skill = (ad: string, tetikAdet: number, tetiklemezAdet: number) => ({
  ad,
  should_trigger: Array.from({ length: tetikAdet }, (_, i) => `sorgu ${i}`),
  should_not_trigger: Array.from({ length: tetiklemezAdet }, (_, i) => `karsi sorgu ${i}`),
})

describe('INV-SKILLS-EVAL-1 · model cevabının çözümü', () => {
  it('üç yazım biçimini de çözer ve sırayı korur', () => {
    expect(lib.cevabiCoz('1: alfa\n2. beta\n3) gama', 3)).toEqual(['alfa', 'beta', 'gama'])
  })

  it('araya karışan düz metni yutar, kararı düşürmez', () => {
    expect(lib.cevabiCoz('Tabii, iste cevaplar:\n1: alfa\nbu satir gereksiz\n2: NONE', 2)).toEqual(['alfa', 'NONE'])
  })

  it('⭐ÇÖZÜLEMEYEN cevap null döner — sessizce DOĞRU sayılmaz', () => {
    expect(lib.cevabiCoz('hicbir sey anlamadim', 2)).toEqual([null, null])
    expect(lib.cevabiCoz('', 1)).toEqual([null])
    expect(lib.cevabiCoz(undefined, 2)).toEqual([null, null])
    // Sıra numarası aralık dışındaysa cevap UYDURULMAZ.
    expect(lib.cevabiCoz('7: alfa', 2)).toEqual([null, null])
  })
})

describe('INV-SKILLS-EVAL-1 · puanlama ve eşik', () => {
  it('hepsi doğruysa GECTI', () => {
    const p = lib.puanla(skill('alfa', 12, 8), new Array(12).fill('alfa'), new Array(8).fill('NONE'))
    expect(p.durum).toBe('GECTI')
    expect(p.tetik.oran).toBe(1)
    expect(p.tetiklemez.oran).toBe(1)
  })

  it('EŞİK KOLU: 12 sorguda 1 yanlış GEÇER (yüzde 91.7), 2 yanlış DÜŞER (yüzde 83.3)', () => {
    const s = skill('alfa', 12, 8)
    const birYanlis = [...new Array(11).fill('alfa'), 'beta']
    const ikiYanlis = [...new Array(10).fill('alfa'), 'beta', 'beta']
    expect(lib.puanla(s, birYanlis, new Array(8).fill('NONE')).durum).toBe('GECTI')
    expect(lib.puanla(s, ikiYanlis, new Array(8).fill('NONE')).durum).toBe('DUSTU')
    expect(lib.ESIK).toBe(0.9)
  })

  it('should_not_trigger: BAŞKA skill de NONE de doğrudur, KENDİ adı yanlıştır', () => {
    const s = skill('alfa', 12, 8)
    const baskasi = lib.puanla(s, new Array(12).fill('alfa'), new Array(8).fill('beta'))
    expect(baskasi.durum, 'başka skill cevabı yanlış sayıldı').toBe('GECTI')
    expect(baskasi.tetiklemez.dogru).toBe(8)

    const kendisi = lib.puanla(s, new Array(12).fill('alfa'), new Array(8).fill('alfa'))
    expect(kendisi.durum, 'kendi adını verince yine geçti sayıldı').toBe('DUSTU')
    expect(kendisi.tetiklemez.dogru).toBe(0)
  })

  it('⭐ÖLÇEMEDİ İHLALDEN ÖNCE GELİR: tek çözülemeyen cevap sonucu OLCEMEDI yapar', () => {
    // Bozuk cevapla "skill düştü" demek yanlış suçlamadır; iki arıza tek sayıya çökmemeli.
    const s = skill('alfa', 12, 8)
    const p = lib.puanla(s, [...new Array(11).fill('alfa'), null], new Array(8).fill('NONE'))
    expect(p.durum).toBe('OLCEMEDI')
    expect(p.olcemedi).toBe(1)
  })
})

describe('INV-SKILLS-EVAL-1 · filo özeti ve çıkış kodu', () => {
  const p = (durum: Puan['durum']): Puan => ({
    ad: 'x',
    durum,
    tetik: { dogru: 0, toplam: 0, oran: 1 },
    tetiklemez: { dogru: 0, toplam: 0, oran: 1 },
    olcemedi: durum === 'OLCEMEDI' ? 1 : 0,
  })

  it('hepsi geçtiyse çıkış 0', () => {
    expect(lib.ozet([p('GECTI'), p('GECTI')]).cikis).toBe(0)
  })

  it('ihlal varsa çıkış 1', () => {
    expect(lib.ozet([p('GECTI'), p('DUSTU')]).cikis).toBe(1)
  })

  it('ÖLÇEMEDİ varsa çıkış 2 — ihlalden ÖNCE gelir (ölçemedi ile ihlal ayrı sözleşme)', () => {
    const o = lib.ozet([p('DUSTU'), p('OLCEMEDI')])
    expect(o.cikis).toBe(2)
    expect(o.olcemedi).toBe(1)
    expect(o.dustu).toBe(1)
  })
})

describe('INV-SKILLS-EVAL-1 · istem ve maliyet', () => {
  it('istem KATALOĞU taşır, sorguları numaralar ve NONE seçeneğini söyler', () => {
    // Katalogsuz sınav, skill tetiğini değil modelin tahminini ölçer — bu kol onu korur.
    const istem = lib.istemKur(
      [
        { ad: 'alfa', aciklama: 'alfa isi' },
        { ad: 'beta', aciklama: 'beta isi' },
      ],
      ['birinci istek', 'ikinci istek'],
    )
    expect(istem).toContain('alfa: alfa isi')
    expect(istem).toContain('beta: beta isi')
    expect(istem).toContain('1. birinci istek')
    expect(istem).toContain('2. ikinci istek')
    expect(istem).toContain('NONE')
  })

  it('maliyet hesabı fiyat tablosundan gelir — varsayılan fiyat YOK', () => {
    const usd = lib.maliyetTahmini({
      girisJetonu: 1_000_000,
      cikisJetonu: 200_000,
      girisUsdMilyon: 1,
      cikisUsdMilyon: 5,
    })
    expect(usd).toBe(2)
    expect(lib.jetonTahmini('abcd')).toBe(1)
  })
})

/**
 * INV-SKILLS-EVAL-2 · Katalog açıklaması KIRPILMADAN okunur.
 *
 * ÖLÇÜLEN KUSUR (prompt denetimi 2026-09-25): okuyucu yalnız `description:` satırını alıyordu;
 * `.claude/skills` 38 skill'in 33'ünde açıklama alt satıra taşıyor, 8'i `>-` biçiminde. Sınav
 * kırpık kataloğu ölçüyordu. Yeni okuyucu 74/74 skill'de js-yaml ile aynı sonucu verdi
 * (eskisi 10/74).
 */
describe('INV-SKILLS-EVAL-2 · frontmatter açıklaması', () => {
  const fm = (govde: string) => `---\n${govde}\n---\n# Baslik\n`

  it('>- blok skalerde tüm satırları birleştirir, ">-" metnini değer saymaz', () => {
    const r = lib.frontmatterCoz(fm('name: a\ndescription: >-\n  birinci satir\n  ikinci satir\nallowed-tools: Bash'))
    expect(r).toEqual({ ad: 'a', aciklama: 'birinci satir ikinci satir' })
  })

  it('düz değer alt satıra taştığında devamını alır, sonraki anahtarda durur', () => {
    const r = lib.frontmatterCoz(fm('name: b\ndescription: Ilk kisim,\n  devam eden kisim.\nversion: 1'))
    expect(r?.aciklama).toBe('Ilk kisim, devam eden kisim.')
  })

  it('| blok skalerde satır sonlarını korur', () => {
    const r = lib.frontmatterCoz(fm('name: c\ndescription: |\n  satir 1\n  satir 2'))
    expect(r?.aciklama).toBe('satir 1\nsatir 2')
  })

  it('çok satırlı tırnaklı değeri çözer', () => {
    const r = lib.frontmatterCoz(fm('name: d\ndescription: "Uzun aciklama\n  ikinci satir"'))
    expect(r?.aciklama).toBe('Uzun aciklama ikinci satir')
  })

  it('CRLF satır sonlarında da aynı sonucu verir', () => {
    const r = lib.frontmatterCoz('---\r\nname: e\r\ndescription: >-\r\n  x\r\n  y\r\n---\r\n')
    expect(r?.aciklama).toBe('x y')
  })

  it('tek satırlık değeri olduğu gibi okur; frontmatter yoksa null döner', () => {
    expect(lib.frontmatterCoz(fm('name: f\ndescription: kisa'))?.aciklama).toBe('kisa')
    expect(lib.frontmatterCoz('# frontmatter yok')).toBeNull()
  })
})

/**
 * EK-1 (2026-09-25): bayraksız `claude -p` TAM oturum açıyordu — kancalar koştu, gerçek
 * `.claude/skills` listesi sınav kataloğuyla yarıştı, 120 sn'de üç skill zaman aşımına düştü.
 * Sade set iki yerde korunur: sabitin içeriği VE koşucunun onu gerçekten spawn'a vermesi
 * (sabit doğru ama bağlanmamışsa ölçüm yine kirli olur).
 */
describe('skills-eval CLI yolu SADE bağlamda koşar (EK-1)', () => {
  const b = lib.CLI_SADE_BAYRAKLAR
  const deger = (bayrak: string) => b[b.indexOf(bayrak) + 1]

  it('araçlar, MCP, slash komutları, ayar kaynakları ve sistem istemi kapatılmış', () => {
    expect(deger('--tools')).toBe('')
    expect(b).toContain('--strict-mcp-config')
    expect(JSON.parse(deger('--mcp-config'))).toEqual({ mcpServers: {} })
    expect(b).toContain('--disable-slash-commands')
    expect(deger('--setting-sources')).toBe('')
    expect(deger('--system-prompt')).toMatch(/yonlendirme/)
    expect(b, '--bare OAuth u kapatır; yerel koşu API anahtarı ister').not.toContain('--bare')
  })

  it('koşucu sabiti claude spawn argümanlarına yayıyor', () => {
    const kaynak = fs.readFileSync(path.resolve(__dirname, '../../../scripts/skills-eval-run.mjs'), 'utf8')
    expect(kaynak).toMatch(/import\s*\{[^}]*CLI_SADE_BAYRAKLAR[^}]*\}\s*from '\.\/skills-eval\/lib\.mjs'/)
    expect(kaynak).toMatch(/spawnSync\('claude',\s*\['-p',\s*'--model',\s*MODEL,\s*\.\.\.CLI_SADE_BAYRAKLAR\]/)
  })
})
