/**
 * INV-AJAN-TANIM-1 — çalışan tanımları kart üreticisinin ikinci çıktısıdır (REC-530 hattı, OPS emri 2026-09-30).
 *
 * NİÇİN VAR: YETENEK departmanı 15 departman × 4 çalışan türü için ön yükleme setlerini ölçtü
 * (`docs/audits/skill-departman-setleri-2026-09-30.json`); `.claude/agents/<departman>-<tur>.md` dosyaları bu tablonun
 * makine çıktısıdır ve ELLE düzenlenmez. Bu paket iki şeyi ölçer:
 *   1. MANDAL — diskteki tanımlar üreticinin çıktısıyla bire bir aynı, öksüz (tablodan düşmüş) tanım yok.
 *   2. AYIRT EDİCİLİK — üretim kuralı ihlalleri (boş ön yükleme, bütçe aşımı, bilinmeyen skill, yazmayan türe yazma izni,
 *      `adiylaCagir`'ın `skills:` alanına sızması, modelsiz tanım) bilerek bozulmuş girdide yakalanır; yakalamazsa kapı kördür.
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type Skill = { ad: string; kb: number; kaynak?: string }
type Satir = {
  dept: string
  tur: string
  uret: boolean
  onYukle: Skill[]
  adiylaCagir: { ad: string; kb?: number; uyari?: string }[]
  bekleyen: { ad: string; neden: string }[]
}
type Setler = { kural: { enFazlaOnYukle: number; onYuklemeButceKB: number }; setler: Satir[] }
type Uretici = {
  uret: (s: Setler) => Record<string, string>
  tanim: (s: Satir) => string
  sorunlar: (s: Setler, etkinMi: (ad: string) => boolean, kd: Set<string>) => string[]
  dosyaAdi: (d: string, t: string) => string
  TUR_MODEL: Record<string, string>
  KULLANICI_DUZEYI: Set<string>
  AD_CAKISMASI: Set<string>
  SETLER_YOLU: string
}

const kok = path.resolve(__dirname, '..', '..', '..')
const uretici = createRequire(import.meta.url)(path.join(kok, 'scripts', 'belge', 'ajan-tanimi-uret.cjs')) as Uretici
const setler = JSON.parse(fs.readFileSync(path.join(kok, uretici.SETLER_YOLU), 'utf8')) as Setler
const etkinMi = (ad: string) => fs.existsSync(path.join(kok, '.claude', 'skills', ad, 'SKILL.md'))
const kopya = (): Setler => JSON.parse(JSON.stringify(setler)) as Setler
/**
 * KARAR 314 (Recep, 2026-10-08; ALT-45) — çalışan türü → dosyadaki `model:` değeri. Üretici sabiti (`TUR_MODEL`), diskteki tanımlar ve
 * execution-method-standard.md §10.3 "Rol → model tablosu" AYNI olmak zorundadır. Bu nesne bilerek elle yazılıdır: üreticiden
 * okunsaydı, sabiti değiştiren her PR kapıyı da kendiliğinden yeşil tutardı (totoloji).
 */
const KARAR_314_MODEL: Record<string, string> = {
  arastirmaci: 'claude-haiku-5-5',
  uygulayici: 'sonnet',
  curutucu: 'sonnet',
  dogrulayici: 'sonnet',
}
const ornek = (tur: string): Satir => {
  const s = setler.setler.find((x) => x.uret && x.tur === tur && x.adiylaCagir.length > 0) ?? setler.setler.find((x) => x.uret && x.tur === tur)
  if (!s) throw new Error(`örnek satır yok: ${tur}`)
  return JSON.parse(JSON.stringify(s)) as Satir
}

