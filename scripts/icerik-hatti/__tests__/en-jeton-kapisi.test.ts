/**
 * REC-146 · TR ↔ EN jeton kapısı. Ağa/DB'ye çıkmaz: TR/EN eş dosyaları geçici dizine yazılır.
 *
 * Kilitlenenler (plan rec146-karar70 v3.1, eşdeğerlik tablosu — her kurala sabotaj):
 *   1. Sadık çeviri YEŞİL: %90↔90%, 1,5↔1.5, 25.000↔25,000↔25000, d/dk↔rpm, trifaze↔three-phase,
 *      IP55↔IP 55, 380V↔380 V; kaynak atfı ([AVenS s.27]) jeton sayılmaz.
 *   2. Değeri 1000 kat kaydıran kopya KIRMIZI: TR `1.125 m³/h` ↔ EN `1.125 m³/h`.
 *   3. EN'de yeni ya da düşen jeton KIRMIZI; EN metinde Türkçe harf KIRMIZI.
 *   4. `0,125` belirsiz sayılmaz (yanlış kırmızı yok); eş dosya yoksa ÖNKOŞUL (2).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const BETIK = join(__dirname, '..', 'en-jeton-kapisi.py')
const PY = process.platform === 'win32' ? 'python' : 'python3'
let kok = ''

const kos = (ad: string, tr: string | null, en: string) => {
  if (tr !== null) writeFileSync(join(kok, `${ad}.tr.md`), tr)
  writeFileSync(join(kok, `${ad}.en.md`), en)
  return spawnSync(PY, [BETIK, '--tr', join(kok, `${ad}.tr.md`), '--en', join(kok, `${ad}.en.md`)],
    { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
}

beforeAll(() => { kok = mkdtempSync(join(tmpdir(), 'enjeton-')) })
afterAll(() => rmSync(kok, { recursive: true, force: true }))

describe('TR ↔ EN jeton kapısı', () => {
  it('sadık çeviri YEŞİL (eşdeğerlik tablosunun tamamı)', () => {
    const r = kos('iyi',
      'Trifaze 380V motor, IP55 koruma, 1450 d/dk. Isının %90\'ını geri kazanır. Debi 25.000 m³/h, güç 1,5 kW, 0,125 kW yardımcı. [AVenS s.27]',
      'Three-phase 380 V motor, IP 55 protection, 1450 rpm. Recovers 90% of the heat. Air flow 25,000 m³/h, power 1.5 kW, 0.125 kW auxiliary.')
    expect(r.status, r.stdout).toBe(0)
    expect(r.stdout).toMatch(/\[YESIL\]/)
  })

  it('binlik ayırıcısız yazım da denk (25000 ↔ 25,000)', () => {
    expect(kos('duz', 'Debi 25000 m³/h.', 'Air flow 25,000 m3/h.').status).toBe(0)
  })

  it('TR 1.125 m³/h aynen EN\'e kopyalanırsa KIRMIZI (değer 1000 kat kayar)', () => {
    const r = kos('kayma', 'Debi 1.125 m³/h.', 'Air flow 1.125 m³/h.')
    expect(r.status).toBe(1)
    expect(r.stdout).toMatch(/EN'de BELİRSİZ sayı.*1\.125/)
  })

  it('TR 1.125 ↔ EN 1,125 YEŞİL; TR 1,5 ↔ EN 1.5 YEŞİL', () => {
    expect(kos('b1', 'Debi 1.125 m³/h, güç 1,5 kW.', 'Air flow 1,125 m³/h, power 1.5 kW.').status).toBe(0)
  })

  it('EN\'de yeni iddia ve düşen iddia KIRMIZI', () => {
    const r = kos('fark', 'IP54 koruma, 230 V.', 'IP55 protection.')
    expect(r.status).toBe(1)
    expect(r.stdout).toMatch(/FAZLA.*IP55/)
    expect(r.stdout).toMatch(/EKSİK.*230V/)
  })

  it('d/dk ↔ rpm ve trifaze ↔ three-phase kuralları sabotajla sınanır', () => {
    // aynı sayı, farklı birim: yalnız birim eşlemesi ayırt eder
    expect(kos('rpm', 'Devir 1450 d/dk.', 'Speed 1450 Pa.').status).toBe(1)
    expect(kos('rpm2', 'Devir 1450 d/dk.', 'Speed 1450 rpm.').status).toBe(0)
    expect(kos('faz', 'Trifaze motor.', 'Single-phase motor.').status).toBe(1)
  })

  it('TR "Bölge 2" ↔ EN "Zone 2" denk; bölge numarası değişirse KIRMIZI', () => {
    expect(kos('bolge', 'ATEX Bölge 2 ortamına uygun.', 'Suitable for ATEX Zone 2.').status).toBe(0)
    expect(kos('bolge2', 'ATEX Bölge 1 ortamına uygun.', 'Suitable for ATEX Zone 2.').status).toBe(1)
  })

  it('rakamlı kısaltmalı atıf ([CAS191 s.1]) jeton sayılmaz', () => {
    const r = kos('rakamli', 'IP-55 motor. [CAS191 s.1]', 'IP-55 motor.')
    expect(r.status, r.stdout).toBe(0)
  })

  it('EN metinde Türkçe harf KIRMIZI', () => {
    const r = kos('harf', 'IP55 koruma.', 'IP55 koruma sınıfı.')
    expect(r.status).toBe(1)
    expect(r.stdout).toMatch(/Türkçe harf/)
  })

  it('eş TR dosyası yoksa ÖNKOŞUL (2)', () => {
    const r = spawnSync(PY, [BETIK, '--tr', join(kok, 'yok.tr.md'), '--en', join(kok, 'iyi.en.md')], { encoding: 'utf8' })
    expect(r.status).toBe(2)
  })
})
