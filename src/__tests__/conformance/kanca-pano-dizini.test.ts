import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-PANO-DIZINI-1 · kancalar ve pano betikleri yedek pano yolunu sabit Windows yolu olarak YAZMAZ (ARC-252).
 *
 * NİÇİN: `'C:/tmp/venthub-board'` Linux'ta mutlak değil, çalışma klasörüne göre GÖRELİ yoldur; bulut oturumlarında (Linux)
 * kancalar depo içine "C:" adlı klasör açıyordu (en az 5 bulut oturumu). Ortak yardımcı Windows'ta aynı yolu verir,
 * diğer platformlarda os.tmpdir() altını verir.
 * Sabotaj kolu: sabit yol bir kancaya geri konursa statik tarama kırmızı verir; yardımcı Windows yolunu bozarsa ilk test kırar.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const yardimci = require_(path.join(KOK, 'scripts', 'board', 'pano-dizini.cjs')) as {
  panoDizini: (env?: Record<string, string | undefined>, platform?: string, tmp?: string) => string
  varsayilanPano: (platform?: string, tmp?: string) => string
  WINDOWS_VARSAYILAN: string
}

/** Satır içi sabit sürücü harfli pano yolu (yorum satırları sayılmaz). */
const SABIT_PANO = /['"`][A-Za-z]:[\\/]+tmp[\\/]+venthub-board['"`]|path\.join\(\s*['"][A-Za-z]:['"]/
function sabitPanoSatirlari(metin: string): string[] {
  return metin.split(/\r?\n/).filter((s) => !/^\s*(\/\/|\*|\/\*)/.test(s) && SABIT_PANO.test(s))
}

function betikler(klasor: string): string[] {
  return fs
    .readdirSync(path.join(KOK, klasor))
    .filter((a) => /\.(cjs|mjs|js)$/.test(a) && !/\.test\./.test(a))
    .map((a) => path.join(klasor, a))
}

describe('INV-PANO-DIZINI-1 · pano dizini varsayılanı', () => {
  it('Windows davranışı DEĞİŞMEZ: C:/tmp/venthub-board', () => {
    expect(yardimci.varsayilanPano('win32')).toBe('C:/tmp/venthub-board')
    expect(yardimci.panoDizini({}, 'win32')).toBe('C:/tmp/venthub-board')
  })

  it('Linux/macOS (bulut): os.tmpdir() altı, sürücü harfi yok, depo içi göreli yol değil', () => {
    for (const platform of ['linux', 'darwin']) {
      const tmp = os.tmpdir()
      const yol = yardimci.varsayilanPano(platform, tmp)
      expect(yol.startsWith(tmp), `${platform}: ${yol}`).toBe(true)
      expect(path.isAbsolute(yol), `${platform}: mutlak olmalı`).toBe(true)
      expect(yol, 'Windows sabitine düşmemeli').not.toBe('C:/tmp/venthub-board')
      expect(yol.endsWith('venthub-board')).toBe(true)
    }
  })

  it('ortam değişkeni her zaman önceliklidir (VENTHUB_BOARD_DIR, eski ad VENTHUB_PANO_DIR)', () => {
    expect(yardimci.panoDizini({ VENTHUB_BOARD_DIR: '/a', VENTHUB_PANO_DIR: '/b' }, 'linux')).toBe('/a')
    expect(yardimci.panoDizini({ VENTHUB_PANO_DIR: '/b' }, 'linux')).toBe('/b')
  })
})

describe('INV-PANO-DIZINI-1 · sabit yol geri gelemez (statik tarama)', () => {
  it('.claude/hooks ve scripts/board içinde sabit sürücü harfli pano yolu yok', () => {
    const ihlal: string[] = []
    for (const dosya of [...betikler('.claude/hooks'), ...betikler('scripts/board')]) {
      if (dosya.endsWith('pano-dizini.cjs')) continue
      const satirlar = sabitPanoSatirlari(fs.readFileSync(path.join(KOK, dosya), 'utf8'))
      for (const s of satirlar) ihlal.push(`${dosya}: ${s.trim().slice(0, 100)}`)
    }
    expect(ihlal, `Linux'ta "C:" klasörü açar; require('.../pano-dizini.cjs').VARSAYILAN kullan:\n${ihlal.join('\n')}`).toEqual([])
  })

  it('⛔SABOTAJ: tarayıcı sabit yolu gerçekten yakalar', () => {
    expect(sabitPanoSatirlari("const PANO = env.X || 'C:/tmp/venthub-board'")).toHaveLength(1)
    expect(sabitPanoSatirlari("const D = path.join('C:', 'tmp', 'venthub-board')")).toHaveLength(1)
    expect(sabitPanoSatirlari("// 'C:/tmp/venthub-board' yorum satırı sayılmaz")).toHaveLength(0)
    expect(sabitPanoSatirlari("const D = require('./pano-dizini.cjs').VARSAYILAN")).toHaveLength(0)
  })

  it('.gitignore kök seviyesinde "C:/" klasörünü yok sayar (ek koruma)', () => {
    const satirlar = fs.readFileSync(path.join(KOK, '.gitignore'), 'utf8').split(/\r?\n/).map((s) => s.trim())
    expect(satirlar).toContain('/C:/')
  })
})
