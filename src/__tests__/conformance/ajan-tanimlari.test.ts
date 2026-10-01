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

  it('model değeri sabit ve beklenen (totoloji değil): her tür sonnet', () => {
    for (const tur of ['arastirmaci', 'uygulayici', 'curutucu', 'dogrulayici']) {
      expect(uretici.TUR_MODEL[tur]).toBe('sonnet')
      expect(uretici.tanim(ornek(tur))).toMatch(/^model: sonnet$/m)
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
