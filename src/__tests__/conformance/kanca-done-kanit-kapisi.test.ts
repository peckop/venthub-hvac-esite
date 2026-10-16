/**
 * INV-KANCA-DONE-KANIT-1 — kart Done'a taşınırken (kanban move_task / transition_task) kartın son verify_completion
 * raporu `passed` değilse kanca DENY verir; okunamayan kart, zaten Done kart, muaf etiket ve muaf pano geçer (ARC-150).
 *
 * Kanca: .claude/hooks/done-kanit-kapisi.cjs · kural: araç Done kapısını yalnız yönetilen panoda zorlar
 * (docs/audits/skill-yonetilen-pano-deneyi-2026-10-01.md), bu kanca aynı kuralı her panoda uygular.
 * Regresyon: 16 Ekim ölçümü, OPS panosunda Done kartların 10/68'i verify passed raporu taşıyordu.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'done-kanit-kapisi.cjs')

interface Kart {
  pano?: string
  kolon?: string
  verdict?: string | null
  etiketler?: string[]
}
interface Kanca {
  doneIstegiMi: (girdi: Record<string, unknown>) => boolean
  karar: (kart: Kart | null) => { izin: boolean; sebep: string }
  redMetni: (sebep: string) => string
  veritabaniYolu: (ortam?: Record<string, string | undefined>, cwd?: string) => string
}
const k = gerek(KANCA) as Kanca

const ARAC = 'mcp__wrongstack-kanban__kanban_manage'
const istek = (o: Record<string, unknown>) => ({ tool_name: ARAC, tool_input: { action: 'move_task', taskId: 'kart-1', ...o } })

describe('INV-KANCA-DONE-KANIT-1 · Done isteği tanıma', () => {
  it('move_task columnId=done, targetColumnId=done ve transition_task lifecycleStage=done Done isteğidir', () => {
    expect(k.doneIstegiMi(istek({ columnId: 'done' }))).toBe(true)
    expect(k.doneIstegiMi(istek({ targetColumnId: 'Done' }))).toBe(true)
    expect(k.doneIstegiMi(istek({ action: 'transition_task', lifecycleStage: 'done' }))).toBe(true)
  })

  it('başka kolon, başka eylem, başka araç ve kartsız çağrı Done isteği değildir', () => {
    expect(k.doneIstegiMi(istek({ columnId: 'review' }))).toBe(false)
    expect(k.doneIstegiMi(istek({ action: 'update_task', columnId: 'done' }))).toBe(false)
    expect(k.doneIstegiMi({ tool_name: 'Bash', tool_input: { action: 'move_task', taskId: 'x', columnId: 'done' } })).toBe(false)
    expect(k.doneIstegiMi(istek({ columnId: 'done', taskId: '' }))).toBe(false)
    expect(k.doneIstegiMi(null as unknown as Record<string, unknown>)).toBe(false)
  })
})

describe('INV-KANCA-DONE-KANIT-1 · karar', () => {
  it('verify raporu yoksa ya da passed değilse REDDEDER', () => {
    expect(k.karar({ pano: 'VentHub OPS', kolon: 'review', verdict: null, etiketler: [] })).toEqual({ izin: false, sebep: 'verify-yok' })
    expect(k.karar({ pano: 'VentHub OPS', kolon: 'review', verdict: 'failed', etiketler: [] })).toEqual({ izin: false, sebep: 'verify-failed' })
  })

  it('verify passed geçer', () => {
    expect(k.karar({ pano: 'VentHub ARAÇ', kolon: 'review', verdict: 'passed', etiketler: ['ARAC'] }).izin).toBe(true)
  })

  it('fail-open: okunamayan kart, zaten Done kart, muaf etiket ve muaf pano geçer', () => {
    expect(k.karar(null).izin).toBe(true)
    expect(k.karar({ pano: 'VentHub OPS', kolon: 'done', verdict: null, etiketler: [] }).izin).toBe(true)
    expect(k.karar({ pano: 'VentHub OPS', kolon: 'review', verdict: null, etiketler: ['kanit-muaf'] }).izin).toBe(true)
    expect(k.karar({ pano: 'VentHub OPS', kolon: 'review', verdict: null, etiketler: ['Karar-Verildi'] }).izin).toBe(true)
    expect(k.karar({ pano: 'Linear Bekleyenler (taşınan, karar 215)', kolon: 'review', verdict: null, etiketler: [] }).izin).toBe(true)
  })

  it('red metni sebebi ve çalışan yolu söyler (add_check, verify_completion, kanit-muaf)', () => {
    const m = k.redMetni('verify-yok')
    expect(m).toMatch(/verify_completion raporu yok/)
    expect(m).toMatch(/add_check/)
    expect(m).toMatch(/kanit-muaf/)
    expect(k.redMetni('verify-failed')).toMatch(/"failed"/)
  })
})

describe('INV-KANCA-DONE-KANIT-1 · gerçek veritabanıyla uçtan uca', () => {
  let dizin = ''
  let dbYolu = ''

  beforeAll(() => {
    dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'done-kapisi-'))
    dbYolu = path.join(dizin, '_kanban.sqlite')
    const { DatabaseSync } = gerek('node:sqlite') as {
      DatabaseSync: new (p: string) => { exec: (s: string) => void; prepare: (s: string) => { run: (...a: unknown[]) => void }; close: () => void }
    }
    const db = new DatabaseSync(dbYolu)
    db.exec('create table kanban_boards (id text primary key, payload text, revision integer, updated_at text)')
    const pano = (id: string, baslik: string, kartlar: unknown[]) =>
      db.prepare('insert into kanban_boards values (?,?,?,?)').run(id, JSON.stringify({ id, title: baslik, tasks: kartlar }), 1, '2026-10-16')
    pano('p1', 'VentHub TEST', [
      { id: 'kanitsiz', columnId: 'review', labels: [] },
      { id: 'kirmizi', columnId: 'review', labels: [], verificationReport: { verdict: 'failed' } },
      { id: 'yesil', columnId: 'review', labels: [], verificationReport: { verdict: 'passed' } },
      { id: 'muaf', columnId: 'review', labels: ['kanit-muaf'] },
    ])
    db.close()
  })

  afterAll(() => {
    fs.rmSync(dizin, { recursive: true, force: true })
  })

  const calistir = (girdi: unknown, ortam: Record<string, string> = {}) =>
    spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify(girdi),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_KANBAN_DB: dbYolu, ...ortam },
    })

  it('kanıtsız kart Done isteğinde DENY çıktısı verir, çıkış kodu 0', () => {
    const r = calistir(istek({ taskId: 'kanitsiz', columnId: 'done' }))
    expect(r.status).toBe(0)
    const c = JSON.parse(r.stdout)
    expect(c.hookSpecificOutput.hookEventName).toBe('PreToolUse')
    expect(c.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(c.hookSpecificOutput.permissionDecisionReason).toMatch(/verify_completion raporu yok/)
  })

  it('kırmızı raporlu kart de reddedilir', () => {
    const c = JSON.parse(calistir(istek({ taskId: 'kirmizi', columnId: 'done' })).stdout)
    expect(c.hookSpecificOutput.permissionDecisionReason).toMatch(/"failed"/)
  })

  it('passed raporlu kart, muaf kart, bilinmeyen kart ve Done olmayan taşıma sessiz geçer', () => {
    for (const girdi of [
      istek({ taskId: 'yesil', columnId: 'done' }),
      istek({ taskId: 'muaf', columnId: 'done' }),
      istek({ taskId: 'yok-boyle-kart', columnId: 'done' }),
      istek({ taskId: 'kanitsiz', columnId: 'review' }),
    ]) {
      const r = calistir(girdi)
      expect(r.status).toBe(0)
      expect(r.stdout.trim()).toBe('')
    }
  })

  it('vana: VENTHUB_DONE_KAPISI_KAPALI=1 kapıyı kapatır', () => {
    const r = calistir(istek({ taskId: 'kanitsiz', columnId: 'done' }), { VENTHUB_DONE_KAPISI_KAPALI: '1' })
    expect(r.stdout.trim()).toBe('')
  })

  it('fail-open: veritabanı yoksa ya da stdin bozuksa sessiz geçer, çıkış 0', () => {
    const yok = calistir(istek({ taskId: 'kanitsiz', columnId: 'done' }), { VENTHUB_KANBAN_DB: path.join(dizin, 'yok.sqlite') })
    expect(yok.status).toBe(0)
    expect(yok.stdout.trim()).toBe('')
    const bozuk = spawnSync(process.execPath, [KANCA], { input: '{bozuk', encoding: 'utf8', env: { ...process.env, VENTHUB_KANBAN_DB: dbYolu } })
    expect(bozuk.status).toBe(0)
    expect(bozuk.stdout.trim()).toBe('')
  })

  it('veritabaniYolu: ortam ezmesi kazanır; ezme yoksa .wrongstack/kanbans/_kanban.sqlite ile biter', () => {
    expect(k.veritabaniYolu({ VENTHUB_KANBAN_DB: 'ozel.sqlite' })).toBe('ozel.sqlite')
    expect(k.veritabaniYolu({}, KOK).replace(/\\/g, '/')).toMatch(/\.wrongstack\/kanbans\/_kanban\.sqlite$/)
  })
})
