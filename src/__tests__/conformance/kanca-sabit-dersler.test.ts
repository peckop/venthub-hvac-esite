import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-SABIT-DERS-1 · sabit davranış dersleri ve temiz ders sorgusu (ARC-201, HRT-68).
 *
 * Ölçülmüş kusur: kayıtların %44,5'i dosya kancasının hiç gösteremeyeceği kayıtlardı (çapasız ya da
 * yalnız agent/komut/sembol çapalı) ve konu kancası 399 istemin 182'sinde hiç ders döndürmedi; sorgu
 * çoğu kez sistem zarfı başlıklarından kuruluyordu. İki söz kilitlenir:
 *  (1) açılışta en çok 5 çapasız, yüksek önemli DAVRANIŞ dersi sabit görünür; uzun ders KIRPILMAZ, bütün atlanır;
 *  (2) ders sorgusu sistem zarfından değil, emrin / Recep'in metninden kurulur.
 *
 * Canlı sage.db'ye dokunulmaz: fikstür veritabanı (VENTHUB_SAGE_DB_KOKU).
 */

const req = createRequire(import.meta.url)
const SABIT = req(path.resolve(__dirname, '../../../scripts/hijyen/sabit-dersler.cjs')) as {
  sec: (s: unknown[]) => { secilen: { id: string; kind: string; metin: string }[]; atlanan: number }
  metinYap: (s: { secilen: { kind: string; metin: string }[]; atlanan: number }) => string
  TEK_DERS_KARAKTER: number
}
const ENJEKSIYON = req(path.resolve(__dirname, '../../../scripts/hijyen/hafiza-enjeksiyonu.cjs')) as {
  sorguMetni: (i: unknown) => string
}
const KANCA = path.resolve(__dirname, '../../../.claude/hooks/sabit-dersler.cjs')

const satir = (id: string, kind: string, imp: number, text: string, anchors: unknown[] = [], guncel = '2026-10-19T10:00:00Z') => ({
  id,
  kind,
  importance: imp,
  updated_at: guncel,
  data: JSON.stringify({ text, anchors }),
})

describe('INV-KANCA-SABIT-DERS-1 · seçim', () => {
  it('çapalı, düşük önemli ve davranış olmayan türler (fact, bug_root_cause) seçilmez', () => {
    const s = SABIT.sec([
      satir('a', 'anti_pattern', 0.9, 'Davranış dersi bir'),
      satir('b', 'anti_pattern', 0.9, 'Çapalı ders', [{ type: 'file', path: 'x.ts' }]),
      satir('c', 'anti_pattern', 0.7, 'Düşük önemli'),
      satir('d', 'fact', 1, 'Olgu kaydı'),
      satir('e', 'bug_root_cause', 1, 'Kök sebep kaydı'),
    ])
    expect(s.secilen.map((x) => x.id)).toEqual(['a'])
  })

  it('en çok 5 ders; sıra önem azalan, eşitse güncel olan önce', () => {
    const girdi = Array.from({ length: 8 }, (_, i) => satir('k' + i, 'convention', 0.8 + (i % 2) * 0.1, 'ders ' + i, [], `2026-10-1${i}T00:00:00Z`))
    const s = SABIT.sec(girdi)
    expect(s.secilen).toHaveLength(5)
    const imp = s.secilen.map((x) => Number(girdi.find((g) => g.id === x.id)!.importance))
    expect(imp).toEqual([...imp].sort((a, b) => b - a))
  })

  it('uzun ders KIRPILMAZ: bütün atlanır ve atlandığı yazılır', () => {
    const uzun = 'x'.repeat(SABIT.TEK_DERS_KARAKTER + 1)
    const s = SABIT.sec([satir('u', 'warning', 0.9, uzun), satir('k', 'warning', 0.8, 'kısa ders')])
    expect(s.secilen.map((x) => x.id)).toEqual(['k'])
    expect(s.atlanan).toBe(1)
    const metin = SABIT.metinYap(s)
    expect(metin).not.toContain('xxxx')
    expect(metin).toContain('1 ders çok uzun')
  })

  it('bozuk veri ders seçimini engellemez; hiç aday yoksa çıktı boştur', () => {
    const s = SABIT.sec([{ id: 'z', kind: 'warning', importance: 0.9, updated_at: '', data: '{bozuk' }])
    expect(s.secilen).toEqual([])
    expect(SABIT.metinYap(s)).toBe('')
  })
})

