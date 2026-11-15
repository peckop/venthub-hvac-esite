/**
 * INV-KANCA-SAYAC-1 — ortak kanca sayacı (ARC-323, OPS-292 Adım 2): dökümde izi kalmayan kancalar tek biçimli satır bırakır.
 *
 * Kanca yardımcısı: .claude/hooks/kanca-sayac.cjs · kayıt: pano dizininde `kanca-sayac.jsonl` (zaman, sid, kanca, karar).
 * Sayaç davranışı DEĞİŞTİRMEZ: hata fırlatmaz, stdout/stderr yazmaz, komut ya da araç girdisi yazmaz.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const HOOKS = path.join(KOK, '.claude', 'hooks')
const SAYAC = path.join(HOOKS, 'kanca-sayac.cjs')

interface Sayac {
  say: (kanca: string, karar: string, sid?: string, pano?: string) => boolean
  kayitUret: (kanca: unknown, karar: unknown, sid?: unknown, simdi?: Date) => Record<string, unknown> | null
  GUNLUK_ADI: string
  TAVAN_BAYT: number
  KARARLAR: string[]
}
const s = gerek(SAYAC) as Sayac

const gecici: string[] = []
function yeniPano(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'kanca-sayac-'))
  gecici.push(d)
  return d
}
afterAll(() => {
  for (const d of gecici) fs.rmSync(d, { recursive: true, force: true })
})

describe('INV-KANCA-SAYAC-1 · kayıt biçimi', () => {
  it('satır şeması: t, sid (ilk 8), kanca, karar; başka alan YOK', () => {
    const r = s.kayitUret('silme-baglanti-kapisi', 'deny', 'abcdef12-3456-7890-abcd-ef1234567890', new Date('2026-11-15T20:00:00.000Z'))
    expect(r).toEqual({ t: '2026-11-15T20:00:00.000Z', sid: 'abcdef12', kanca: 'silme-baglanti-kapisi', karar: 'deny' })
  })

  it('sid yoksa "-"; sid özel karakter taşırsa temizlenir', () => {
    expect(s.kayitUret('kod-dizini-tazelik', 'kosu')).toMatchObject({ sid: '-' })
    expect(s.kayitUret('kod-dizini-tazelik', 'kosu', '../../x;rm')?.sid).toBe('xrm')
  })

  it('kapalı sözlük: bilinmeyen karar ya da bozuk kanca adı null', () => {
    expect(s.kayitUret('kod-dizini-tazelik', 'belki')).toBeNull()
    expect(s.kayitUret('Kod Dizini', 'kosu')).toBeNull()
    expect(s.kayitUret('../x', 'kosu')).toBeNull()
    expect(s.kayitUret(undefined, 'kosu')).toBeNull()
  })
})

describe('INV-KANCA-SAYAC-1 · yazım', () => {
  it('satırı ekler; ikinci çağrı ikinci satır', () => {
    const pano = yeniPano()
    expect(s.say('board-release', 'birak', 'abcdef12-0000', pano)).toBe(true)
    expect(s.say('board-release', 'birak', 'abcdef12-0000', pano)).toBe(true)
    const satirlar = fs.readFileSync(path.join(pano, s.GUNLUK_ADI), 'utf8').trim().split('\n')
    expect(satirlar).toHaveLength(2)
    expect(JSON.parse(satirlar[0])).toMatchObject({ kanca: 'board-release', karar: 'birak', sid: 'abcdef12' })
  })

  it('yazılamayan dizinde hata fırlatmaz, false döner', () => {
    const pano = yeniPano()
    const dosya = path.join(pano, 'dosya')
    fs.writeFileSync(dosya, 'x')
    // pano yolu bir DOSYA: mkdir/append başarısız olur
    expect(() => s.say('board-release', 'birak', 'a', path.join(dosya, 'alt'))).not.toThrow()
    expect(s.say('board-release', 'birak', 'a', path.join(dosya, 'alt'))).toBe(false)
  })

  it('bozuk girdide yazmaz (kanca adı ya da karar geçersiz)', () => {
    const pano = yeniPano()
    expect(s.say('KOTU AD', 'kosu', 'a', pano)).toBe(false)
    expect(s.say('board-release', 'x', 'a', pano)).toBe(false)
    expect(fs.existsSync(path.join(pano, s.GUNLUK_ADI))).toBe(false)
  })

  it('tavan aşılınca .1 yedeğine döner (tek nesil)', () => {
    const pano = yeniPano()
    const yol = path.join(pano, s.GUNLUK_ADI)
    fs.writeFileSync(yol, 'x'.repeat(s.TAVAN_BAYT + 10))
    s.say('board-release', 'birak', 'a', pano)
    expect(fs.existsSync(yol + '.1')).toBe(true)
    expect(fs.readFileSync(yol, 'utf8').trim().split('\n')).toHaveLength(1)
  })

  it('vana ve test koşusu: pano verilmezse yazmaz (VITEST), vana açıkken de yazmaz', () => {
    const r = spawnSync(
      process.execPath,
      [
        '-e',
        `const s=require(${JSON.stringify(SAYAC)});process.stdout.write(String(s.say('board-release','birak','a')))`,
      ],
      { env: { ...process.env, VITEST: '1', VENTHUB_BOARD_DIR: yeniPano() }, encoding: 'utf8' },
    )
    expect(r.stdout).toBe('false')
    expect(r.stderr).toBe('')
  })

  it('süreç çıktısı: sayaç stdout ve stderr yazmaz, çıkış 0', () => {
    const pano = yeniPano()
    const r = spawnSync(
      process.execPath,
      ['-e', `require(${JSON.stringify(SAYAC)}).say('board-release','birak','a',${JSON.stringify(pano)})`],
      { encoding: 'utf8' },
    )
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
    expect(r.stderr).toBe('')
  })
})

const BAGLI = [
  'hafiza-indeks-bekcisi',
  'silme-baglanti-kapisi',
  'sql-yazma-kapisi',
  'pencere-kilidi-kapisi',
  'kod-dizini-tazelik',
  'board-release',
  'accumulate-edits',
  'duzenleme-ani-lint',
  'agir-komut-kilidi',
  'kanban-tutarlilik-onarimi',
  'precompact-durum-kapisi',
  'son-konusma-dokumu',
]

describe('INV-KANCA-SAYAC-1 · bağlantı', () => {
  it.each(BAGLI)('%s sayacı kendi adıyla çağırır', (ad) => {
    const kaynak = fs.readFileSync(path.join(HOOKS, ad + '.cjs'), 'utf8')
    expect(kaynak).toContain("require('./kanca-sayac.cjs').say('" + ad + "'")
  })
})
