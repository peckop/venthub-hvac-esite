/**
 * INV-KANBAN-UYUM-1 — Kanban kural uyum ölçümü (ARC-153, OPS 16 Ekim): pano başına son 7 gün KAYNAK/CETVEL, YÖNTEM, ÖNCEKİ ÇALIŞMA,
 * kanıt komutu, Done'da verify passed oranı ve 5+ gün hareketsiz kart; eşik altı KIRMIZI (örneklem yeterliyse); SALT-OKUMA.
 *
 * Betik: scripts/board/kanban-uyum.cjs · kural: .claude/rules/filo-ortak.md "İş ve kart".
 * Regresyon: 16 Ekim ölçümü, OPS panosu Done kartlarda verify passed 2/7, kanıt komutu oranı 28%.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts', 'board', 'kanban-uyum.cjs')

interface PanoSonuc {
  ad: string
  departman: string
  acilan: number
  oranlar: Record<string, number | null>
  done: { n: number; verifyli: number; oran: number | null }
  hareketsiz: { n: number; kartlar: string[] }
  kirmizi: string[]
}
interface Betik {
  uyumHesapla: (panolar: unknown[], simdi: number, secenek?: { gun?: number }) => PanoSonuc[]
  departmanAnahtari: (ad: string) => string
  satirVarMi: (kart: Record<string, unknown>, ad: string) => boolean
  kanitKomutuVarMi: (kart: Record<string, unknown>) => boolean
  ESIK_DEPARTMAN: Record<string, Record<string, number>>
  EN_AZ_ORNEK: number
}
const b = gerek(BETIK) as Betik

const GUN = 24 * 60 * 60 * 1000
const SIMDI = Date.parse('2026-10-16T12:00:00.000Z')
const gunOnce = (n: number) => new Date(SIMDI - n * GUN).toISOString()
const TAM = 'KAYNAK/CETVEL: x.\nYÖNTEM: elle.\nÖNCEKİ ÇALIŞMA: arandı.'

const kart = (o: Record<string, unknown>) => ({ id: 'k' + Math.random().toString(36).slice(2), title: 'ARC-1 · x', columnId: 'todo', status: 'pending', description: '', labels: [], createdAt: gunOnce(1), updatedAt: gunOnce(1), ...o })
const pano = (title: string, tasks: unknown[]) => ({ id: 'p-' + title, title, columns: [], tasks })

describe('INV-KANBAN-UYUM-1 · oranlar', () => {
  it('son 7 günde açılan kartlarda satır ve kanıt komutu oranları; eski kart paydaya girmez', () => {
    const p = pano('VentHub ARAÇ', [
      kart({ description: TAM, successCriteria: [{ type: 'command' }] }),
      kart({ description: 'KAYNAK/CETVEL: x.' }),
      kart({ description: '', successCriteria: [{ type: 'manual' }] }),
      kart({ description: TAM, createdAt: gunOnce(30) }), // pencere dışı
    ])
    const [s] = b.uyumHesapla([p], SIMDI)
    expect(s.acilan).toBe(3)
    expect(s.oranlar.kaynakCetvel).toBeCloseTo(2 / 3, 2)
    expect(s.oranlar.yontem).toBeCloseTo(1 / 3, 2)
    expect(s.oranlar.oncekiCalisma).toBeCloseTo(1 / 3, 2)
    expect(s.oranlar.kanitKomutu).toBeCloseTo(1 / 3, 2)
  })

  it('küçük harf ve ASCII yazım tolere edilir; manuel kontrol kanıt komutu sayılmaz', () => {
    expect(b.satirVarMi({ description: 'kaynak/cetvel: x' }, 'kaynakCetvel')).toBe(true)
    expect(b.satirVarMi({ description: 'yontem: elle' }, 'yontem')).toBe(true)
    expect(b.satirVarMi({ description: 'onceki calisma: y' }, 'oncekiCalisma')).toBe(true)
    expect(b.satirVarMi({ description: 'sadece metin' }, 'yontem')).toBe(false)
    expect(b.kanitKomutuVarMi({ successCriteria: [{ type: 'manual' }] })).toBe(false)
    expect(b.kanitKomutuVarMi({ successCriteria: [{ type: 'file_matches' }] })).toBe(true)
    expect(b.kanitKomutuVarMi({})).toBe(false)
  })

  it('Done: yalnız 7 günde biten, muaf etiket paydadan düşer; verify passed oranı', () => {
    const p = pano('VentHub OPS', [
      kart({ columnId: 'done', completedAt: gunOnce(1), verificationReport: { verdict: 'passed' } }),
      kart({ columnId: 'done', completedAt: gunOnce(2) }),
      kart({ columnId: 'done', completedAt: gunOnce(2), labels: ['kanit-muaf'] }),
      kart({ columnId: 'done', completedAt: gunOnce(20) }),
    ])
    const [s] = b.uyumHesapla([p], SIMDI)
    expect(s.done).toEqual({ n: 2, verifyli: 1, oran: 0.5 })
  })

  it('5+ gün hareketsiz: yalnız In Progress ve Review; Backlog ve To Do sayılmaz; kart kodu döner', () => {
    const p = pano('VentHub URUN', [
      kart({ title: 'URN-9 · eski', columnId: 'in-progress', updatedAt: gunOnce(6) }),
      kart({ title: 'URN-10 · taze', columnId: 'review', updatedAt: gunOnce(1) }),
      kart({ title: 'URN-11 · bekleyen', columnId: 'backlog', updatedAt: gunOnce(40) }),
      kart({ title: 'URN-12 · sırada', columnId: 'todo', updatedAt: gunOnce(40) }),
    ])
    const [s] = b.uyumHesapla([p], SIMDI)
    expect(s.hareketsiz).toEqual({ n: 1, kartlar: ['URN-9'] })
  })

  it('arşivli kart, muaf pano (Linear Bekleyenler, DENEME) hesaba girmez', () => {
    const arsivli = kart({ status: 'archived', description: TAM })
    const panolar = [pano('VentHub ARAÇ', [arsivli]), pano('Linear Bekleyenler (taşınan)', [kart({})]), pano('DENEME-yonetilen', [kart({})])]
    const sonuc = b.uyumHesapla(panolar, SIMDI)
    expect(sonuc.map((s) => s.ad)).toEqual(['VentHub ARAÇ'])
    expect(sonuc[0].acilan).toBe(0)
  })
})

describe('INV-KANBAN-UYUM-1 · kırmızı eşik', () => {
  const kotu = (n: number) => Array.from({ length: n }, () => kart({ description: 'kısa' }))

  it('örneklem yeterliyse (3+ kart) eşik altı oran KIRMIZI üretir', () => {
    const [s] = b.uyumHesapla([pano('VentHub OPS', kotu(4))], SIMDI)
    expect(s.kirmizi.some((x) => /^kaynakCetvel 0% \(eşik 80%, 4 kart\)/.test(x))).toBe(true)
    expect(s.kirmizi.some((x) => /^kanitKomutu/.test(x))).toBe(true)
  })

  it('örneklem yetersizse (2 kart) kırmızı üretmez (gürültü yok)', () => {
    const [s] = b.uyumHesapla([pano('VentHub OPS', kotu(b.EN_AZ_ORNEK - 1))], SIMDI)
    expect(s.kirmizi).toEqual([])
  })

  it('Done verify oranı eşik altıysa ve 3+ Done varsa KIRMIZI; hareketsiz kart ayrı satır', () => {
    const bitenler = Array.from({ length: 3 }, () => kart({ columnId: 'done', completedAt: gunOnce(1) }))
    const eski = kart({ columnId: 'review', updatedAt: gunOnce(9) })
    const [s] = b.uyumHesapla([pano('VentHub OPS', [...bitenler, eski])], SIMDI)
    expect(s.kirmizi.some((x) => /^doneVerify 0% \(eşik 80%, 3 kart\)/.test(x))).toBe(true)
    expect(s.kirmizi.some((x) => /^hareketsiz 1 kart/.test(x))).toBe(true)
  })

  it('tam kartlar KIRMIZI üretmez', () => {
    const iyi = Array.from({ length: 4 }, () => kart({ description: TAM, successCriteria: [{ type: 'command' }] }))
    const [s] = b.uyumHesapla([pano('VentHub ARAÇ', iyi)], SIMDI)
    expect(s.kirmizi).toEqual([])
  })

  it('eşik DEPARTMAN BAŞINA ezilebilir: HARITA için yontem eşiği 0 ise o satır kırmızı olmaz', () => {
    const p = pano('VentHub HARİTA', kotu(4))
    expect(b.departmanAnahtari('VentHub HARİTA')).toBe('HARITA')
    const once = b.uyumHesapla([p], SIMDI)[0].kirmizi.some((x) => /^yontem/.test(x))
    b.ESIK_DEPARTMAN.HARITA = { yontem: 0 }
    try {
      const sonra = b.uyumHesapla([p], SIMDI)[0].kirmizi.some((x) => /^yontem/.test(x))
      expect([once, sonra]).toEqual([true, false])
    } finally {
      delete b.ESIK_DEPARTMAN.HARITA
    }
  })
})

describe('INV-KANBAN-UYUM-1 · gerçek süreç (geçici sqlite, salt-okuma, UTF-8)', () => {
  let dizin = ''
  let dbYolu = ''
  let oncekiBayt = ''

  beforeAll(() => {
    dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'kanban-uyum-'))
    dbYolu = path.join(dizin, '_kanban.sqlite')
    const { DatabaseSync } = gerek('node:sqlite') as { DatabaseSync: new (p: string) => { exec: (s: string) => void; prepare: (s: string) => { run: (...a: unknown[]) => void }; close: () => void } }
    const db = new DatabaseSync(dbYolu)
    db.exec('create table kanban_boards (id text primary key, payload text, revision integer, updated_at text)')
    const taze = new Date().toISOString()
    const tasks = Array.from({ length: 3 }, (_, i) => kart({ title: `ARC-${i + 1} · çalışma`, description: 'kısa', createdAt: taze, updatedAt: taze }))
    db.prepare('insert into kanban_boards values (?,?,?,?)').run('p1', JSON.stringify(pano('VentHub ARAÇ', tasks)), 1, taze)
    db.close()
    oncekiBayt = fs.readFileSync(dbYolu).toString('base64')
  })

  afterAll(() => {
    fs.rmSync(dizin, { recursive: true, force: true })
  })

  const kos = (args: string[], ortam: Record<string, string> = {}) =>
    spawnSync(process.execPath, [BETIK, ...args], { encoding: 'utf8', env: { ...process.env, VENTHUB_KANBAN_DB: dbYolu, ...ortam }, timeout: 60_000 })

  it('JSON çıktı: Türkçe pano adı UTF-8 bozulmadan döner, kırmızı satırları taşır', () => {
    const r = kos([])
    expect(r.status).toBe(0)
    const c = JSON.parse(r.stdout) as { gun: number; panolar: PanoSonuc[] }
    expect(c.gun).toBe(7)
    expect(c.panolar[0].ad).toBe('VentHub ARAÇ')
    expect(c.panolar[0].acilan).toBe(3)
    expect(c.panolar[0].kirmizi.length).toBeGreaterThan(0)
    expect(r.stdout).not.toContain('�')
  })

  it('--metin tablo başlığı verir; --pano süzer; --gun pencereyi daraltır', () => {
    expect(kos(['--metin']).stdout).toMatch(/^pano \| açılan \| KAYNAK/)
    expect((JSON.parse(kos(['--pano', 'yok-boyle']).stdout) as { panolar: unknown[] }).panolar).toEqual([])
  })

  it('SALT-OKUMA: koşudan sonra veritabanı baytı değişmedi', () => {
    kos([])
    expect(fs.readFileSync(dbYolu).toString('base64')).toBe(oncekiBayt)
  })

  it('hata yolu: veritabanı yoksa {hata} ve çıkış 1', () => {
    const r = kos([], { VENTHUB_KANBAN_DB: path.join(dizin, 'yok.sqlite') })
    expect(r.status).toBe(1)
    expect(JSON.parse(r.stdout)).toEqual({ hata: 'pano dosyası yok' })
  })
})
