/**
 * INV-OPS-YAZIM-ONAYI-1 — product-data betiklerinin canlı yazımı (--apply / --rollback) betiğin KENDİSİNDE de OPS onayı ister
 * (ARC-181; canli-yazim-kapisi.cjs kancasının ARKASINDAKİ ikinci katman, derinlemesine savunma).
 *
 * 1. Davranış: _ops-onay.mjs bayraksız (kuru koşum) geçer; bayrakla birlikte ortam değişkeni ve anahtar dosyası eşleşmezse çıkış 1.
 * 2. Kapsam: has('apply') ya da arg('rollback') okuyan HER product-data betiği ilk içe aktarma olarak _ops-onay.mjs'i alır
 *    (yeni betik atlayamaz).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '../../..')
const KLASOR = path.join(KOK, 'scripts', 'db', 'product-data')
const YARDIMCI = path.join(KLASOR, '_ops-onay.mjs')
const APPLY = '--' + 'apply'
const ROLLBACK = '--' + 'rollback'

let gecici = ''
let anahtarDosyasi = ''

function kos(args: string[], ortam: Record<string, string | undefined>) {
  const env: NodeJS.ProcessEnv = { ...process.env, VENTHUB_OPS_YAZIM_ONAYI: undefined, VENTHUB_OPS_ONAY_DOSYASI: undefined, ...ortam }
  return spawnSync(process.execPath, [YARDIMCI, ...args], { env, encoding: 'utf8' })
}

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'ops-onay-'))
  anahtarDosyasi = path.join(gecici, 'anahtar.txt')
  fs.writeFileSync(anahtarDosyasi, 'dogru-anahtar\n')
})

afterAll(() => {
  fs.rmSync(gecici, { recursive: true, force: true })
})

describe('INV-OPS-YAZIM-ONAYI-1 · davranış', () => {
  it('bayraksız (kuru koşum) onay istemeden geçer', () => {
    expect(kos(['--url', 'x'], {}).status).toBe(0)
  })

  it.each([APPLY, ROLLBACK, `${ROLLBACK}=x.json`])('%s: değişken yoksa durur', (bayrak) => {
    const s = kos([bayrak], { VENTHUB_OPS_ONAY_DOSYASI: anahtarDosyasi })
    expect(s.status).toBe(1)
    expect(s.stderr).toContain('tanımlı değil')
  })

  it('değişken var ama anahtar dosyası yok: durur', () => {
    const s = kos([APPLY], { VENTHUB_OPS_YAZIM_ONAYI: 'dogru-anahtar', VENTHUB_OPS_ONAY_DOSYASI: path.join(gecici, 'yok.txt') })
    expect(s.status).toBe(1)
    expect(s.stderr).toContain('okunamadı')
  })

  it('anahtar dosyası boş: durur', () => {
    const bos = path.join(gecici, 'bos.txt')
    fs.writeFileSync(bos, '\n')
    expect(kos([APPLY], { VENTHUB_OPS_YAZIM_ONAYI: 'x', VENTHUB_OPS_ONAY_DOSYASI: bos }).status).toBe(1)
  })

  it('yanlış değer: durur', () => {
    const s = kos([APPLY], { VENTHUB_OPS_YAZIM_ONAYI: 'tahmin', VENTHUB_OPS_ONAY_DOSYASI: anahtarDosyasi })
    expect(s.status).toBe(1)
    expect(s.stderr).toContain('eşleşmiyor')
  })

  it('doğru değer: geçer', () => {
    expect(kos([APPLY], { VENTHUB_OPS_YAZIM_ONAYI: 'dogru-anahtar', VENTHUB_OPS_ONAY_DOSYASI: anahtarDosyasi }).status).toBe(0)
  })
})

describe('INV-OPS-YAZIM-ONAYI-1 · kapsam', () => {
  const yazanlar = fs
    .readdirSync(KLASOR)
    .filter((f) => f.endsWith('.mjs') && f !== '_ops-onay.mjs')
    .filter((f) => /has\('apply'\)|arg\('rollback'\)/.test(fs.readFileSync(path.join(KLASOR, f), 'utf8')))

  it('en az bir yazan betik bulunur (tarama kör değil)', () => {
    expect(yazanlar.length).toBeGreaterThanOrEqual(9)
  })

  it.each(yazanlar)('%s: ilk içe aktarma _ops-onay.mjs', (dosya) => {
    const ilk = /^import .*$/m.exec(fs.readFileSync(path.join(KLASOR, dosya), 'utf8'))
    expect(ilk?.[0].trim()).toBe("import './_ops-onay.mjs'")
  })
})
