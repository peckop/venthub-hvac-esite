/**
 * INV-AJAN-SKILL-COZULUR-1 — çalışan tanımındaki `skills:` adı, çalışanın çalıştığı makinede GERÇEKTEN bir skill'e çözülür (YTN-8).
 *
 * NİÇİN VAR: olmayan skill adı HATA VERMEDEN atlanır (2026-10-01 ölçümü: Haiku ve Sonnet alt ajanı "YOK" dedi, uyarı yok).
 * `supabase-postgres-best-practices` iki SATIS çalışanında ön yükleniyordu; skill supabase EKLENTİSİNDEYDİ ve eklenti bu
 * makinede etkin değildi. Mevcut kapı (INV-AJAN-TANIM-1) yalnız elle beyan edilmiş bir listeye bakar; beyan yanlışsa
 * kimse görmez. Kaynak ölçüm: docs/audits/skill-calisan-yukleme-olcumu-2026-10-01.md.
 *
 * İKİ KATMAN:
 *   1. CI'DA ÇALIŞIR (makineden bağımsız) — setlerdeki projede OLMAYAN her ad, aşağıdaki DIS_BAGIMLILIK tablosunda
 *      kaynağıyla beyan edilmiş olmalı. Yeni bir dış ad eklemek, kaynağını makinede ölçüp buraya yazmayı zorunlu kılar.
 *   2. YEREL MAKİNEDE ÇALIŞIR (~/.claude varsa) — beyan edilen her dış ad, o makinede gerçekten çözülmeli:
 *      kullanıcı düzeyi (~/.claude/skills) ya da ETKİN eklenti (ayarda `true`). Çözülmeyen kırmızı. Makine ölçülemiyorsa
 *      (CI) test görünür biçimde ATLANIR; sessizce geçmez.
 * AD ÖNCELİĞİ (ölçüldü): aynı ad kullanıcı ve proje düzeyinde varsa KULLANICI düzeyi kazanır; bugün çakışma yok (aşağıda ölçülür).
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type Satir = {
  dept: string
  tur: string
  uret: boolean
  onYukle: { ad: string; kb: number }[]
  adiylaCagir: { ad: string; kb?: number }[]
}
type Kaynak = 'kullanici' | 'eklenti'
type Cozum = 'proje' | 'kullanici' | 'eklenti' | 'cozulmedi' | 'olculemedi'

/** Projede olmayan ama setlerde geçmesine izin verilen dış skill'ler. Kaynağı MAKİNEDE ÖLÇÜLÜP yazılır (YTN-8, 2026-10-01). */
const DIS_BAGIMLILIK: Record<string, { kaynak: Kaynak; olcum: string }> = {
  'webapp-testing': { kaynak: 'kullanici', olcum: '2026-10-01: ~/.claude/skills/webapp-testing; Haiku alt ajanında yüklendi' },
  accessibility: { kaynak: 'kullanici', olcum: '2026-10-01: ~/.claude/skills/accessibility; Haiku alt ajanında yüklendi' },
  'search-console': { kaynak: 'kullanici', olcum: '2026-10-01: ~/.claude/skills/search-console (dosya var; canlı denenmedi)' },
  pdf: { kaynak: 'kullanici', olcum: '2026-10-01: ~/.claude/skills/pdf (dosya var; canlı denenmedi)' },
  // "adıyla çağır" listelerinde geçenler (ön yüklenmez, Skill aracıyla çağrılır); aynı ölçüm: dosya ~/.claude/skills altında var
  benchmark: { kaynak: 'kullanici', olcum: '2026-10-01: ~/.claude/skills/benchmark (adıyla çağır; dosya var)' },
  browse: { kaynak: 'kullanici', olcum: '2026-10-01: ~/.claude/skills/browse (adıyla çağır; dosya var)' },
  canary: { kaynak: 'kullanici', olcum: '2026-10-01: ~/.claude/skills/canary (adıyla çağır; dosya var)' },
  'design-dna': { kaynak: 'kullanici', olcum: '2026-10-01: ~/.claude/skills/design-dna (adıyla çağır; dosya var)' },
}

const kok = path.resolve(__dirname, '..', '..', '..')
const setler = (JSON.parse(fs.readFileSync(path.join(kok, 'docs', 'audits', 'skill-departman-setleri-2026-09-30.json'), 'utf8')) as { setler: Satir[] }).setler

