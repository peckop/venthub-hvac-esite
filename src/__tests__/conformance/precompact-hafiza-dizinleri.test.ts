// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * INV-COMPACT-2 · PreCompact durum kapısı HAFIZA DİZİNLERİNİ doğru tarar (ARC-6 + ARC-17, 2026-10-01).
 *
 *  ARC-6  · worktree'de açılan pencerenin transcript'i kendi proje dizinindedir ama durum dosyası ANA projenin
 *           `memory/` klasöründe durur. Kapı yalnız transcript dizinine baktığı için dosya VARKEN "dosya 0" deyip
 *           compact'ı durdurdu (ALTYAPI, iki kez). Artık ikisi de taranır.
 *  ARC-17 · şartname durum dosyalarının `memory/gunluk/<tarih>/` ve `memory/gunluk/_sahipsiz/` altında da durabileceğini
 *           söyler; kod yalnız kökü tarıyordu.
 */

interface Kapi {
  durumDosyasiBul: (sid: string, transcript?: string) => { ad: string; tam: string; mt: number } | null
  hafizaDizinleri: (projeDizini: string) => string[]
  oturumunDosyalari: (dizinler: string | string[], sid: string) => { ad: string; tam: string; mt: number }[]
}

const require_ = createRequire(import.meta.url)
const KAPI_YOLU = require_.resolve('../../../.claude/hooks/precompact-durum-kapisi.cjs')
const kapi = require_(KAPI_YOLU) as Kapi

const SID = '11111111-2222-3333-4444-555555555555'
const BASKA_SID = '99999999-8888-7777-6666-555555555555'
const ENV = ['VENTHUB_ANA_PROJE_DIZINI', 'VENTHUB_SESSIONS_DIZINI'] as const

const durumGovde = (sid: string) =>
  `---\nname: x-lane-day\nmetadata:\n  originSessionId: ${sid}\n---\n\n## Durum\n**SON GIRDI:** a\n**ACIK KUYRUK:** b\n**VERILEN SOZLER:** c\n**BEKLEYEN KARARLAR:** d\n`

let t = ''
let wt = ''
let ana = ''
const eski: Record<string, string | undefined> = {}

beforeEach(() => {
  t = fs.mkdtempSync(path.join(os.tmpdir(), 'precompact-hd-'))
  wt = path.join(t, 'wt')
  ana = path.join(t, 'ana')
  fs.mkdirSync(path.join(wt, 'memory'), { recursive: true })
  fs.mkdirSync(path.join(ana, 'memory'), { recursive: true })
  for (const k of ENV) eski[k] = process.env[k]
  process.env.VENTHUB_ANA_PROJE_DIZINI = ana
})
afterEach(() => {
  for (const k of ENV) {
    if (eski[k] === undefined) delete process.env[k]
    else process.env[k] = eski[k]
  }
  fs.rmSync(t, { recursive: true, force: true })
})

const transcript = () => path.join(wt, `${SID}.jsonl`).replace(/\\/g, '/')
const yaz = (yol: string, govde: string) => {
  fs.mkdirSync(path.dirname(yol), { recursive: true })
  fs.writeFileSync(yol, govde)
}
const kapiKos = (anaDizini: string = ana) =>
  spawnSync(process.execPath, [KAPI_YOLU], {
    input: JSON.stringify({ session_id: SID, trigger: 'manual', transcript_path: transcript() }),
    encoding: 'utf8',
    env: { ...process.env, VENTHUB_ANA_PROJE_DIZINI: anaDizini },
  })

