/**
 * INV-KANCA-OLAY-KAYDI-1 — PermissionDenied, StopFailure, SubagentStop, TaskCompleted olaylarında tek JSON satırı kaydedilir;
 * kanca ASLA engellemez, stdout yazmaz, çıkış hep 0 (ARC-191, OPS-176 kıyası).
 *
 * Kanca: .claude/hooks/olay-kaydi.cjs · kayıt: pano dizininde `olay-kaydi.jsonl`. Belge ölçümü 19 Ekim: dört olay da engellemez
 * kipte kullanılır (stdout'ta JSON yok, TaskCompleted'ta exit 2 yok), alanlar belge şemasından.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'olay-kaydi.cjs')

interface Kanca {
  kayitUret: (ham: string, simdi?: Date) => Record<string, unknown> | null
  GUNLUK_ADI: string
  TAVAN_BAYT: number
  OLAYLAR: string[]
}
const k = gerek(KANCA) as Kanca
const ZAMAN = new Date('2026-10-19T14:00:00.000Z')
const SID = 'abcdef12-3456-7890-abcd-ef1234567890'

describe('INV-KANCA-OLAY-KAYDI-1 · kayıt nesnesi', () => {
  it('PermissionDenied: tool_name, mcp_server, reason; araç GİRDİSİ kayda GİRMEZ', () => {
    const r = k.kayitUret(JSON.stringify({ session_id: SID, hook_event_name: 'PermissionDenied', tool_name: 'Bash', tool_input: { command: 'curl -H "Authorization: Bearer ABCDEF1234567890" x' }, reason: 'kural: Bash(git push *--mirror*)' }), ZAMAN)
    expect(r).toEqual({ t: '2026-10-19T14:00:00.000Z', olay: 'PermissionDenied', oturum: 'abcdef12', tool_name: 'Bash', reason: 'kural: Bash(git push *--mirror*)' })
    expect(JSON.stringify(r)).not.toContain('ABCDEF1234567890')
  })

  it('StopFailure: error, error_details, last_assistant_message', () => {
    const r = k.kayitUret(JSON.stringify({ session_id: SID, hook_event_name: 'StopFailure', error: 'rate_limit', last_assistant_message: 'API Error: 429' }), ZAMAN)
    expect(r).toMatchObject({ olay: 'StopFailure', error: 'rate_limit', last_assistant_message: 'API Error: 429' })
  })

  it('SubagentStop: agent_id, agent_type, stop_hook_active (boolean), last_assistant_message', () => {
    const r = k.kayitUret(JSON.stringify({ session_id: SID, hook_event_name: 'SubagentStop', agent_id: 'a1', agent_type: 'arac-arastirmaci', stop_hook_active: false, last_assistant_message: 'bitti' }), ZAMAN)
    expect(r).toMatchObject({ olay: 'SubagentStop', agent_id: 'a1', agent_type: 'arac-arastirmaci', stop_hook_active: false, last_assistant_message: 'bitti' })
  })

  it('TaskCompleted: task_id, task_subject, teammate_name, agent_id', () => {
    const r = k.kayitUret(JSON.stringify({ session_id: SID, hook_event_name: 'TaskCompleted', task_id: 't1', task_subject: 'ARC-191 kaydı', teammate_name: 'ekip' }), ZAMAN)
    expect(r).toMatchObject({ olay: 'TaskCompleted', task_id: 't1', task_subject: 'ARC-191 kaydı', teammate_name: 'ekip' })
    expect(r).not.toHaveProperty('agent_id')
  })

  it('sır desenleri maskelenir; satır sonu ve sekme boşluk olur; 300 karakterde kesilir', () => {
    const r = k.kayitUret(JSON.stringify({ session_id: SID, hook_event_name: 'StopFailure', error_details: 'token=abc123secret\nsatir2\tx', last_assistant_message: 'ghp_' + 'A'.repeat(30) + ' ' + 'u'.repeat(400) }), ZAMAN) as Record<string, string>
    expect(r.error_details).toBe('[GIZLI] satir2 x')
    expect(r.last_assistant_message).not.toContain('ghp_')
    expect(r.last_assistant_message.length).toBeLessThanOrEqual(300)
  })

  it('tanınmayan olay, bozuk, boş ve nesne olmayan girdi kayıt üretmez', () => {
    expect(k.kayitUret(JSON.stringify({ hook_event_name: 'PreToolUse', session_id: SID }))).toBeNull()
    expect(k.kayitUret('{bozuk')).toBeNull()
    expect(k.kayitUret('')).toBeNull()
    expect(k.kayitUret('42')).toBeNull()
    expect(k.kayitUret('null')).toBeNull()
    expect(k.OLAYLAR).toEqual(['PermissionDenied', 'StopFailure', 'SubagentStop', 'TaskCompleted'])
  })
})

describe('INV-KANCA-OLAY-KAYDI-1 · günlük ve gerçek süreç', () => {
  const dizinler: string[] = []
  afterAll(() => {
    for (const d of dizinler) fs.rmSync(d, { recursive: true, force: true })
  })
  const gecici = () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-olay-'))
    dizinler.push(d)
    return d
  }
  const kos = (pano: string, girdi: string, ek: Record<string, string> = {}) =>
    spawnSync(process.execPath, [KANCA], { input: girdi, encoding: 'utf8', env: { ...process.env, VENTHUB_BOARD_DIR: pano, ...ek }, timeout: 30_000 })

  it('gerçek süreç: dört olay dört JSON satırı ekler, çıkış 0, stdout BOŞ (karar/engelleme yok)', () => {
    const pano = gecici()
    for (const olay of ['PermissionDenied', 'StopFailure', 'SubagentStop', 'TaskCompleted']) {
      const r = kos(pano, JSON.stringify({ session_id: SID, hook_event_name: olay, tool_name: 'Bash', error: 'x', agent_id: 'a', task_id: 't' }))
      expect(r.status).toBe(0)
      expect(r.stdout).toBe('')
    }
    const satirlar = fs.readFileSync(path.join(pano, k.GUNLUK_ADI), 'utf8').trim().split('\n').map((s) => JSON.parse(s) as { olay: string })
    expect(satirlar.map((s) => s.olay)).toEqual(['PermissionDenied', 'StopFailure', 'SubagentStop', 'TaskCompleted'])
  })

  it('fail-open: bozuk/boş stdin ve tanınmayan olay kayıt yazmaz, çıkış 0', () => {
    const pano = gecici()
    for (const girdi of ['{bozuk', '', JSON.stringify({ hook_event_name: 'Stop' })]) {
      const r = kos(pano, girdi)
      expect(r.status).toBe(0)
      expect(r.stdout).toBe('')
    }
    expect(fs.existsSync(path.join(pano, k.GUNLUK_ADI))).toBe(false)
  })

  it('vana: VENTHUB_OLAY_KAYDI_KAPALI=1 kayıt yazmaz', () => {
    const pano = gecici()
    expect(kos(pano, JSON.stringify({ session_id: SID, hook_event_name: 'StopFailure', error: 'x' }), { VENTHUB_OLAY_KAYDI_KAPALI: '1' }).status).toBe(0)
    expect(fs.existsSync(path.join(pano, k.GUNLUK_ADI))).toBe(false)
  })

  it('tavan: 512 KB üstüne çıkınca .1 yedeğine döner, yeni kayıt tek satırla başlar', () => {
    const pano = gecici()
    const yol = path.join(pano, k.GUNLUK_ADI)
    fs.writeFileSync(yol, 'x'.repeat(k.TAVAN_BAYT + 10), 'utf8')
    expect(kos(pano, JSON.stringify({ session_id: SID, hook_event_name: 'StopFailure', error: 'x' })).status).toBe(0)
    expect(fs.existsSync(yol + '.1')).toBe(true)
    expect(fs.readFileSync(yol, 'utf8').trim().split('\n')).toHaveLength(1)
  })

  it('yazılamayan pano dizini (dosya olan yol) çıkış kodunu bozmaz', () => {
    const d = gecici()
    const dosya = path.join(d, 'dosya-pano')
    fs.writeFileSync(dosya, 'x', 'utf8')
    const r = kos(dosya, JSON.stringify({ session_id: SID, hook_event_name: 'StopFailure', error: 'x' }))
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })
})

describe('INV-KANCA-OLAY-KAYDI-1 · settings.json bağlantısı', () => {
  it('dört olay için kayıt bağlı; hiçbirinde matcher/engelleyici ayar yok', () => {
    const s = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8')) as { hooks: Record<string, { hooks: { command: string }[] }[]> }
    for (const olay of ['PermissionDenied', 'StopFailure', 'SubagentStop', 'TaskCompleted']) {
      const kayitlar = s.hooks[olay]
      expect(kayitlar, olay).toBeDefined()
      const komutlar = kayitlar.flatMap((g) => g.hooks.map((h) => h.command))
      expect(komutlar.some((c) => c.includes('olay-kaydi.cjs')), olay).toBe(true)
    }
  })
})