const projedeVar = (ad: string, depo: string): boolean => fs.existsSync(path.join(depo, '.claude', 'skills', ad, 'SKILL.md'))

function enabledPlugins(dosya: string): Record<string, boolean> {
  try {
    const j = JSON.parse(fs.readFileSync(dosya, 'utf8')) as { enabledPlugins?: Record<string, boolean> }
    return j.enabledPlugins ?? {}
  } catch {
    return {}
  }
}

/** Etkin eklentilerin önbellekteki skill klasörlerinde `ad` var mı? Etkin = ayarda `plugin@pazar: true`. */
function etkinEklentidenVarMi(ad: string, ev: string, depo: string): boolean {
  const etkin = { ...enabledPlugins(path.join(ev, '.claude', 'settings.json')), ...enabledPlugins(path.join(depo, '.claude', 'settings.json')) }
  const onbellek = path.join(ev, '.claude', 'plugins', 'cache')
  for (const [anahtar, acik] of Object.entries(etkin)) {
    if (!acik) continue
    const [eklenti, pazar] = anahtar.split('@')
    if (!eklenti || !pazar) continue
    const surumler = path.join(onbellek, pazar, eklenti)
    if (!fs.existsSync(surumler)) continue
    for (const s of fs.readdirSync(surumler)) if (fs.existsSync(path.join(surumler, s, 'skills', ad, 'SKILL.md'))) return true
  }
  return false
}

/** Saf çözüm işlevi: ev ve depo dizini verilir (testte geçici sahte ev kullanılır). */
function cozum(ad: string, ev: string, depo: string): Cozum {
  if (projedeVar(ad, depo)) return 'proje'
  if (!fs.existsSync(path.join(ev, '.claude'))) return 'olculemedi'
  if (fs.existsSync(path.join(ev, '.claude', 'skills', ad, 'SKILL.md'))) return 'kullanici'
  if (etkinEklentidenVarMi(ad, ev, depo)) return 'eklenti'
  return 'cozulmedi'
}

const kullanilanAdlar = (satirlar: Satir[]): string[] => [...new Set(satirlar.filter((s) => s.uret).flatMap((s) => [...s.onYukle, ...s.adiylaCagir].map((x) => x.ad)))].sort()
const disAdlar = (satirlar: Satir[], depo: string): string[] => kullanilanAdlar(satirlar).filter((ad) => !projedeVar(ad, depo))

describe('INV-AJAN-SKILL-COZULUR-1 — CI katmanı (makineden bağımsız)', () => {
  it('setlerde geçen ve projede olmayan her skill adı DIS_BAGIMLILIK tablosunda kaynağıyla beyan edilmiş', () => {
    const beyansiz = disAdlar(setler, kok).filter((ad) => !(ad in DIS_BAGIMLILIK))
    expect(beyansiz, `beyansız dış skill: ${beyansiz.join(', ')} — önce makinede çözülmesini ölç, sonra DIS_BAGIMLILIK'a yaz`).toEqual([])
  })

  it('DIS_BAGIMLILIK tablosunda artık hiçbir sette geçmeyen (bayat) ad yok', () => {
    const kullanilan = new Set(kullanilanAdlar(setler))
    const bayat = Object.keys(DIS_BAGIMLILIK).filter((ad) => !kullanilan.has(ad))
    expect(bayat, `bayat beyan: ${bayat.join(', ')}`).toEqual([])
  })

  it('ad önceliği: projenin hiçbir skill adı kullanıcı düzeyindeki bir adla çakışmıyor ya da çakışan ad ön yüklenmiyor', () => {
    const ev = os.homedir()
    const kullaniciDizin = path.join(ev, '.claude', 'skills')
    if (!fs.existsSync(kullaniciDizin)) return // makine ölçülemiyor; yerel katman zaten atlanır
    const proje = fs.readdirSync(path.join(kok, '.claude', 'skills')).filter((x) => !x.startsWith('_'))
    const cakisan = proje.filter((ad) => fs.existsSync(path.join(kullaniciDizin, ad, 'SKILL.md')))
    const onYuklenen = new Set(setler.filter((s) => s.uret).flatMap((s) => s.onYukle.map((x) => x.ad)))
    expect(cakisan.filter((ad) => onYuklenen.has(ad)), 'çakışan ad ön yüklenirse kullanıcı düzeyinin gövdesi gelir (ölçüldü)').toEqual([])
  })
})