describe('INV-COMPACT-2 · ARC-6: worktree transcript\'i + ana projenin memory/si', () => {
  it('⭐durum dosyası YALNIZ ana proje memory/sinde ise kapı GEÇER (eskiden "dosya 0" ile compact DURDURULDU)', () => {
    yaz(path.join(ana, 'memory', 'araç-lane-day-2026-10-01.md'), durumGovde(SID))
    const r = kapiKos()
    expect(r.status, r.stderr).toBe(0)
    expect(r.stdout).toContain('durum kapisi TEMIZ')
  })

  it('dosya HİÇBİR YERDE yoksa kapı hâlâ DURDURUR ve taranan HER dizini söyler', () => {
    const r = kapiKos()
    expect(r.status).toBe(2)
    expect(r.stderr).toContain(path.join(wt, 'memory'))
    expect(r.stderr).toContain(path.join(ana, 'memory'))
  })

  it('başka oturumun dosyası eşleşmez (kimlik hâlâ frontmatter\'dan)', () => {
    yaz(path.join(ana, 'memory', 'baska-lane-day.md'), durumGovde(BASKA_SID))
    expect(kapiKos().status).toBe(2)
  })

  it('ana proje dizini yok/çözülemiyorsa yalnız worktree dizinine bakar ve ÇÖKMEZ', () => {
    yaz(path.join(wt, 'memory', 'x-lane-day.md'), durumGovde(SID))
    const r = kapiKos(path.join(t, 'yok-boyle-bir-dizin'))
    expect(r.status, r.stderr).toBe(0)
  })

  it('durumDosyasiBul (session-board ve departman-ortak çağırır) aynı çözümlemeyi kullanır', () => {
    yaz(path.join(ana, 'memory', 'araç-lane-day-2026-10-01.md'), durumGovde(SID))
    const d = kapi.durumDosyasiBul(SID, transcript())
    expect(d?.tam).toBe(path.join(ana, 'memory', 'araç-lane-day-2026-10-01.md'))
  })

  it('hafizaDizinleri: ana ile worktree aynıysa tekrar etmez; var olmayan dizin elenir', () => {
    expect(kapi.hafizaDizinleri(ana)).toEqual([path.join(ana, 'memory')])
    expect(kapi.hafizaDizinleri(wt)).toEqual([path.join(wt, 'memory'), path.join(ana, 'memory')])
    fs.rmSync(path.join(ana, 'memory'), { recursive: true })
    expect(kapi.hafizaDizinleri(wt)).toEqual([path.join(wt, 'memory')])
  })

  it('ders dosyası durum dosyası sanılmaz (ana dizinde de)', () => {
    yaz(path.join(ana, 'memory', 'dizin-olcum-dersleri.md'), `---\nmetadata:\n  originSessionId: ${SID}\n---\n\nsadece ders\n`)
    expect(kapi.oturumunDosyalari(kapi.hafizaDizinleri(wt), SID)).toEqual([])
  })
})

describe('INV-COMPACT-2 · ARC-17: gunluk/* alt klasörleri taranır', () => {
  it.each([
    ['gunluk/2026-10-01', 'tarih klasörü'],
    ['gunluk/_sahipsiz', '_sahipsiz klasörü'],
  ])('%s altındaki durum dosyası bulunur (%s)', (alt) => {
    yaz(path.join(wt, 'memory', alt, 'araç-lane-day.md'), durumGovde(SID))
    const bulunan = kapi.oturumunDosyalari(kapi.hafizaDizinleri(wt), SID)
    expect(bulunan.map((b) => b.tam)).toEqual([path.join(wt, 'memory', alt, 'araç-lane-day.md')])
    expect(kapiKos().status).toBe(0)
  })

  it('kök ve alt klasördeki dosyalar BİRLİKTE gelir, en yeni önde; dönüş biçimi {ad,tam,mt} aynı', () => {
    const eskiYol = path.join(wt, 'memory', 'gunluk', '2026-09-30', 'a-lane-day.md')
    const yeniYol = path.join(wt, 'memory', 'b-lane-day.md')
    yaz(eskiYol, durumGovde(SID))
    yaz(yeniYol, durumGovde(SID))
    const eskiZaman = new Date(Date.now() - 3 * 86_400_000)
    fs.utimesSync(eskiYol, eskiZaman, eskiZaman)
    const sonuc = kapi.oturumunDosyalari(kapi.hafizaDizinleri(wt), SID)
    expect(sonuc.map((s) => s.tam)).toEqual([yeniYol, eskiYol])
    expect(Object.keys(sonuc[0]).sort()).toEqual(['ad', 'mt', 'tam'])
  })

  it('eski çağrı biçimi (tek dizin dizgisi) çalışmaya devam eder', () => {
    yaz(path.join(wt, 'memory', 'x-lane-day.md'), durumGovde(SID))
    expect(kapi.oturumunDosyalari(path.join(wt, 'memory'), SID).length).toBe(1)
  })

  it('gunluk altındaki BAŞKA oturumun dosyası eşleşmez', () => {
    yaz(path.join(wt, 'memory', 'gunluk', '2026-10-01', 'x-lane-day.md'), durumGovde(BASKA_SID))
    expect(kapi.oturumunDosyalari(kapi.hafizaDizinleri(wt), SID)).toEqual([])
  })
})

