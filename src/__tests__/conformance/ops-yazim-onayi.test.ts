/**
 * INV-OPS-YAZIM-ONAYI-1 — product-data betiklerinin canlı yazımı (--apply / --rollback) betiğin KENDİSİNDE de OPS onayı ister
 * (ARC-181; canli-yazim-kapisi.cjs kancasının ARKASINDAKİ ikinci katman, derinlemesine savunma).
 *
 * 1. Mantık: onayDurumu işlevi doğrudan çağrılır (anahtar dosyası yolu yalnız parametreyle verilir; üretim yolunda ortam
 *    değişkeniyle değiştirilemez, güvenlik taraması 19 Ekim).
 * 2. Uçtan uca: modül gerçek sabit yolla çalıştırılır; bayraksız geçer, bayrakla birlikte değişken yok / yanlış değer durur.
 * 3. Kapsam: has('apply') ya da arg('rollback') okuyan HER product-data betiği ilk içe aktarma olarak _ops-onay.mjs'i alır.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '../../..')
const KLASOR = path.join(KOK, 'scripts', 'db', 'product-data')
const YARDIMCI = path.join(KLASOR, '_ops-onay.mjs')
const APPLY = '--' + 'apply'
const ROLLBACK = '--' + 'rollback'

interface Durum { izin: boolean; sebep: string }
type OnayDurumu = (argv: string[], ortam: Record<string, string | undefined>, dosya?: string) => Durum
let onayDurumu: OnayDurumu
let gecici = ''
let anahtarDosyasi = ''

beforeAll(async () => {
  const modul = (await import(/* @vite-ignore */ pathToFileURL(YARDIMCI).href)) as { onayDurumu: OnayDurumu }
  onayDurumu = modul.onayDurumu
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'ops-onay-'))
  anahtarDosyasi = path.join(gecici, 'anahtar.txt')
  fs.writeFileSync(anahtarDosyasi, 'dogru-anahtar\n')
})

afterAll(() => {
  fs.rmSync(gecici, { recursive: true, force: true })
})

describe('INV-OPS-YAZIM-ONAYI-1 · mantık', () => {
  it('bayraksız (kuru koşum) onay istemeden geçer', () => {
    expect(onayDurumu(['--url', 'x'], {}, anahtarDosyasi).izin).toBe(true)
  })

  it.each([APPLY, ROLLBACK, `${ROLLBACK}=x.json`])('%s: değişken yoksa durur', (bayrak) => {
    const s = onayDurumu([bayrak], {}, anahtarDosyasi)
    expect(s.izin).toBe(false)
    expect(s.sebep).toContain('tanımlı değil')
  })

  it('değişken var ama anahtar dosyası yok: durur', () => {
    const s = onayDurumu([APPLY], { VENTHUB_OPS_YAZIM_ONAYI: 'dogru-anahtar' }, path.join(gecici, 'yok.txt'))
    expect(s.izin).toBe(false)
    expect(s.sebep).toContain('okunamadı')
  })

  it('anahtar dosyası boş: durur', () => {
    const bos = path.join(gecici, 'bos.txt')
    fs.writeFileSync(bos, '\n')
    expect(onayDurumu([APPLY], { VENTHUB_OPS_YAZIM_ONAYI: 'x' }, bos).izin).toBe(false)
  })

  it('yanlış değer: durur', () => {
    const s = onayDurumu([APPLY], { VENTHUB_OPS_YAZIM_ONAYI: 'tahmin' }, anahtarDosyasi)
    expect(s.izin).toBe(false)
    expect(s.sebep).toContain('eşleşmiyor')
  })

  it('doğru değer: geçer', () => {
    expect(onayDurumu([APPLY], { VENTHUB_OPS_YAZIM_ONAYI: 'dogru-anahtar' }, anahtarDosyasi).izin).toBe(true)
  })

  it('üretim yolu ortam değişkeniyle başka dosyaya yönlendirilemez', () => {
    expect(fs.readFileSync(YARDIMCI, 'utf8')).not.toMatch(/ortam\.[A-Z_]*DOSYA/)
    expect(fs.readFileSync(YARDIMCI, 'utf8')).toContain('os.userInfo().homedir')
  })
})

describe('INV-OPS-YAZIM-ONAYI-1 · uçtan uca (gerçek sabit yol)', () => {
  const kos = (args: string[], ortam: Record<string, string | undefined> = {}) =>
    spawnSync(process.execPath, [YARDIMCI, ...args], { env: { ...process.env, VENTHUB_OPS_YAZIM_ONAYI: undefined, ...ortam }, encoding: 'utf8' })

  it('bayraksız çıkış 0', () => {
    expect(kos(['--url', 'x']).status).toBe(0)
  })

  it('bayrak + değişken yok: çıkış 1', () => {
    expect(kos([APPLY]).status).toBe(1)
  })

  it('bayrak + tahmin edilen değer: çıkış 1 (gerçek anahtar dosyası yok ya da eşleşmez)', () => {
    expect(kos([ROLLBACK, 'x.json'], { VENTHUB_OPS_YAZIM_ONAYI: 'tahmin' }).status).toBe(1)
  })
})

describe('INV-OPS-YAZIM-ONAYI-1 · kapsam', () => {
  const yazanlar = fs
    .readdirSync(KLASOR)
    .filter((f) => f.endsWith('.mjs') && f !== '_ops-onay.mjs')
    .filter((f) => /has\('apply'\)|arg\('rollback'\)/.test(fs.readFileSync(path.join(KLASOR, f), 'utf8')))

  it('en az dokuz yazan betik bulunur (tarama kör değil)', () => {
    expect(yazanlar.length).toBeGreaterThanOrEqual(9)
  })

  it.each(yazanlar)('%s: ilk içe aktarma _ops-onay.mjs', (dosya) => {
    const ilk = /^import .*$/m.exec(fs.readFileSync(path.join(KLASOR, dosya), 'utf8'))
    expect(ilk?.[0].trim()).toBe("import './_ops-onay.mjs'")
  })
})
