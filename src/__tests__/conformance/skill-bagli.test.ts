/**
 * INV-SKILL-BAGLI-1 — depodaki her skill ya bir çalışan setine ya da müdür çekirdeğine bağlıdır (YTN-11).
 *
 * NİÇİN VAR: 2026-10-01'de 15 WrongStack skill'i depoya girdi ve ondan 14'ü hiçbir çalışan tanımına bağlı değildi;
 * 10 günde yalnız verify-before-done (3) ve code-review (1) çağrıldı. Setler skill'ler gelmeden önce yazılmıştı ve
 * "yeni skill gelince kim bağlar" sorusunu hiçbir kapı sormuyordu. Bu kapı sorar: `.claude/skills/<ad>/SKILL.md` olan her ad,
 * `docs/audits/skill-departman-setleri-2026-09-30.json` içinde `onYukle`, `adiylaCagir`, `bekleyen` ya da `mudurCekirdegi`
 * listelerinden birinde geçmelidir. Bağlamak bir karar ister; karar yazılı olmadan yeni skill kırmızı verir.
 *
 * İKİNCİ KORUMA: set bütçesi `kb` alanına dayanır; alan eskiyince bütçe yalan söyler (eski tabloda code-review 5,2K yazıyordu,
 * diskte 9,0K). Projedeki her skill için `kb`, diskteki boyutla %20 içinde olmalıdır.
 * ÜÇÜNCÜ: kapı eylemi ve orkestrasyon skill'i (müdür çekirdeği) çalışan tanımına ÖN YÜKLENMEZ (set kuralları 4 ve 5).
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type Girdi = { ad: string; kb?: number }
type Satir = { dept: string; tur: string; uret: boolean; onYukle: Girdi[]; adiylaCagir: Girdi[]; bekleyen: { ad: string }[] }
type Mudur = { ad: string; departmanlar: string[] | 'HEPSI'; ne: string }
type Setler = { setler: Satir[]; mudurCekirdegi: Mudur[] }

const kok = path.resolve(__dirname, '..', '..', '..')
const setler = JSON.parse(fs.readFileSync(path.join(kok, 'docs', 'audits', 'skill-departman-setleri-2026-09-30.json'), 'utf8')) as Setler
const skillDizini = path.join(kok, '.claude', 'skills')
const skillAdlari = fs
  .readdirSync(skillDizini, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(skillDizini, d.name, 'SKILL.md')))
  .map((d) => d.name)

/** Hiçbir listede geçmeyen skill adları. */
function bagsizlar(adlar: string[], s: Setler): string[] {
  const bagli = new Set<string>()
  for (const x of s.setler) for (const k of [x.onYukle, x.adiylaCagir, x.bekleyen]) for (const o of k) bagli.add(o.ad)
  for (const m of s.mudurCekirdegi) bagli.add(m.ad)
  return adlar.filter((a) => !bagli.has(a))
}

const kopya = (): Setler => JSON.parse(JSON.stringify(setler)) as Setler
const diskKB = (ad: string): number => fs.statSync(path.join(skillDizini, ad, 'SKILL.md')).size / 1024

describe('INV-SKILL-BAGLI-1 — her skill bağlı', () => {
  it('depoda skill var (kapı boş listeye karşı kör olmasın)', () => {
    expect(skillAdlari.length).toBeGreaterThan(30)
  })

  it('.claude/skills altındaki her skill bir sette ya da müdür çekirdeğinde geçer', () => {
    expect(bagsizlar(skillAdlari, setler), 'bağsız skill: önce kime ait olduğuna karar ver, JSON setlerine ya da mudurCekirdegi listesine yaz').toEqual([])
  })

  it('AYIRT EDİCİLİK: bağlı bir skill listelerden silinirse kapı onu bağsız bulur', () => {
    const s = kopya()
    const hedef = 'bug-hunter'
    expect(skillAdlari).toContain(hedef)
    for (const x of s.setler) {
      x.onYukle = x.onYukle.filter((o) => o.ad !== hedef)
      x.adiylaCagir = x.adiylaCagir.filter((o) => o.ad !== hedef)
      x.bekleyen = x.bekleyen.filter((o) => o.ad !== hedef)
    }
    s.mudurCekirdegi = s.mudurCekirdegi.filter((m) => m.ad !== hedef)
    expect(bagsizlar(skillAdlari, s)).toEqual([hedef])
  })

  it('AYIRT EDİCİLİK: depoya yeni skill gelirse (listede yok) kapı yakalar', () => {
    expect(bagsizlar([...skillAdlari, 'yeni-gelen-skill'], setler)).toEqual(['yeni-gelen-skill'])
  })
})

