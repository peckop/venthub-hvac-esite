import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-KIMLIK-TEK-KURAL-1 · CI bağı (REC-275).
 *
 * Kapının kendisi KATALOG şeridinde: `scripts/icerik-hatti/kimlik-kurali-kapisi.mjs` (dört kol, çıkış kodu).
 * 2026-09-07'de yazıldı ama hiçbir iş akışı onu koşmuyordu — betiğin kendi notu: "CI'ya bağlanması
 * ALTYAPI'dan istenecek". Bu dosya o bağdır: her PR'da gerçek alt süreç olarak koşar.
 *
 * NİÇİN VAR: kodsuz ürün yükleme hattında düşüyordu ve uydurma kod slug'a giriyordu (VRT-16076..16080).
 * Kural iki yerde kullanılıyor; biri kendi kimlik türetmesini yeniden yazarsa "aynı ürün, iki kimlik" doğar.
 *
 * ⭐SABOTAJ KOLU: kural modülünün kopyasına ardışık sayı eklenir → kapı KIRMIZI vermeli. Yeşil kapı ancak
 * kırmızıyı gördüğünü kanıtlayınca kapıdır.
 */

const KOK = path.resolve(__dirname, '../../..')
const DIZIN = path.join(KOK, 'scripts', 'icerik-hatti')
const KAPI = path.join(DIZIN, 'kimlik-kurali-kapisi.mjs')
const KURAL = path.join(DIZIN, 'kimlik-kurali.mjs')
const GECICI = fs.mkdtempSync(path.join(os.tmpdir(), 'kimlik-kapi-'))

afterAll(() => fs.rmSync(GECICI, { recursive: true, force: true }))

const kos = (betik: string) => spawnSync(process.execPath, [betik], { encoding: 'utf8', timeout: 60_000 })

describe('INV-KIMLIK-TEK-KURAL-1 · CI bağı', () => {
  it('kapı gerçek koşumda YEŞİL: çıkış 0, dört kol da koştu', () => {
    const r = kos(KAPI)
    expect(r.status, r.stdout + r.stderr).toBe(0)
    for (const kol of ['KOL 1', 'KOL 2', 'KOL 3', 'KOL 4']) expect(r.stdout).toContain(kol)
    expect(r.stdout).toContain('YESIL')
    expect(r.stdout).not.toContain('⛔')
  })

  it('SABOTAJ: kural ardışık sayı uydurursa kapı KIRMIZI (çıkış 1)', () => {
    const kural = fs.readFileSync(KURAL, 'utf8')
    expect(kural).toMatch(/export function kimlikTuret\(/)
    const bozuk =
      kural.replace('export function kimlikTuret(', 'function _asilKimlik(') +
      '\nexport function kimlikTuret(g) { const r = _asilKimlik(g); return r && { ...r, sku: r.sku + "-16076", slug: r.slug + "-16076" } }\n'
    fs.writeFileSync(path.join(GECICI, 'kimlik-kurali.mjs'), bozuk)
    fs.copyFileSync(KAPI, path.join(GECICI, 'kimlik-kurali-kapisi.mjs'))
    const r = kos(path.join(GECICI, 'kimlik-kurali-kapisi.mjs'))
    expect(r.status, 'bozuk kural kapıdan GEÇTİ — kapı kör').toBe(1)
    expect(r.stdout).toContain('⛔')
  })

  it('tek kural: iki çağıran da kimliği kural modülünden alıyor, yükleyici kodsuz satırı atmıyor', () => {
    // 2026-09-24 (REC-209): yükleyici ikiye bölündü — load.mjs (G/Ç) planla.mjs'i (saf kurallar) içe aktarır,
    // kimlik kuralı planla.mjs'den gelir. Zincir iki halkada ayrı ayrı doğrulanır; kodsuz satır yasağı
    // ikisinin birleşiminde aranır (kural hangisine taşınırsa taşınsın kaçmasın).
    const load = fs.readFileSync(path.join(KOK, 'scripts', 'kademe2-load', 'load.mjs'), 'utf8')
    const planla = fs.readFileSync(path.join(KOK, 'scripts', 'kademe2-load', 'planla.mjs'), 'utf8')
    const uydurma = fs.readFileSync(path.join(DIZIN, 'uydurma-kimlik-tek-kural.mjs'), 'utf8')
    expect(load, 'yükleyici planlama katmanını kullanmıyor').toMatch(/import\s*\{[^}]*\bplanla\b[^}]*\}\s*from\s*'\.\/planla\.mjs'/)
    expect(planla).toMatch(/import\s*\{[^}]*kimlikTuret[^}]*\}\s*from\s*'\.\.\/icerik-hatti\/kimlik-kurali\.mjs'/)
    // Yalnız GERÇEK içe aktarım satırı (yorumda dosya adının geçmesi serbest — load.mjs:22 zinciri anlatıyor).
    expect(load, 'yükleyici kimlik kuralını planlama katmanını atlayarak ikinci kez içe aktarıyor').not.toMatch(/^\s*import\b[^\n]*kimlik-kurali\.mjs/m)
    expect(uydurma).toMatch(/import\s*\{[^}]*kimlikTuret[^}]*\}\s*from\s*'\.\/kimlik-kurali\.mjs'/)
    expect(load + '\n' + planla, 'yükleyici kodsuz satırı yine hata sayıp atıyor (REC-275)').not.toMatch(/model_code boş satır/)
    expect(load, 'yükleyici SKU\'yu yine kendisi kuruyor — iki kural').not.toMatch(/prefix\s*\+\s*'-'\s*\+\s*model_code/)
  })
})