const makineOlculebilir = fs.existsSync(path.join(os.homedir(), '.claude', 'skills'))

describe('INV-AJAN-SKILL-COZULUR-1 — yerel makine katmanı (CI\'da atlanır, görünür)', () => {
  it.skipIf(!makineOlculebilir)('setlerdeki her dış skill adı bu makinede beyan edilen kaynaktan çözülüyor', () => {
    const kirik = disAdlar(setler, kok).filter((ad) => {
      const c = cozum(ad, os.homedir(), kok)
      return c !== DIS_BAGIMLILIK[ad]?.kaynak
    })
    expect(kirik, `bu makinede çözülmeyen dış skill (olmayan ad hata vermeden atlanır): ${kirik.join(', ')}`).toEqual([])
  })
})

describe('INV-AJAN-SKILL-COZULUR-1 — çözüm işlevi ayırt edici (geçici sahte ev dizininde)', () => {
  const sahte = (kur: (ev: string) => void): { ev: string; temizle: () => void } => {
    const ev = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-skill-cozum-'))
    kur(ev)
    return { ev, temizle: () => fs.rmSync(ev, { recursive: true, force: true }) }
  }
  const eklentiSkill = (ev: string) => {
    const d = path.join(ev, '.claude', 'plugins', 'cache', 'pazar', 'supabase', '0.1.0', 'skills', 'ornek-skill')
    fs.mkdirSync(d, { recursive: true })
    fs.writeFileSync(path.join(d, 'SKILL.md'), '---\nname: ornek-skill\n---\n')
  }
  const ayar = (ev: string, acik: boolean) => fs.writeFileSync(path.join(ev, '.claude', 'settings.json'), JSON.stringify({ enabledPlugins: { 'supabase@pazar': acik } }))
  const bosDepo = path.join(os.tmpdir(), 'vh-skill-cozum-bos-depo')

  it('eklenti önbellekte VAR ama KAPALI → çözülmedi (asıl vaka: supabase-postgres-best-practices)', () => {
    const { ev, temizle } = sahte((e) => { eklentiSkill(e); ayar(e, false) })
    try { expect(cozum('ornek-skill', ev, bosDepo)).toBe('cozulmedi') } finally { temizle() }
  })

  it('eklenti önbellekte VAR ve ETKİN → eklenti (ayırt edici çift: kapalıdan farkı yalnız ayar)', () => {
    const { ev, temizle } = sahte((e) => { eklentiSkill(e); ayar(e, true) })
    try { expect(cozum('ornek-skill', ev, bosDepo)).toBe('eklenti') } finally { temizle() }
  })

  it('kullanıcı düzeyinde klasör varsa → kullanici', () => {
    const { ev, temizle } = sahte((e) => {
      const d = path.join(e, '.claude', 'skills', 'ornek-skill')
      fs.mkdirSync(d, { recursive: true })
      fs.writeFileSync(path.join(d, 'SKILL.md'), '---\nname: ornek-skill\n---\n')
    })
    try { expect(cozum('ornek-skill', ev, bosDepo)).toBe('kullanici') } finally { temizle() }
  })

  it('hiçbir yerde yoksa → çözülmedi', () => {
    const { ev, temizle } = sahte((e) => fs.mkdirSync(path.join(e, '.claude'), { recursive: true }))
    try { expect(cozum('ornek-skill', ev, bosDepo)).toBe('cozulmedi') } finally { temizle() }
  })

  it('ev dizininde .claude hiç yoksa (CI) → olculemedi, kırmızı DEĞİL', () => {
    const { ev, temizle } = sahte(() => undefined)
    try { expect(cozum('ornek-skill', ev, bosDepo)).toBe('olculemedi') } finally { temizle() }
  })

  it('beyansız dış ad bilerek eklenirse CI katmanı yakalar', () => {
    const bozuk: Satir[] = JSON.parse(JSON.stringify(setler)) as Satir[]
    const x = bozuk.find((s) => s.uret)
    if (x) x.onYukle = [...x.onYukle, { ad: 'supabase-postgres-best-practices', kb: 3.2 }]
    const beyansiz = disAdlar(bozuk, kok).filter((ad) => !(ad in DIS_BAGIMLILIK))
    expect(beyansiz).toContain('supabase-postgres-best-practices')
  })
})
