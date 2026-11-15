import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/** INV-KANCA-ONEK-1 (ARC-102 kapı 3): aynı panoda aynı başlık önekiyle ikinci add_task reddedilir; diğer her durumda açılır. */
const KANCA = path.resolve(__dirname, '../../../.claude/hooks/kart-onek-tekrari.cjs')
const { onek, karar } = createRequire(import.meta.url)(KANCA) as {
  onek: (b: string) => string | null
  karar: (g: unknown, k: unknown[]) => string | null
}

const kartlar = [{ title: 'ALT-75 · eski kart' }, { title: 'ARC-9 · başka' }]

describe('INV-KANCA-ONEK-1 · tekrarlı kart numarası', () => {
  it('önek ayrıştırma: numara yoksa null; büyük/küçük harf aynı; ALT-7 ile ALT-75 farklı', () => {
    expect(onek('ALT-75 · ad')).toBe('ALT-75')
    expect(onek('alt-75: ad')).toBe('ALT-75')
    expect(onek('Numarasız başlık')).toBeNull()
    expect(onek('ALT-7 · ad')).toBe('ALT-7')
  })

  it('aynı önek → ret; SABOTAJ kolları: farklı önek, numarasız başlık, başka eylem, kart listesi boş → izin', () => {
    expect(karar({ action: 'add_task', title: 'ALT-75 · yeni kopya' }, kartlar)).toContain('ALT-75')
    expect(karar({ action: 'add_task', title: 'ALT-76 · yeni' }, kartlar)).toBeNull()
    expect(karar({ action: 'add_task', title: 'ALT-7 · yeni' }, kartlar)).toBeNull()
    expect(karar({ action: 'add_task', title: 'Numarasız' }, kartlar)).toBeNull()
    expect(karar({ action: 'update_task', title: 'ALT-75 · ad' }, kartlar)).toBeNull()
    expect(karar({ action: 'add_task', title: 'ALT-75 · ad' }, [])).toBeNull()
  })

  it('vana: VENTHUB_ONEK_TEKRARI_KAPAT=1 iken kanca hiçbir şey basmaz; okuma düşerse (pano yok) fail-open', () => {
    const girdi = JSON.stringify({ tool_name: 'mcp__wrongstack-kanban__kanban_manage', tool_input: { action: 'add_task', boardId: 'yok-pano', title: 'ALT-75 · ad' } })
    const kos = (env: Record<string, string>) => spawnSync('node', [KANCA], { input: girdi, encoding: 'utf8', env: { ...process.env, ...env }, timeout: 20_000 })
    expect(kos({ VENTHUB_ONEK_TEKRARI_KAPAT: '1' }).stdout).toBe('')
    const r = kos({})
    expect(r.status).toBe(0)
    expect(r.stdout).not.toContain('deny')
  })
})