describe('INV-SKILL-BAGLI-1 — müdür çekirdeği', () => {
  it('her kayıt gerçek bir skill klasörüne işaret eder, bir amacı ve geçerli departmanları vardır', () => {
    const depts = new Set(setler.setler.map((x) => x.dept))
    for (const m of setler.mudurCekirdegi) {
      expect(skillAdlari, `${m.ad}: depoda böyle skill yok (bayat kayıt)`).toContain(m.ad)
      expect(m.ne.length, `${m.ad}: amaç yazılı olmalı`).toBeGreaterThan(20)
      if (m.departmanlar !== 'HEPSI') {
        expect(m.departmanlar.length, `${m.ad}: boş departman listesi`).toBeGreaterThan(0)
        for (const d of m.departmanlar) expect(depts.has(d), `${m.ad}: bilinmeyen departman ${d}`).toBe(true)
      }
    }
  })

  it('müdür çekirdeğindeki skill çalışan tanımına ÖN YÜKLENMEZ (kapı eylemi ve orkestrasyon müdürün işi)', () => {
    const mudur = new Set(setler.mudurCekirdegi.map((m) => m.ad))
    const sizan = setler.setler.flatMap((x) => x.onYukle.filter((o) => mudur.has(o.ad)).map((o) => `${x.dept}-${x.tur}: ${o.ad}`))
    expect(sizan).toEqual([])
  })

  it('AYIRT EDİCİLİK: müdür skill\'i bir çalışana ön yüklenirse kapı yakalar', () => {
    const s = kopya()
    const mudur = new Set(s.mudurCekirdegi.map((m) => m.ad))
    s.setler[0].onYukle.push({ ad: 'git-commit', kb: 1 })
    const sizan = s.setler.flatMap((x) => x.onYukle.filter((o) => mudur.has(o.ad)).map((o) => o.ad))
    expect(sizan).toEqual(['git-commit'])
  })
})

/** kb alanı diskle %20'den fazla ayrışan girdiler. */
function kbSapanlar(s: Setler): string[] {
  const sapan: string[] = []
  for (const x of s.setler) {
    for (const o of [...x.onYukle, ...x.adiylaCagir]) {
      if (!skillAdlari.includes(o.ad) || typeof o.kb !== 'number') continue
      const d = diskKB(o.ad)
      if (Math.abs(o.kb - d) / d > 0.2) sapan.push(x.dept + '-' + x.tur + ': ' + o.ad + ' kb=' + o.kb + ' disk=' + d.toFixed(1))
    }
  }
  return sapan
}

describe('INV-SKILL-BAGLI-1 — kb alanı diskle uyumlu (bütçe yalan söylemesin)', () => {
  it("projedeki skill'lerin kb değeri diskteki SKILL.md boyutundan en çok %20 sapar", () => {
    expect(kbSapanlar(setler), "kb bayat: JSON'daki kb alanlarını diskten yenile (bütçe kapısı bu sayıya güvenir)").toEqual([])
  })

  it("AYIRT EDİCİLİK: kb'si yarı yarıya küçük yazılmış bir girdi yakalanır", () => {
    const s = kopya()
    const x = s.setler.find((r) => r.onYukle.some((o) => o.ad === 'verify-before-done'))
    if (!x) throw new Error('verify-before-done hiçbir sette değil')
    const o = x.onYukle.find((g) => g.ad === 'verify-before-done')
    if (!o) throw new Error('girdi yok')
    o.kb = Math.round((diskKB('verify-before-done') / 2) * 10) / 10
    expect(kbSapanlar(s)).toHaveLength(1)
  })
})
