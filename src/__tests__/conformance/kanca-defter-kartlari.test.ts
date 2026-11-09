// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-DEFTER-KANBAN-1 · defterin iş bölümleri Kanban'dan üretilir (ARC-291).
 * Kanban sqlite yerel olduğu için okuma enjekte edilir; sabotaj kolları: ayrışma yakalanır, ölçülemedi uydurmaz,
 * elle yazılmış satırlara dokunulmaz, damga yaşı ölçülür, gerçek manifest bozulmadan kalır.
 */

const req = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const D = req(path.join(KOK, 'scripts/hijyen/defter-kartlari.cjs')) as {
  yaniKartlar: (h: unknown[]) => { no: string; baslik: string; durum: string; bitti: boolean; sahip: string; kapanis: string }[]
  kartlariOku: (ad: string, k: { oku: (ad: string) => unknown }) => { durum: string; kartlar?: unknown[]; sebep?: string }
  metniYaz: (m: string, ad: string, k: unknown[], t: string) => string | null
  kontrol: (m: string, k: unknown[]) => { durum: string; ayrik: string[] }
  damgaYasi: (m: string, b?: Date) => number | null
  tablo: (kip: string, k: unknown[]) => string
}

const ham = (no: string, baslik: string, extra: Record<string, unknown> = {}) => ({
  board: { id: 'b', title: 'VentHub URUN' },
  task: { id: 'abcdef0123456789', title: `${no}: ${baslik}`, status: 'pending', sutun: 'To Do', columnId: 'todo', assignee: null, ...extra },
})
const BITEN = ham('URN-158', 'Pilot defter | yazıldı', { status: 'completed', sutun: 'Done', columnId: 'done', completedAt: '2026-11-09T10:00:00Z' })
const ACIK = ham('URN-157', 'Eski→yeni adres tablosu', { sutun: 'In Progress', columnId: 'in-progress', status: 'in_progress' })
const DEFTER = '# D\n\n## 1 Ne yaptık\n\n| Tarih | İş |\n|---|---|\n| 2026-11-01 | elle satır | URN-1 |\n\n## 2 Envanter\n\nx\n\n## 3 Sırada ve yapılabilecekler\n\n| Madde |\n|---|\n| elle madde |\n\n## 4 Kararlar\n'

describe('INV-DEFTER-KANBAN-1 · kart çözümleme ve tablolar', () => {
  it('numara başlıktan çıkar, | karakteri kaçar, bitti/kapanış doğru', () => {
    const [b, a] = D.yaniKartlar([BITEN, ACIK])
    expect(b).toMatchObject({ no: 'URN-158', bitti: true, kapanis: '2026-11-09', sahip: 'URUN' })
    expect(b.baslik).not.toContain('|')
    expect(a).toMatchObject({ no: 'URN-157', bitti: false, durum: 'In Progress' })
  })
  it('Kanban okunamazsa ölçülemedi (uydurma tablo yok)', () => {
    expect(D.kartlariOku('x', { oku: () => null }).durum).toBe('olculemedi')
    expect(D.kartlariOku('x', { oku: () => { throw new Error('sqlite yok') } })).toMatchObject({ durum: 'olculemedi', sebep: 'sqlite yok' })
  })
  it('tavan: 30 satırdan fazlası "+N kart daha" ile kısalır', () => {
    const cok = D.yaniKartlar(Array.from({ length: 35 }, (_, i) => ham(`URN-${200 + i}`, 'x')))
    expect(D.tablo('sirada', cok)).toContain('+5 kart daha')
  })
})