describe('INV-AJAN-TANIM-1 — mandal', () => {
  const uretim = uretici.uret(setler)

  it('tabloda uret:true olan her satır için tam bir dosya üretilir (50 beklenen; sayı tablodan okunur)', () => {
    const beklenen = setler.setler.filter((s) => s.uret).length
    expect(Object.keys(uretim)).toHaveLength(beklenen)
    expect(beklenen).toBeGreaterThan(0)
  })

  it('diskteki .claude/agents tanımları üreticinin çıktısıyla bire bir aynı (CRLF normalize)', () => {
    const farkli: string[] = []
    for (const [ad, metin] of Object.entries(uretim)) {
      const yol = path.join(kok, '.claude', 'agents', ad)
      if (!fs.existsSync(yol) || fs.readFileSync(yol, 'utf8').replace(/\r\n/g, '\n') !== metin) farkli.push(ad)
    }
    expect(farkli, `üretim çalıştırılmalı: node scripts/belge/ajan-tanimi-uret.cjs --yaz (${farkli.join(', ')})`).toEqual([])
  })

  it('öksüz tanım yok: <departman>-<tur>.md kalıbındaki her dosya tabloda uret:true', () => {
    const dizin = path.join(kok, '.claude', 'agents')
    const depts = new Set(setler.setler.map((s) => s.dept.toLowerCase()))
    const kalip = /^(.+)-(arastirmaci|uygulayici|curutucu|dogrulayici)\.md$/
    const oksuz = fs.readdirSync(dizin).filter((f) => {
      const m = kalip.exec(f)
      return !!m && depts.has(m[1]) && !(f in uretim)
    })
    expect(oksuz).toEqual([])
  })

  it('tablonun kendisi üretim kurallarına uyuyor (boş ön yükleme yok, bütçe ve sayı sınırı, bilinen skill)', () => {
    expect(uretici.sorunlar(setler, etkinMi, uretici.KULLANICI_DUZEYI)).toEqual([])
  })
})

describe('INV-AJAN-TANIM-1 — tanımın içeriği', () => {
  it('model AÇIK yazılır ve tür tablosundan gelir (modelsiz tanım sessizce Sonnet\'e düşerdi)', () => {
    for (const tur of ['arastirmaci', 'uygulayici', 'curutucu', 'dogrulayici']) {
      const t = uretici.tanim(ornek(tur))
      expect(t).toMatch(new RegExp(`^model: ${uretici.TUR_MODEL[tur]}$`, 'm'))
    }
  })

  it('yazmayan türlerde disallowedTools var, uygulayıcıda YOK (ayırt edici çift)', () => {
    for (const tur of ['arastirmaci', 'curutucu', 'dogrulayici']) {
      expect(uretici.tanim(ornek(tur))).toMatch(/^disallowedTools: Edit, Write, NotebookEdit$/m)
    }
    expect(uretici.tanim(ornek('uygulayici'))).not.toMatch(/disallowedTools/)
  })

  it('HRT-13 (YTN-8 ölçümü): hiçbir türün disallowedTools alanında ToolSearch YOK (Haiku çalışan ~329 bin jetonla hiç açılmıyor)', () => {
    for (const tur of ['arastirmaci', 'uygulayici', 'curutucu', 'dogrulayici']) {
      expect(uretici.tanim(ornek(tur)), tur).not.toMatch(/^disallowedTools:.*ToolSearch/m)
    }
  })

  it('HRT-13: KULLANICI_DUZEYI bayat eklenti skill adı taşımaz (supabase eklentisi bu makinede etkin değil)', () => {
    expect([...uretici.KULLANICI_DUZEYI]).not.toContain('supabase-postgres-best-practices')
  })

  it('skills: alanına YALNIZ onYukle girer; adiylaCagir ve bekleyen girmez', () => {
    const s = ornek('uygulayici')
    expect(s.adiylaCagir.length).toBeGreaterThan(0)
    const t = uretici.tanim(s)
    const fm = t.split('---')[1]
    for (const o of s.onYukle) expect(fm).toContain(`  - ${o.ad}`)
    for (const a of s.adiylaCagir) expect(fm).not.toContain(a.ad)
    // adıyla çağır katmanı gövdede tek satırdır
    for (const a of s.adiylaCagir) expect(t.split('---')[2]).toContain(a.ad)
  })

  it('bekleyen skill adı frontmatter\'a da gövdeye de girmez (ayırt edici: bekleyeni dolu satır)', () => {
    const s = ornek('uygulayici')
    s.bekleyen = [{ ad: 'bekleyen-skill-x', neden: 'REC-514 kapanınca' }]
    expect(uretici.tanim(s)).not.toContain('bekleyen-skill-x')
  })

  it('model değerleri sabit ve beklenen (totoloji değil): karar 314 rol→model tablosu, ne eksik ne fazla tür', () => {
    expect(uretici.TUR_MODEL).toEqual(KARAR_314_MODEL)
    for (const [tur, model] of Object.entries(KARAR_314_MODEL)) {
      expect(uretici.tanim(ornek(tur)), tur).toMatch(new RegExp(`^model: ${model}$`, 'm'))
    }
  })

  it('name dosya adıyla aynıdır ve description boş değildir (50 üretilmiş dosya)', () => {
    for (const [dosya, metin] of Object.entries(uretici.uret(setler))) {
      expect(metin).toMatch(new RegExp(`^name: ${dosya.replace(/\.md$/, '')}$`, 'm'))
      expect(metin).toMatch(/^description: \S.{20,}$/m)
    }
  })

  it('yazmayan türlerin gövdesi rapor yazma/dosya yazma çelişkisi taşımaz: "dosya yazmazsın" der, scratchpad\'e yazdırmaz', () => {
    for (const tur of ['arastirmaci', 'curutucu', 'dogrulayici']) {
      const t = uretici.tanim(ornek(tur))
      expect(t).toMatch(/[Dd]osya yazmazsın/)
      expect(t).not.toMatch(/scratchpad/)
    }
  })

  it('ad çakışması uyarısı olan adıyla-çağır skill\'i gövdeye de girmez', () => {
    const s = ornek('uygulayici')
    s.adiylaCagir.push({ ad: 'cakisan-skill', uyari: 'ad çakışması' })
    expect(uretici.tanim(s)).not.toContain('cakisan-skill')
  })

  it('adiylaCagir boşsa gövdede yalnız rol cümlesi vardır (skill satırı yok)', () => {
    const s = ornek('uygulayici')
    s.adiylaCagir = []
    expect(uretici.tanim(s)).not.toMatch(/adıyla çağır/)
  })
})

