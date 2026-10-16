/**
 * INV-KANCA-HIJYEN-KISMA-1 — sage hijyen oturum sonu kancası son koşumdan beri 6 saat geçmediyse hijyeni ATLAR (ARC-152).
 *
 * Kanca: .claude/hooks/sage-hijyen-oturum-sonu.cjs · damga: pano dizininde `hijyen-son-kosum.txt` (epoch ms).
 * Regresyon: OPS ölçümü, 38 hijyen koşusunun 11'i 5 sn üstü, en uzun 60 sn; ARAÇ ölçümü: 384 kayıt incelendi, 0 değişiklik.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'sage-hijyen-oturum-sonu.cjs')

interface Kanca {
  kismaKarari: (son: number, simdi: number, aralik?: number) => { kos: boolean; sebep: string }
  KISMA_ARALIK_MS: number
  DAMGA_ADI: string
}
const k = gerek(KANCA) as Kanca
const SAAT = 60 * 60 * 1000

describe('INV-KANCA-HIJYEN-KISMA-1 · karar', () => {
  it('aralık 6 saattir', () => {
    expect(k.KISMA_ARALIK_MS).toBe(6 * SAAT)
  })

  it('son koşum 6 saatten yeniyse ATLAR (kisma)', () => {
    const simdi = Date.now()
    expect(k.kismaKarari(simdi - 1 * SAAT, simdi)).toEqual({ kos: false, sebep: 'kisma' })
    expect(k.kismaKarari(simdi - (6 * SAAT - 1), simdi)).toEqual({ kos: false, sebep: 'kisma' })
  })

  it('aralık dolduysa KOŞAR', () => {
    const simdi = Date.now()
    expect(k.kismaKarari(simdi - 6 * SAAT, simdi)).toEqual({ kos: true, sebep: 'aralik-doldu' })
    expect(k.kismaKarari(simdi - 30 * SAAT, simdi).kos).toBe(true)
  })

  it('fail-open: damga yok, bozuk ya da gelecekte ise KOŞAR (hijyen kaybolmaz)', () => {
    const simdi = Date.now()
    expect(k.kismaKarari(Number.NaN, simdi)).toEqual({ kos: true, sebep: 'damga-yok' })
    expect(k.kismaKarari(simdi + SAAT, simdi)).toEqual({ kos: true, sebep: 'damga-gelecekte' })
  })
})

describe('INV-KANCA-HIJYEN-KISMA-1 · gerçek süreç', () => {
  const dizinler: string[] = []
  afterAll(() => {
    for (const d of dizinler) fs.rmSync(d, { recursive: true, force: true })
  })

  const gecici = (ad: string) => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), `vh-hijyen-kisma-${ad}-`))
    dizinler.push(d)
    return d
  }

  /** Kancayı izole pano/yedek/proje dizinleriyle koşar; damga yolunu ve koşum çıktısını döner. */
  function kos(damga: number | null) {
    const pano = gecici('pano')
    const yol = path.join(pano, k.DAMGA_ADI)
    if (damga !== null) fs.writeFileSync(yol, String(damga), 'utf8')
    const r = spawnSync(process.execPath, [KANCA], {
      input: '{}',
      encoding: 'utf8',
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: gecici('kok'),
        VENTHUB_BOARD_DIR: pano,
        VENTHUB_SAGE_YEDEK_DIZINI: gecici('yedek'),
      },
      timeout: 60_000,
    })
    return { r, yol, damgaOku: () => (fs.existsSync(yol) ? Number(fs.readFileSync(yol, 'utf8')) : null) }
  }

  it('taze damga (1 saat önce): ATLAR; damga DEĞİŞMEZ, çıkış 0, stdout boş', () => {
    const once = Date.now() - 1 * SAAT
    const s = kos(once)
    expect(s.r.status).toBe(0)
    expect(s.r.stdout).toBe('')
    expect(s.damgaOku()).toBe(once)
  })

  it('eski damga (7 saat önce): KOŞAR; damga yenilenir', () => {
    const once = Date.now() - 7 * SAAT
    const s = kos(once)
    expect(s.r.status).toBe(0)
    expect(s.damgaOku()).toBeGreaterThan(once + 6 * SAAT)
  })

  it('damga yok: KOŞAR ve damga yazılır', () => {
    const baslangic = Date.now()
    const s = kos(null)
    expect(s.r.status).toBe(0)
    expect(s.damgaOku()).toBeGreaterThanOrEqual(baslangic)
  })

  it('bozuk damga içeriği: KOŞAR (fail-open), çıkış 0', () => {
    const pano = gecici('pano-bozuk')
    fs.writeFileSync(path.join(pano, k.DAMGA_ADI), 'bozuk-icerik', 'utf8')
    const r = spawnSync(process.execPath, [KANCA], {
      input: '{}',
      encoding: 'utf8',
      env: { ...process.env, CLAUDE_PROJECT_DIR: gecici('kok'), VENTHUB_BOARD_DIR: pano, VENTHUB_SAGE_YEDEK_DIZINI: gecici('yedek') },
      timeout: 60_000,
    })
    expect(r.status).toBe(0)
    expect(Number(fs.readFileSync(path.join(pano, k.DAMGA_ADI), 'utf8'))).toBeGreaterThan(0)
  })
})
