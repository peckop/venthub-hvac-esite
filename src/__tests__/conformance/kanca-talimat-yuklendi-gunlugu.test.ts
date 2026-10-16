/**
 * INV-KANCA-TALIMAT-GUNLUGU-1 — InstructionsLoaded olayında tek satır günlük yazılır; kanca ASLA engellemez (ARC-155, ARC-147 AL6).
 *
 * Kanca: .claude/hooks/talimat-yuklendi-gunlugu.cjs · günlük: pano dizininde `talimat-yuklendi.log`.
 * Regresyon: ARC-147 headless ölçümü, olay alanları file_path / memory_type / load_reason.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'talimat-yuklendi-gunlugu.cjs')

interface Kanca {
  satirUret: (ham: string, simdi?: Date) => string | null
  gunlugeYaz: (satir: string, pano: string) => void
  GUNLUK_ADI: string
  TAVAN_BAYT: number
}
const k = gerek(KANCA) as Kanca

const OLAY = {
  session_id: 'abcdef12-3456-7890-abcd-ef1234567890',
  hook_event_name: 'InstructionsLoaded',
  file_path: 'proje/.claude/rules/filo-ortak.md',
  memory_type: 'Project',
  load_reason: 'session_start',
}

describe('INV-KANCA-TALIMAT-GUNLUGU-1 · satır', () => {
  it('olay alanları tek satırda: zaman, oturum kısa, memory_type, load_reason, file_path', () => {
    const s = k.satirUret(JSON.stringify(OLAY), new Date('2026-10-16T08:00:00.000Z'))
    expect(s).toBe('2026-10-16T08:00:00.000Z abcdef12 Project session_start proje/.claude/rules/filo-ortak.md')
  })

  it('eksik alan "-" olur; satır sonu ve sekme alanda satırı bölemez', () => {
    const s = k.satirUret(JSON.stringify({ session_id: 'x', file_path: 'a\nb\tc' }), new Date('2026-10-16T08:00:00.000Z')) as string
    expect(s.split('\n')).toHaveLength(1)
    expect(s).toBe('2026-10-16T08:00:00.000Z x - - a b c')
  })

  it('bozuk, boş ve nesne olmayan girdi satır üretmez', () => {
    expect(k.satirUret('{bozuk')).toBeNull()
    expect(k.satirUret('')).toBeNull()
    expect(k.satirUret('42')).toBeNull()
    expect(k.satirUret('null')).toBeNull()
  })
})

describe('INV-KANCA-TALIMAT-GUNLUGU-1 · günlük ve gerçek süreç', () => {
  const dizinler: string[] = []
  afterAll(() => {
    for (const d of dizinler) fs.rmSync(d, { recursive: true, force: true })
  })
  const gecici = () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-talimat-'))
    dizinler.push(d)
    return d
  }
  const kos = (pano: string, girdi: string, ek: Record<string, string> = {}) =>
    spawnSync(process.execPath, [KANCA], { input: girdi, encoding: 'utf8', env: { ...process.env, VENTHUB_BOARD_DIR: pano, ...ek }, timeout: 30_000 })

  it('gerçek süreç: iki olay iki satır ekler, çıkış 0, stdout boş', () => {
    const pano = gecici()
    expect(kos(pano, JSON.stringify(OLAY)).status).toBe(0)
    const r = kos(pano, JSON.stringify({ ...OLAY, file_path: 'CLAUDE.md', memory_type: 'Project' }))
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
    const satirlar = fs.readFileSync(path.join(pano, k.GUNLUK_ADI), 'utf8').trim().split('\n')
    expect(satirlar).toHaveLength(2)
    expect(satirlar[0]).toMatch(/ abcdef12 Project session_start proje\/\.claude\/rules\/filo-ortak\.md$/)
    expect(satirlar[1]).toMatch(/CLAUDE\.md$/)
  })

  it('fail-open: bozuk/boş stdin günlük yazmaz, çıkış 0', () => {
    const pano = gecici()
    for (const girdi of ['{bozuk', '']) {
      const r = kos(pano, girdi)
      expect(r.status).toBe(0)
      expect(r.stdout).toBe('')
    }
    expect(fs.existsSync(path.join(pano, k.GUNLUK_ADI))).toBe(false)
  })

  it('vana: VENTHUB_TALIMAT_GUNLUGU_KAPALI=1 günlük yazmaz', () => {
    const pano = gecici()
    expect(kos(pano, JSON.stringify(OLAY), { VENTHUB_TALIMAT_GUNLUGU_KAPALI: '1' }).status).toBe(0)
    expect(fs.existsSync(path.join(pano, k.GUNLUK_ADI))).toBe(false)
  })

  it('tavan: günlük 256 KB üstüne çıkınca .1 yedeğine döner, yeni günlük tek satırla başlar', () => {
    const pano = gecici()
    const yol = path.join(pano, k.GUNLUK_ADI)
    fs.writeFileSync(yol, 'x'.repeat(k.TAVAN_BAYT + 10), 'utf8')
    expect(kos(pano, JSON.stringify(OLAY)).status).toBe(0)
    expect(fs.existsSync(yol + '.1')).toBe(true)
    expect(fs.readFileSync(yol, 'utf8').trim().split('\n')).toHaveLength(1)
  })

  it('yazılamayan pano dizini (dosya olan yol) çıkış kodunu bozmaz', () => {
    const d = gecici()
    const dosya = path.join(d, 'dosya-pano')
    fs.writeFileSync(dosya, 'x', 'utf8')
    const r = kos(dosya, JSON.stringify(OLAY))
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })
})
