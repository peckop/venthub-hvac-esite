// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-BAGLAM-PENCERE-1 · kanca bağlam ölçümünü pencere başına dosyaya da yazar (ARC-33 madde 2).
 *
 * BAĞLAM: ops-kokpit `$.session.usage()` ile bağlamı okuyunca değer donuyordu (kokpit 19, gerçek 27).
 * Gerçek ölçümü kanca zaten her istemde yapıyor; mod oradan okusun diye aynı değer
 * `~/.claude/mod-durum/pencereler/<sid>.json` dosyasına yazılır. Yazım fail-open ve atomiktir.
 */

interface Baglam {
  COMPACT_SONRASI: string
  pencereDosyasiYaz: (
    klasor: string,
    sid: string,
    token: number | string | null,
    pencere: number,
    rol?: string,
    simdi?: Date,
  ) => string | null
}

const KANCA = path.resolve(process.cwd(), '.claude', 'hooks')
const gerek = createRequire(import.meta.url)
const bd = gerek(path.join(KANCA, 'baglam-doluluk.cjs')) as Baglam

const SID = '65844ccb-e970-48ab-a9f2-0e497c6a7ef9'
const SIMDI = new Date('2026-10-04T09:00:00Z')

function gecici(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'baglam-pencere-'))
}

describe('INV-BAGLAM-PENCERE-1 · pencereDosyasiYaz', () => {
  it('ölçülen değeri sid adlı dosyaya yazar: baglamToken, durum, pencere, saat, rol, sid', () => {
    const d = gecici()
    const yol = bd.pencereDosyasiYaz(d, SID, 272_000, 1_000_000, 'arac', SIMDI)
    expect(yol).toBe(path.join(d, SID + '.json'))
    const k = JSON.parse(fs.readFileSync(yol ?? '', 'utf8')) as Record<string, unknown>
    expect(k).toEqual({
      sid: SID,
      baglamToken: 272_000,
      durum: 'olculdu',
      pencere: 1_000_000,
      saat: '2026-10-04T09:00:00.000Z',
      rol: 'ARAC',
    })
  })

  it('compact sonrası ilk mesajda baglamToken null, durum compact-sonrasi (eski değer kalmaz)', () => {
    const d = gecici()
    bd.pencereDosyasiYaz(d, SID, 272_000, 1_000_000, undefined, SIMDI)
    bd.pencereDosyasiYaz(d, SID, bd.COMPACT_SONRASI, 1_000_000, undefined, SIMDI)
    const k = JSON.parse(fs.readFileSync(path.join(d, SID + '.json'), 'utf8')) as Record<string, unknown>
    expect(k.baglamToken).toBeNull()
    expect(k.durum).toBe('compact-sonrasi')
    expect(k.rol).toBeNull()
  })

  it('ölçüm yoksa (null) ya da sid UUID değilse hiçbir şey yazmaz; yol enjeksiyonu kapalı', () => {
    const d = gecici()
    expect(bd.pencereDosyasiYaz(d, SID, null, 1_000_000)).toBeNull()
    expect(bd.pencereDosyasiYaz(d, 'test', 100, 1_000_000)).toBeNull()
    expect(bd.pencereDosyasiYaz(d, '../../etc/passwd', 100, 1_000_000)).toBeNull()
    expect(fs.readdirSync(d)).toEqual([])
  })

  it('atomik: geçici dosya geride kalmaz; ikinci yazım ilkinin üstüne yazar', () => {
    const d = gecici()
    bd.pencereDosyasiYaz(d, SID, 100_000, 1_000_000, undefined, SIMDI)
    bd.pencereDosyasiYaz(d, SID, 130_000, 1_000_000, undefined, SIMDI)
    expect(fs.readdirSync(d)).toEqual([SID + '.json'])
    const k = JSON.parse(fs.readFileSync(path.join(d, SID + '.json'), 'utf8')) as { baglamToken: number }
    expect(k.baglamToken).toBe(130_000)
  })

  it('fail-open: klasör yerine dosya varsa istisna fırlatmaz, null döner', () => {
    const d = gecici()
    const engel = path.join(d, 'pencereler')
    fs.writeFileSync(engel, 'dosya')
    expect(bd.pencereDosyasiYaz(engel, SID, 100, 1_000_000)).toBeNull()
  })
})

describe('INV-BAGLAM-PENCERE-2 · kanca uçtan uca', () => {
  it('UUID sid ile koşan kanca satırı basar VE pencere dosyasına aynı değeri yazar', () => {
    const d = gecici()
    const kayit = path.join(d, 'kayit.jsonl')
    const satir = {
      type: 'assistant',
      isSidechain: false,
      message: { usage: { input_tokens: 10, cache_creation_input_tokens: 0, cache_read_input_tokens: 271_990 } },
    }
    fs.writeFileSync(kayit, JSON.stringify(satir) + '\n')
    const pencereler = path.join(d, 'pencereler')
    const r = spawnSync(process.execPath, [path.join(KANCA, 'defter-tazelik-satiri.cjs')], {
      input: JSON.stringify({ session_id: SID, transcript_path: kayit }),
      encoding: 'utf8',
      env: {
        ...process.env,
        VENTHUB_BOARD_DIR: d,
        VH_PENCERE_KLASORU: pencereler,
        CLAUDE_CODE_AUTO_COMPACT_WINDOW: '',
        CC_LANE: 'arac',
      },
      timeout: 30_000,
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toMatch(/BAGLAM: 272k\/1M/)
    const k = JSON.parse(fs.readFileSync(path.join(pencereler, SID + '.json'), 'utf8')) as {
      baglamToken: number
      rol: string
    }
    expect(k.baglamToken).toBe(272_000)
    expect(k.rol).toBe('ARAC')
  })
})