describe('INV-KANCA-SABIT-DERS-1 · ders sorgusu zarftan değil metinden', () => {
  const sm = ENJEKSIYON.sorguMetni
  it('düz Recep istemi aynen döner', () => {
    expect(sm('devam et, kart numarasını söyle')).toBe('devam et, kart numarasını söyle')
  })
  it('task-notification / ci-monitor-event / side-sessions-event sistem bildirimidir: sorgu YOK', () => {
    expect(sm('<task-notification><task-id>abc</task-id></task-notification>')).toBe('')
    expect(sm('<ci-monitor-event>pr 12 failed</ci-monitor-event>')).toBe('')
    expect(sm('<side-sessions-event>bitti</side-sessions-event>')).toBe('')
  })
  it('cross-session-message: etiket, from= ve local_ kimlikleri atılır, yalnız emir gövdesi kalır', () => {
    const t = sm('<cross-session-message from="local_54395ed4-0dfc-4b5d-9c92-bc0e2670d00f" name="OPS">\nOPS → ARAÇ: worktree silme kapısı ekle\n</cross-session-message>')
    expect(t).toContain('worktree silme kapısı')
    expect(t).not.toContain('local_')
    expect(t).not.toContain('cross-session-message')
  })
  it('system-reminder blokları atılır; yalnız onlardan oluşan istem sorgu üretmez', () => {
    expect(sm('<system-reminder>harness notu uzun uzun</system-reminder>\nkartı kapat')).toBe('kartı kapat')
    expect(sm('<system-reminder>yalnız harness</system-reminder>')).toBe('')
  })
  it('string olmayan girdi çökertmez', () => {
    expect(sm(undefined)).toBe('')
    expect(sm(42)).toBe('')
  })
})

function sahteSage(satirlar: ReturnType<typeof satir>[]): string {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sabit-ders-'))
  fs.mkdirSync(path.join(kok, '.wrongstack', 'memories'), { recursive: true })
  const yol = path.join(kok, '.wrongstack', 'memories', 'sage.db')
  const kod = `
    process.removeAllListeners('warning'); process.on('warning', () => {});
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(process.argv[1]);
    db.exec("create table memories (id text primary key, status text, kind text, importance real, updated_at text, data text)");
    const ins = db.prepare("insert into memories (id, status, kind, importance, updated_at, data) values (?, 'active', ?, ?, ?, ?)");
    JSON.parse(process.argv[2]).forEach((k) => ins.run(k.id, k.kind, k.importance, k.updated_at, k.data));
    db.close();
  `
  const r = spawnSync(process.execPath, ['-e', kod, yol, JSON.stringify(satirlar)], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error('fikstür kurulamadı: ' + r.stderr)
  return kok
}

function kos(env: Record<string, string>) {
  return spawnSync(process.execPath, [KANCA], { encoding: 'utf8', env: { ...process.env, ...env }, input: '{}' })
}

describe('INV-KANCA-SABIT-DERS-1 · kanca davranışı', () => {
  it('SessionStart additionalContext üretir, çıkış 0', () => {
    const kok = sahteSage([satir('a', 'anti_pattern', 0.9, 'Tamamına bak, ilk bölümle yetinme')])
    const r = kos({ VENTHUB_SAGE_DB_KOKU: kok })
    fs.rmSync(kok, { recursive: true, force: true })
    expect(r.status).toBe(0)
    const j = JSON.parse(r.stdout)
    expect(j.hookSpecificOutput.hookEventName).toBe('SessionStart')
    expect(j.hookSpecificOutput.additionalContext).toContain('SABİT DERSLER')
    expect(j.hookSpecificOutput.additionalContext).toContain('Tamamına bak')
  })

  it('veritabanı yoksa / bozuksa sessiz çıkar ve bloklamaz', () => {
    const yok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sabit-yok-'))
    const r1 = kos({ VENTHUB_SAGE_DB_KOKU: yok })
    fs.mkdirSync(path.join(yok, '.wrongstack', 'memories'), { recursive: true })
    fs.writeFileSync(path.join(yok, '.wrongstack', 'memories', 'sage.db'), 'sqlite degil')
    const r2 = kos({ VENTHUB_SAGE_DB_KOKU: yok })
    fs.rmSync(yok, { recursive: true, force: true })
    expect([r1.status, r1.stdout]).toEqual([0, ''])
    expect([r2.status, r2.stdout]).toEqual([0, ''])
  })

  it('vana: VENTHUB_SABIT_DERSLER_KAPALI=1 ise hiçbir şey yazmaz', () => {
    const r = kos({ VENTHUB_SABIT_DERSLER_KAPALI: '1' })
    expect([r.status, r.stdout]).toEqual([0, ''])
  })

  it('salt okur: kaynak yazma ifadesi içermez', () => {
    const kaynak = fs.readFileSync(path.resolve(__dirname, '../../../scripts/hijyen/sabit-dersler.cjs'), 'utf8')
    expect(kaynak).not.toMatch(/\b(insert|update|delete|drop|alter)\s/i)
    expect(kaynak).toContain('readOnly: true')
  })
})
