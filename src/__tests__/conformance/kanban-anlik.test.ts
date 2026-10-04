/**
 * INV-KANBAN-ANLIK-1..6 — scripts/board/kanban-anlik.cjs (ARC-33).
 *
 * Mod'lar (hafta, ops-kokpit) Kanban'ı bu betikle okur. Sözleşme: hiçbir zaman yazmaz, varsayılan çıktı
 * geriye uyumlu kalır (yalnız alan EKLENİR), `--detay` tek kartın TAM içeriğini verir, `--id` kart numarasıyla çalışır.
 * Sahte pano dosyası (geçici sqlite) kullanılır; gerçek pano okunmaz.
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const require_ = createRequire(import.meta.url)
const BETIK = resolve(__dirname, '..', '..', '..', 'scripts', 'board', 'kanban-anlik.cjs')

interface Kart {
  id: string
  title: string
  columnId: string
  status: string
  priority: string
  labels: string[]
  assignee?: string
  dueDate?: string
  description?: string
  estimatedHours?: number
  successCriteria?: { id: string; description: string; status: string; type: string }[]
  dependsOn?: string[]
  notes?: { id: string; author: string; content: string; createdAt: string }[]
  links?: { url: string; type: string; title: string }[]
}

interface Cikti {
  id: string
  title: string
  status: string
  priority: string
  assignee: string | null
  dueDate: string | null
  columnId: string
  sutun: string
  kabul: { m: number; n: number }
  bagimlilik: number
  notSayisi: number
  description?: string
  notlar?: { yazan: string; icerik: string; saat: string }[]
  kabulOlcutleri?: { id: string; aciklama: string; durum: string; tur: string }[]
  bagimliliklar?: { id: string; title: string | null; status: string | null }[]
  baglantilar?: { url: string; tur: string; baslik: string }[]
  tahminSaat?: number
}

interface Yanit {
  ok: boolean
  hata?: string
  tasks: { board: { id: string }; task: Cikti }[]
}

const KART_A: Kart = {
  id: 'aaaa-1111',
  title: 'OPS-31 · Prototip canlıya',
  columnId: 'review',
  status: 'review',
  priority: 'high',
  labels: ['hafta-41'],
  assignee: 'OPS',
  dueDate: '2026-10-06',
  description: 'KAYNAK: x\n' + 'NE: '.padEnd(500, 'a'),
  estimatedHours: 3,
  successCriteria: [
    { id: 'c1', description: 'birinci', status: 'passed', type: 'manual' },
    { id: 'c2', description: 'ikinci', status: 'pending', type: 'command' },
    { id: 'c3', description: 'üçüncü', status: 'skipped', type: 'manual' },
  ],
  dependsOn: ['bbbb-2222'],
  notes: Array.from({ length: 7 }, (_, i) => ({ id: `n${i}`, author: 'OPS', content: `not ${i}`, createdAt: `2026-10-04T0${i}:00:00Z` })),
  links: [{ url: 'https://example.test/pr/1', type: 'pr', title: 'PR 1' }],
}
const KART_B: Kart = { id: 'bbbb-2222', title: 'ARC-33: Mod', columnId: 'done', status: 'completed', priority: 'low', labels: [] }
const KART_C: Kart = { id: 'cccc-3333', title: 'ARC-3: başka kart', columnId: 'backlog', status: 'pending', priority: 'medium', labels: ['Hafta-41'] }
const KART_ARSIV: Kart = { id: 'dddd-4444', title: 'ARC-9: arşiv', columnId: 'backlog', status: 'archived', priority: 'low', labels: [] }

let klasor = ''
let db = ''

function kos(...args: string[]): Yanit {
  const r = spawnSync(process.execPath, [BETIK, '--db', db, ...args], { encoding: 'utf8', timeout: 20000 })
  return JSON.parse(r.stdout.trim().split('\n').pop() ?? '{}') as Yanit
}

function idler(y: Yanit): string[] {
  return y.tasks.map(t => t.task.id).sort()
}

beforeAll(() => {
  klasor = mkdtempSync(join(tmpdir(), 'kanban-anlik-'))
  db = join(klasor, '_kanban.sqlite')
  // @types/node bu sürümde node:sqlite'ı tanımıyor; yalnız kullanılan yüzey elle yazıldı.
  interface Veritabani {
    exec(sql: string): void
    prepare(sql: string): { run(...a: unknown[]): unknown }
    close(): void
  }
  const { DatabaseSync } = require_('node:sqlite') as { DatabaseSync: new (yol: string) => Veritabani }
  const d = new DatabaseSync(db)
  d.exec('create table kanban_boards (id text primary key, payload text, revision integer, updated_at text)')
  const pano = {
    id: 'p1',
    title: 'Pano',
    columns: [
      { id: 'backlog', title: 'Backlog' },
      { id: 'review', title: 'Review' },
      { id: 'done', title: 'Done' },
    ],
    tasks: [KART_A, KART_B, KART_C, KART_ARSIV],
  }
  d.prepare('insert into kanban_boards values (?,?,?,?)').run('p1', JSON.stringify(pano), 1, 'x')
  d.close()
})

afterAll(() => {
  rmSync(klasor, { recursive: true, force: true })
})

describe('INV-KANBAN-ANLIK-1 · varsayılan çıktı geriye uyumlu, alan eklenir', () => {
  it('eski alanlar durur, sütun adı ve sayaçlar gelir, arşivli kart yok', () => {
    const r = kos()
    expect(r.ok).toBe(true)
    expect(idler(r)).toEqual(['aaaa-1111', 'bbbb-2222', 'cccc-3333'])
    const a = r.tasks.find(t => t.task.id === 'aaaa-1111')!.task
    expect(a).toMatchObject({ title: KART_A.title, status: 'review', priority: 'high', assignee: 'OPS', dueDate: '2026-10-06', columnId: 'review' })
    expect(a.sutun).toBe('Review')
    expect(a.kabul).toEqual({ m: 2, n: 3 })
    expect(a.bagimlilik).toBe(1)
    expect(a.notSayisi).toBe(7)
    expect(a.description?.length ?? 0).toBeLessThanOrEqual(200)
    expect(a.notlar).toBeUndefined()
  })
})

describe('INV-KANBAN-ANLIK-2 · --detay tek kartın tam içeriği', () => {
  it('açıklama tam, kabul ölçütleri, bağımlılık başlığı, son 5 not, bağlantı, süre', () => {
    const t = kos('--id', 'OPS-31', '--detay').tasks[0].task
    expect(t.description).toBe(KART_A.description)
    expect(t.kabulOlcutleri).toEqual([
      { id: 'c1', aciklama: 'birinci', durum: 'passed', tur: 'manual' },
      { id: 'c2', aciklama: 'ikinci', durum: 'pending', tur: 'command' },
      { id: 'c3', aciklama: 'üçüncü', durum: 'skipped', tur: 'manual' },
    ])
    expect(t.bagimliliklar).toEqual([{ id: 'bbbb-2222', title: 'ARC-33: Mod', status: 'completed' }])
    expect(t.notlar?.map(n => n.icerik)).toEqual(['not 2', 'not 3', 'not 4', 'not 5', 'not 6'])
    expect(t.notSayisi).toBe(7)
    expect(t.baglantilar).toEqual([{ url: 'https://example.test/pr/1', tur: 'pr', baslik: 'PR 1' }])
    expect(t.tahminSaat).toBe(3)
  })

  it('bağımlılığı olmayan kartta liste boş gelir, çökmez', () => {
    const r = kos('--id', 'ARC-33', '--detay')
    expect(r.ok).toBe(true)
    expect(r.tasks[0].task.bagimliliklar).toEqual([])
  })
})

describe('INV-KANBAN-ANLIK-3 · --id kart numarası ya da kimlikle, yanlış numara eşleşmez', () => {
  it('numara, kimlik ve birden çok --id', () => {
    expect(idler(kos('--id', 'ops-31'))).toEqual(['aaaa-1111'])
    expect(idler(kos('--id', 'aaaa-1111'))).toEqual(['aaaa-1111'])
    expect(idler(kos('--id', 'ARC-33', '--id', 'ARC-3'))).toEqual(['bbbb-2222', 'cccc-3333'])
  })
  it('ARC-3 sorgusu ARC-33 kartını getirmez', () => {
    expect(idler(kos('--id', 'ARC-3'))).toEqual(['cccc-3333'])
  })
})

describe('INV-KANBAN-ANLIK-4 · --acik Done sütununu atlar, --label büyük/küçük harf ayırmaz', () => {
  it('acik', () => {
    expect(idler(kos('--acik'))).toEqual(['aaaa-1111', 'cccc-3333'])
  })
  it('label', () => {
    expect(idler(kos('--label', 'HAFTA-41'))).toEqual(['aaaa-1111', 'cccc-3333'])
  })
})

describe('INV-KANBAN-ANLIK-5 · hata yolları: çıkış 0, ok:false, kısa sebep', () => {
  it('pano dosyası yoksa', () => {
    const r = spawnSync(process.execPath, [BETIK, '--db', join(klasor, 'yok.sqlite')], { encoding: 'utf8', timeout: 20000 })
    expect(r.status).toBe(0)
    const j = JSON.parse(r.stdout.trim()) as { ok: boolean; hata: string }
    expect(j.ok).toBe(false)
    expect(String(j.hata).length).toBeLessThanOrEqual(200)
  })
})

describe('INV-KANBAN-ANLIK-7 · --kisa, vade aralığı, --pano ve sayaç', () => {
  it('--kisa açıklamayı ve zaman damgalarını çıkarır, başlığı 120 karaktere kırpar', () => {
    const a = kos('--kisa', '--id', 'OPS-31').tasks[0].task
    expect(a.description).toBeUndefined()
    expect('createdAt' in a).toBe(false)
    expect(a.sutun).toBe('Review')
  })
  it('vade aralığı uçlar dahil süzer, vadesizi eler', () => {
    expect(idler(kos('--vade-bas', '2026-10-06', '--vade-son', '2026-10-06'))).toEqual(['aaaa-1111'])
    expect(idler(kos('--vade-bas', '2026-10-07'))).toEqual([])
  })
  it('--pano başlık parçasıyla süzer', () => {
    expect(idler(kos('--pano', 'pano'))).toEqual(['aaaa-1111', 'bbbb-2222', 'cccc-3333'])
    expect(idler(kos('--pano', 'yok-boyle-pano'))).toEqual([])
  })
  it('sayaç süzgeçlerden bağımsız, Done dahil, arşivsiz', () => {
    const j = kos('--acik', '--id', 'ARC-3') as Yanit & { sayac: Record<string, { baslik: string; sutunlar: Record<string, number> }> }
    expect(j.sayac.p1).toEqual({ baslik: 'Pano', sutunlar: { Review: 1, Done: 1, Backlog: 1 } })
  })
})

describe('INV-KANBAN-ANLIK-6 · betik panoya YAZMAZ', () => {
  it('çalıştırma pano dosyasının boyutunu ve zamanını değiştirmez', () => {
    const once = statSync(db)
    kos('--detay')
    kos('--acik')
    const sonra = statSync(db)
    expect(sonra.size).toBe(once.size)
    expect(sonra.mtimeMs).toBe(once.mtimeMs)
  })
})