describe('INV-AJAN-TANIM-1 — ayırt edicilik (sorunlar bilerek bozulmuş girdide kırmızı verir)', () => {
  const bozuk = (degistir: (s: Setler) => void) => {
    const k = kopya()
    degistir(k)
    return uretici.sorunlar(k, etkinMi, uretici.KULLANICI_DUZEYI)
  }

  it('uret:true satırın onYukle\'si boşalırsa yakalar', () => {
    const s = bozuk((k) => {
      const x = k.setler.find((r) => r.uret)
      if (x) x.onYukle = []
    })
    expect(s.some((x) => /onYukle boş/.test(x))).toBe(true)
  })

  it('uret:false satıra onYukle konursa yakalar', () => {
    const s = bozuk((k) => {
      const x = k.setler.find((r) => !r.uret)
      if (x) x.onYukle = [{ ad: 'codegraph', kb: 1 }]
    })
    expect(s.some((x) => /uret:false ama onYukle dolu/.test(x))).toBe(true)
  })

  it('sayı sınırı aşılırsa yakalar', () => {
    const s = bozuk((k) => {
      const x = k.setler.find((r) => r.uret)
      if (x) x.onYukle = Array.from({ length: k.kural.enFazlaOnYukle + 1 }, () => ({ ad: 'codegraph', kb: 0.1 }))
    })
    expect(s.some((x) => /skill >/.test(x))).toBe(true)
  })

  it('KB bütçesi aşılırsa yakalar', () => {
    const s = bozuk((k) => {
      const x = k.setler.find((r) => r.uret)
      if (x) x.onYukle = [{ ad: 'codegraph', kb: k.kural.onYuklemeButceKB + 5 }]
    })
    expect(s.some((x) => /KB >/.test(x))).toBe(true)
  })

  it('etkin ağaçta ve bilinen kullanıcı düzeyi listesinde olmayan skill adını yakalar (yazım hatası)', () => {
    const s = bozuk((k) => {
      const x = k.setler.find((r) => r.uret)
      if (x) x.onYukle = [{ ad: 'codegrph-yazim-hatasi', kb: 1 }]
    })
    expect(s.some((x) => /etkin ağaçta/.test(x))).toBe(true)
  })

  it('ad çakışması olan skill (supabase, scrape) ön yüklenirse yakalar', () => {
    for (const ad of ['supabase', 'scrape']) {
      const s = bozuk((k) => {
        const x = k.setler.find((r) => r.uret)
        if (x) x.onYukle = [{ ad, kb: 1 }]
      })
      expect(s.some((x) => /ad çakışması/.test(x))).toBe(true)
    }
  })

  it('yinelenen ajan adını ve bilinmeyen türü yakalar', () => {
    const yinelenen = bozuk((k) => {
      k.setler.push(JSON.parse(JSON.stringify(k.setler[0])) as Satir)
    })
    expect(yinelenen.some((x) => /yinelenen/.test(x))).toBe(true)
    const tur = bozuk((k) => {
      k.setler[0].tur = 'baska'
    })
    expect(tur.some((x) => /bilinmeyen tür/.test(x))).toBe(true)
  })
})

