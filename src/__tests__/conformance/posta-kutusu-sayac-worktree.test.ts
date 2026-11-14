import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-POSTA-SAYAC-1 (ARC-308): açılış sayacı worktree'de de ölçer.
 * 14 Kasım ÖLÇÜLDÜ: worktree'de tools/wrongstack-mcp/node_modules yoktu (kurulum ana ağaçta); sayaç orada olmayan cli.js'i
 * başlatıp "sunucu cevapsiz kapandi" diyordu — her pencere açılışında "posta kutusu ÖLÇÜLEMEDİ" satırı (WrongStack sürümüyle ilgisiz).
 * Hermetik: sahte kök + sahte ana ağaç + sahte mailbox cli'si (el sıkışmayı taklit eder).
 */
const KOK = path.resolve(__dirname, '../../..')
const SAYAC = path.join(KOK, 'scripts/hijyen/posta-kutusu-sayac.cjs')
const SID = '11111111-2222-4333-8444-555555555555'
const CLI_KAYNAK = `
let t = ''
process.stdin.on('data', (d) => {
  t += d
  let i
  while ((i = t.indexOf('\\n')) >= 0) {
    const m = JSON.parse(t.slice(0, i)); t = t.slice(i + 1)
    if (m.id === 1) process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: 1, result: {} }) + '\\n')
    if (m.id === 2) process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: 2, result: { content: [{ text: JSON.stringify({ unread: 2 }) }] } }) + '\\n')
  }
})
`

let gecici = ''
let kok = ''
let ana = ''

function kurKok(dizin: string, anaDizin: string) {
  fs.mkdirSync(path.join(dizin, 'tools/wrongstack-mcp'), { recursive: true })
  fs.writeFileSync(
    path.join(dizin, 'tools/wrongstack-mcp/posta-kutusu.cjs'),
    `exports.kanonikKok = () => ${JSON.stringify(anaDizin)}\n`,
  )
}

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'posta-sayac-'))
  kok = path.join(gecici, 'worktree')
  ana = path.join(gecici, 'ana')
  kurKok(kok, ana)
  kurKok(ana, ana)
})

afterAll(() => {
  fs.rmSync(gecici, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
})

const sayac = () =>
  createRequire(import.meta.url)(SAYAC) as {
    okunmamis: (sid: string, o: { kok: string; zamanAsimiMs?: number }) => Promise<{ durum: string; n?: number; sebep?: string }>
  }

describe('INV-POSTA-SAYAC-1 · açılış sayacı worktree kökünde', () => {
  it('cli yalnız ana ağaçta: worktree kökünden de sayar (eskiden "sunucu cevapsiz kapandi")', async () => {
    const cli = path.join(ana, 'tools/wrongstack-mcp/node_modules/@wrongstack/mailbox-mcp/dist/cli.js')
    fs.mkdirSync(path.dirname(cli), { recursive: true })
    fs.writeFileSync(cli, CLI_KAYNAK)
    const r = await sayac().okunmamis(SID, { kok, zamanAsimiMs: 8000 })
    expect(r, JSON.stringify(r)).toEqual({ durum: 'sayildi', n: 2 })
  })

  it('cli hiçbir yerde yok: nedeni dürüstçe söyler (sunucu başlatmaz, "cevapsiz kapandi" demez)', async () => {
    const bos = fs.mkdtempSync(path.join(gecici, 'bos-'))
    kurKok(bos, bos)
    const r = await sayac().okunmamis(SID, { kok: bos })
    expect(r.durum).toBe('olculemedi')
    expect(r.sebep).toMatch(/kurulu degil/)
  })
})