describe('INV-COMPACT-3 · ARC-6 2. katman: kimlik eski ise AYNI ŞERİT adlı durum dosyası kabul edilir (uyarıyla)', () => {
  let oturumlar = ''
  const oturumKaydi = (ad: string, sid: string = SID) =>
    yaz(path.join(oturumlar, '4242.json'), JSON.stringify({ pid: 4242, sessionId: sid, name: ad, kind: 'interactive' }))
  const cikti = (r: { stdout: string; stderr: string }) => r.stdout + r.stderr

  beforeEach(() => {
    oturumlar = path.join(t, 'sessions')
    fs.mkdirSync(oturumlar, { recursive: true })
    process.env.VENTHUB_SESSIONS_DIZINI = oturumlar
  })

  it('⭐kimlik ESKİ ama dosya adı pencere adıyla başlıyor (Araç → arac-…): kapı GEÇER ve "KIMLIK ESKI" uyarır', () => {
    yaz(path.join(ana, 'memory', 'arac-serit-durumu.md'), durumGovde(BASKA_SID).replace('x-lane-day', 'arac-durum'))
    oturumKaydi('Araç')
    const r = kapiKos()
    expect(r.status, cikti(r)).toBe(0)
    expect(cikti(r)).toContain('KIMLIK ESKI')
    expect(cikti(r)).toContain('"arac"')
  })

  it('sessions kaydı YOK (şerit bilinmiyor): eski davranış, kapı DURDURUR', () => {
    yaz(path.join(ana, 'memory', 'arac-serit-durumu.md'), durumGovde(BASKA_SID))
    expect(kapiKos().status).toBe(2)
  })

  it('BAŞKA şeridin dosyası kabul edilmez (Araç penceresi, ops-lane-day): DURDURUR', () => {
    yaz(path.join(ana, 'memory', 'ops-lane-day-2026-10-01.md'), durumGovde(BASKA_SID))
    oturumKaydi('Araç')
    expect(kapiKos().status).toBe(2)
  })

  it('önek kısmi değil: "arac" şeridi "aracsiz-lane-day.md" (tire yok) ya da durum kalıbı olmayan "arac-ders.md" dosyasını kabul ETMEZ', () => {
    yaz(path.join(ana, 'memory', 'aracsiz-lane-day.md'), durumGovde(BASKA_SID))
    yaz(path.join(ana, 'memory', 'arac-ders.md'), durumGovde(BASKA_SID))
    oturumKaydi('Araç')
    expect(kapiKos().status).toBe(2)
  })

  it('kimlik EŞLEŞİYORSA şerit yedeği devreye girmez: uyarı yok, dönüş biçimi değişmez', () => {
    yaz(path.join(ana, 'memory', 'arac-serit-durumu.md'), durumGovde(SID))
    oturumKaydi('Araç')
    const r = kapiKos()
    expect(r.status).toBe(0)
    expect(cikti(r)).not.toContain('KIMLIK ESKI')
    expect(Object.keys(kapi.oturumunDosyalari(kapi.hafizaDizinleri(wt), SID)[0]).sort()).toEqual(['ad', 'mt', 'tam'])
  })

  it('bozuk sessions kaydı kapıyı düşürmez (JSON değil): eski davranış', () => {
    yaz(path.join(oturumlar, '1.json'), '{bozuk')
    yaz(path.join(ana, 'memory', 'arac-serit-durumu.md'), durumGovde(BASKA_SID))
    expect(kapiKos().status).toBe(2)
  })
})
