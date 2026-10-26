/**
 * INV-KANCA-ONCE-ELINDEKI-IS-1 — departman, elindeki In Progress işi bitirmeden yeni karta geçerken uyarılır
 * (ARC-217, ARC-212 ek parçası). Açılışta "ÖNCE BUNLAR / SIRADA" bloğu, kart başlatılırken uyarı.
 *
 * Mantık: scripts/board/once-elindeki-is.cjs · kanca: .claude/hooks/once-elindeki-is-uyarisi.cjs
 * SABOTAJ: "beklemede etiketli kart sayılmaz" ve "kartın kendisi sayılmaz" senaryoları, bu kuralları gevşeten
 * (etiketi yok sayan / kendini sayan) bir kopyaya karşı KIRMIZI verir; yani kural gerçekten ölçülüyor.
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const MODUL_YOLU = path.join(KOK, 'scripts', 'board', 'once-elindeki-is.cjs')
const KANCA = path.join(KOK, '.claude', 'hooks', 'once-elindeki-is-uyarisi.cjs')

interface Kart {
  id: string
  title: string
  assignee?: string | null
  sutun: string
  status?: string
  priority?: string
  labels?: string[]
}
interface Modul {
  acilisMetni: (rol: string, kartlar: Kart[] | null, onek?: Record<string, string>) => string
  baslatmaUyarisi: (hedef: string, kartlar: Kart[] | null, onek?: Record<string, string>) => string
  grupla: (k: Kart[], rol: string, onek?: Record<string, string>) => { surenler: Kart[]; bekleyenler: Kart[]; incelemede: Kart[]; sirada: Kart[] }
  beklemede: (k: Kart) => boolean
}
const m = gerek(MODUL_YOLU) as Modul
const kanca = gerek(KANCA) as { baslatmaMi: (g: Record<string, unknown>) => boolean }

const ONEK = { ARC: 'ARAC', ALT: 'ALTYAPI', HRT: 'HARITA' }

function kart(no: string, sutun: string, ek: Partial<Kart> = {}): Kart {
  return { id: `id-${no}`, title: `${no} · ${ek.title ?? 'örnek iş'}`, sutun, labels: [], assignee: null, ...ek, ...(ek.title ? { title: `${no} · ${ek.title}` } : {}) }
}

const KARTLAR: Kart[] = [
  kart('ARC-147', 'In Progress'),
  kart('ARC-148', 'In Progress', { assignee: 'ARAC' }),
  kart('ARC-155', 'In Progress', { labels: ['beklemede', 'ops-bekliyor'] }),
  kart('ARC-36', 'Review'),
  kart('ARC-214', 'Backlog', { labels: ['ops-emri'] }),
  kart('ARC-300', 'Backlog', { labels: ['diger'] }),
  kart('ARC-217', 'Backlog', { labels: ['ops-emri'] }),
  kart('ALT-5', 'In Progress'),
  kart('REC-77', 'In Progress', { assignee: 'Araç' }), // taşınan Linear kartı: atanan ARAÇ
  kart('REC-78', 'In Progress', { assignee: null }), // departmansız: kimseye sayılmaz
]

describe('açılış bloğu (ÖNCE BUNLAR / SIRADA)', () => {
  it('ARAÇ: In Progress + Review "ÖNCE BUNLAR"da, ops-emri kartları "SIRADA"da; beklemede olan öne çıkmaz', () => {
    const metin = m.acilisMetni('ARAC', KARTLAR, ONEK)
    const once = metin.slice(metin.indexOf('ÖNCE BUNLAR'), metin.indexOf('SIRADA'))
    expect(once).toContain('ARC-147')
    expect(once).toContain('ARC-148')
    expect(once).toContain('ARC-36')
    expect(once).toContain('REC-77') // atanan "Araç" katlanır
    expect(once).not.toContain('ARC-155') // beklemede
    expect(once).not.toContain('ALT-5') // başka departman
    expect(once).not.toContain('REC-78') // departmansız
    const sirada = metin.slice(metin.indexOf('SIRADA'))
    expect(sirada).toContain('ARC-214')
    expect(sirada).toContain('ARC-217')
    expect(sirada).not.toContain('ARC-300') // ops-emri etiketi yok
  })

  it('ÖNCE BUNLAR, SIRADA başlığından önce gelir', () => {
    const metin = m.acilisMetni('ARAC', KARTLAR, ONEK)
    expect(metin.indexOf('ÖNCE BUNLAR')).toBeGreaterThanOrEqual(0)
    expect(metin.indexOf('ÖNCE BUNLAR')).toBeLessThan(metin.indexOf('SIRADA'))
  })

  it('SIRADA: To Do önce, sonra Backlog; her ikisinde öncelik sırası', () => {
    const kartlar = [
      { ...kart('ARC-601', 'Backlog', { labels: ['ops-emri'] }), priority: 'low' },
      { ...kart('ARC-602', 'Backlog', { labels: ['ops-emri'] }), priority: 'critical' },
      { ...kart('ARC-603', 'To Do', { labels: ['ops-emri'] }), priority: 'low' },
    ] as Kart[]
    const sirada = m.grupla(kartlar, 'ARAC', ONEK).sirada.map((k) => k.id)
    expect(sirada).toEqual(['id-ARC-603', 'id-ARC-602', 'id-ARC-601'])
  })

  it('elinde açık iş yok, yalnız sırada kart var: ÖNCE BUNLAR yazılmaz', () => {
    const metin = m.acilisMetni('ARAC', [kart('ARC-5', 'Backlog', { labels: ['ops-emri'] })], ONEK)
    expect(metin).not.toContain('ÖNCE BUNLAR')
    expect(metin).toContain('SIRADA')
  })

  it('Kanban okunamadı (null), kart yok ya da rol boş: sessiz', () => {
    expect(m.acilisMetni('ARAC', null, ONEK)).toBe('')
    expect(m.acilisMetni('ARAC', [], ONEK)).toBe('')
    expect(m.acilisMetni('', KARTLAR, ONEK)).toBe('')
    expect(m.acilisMetni('YETENEK', KARTLAR, ONEK)).toBe('')
  })

  it('çok kart: tavan uygulanır, fazlası "+N kart daha" diye sayılır', () => {
    const cok = Array.from({ length: 10 }, (_, i) => kart(`ARC-${400 + i}`, 'In Progress'))
    const metin = m.acilisMetni('ARAC', cok, ONEK)
    expect((metin.match(/ARC-4\d\d/g) ?? []).length).toBe(6)
    expect(metin).toContain('+4 kart daha')
  })
})

describe('kart başlatma uyarısı', () => {
  it('başka In Progress kart varken yeni kart başlatılırsa UYARI verir, ilk üçünü ve fazlasını yazar', () => {
    const u = m.baslatmaUyarisi('ARC-217', KARTLAR, ONEK)
    expect(u).toContain('ÖNCE ELİNDEKİ İŞ')
    expect(u).toContain('ARC-147')
    expect(u).toContain('önce bitir ya da "beklemede" etiketi')
    expect(u).toContain('3 kartı var') // ARC-147, ARC-148, REC-77 (ARC-155 beklemede)
    expect(u).not.toContain('(+')
  })

  it('üçten fazla kartta ilk üçü yazar, fazlasını sayar', () => {
    const cok = [...Array.from({ length: 5 }, (_, i) => kart(`ARC-${500 + i}`, 'In Progress')), kart('ARC-217', 'Backlog')]
    const u = m.baslatmaUyarisi('ARC-217', cok, ONEK)
    expect(u).toContain('5 kartı var')
    expect(u).toContain('(+2)')
  })

  it('kimlik (uuid) ile de bulunur', () => {
    expect(m.baslatmaUyarisi('id-ARC-217', KARTLAR, ONEK)).toContain('ÖNCE ELİNDEKİ İŞ')
  })

  it('SABOTAJ: beklemede etiketli tek In Progress kart uyarıyı tetiklemez', () => {
    const kartlar = [kart('ARC-155', 'In Progress', { labels: ['beklemede'] }), kart('ARC-217', 'Backlog')]
    expect(m.baslatmaUyarisi('ARC-217', kartlar, ONEK)).toBe('')
    // gevşetilmiş kopya (etiketi yok sayar) uyarı verirdi: kural gerçekten ölçülüyor
    const gevsek = kartlar.filter((k) => k.sutun === 'In Progress')
    expect(gevsek.length).toBe(1)
  })

  it('SABOTAJ: kartın kendisi başkası sayılmaz (zaten In Progress olan kartı yeniden başlatmak uyarmaz)', () => {
    const kartlar = [kart('ARC-217', 'In Progress')]
    expect(m.baslatmaUyarisi('ARC-217', kartlar, ONEK)).toBe('')
  })

  it('blocked durumu beklemede sayılır', () => {
    const kartlar = [kart('ARC-9', 'In Progress', { status: 'blocked' }), kart('ARC-217', 'Backlog')]
    expect(m.beklemede(kartlar[0] as Kart)).toBe(true)
    expect(m.baslatmaUyarisi('ARC-217', kartlar, ONEK)).toBe('')
  })

  it('başka departmanın In Progress kartı uyarmaz', () => {
    const kartlar = [kart('ALT-5', 'In Progress'), kart('ARC-217', 'Backlog')]
    expect(m.baslatmaUyarisi('ARC-217', kartlar, ONEK)).toBe('')
  })

  it('bilinmeyen kart, boş hedef, okunamayan Kanban, çözülemeyen departman: sessiz (fail-open)', () => {
    expect(m.baslatmaUyarisi('ARC-99999', KARTLAR, ONEK)).toBe('')
    expect(m.baslatmaUyarisi('', KARTLAR, ONEK)).toBe('')
    expect(m.baslatmaUyarisi('ARC-217', null, ONEK)).toBe('')
    expect(m.baslatmaUyarisi('REC-78', KARTLAR, ONEK)).toBe('')
  })
})

describe('kanca (PreToolUse)', () => {
  it('yalnız başlatma çağrıları Kanban’a gider', () => {
    expect(kanca.baslatmaMi({ action: 'start_task', taskId: 'x' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'claim_task', taskId: 'x' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'transition_task', lifecycleStage: 'running' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'move_task', targetColumnId: 'in-progress' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'move_task', columnId: 'In Progress' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'move_task', targetColumnId: 'In Progress' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'move_task', targetColumnId: 'review' })).toBe(false)
    expect(kanca.baslatmaMi({ action: 'move_task', targetColumnId: 'done' })).toBe(false)
    expect(kanca.baslatmaMi({ action: 'transition_task', lifecycleStage: 'done' })).toBe(false)
    expect(kanca.baslatmaMi({ action: 'add_note' })).toBe(false)
    expect(kanca.baslatmaMi({})).toBe(false)
  })

  const calistir = (stdin: string) => spawnSync(process.execPath, [KANCA], { input: stdin, encoding: 'utf8', timeout: 20000 })

  it('başlatma olmayan çağrı, yanlış araç ve bozuk girdi: çıkış 0, çıktı yok', () => {
    for (const g of [
      JSON.stringify({ tool_name: 'mcp__wrongstack-kanban__kanban_manage', tool_input: { action: 'add_note', taskId: 'x' } }),
      JSON.stringify({ tool_name: 'Bash', tool_input: { action: 'start_task', taskId: 'x' } }),
      '{bozuk',
      '',
    ]) {
      const r = calistir(g)
      expect(r.status).toBe(0)
      expect(r.stdout).toBe('')
    }
  })

  it('bilinmeyen kart başlatılırken (gerçek Kanban okunur ya da okunamaz) çıkış hep 0', () => {
    const r = calistir(
      JSON.stringify({ tool_name: 'mcp__wrongstack-kanban__kanban_manage', tool_input: { action: 'start_task', taskId: 'yok-boyle-kart' } }),
    )
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })
})