/**
 * BAĞLAM MALİYETİ — her tanım Agent aracının açıklamasına girer, yani HER oturumun ve HER alt ajanın ilk çağrısında bir kez
 * ödenir (önbellekten sonra ucuzlar). ÖLÇÜM 2026-10-01 (claude -p, tek tur, kancalar kapalı, iki tekrar): 50 tanım Sonnet 5.5
 * ilk çağrı girişini +4.794, Haiku 4.5'i +4.087 jeton büyüttü (tanım başına ~96); Haiku'da skill listesi kırpması DEĞİŞMEDİ.
 * OPS tavanı 6.000 jeton; yeni çalışan türü eklemek bu sayıyı büyütür, tavanı aşan ekleme OPS'a gider. Kapı jetonu doğrudan
 * ölçemez: ölçüm anındaki ad+açıklama karakter toplamı (7.282) ile jeton farkı (4.794) orantılanır, tavan karaktere çevrilir.
 */
const OLCUM_KARAKTER = 7282
const OLCUM_JETON = 4794
const TAVAN_JETON = 6000
const TAVAN_KARAKTER = Math.round((OLCUM_KARAKTER * TAVAN_JETON) / OLCUM_JETON)

const maliyetKarakter = (cikti: Record<string, string>): number =>
  Object.values(cikti).reduce((t, metin) => {
    const fm = metin.replace(/\r/g, '').split('---')[1] ?? ''
    const ad = /^name:\s*(.*)$/m.exec(fm)?.[1] ?? ''
    const aciklama = /^description:\s*(.*)$/m.exec(fm)?.[1] ?? ''
    return t + ad.length + aciklama.length
  }, 0)

describe('INV-AJAN-TANIM-1 — bağlam maliyeti tavanı', () => {
  it('üretilen tanımların ad+açıklama toplamı OPS tavanının (6k jeton) karakter karşılığını aşmaz', () => {
    expect(maliyetKarakter(uretici.uret(setler))).toBeLessThanOrEqual(TAVAN_KARAKTER)
  })

  it('ayırt edici: tek bir tanımın açıklaması şişirilirse tavan aşılır ve kapı kırmızı verir', () => {
    const k = kopya()
    const satir = k.setler.find((x) => x.uret)
    if (!satir) throw new Error('üretilen satır yok')
    const cikti = uretici.uret(k)
    const [ilkDosya] = Object.keys(cikti)
    cikti[ilkDosya] = cikti[ilkDosya].replace(/^description:\s*(.*)$/m, (_m, d: string) => `description: ${d}${' x'.repeat(2000)}`)
    expect(maliyetKarakter(cikti)).toBeGreaterThan(TAVAN_KARAKTER)
  })
})

/**
 * MODEL KAYDI (karar 314, ALT-45): "açacağımız her departman bu plana uysun ama kayıtlı olsun" (Recep, 2026-10-08).
 * Üç yüzey AYNI olmak zorundadır; biri değişince diğerleri kırmızı verir:
 *   1. ÜRETİCİ sabiti `TUR_MODEL` (tek kaynak; yeni departman buradan geçer, kendiliğinden uyar),
 *   2. DİSKTEKİ `.claude/agents/*.md` dosyalarının `model:` satırı (üretici çıktısıyla mandal zaten var; bu kol model satırını ADIYLA ölçer),
 *   3. KAYIT: execution-method-standard.md §10.3 "Rol → model tablosu".
 * Üretilmeyen iki tanım (`denetim-opus`, `security-reviewer`) `opus` KALIR (karar 314: değişmez).
 */
const TR_TUR_ADI: Record<string, string> = { araştırmacı: 'arastirmaci', uygulayıcı: 'uygulayici', çürütücü: 'curutucu', doğrulayıcı: 'dogrulayici' }