describe('INV-DEFTER-KANBAN-1 · yazma ve kontrol', () => {
  const kartlar = D.yaniKartlar([BITEN, ACIK])
  it('bölüm başlığının altına iki blok ekler, elle satırlara DOKUNMAZ', () => {
    const yeni = D.metniYaz(DEFTER, 'urun-adres', kartlar, '2026-11-09') as string
    expect(yeni).toContain('| 2026-11-01 | elle satır | URN-1 |')
    expect(yeni).toContain('| elle madde |')
    expect(yeni).toContain('| 2026-11-09 | URN-158 |')
    expect(yeni).toContain('| URN-157 |')
    expect(yeni.match(/DEFTER-KANBAN:ne-yaptik BASLA/g)).toHaveLength(1)
  })
  it('ikinci yazım blokları ÇOĞALTMAZ (idempotent) ve CRLF korunur', () => {
    const bir = D.metniYaz(DEFTER.replace(/\n/g, '\r\n'), 'urun-adres', kartlar, '2026-11-09') as string
    const iki = D.metniYaz(bir, 'urun-adres', kartlar, '2026-11-09') as string
    expect(iki).toBe(bir)
    expect(bir.includes('\r\n')).toBe(true)
    expect(bir.replace(/\r\n/g, '').includes('\n')).toBe(false)
  })
  it('başlık yoksa yazmaz (null)', () => {
    expect(D.metniYaz('# boş defter\n', 'x', kartlar, '2026-11-09')).toBeNull()
  })
  it('kontrol: taze üretim uyumlu', () => {
    const yeni = D.metniYaz(DEFTER, 'urun-adres', kartlar, '2026-11-09') as string
    expect(D.kontrol(yeni, kartlar)).toMatchObject({ durum: 'uyumlu', ayrik: [] })
  })
  it('sabotaj: kart durum değiştirince, kart eklenince ve etiket kalkınca AYRIŞMA yakalanır', () => {
    const yeni = D.metniYaz(DEFTER, 'urun-adres', kartlar, '2026-11-09') as string
    const ilerledi = D.yaniKartlar([BITEN, { ...ACIK, task: { ...ACIK.task, sutun: 'Done', columnId: 'done', status: 'completed', completedAt: '2026-11-10T08:00:00Z' } }])
    expect(D.kontrol(yeni, ilerledi).durum).toBe('ayrisik')
    const eklendi = D.yaniKartlar([BITEN, ACIK, ham('URN-999', 'yeni')])
    expect(D.kontrol(yeni, eklendi).ayrik.join()).toContain('URN-999 Kanban\'da var')
    const kalkti = D.yaniKartlar([BITEN])
    expect(D.kontrol(yeni, kalkti).ayrik.join()).toContain('URN-157 defterde var')
  })
  it('blok yoksa "blok-yok" (uyumlu sayılmaz)', () => {
    expect(D.kontrol(DEFTER, kartlar).durum).toBe('blok-yok')
  })
  it('kontrol: 30 karttan fazlada da taze üretim uyumlu (tablo ile aynı sıralama)', () => {
    const cok = D.yaniKartlar(Array.from({ length: 40 }, (_, i) => ham(`URN-${300 - i * 3}`, 'x', i % 2 ? { sutun: 'In Progress', status: 'in_progress' } : {})))
    const yeni = D.metniYaz(DEFTER, 'urun-adres', cok, '2026-11-09') as string
    expect(D.kontrol(yeni, cok)).toMatchObject({ durum: 'uyumlu', ayrik: [] })
  })
  it('sabotaj: aynı numaralı iki kartın biri değişince ayrışma gizlenmez', () => {
    const ikiz = (d: string) => D.yaniKartlar([ham('URN-50', 'a'), ham('URN-50', 'b', { sutun: d, status: 'pending' })])
    const yeni = D.metniYaz(DEFTER, 'urun-adres', ikiz('To Do'), '2026-11-09') as string
    expect(D.kontrol(yeni, ikiz('To Do')).durum).toBe('uyumlu')
    expect(D.kontrol(yeni, ikiz('In Progress')).durum).toBe('ayrisik')
  })
  it('damga yaşı ölçülür; damga yoksa null', () => {
    const yeni = D.metniYaz(DEFTER, 'urun-adres', kartlar, '2026-11-01') as string
    expect(D.damgaYasi(yeni, new Date('2026-11-09T12:00:00Z'))).toBe(8)
    expect(D.damgaYasi(DEFTER)).toBeNull()
  })
})

describe('INV-DEFTER-KANBAN-1 · gerçek defterler', () => {
  it('üretilmiş blok bulunan her defterde blok çifti tam ve damga var', () => {
    const dizin = path.join(KOK, 'docs', 'defter')
    for (const f of fs.readdirSync(dizin).filter((x) => x.endsWith('.md'))) {
      const m = fs.readFileSync(path.join(dizin, f), 'utf8')
      const basla = (m.match(/DEFTER-KANBAN:[a-z-]+ BASLA/g) || []).length
      const bitis = (m.match(/DEFTER-KANBAN:[a-z-]+ BITIS/g) || []).length
      expect(basla, f).toBe(bitis)
      if (basla > 0) expect(D.damgaYasi(m), `${f} damga`).not.toBeNull()
    }
  })
})