/** Cetveldeki "Rol → model tablosu"nu okur: `| **Tür** | `model` | ... |` satırları, bir sonraki başlığa kadar. */
function belgeModelTablosu(metin: string): Record<string, string> {
  const satirlar = metin.replace(/\r/g, '').split('\n')
  const bas = satirlar.findIndex((s) => /^#{3,4} .*Rol → model tablosu/.test(s))
  if (bas === -1) throw new Error('execution-method-standard.md: "Rol → model tablosu" başlığı yok')
  const tablo: Record<string, string> = {}
  for (const s of satirlar.slice(bas + 1)) {
    if (/^#{1,4} /.test(s)) break
    const m = /^\|\s*\*\*([^*|]+)\*\*\s*\|\s*`([^`|]+)`\s*\|/.exec(s)
    if (!m) continue
    const tur = TR_TUR_ADI[m[1].trim().toLocaleLowerCase('tr-TR')]
    if (!tur) throw new Error(`tabloda bilinmeyen tür adı: ${m[1]}`)
    tablo[tur] = m[2]
  }
  return tablo
}

describe('INV-AJAN-TANIM-1 — model kaydı (karar 314): üretici sabiti = diskteki tanımlar = cetvel tablosu', () => {
  const dizin = path.join(kok, '.claude', 'agents')
  const diskModel = (ad: string): string | undefined => {
    const fm = fs.readFileSync(path.join(dizin, ad), 'utf8').replace(/\r/g, '').split('---')[1] ?? ''
    return /^model:\s*(\S+)\s*$/m.exec(fm)?.[1]
  }
  const turOku = (ad: string): string | undefined => /-(arastirmaci|uygulayici|curutucu|dogrulayici)\.md$/.exec(ad)?.[1]

  it('diskteki her üretilmiş çalışan tanımının model satırı TUR_MODEL[tür] ile aynıdır (model satırı ADIYLA ölçülür)', () => {
    const dosyalar = Object.keys(uretici.uret(setler))
    expect(dosyalar.length).toBeGreaterThan(40)
    const farkli: string[] = []
    for (const ad of dosyalar) {
      const tur = turOku(ad)
      const beklenen = tur ? uretici.TUR_MODEL[tur] : undefined
      if (!tur || diskModel(ad) !== beklenen) farkli.push(`${ad}: ${diskModel(ad) ?? 'model yok'} ≠ ${beklenen ?? '?'}`)
    }
    expect(farkli, `node scripts/belge/ajan-tanimi-uret.cjs --yaz (${farkli.join('; ')})`).toEqual([])
  })

  it('her araştırmacı dosyası claude-haiku-5-5, her öteki üretilmiş tür sonnet (tabloyla sabitlenmiş, üreticiden okunmaz)', () => {
    const dosyalar = Object.keys(uretici.uret(setler))
    expect(dosyalar.filter((a) => a.endsWith('-arastirmaci.md')).length).toBeGreaterThanOrEqual(14)
    for (const ad of dosyalar) expect(diskModel(ad), ad).toBe(KARAR_314_MODEL[turOku(ad) ?? '?'])
  })

  it('üretilmeyen tanımlar değişmedi: denetim-opus ve security-reviewer opus KALIR', () => {
    expect(diskModel('denetim-opus.md')).toBe('opus')
    expect(diskModel('security-reviewer.md')).toBe('opus')
  })

  it('cetveldeki "Rol → model tablosu" TUR_MODEL ile birebir aynıdır (kayıt: yeni departman bu plana uyar)', () => {
    const cetvel = fs.readFileSync(path.join(kok, 'docs', 'standards', 'execution-method-standard.md'), 'utf8')
    expect(belgeModelTablosu(cetvel)).toEqual(uretici.TUR_MODEL)
  })

  it('ayırt edici: tablo ayrıştırıcısı bozulmuş cetvelde farkı yakalar (yanlış model, eksik satır) ve sağlam metni doğru okur', () => {
    const saglam = [
      '### 10.3 x',
      '#### Rol → model tablosu (karar 314)',
      '| Tür | Model | Gerekçe |',
      '|---|---|---|',
      '| **Araştırmacı** | `claude-haiku-5-5` | a |',
      '| **Uygulayıcı** | `sonnet` | b |',
      '| **Çürütücü** | `sonnet` | c |',
      '| **Doğrulayıcı** | `sonnet` | d |',
      '#### Sonraki başlık',
      '| **Doğrulayıcı** | `haiku` | tablonun DIŞINDA, okunmamalı |',
    ].join('\n')
    expect(belgeModelTablosu(saglam)).toEqual(KARAR_314_MODEL)
    expect(belgeModelTablosu(saglam.replace('`claude-haiku-5-5`', '`sonnet`'))).not.toEqual(KARAR_314_MODEL)
    expect(belgeModelTablosu(saglam.replace('| **Çürütücü** | `sonnet` | c |\n', ''))).not.toEqual(KARAR_314_MODEL)
    expect(() => belgeModelTablosu('başlık yok')).toThrow(/başlığı yok/)
  })
})
