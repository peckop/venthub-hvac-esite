import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-E2E-CIKTI-1 · giriş yapan testlerin çıktısı kimlik bilgisi taşıyabilir; yüklenmez (ALT-226).
 *
 * NİÇİN: depo herkese açık, E2E testleri gerçek hesapla giriş yapar. Playwright'ın trace ve video
 * kaydı girilen değerleri ve oturum verisini taşıyabilir. Kural üç ayaklı:
 *   1) kök Playwright ayarında trace ve video KAPALI;
 *   2) hiçbir spec ve hiçbir iş akışı bunları yeniden açmaz;
 *   3) hiçbir iş akışı Playwright çıktısını ya da giriş sırrı kullanan işin artefaktını yüklemez.
 * Canlıya yazan tek seferlik ayrı yol: `canli-kanit-yalitimi.test.ts` (INV-CANLI-KANIT-1).
 */

const KOK = path.resolve(__dirname, '../../..')
const oku = (g: string) => fs.readFileSync(path.join(KOK, g), 'utf8').replace(/\r\n/g, '\n')
const dosyalar = (klasor: string, sonek: RegExp) =>
  fs
    .readdirSync(path.join(KOK, klasor))
    .filter((ad) => sonek.test(ad))
    .map((ad) => `${klasor}/${ad}`)

/** Yorum satırları kural metnini anlatabilir; ölçüm yalnız etkin satırlara bakar. */
const yorumsuz = (metin: string) =>
  metin
    .split('\n')
    .filter((s) => !/^\s*(#|\/\/|\*|\/\*)/.test(s))
    .join('\n')

function ayarDenetle(ayar: string): string[] {
  const kod = yorumsuz(ayar)
  const ihlal: string[] = []
  for (const anahtar of ['trace', 'video']) {
    const degerler = [...kod.matchAll(new RegExp(`\\b${anahtar}\\s*:\\s*([^,\\n}]+)`, 'g'))].map((m) => m[1].trim())
    if (degerler.length === 0) ihlal.push(`${anahtar}: ayarda açıkça yazılı değil`)
    for (const d of degerler) if (d !== "'off'") ihlal.push(`${anahtar}: ${d} (yalnız 'off')`)
  }
  return ihlal
}

function specDenetle(ad: string, spec: string): string[] {
  const kod = yorumsuz(spec)
  const acik = [...kod.matchAll(/\b(trace|video)\s*:(?!\s*'off')\s*[^,\n}]+/g)].map((m) => `${ad}: ${m[0].trim()}`)
  if (/\btracing\.start\s*\(/.test(kod) || /\brecordVideo\b|\brecordHar\b/.test(kod)) acik.push(`${ad}: elle kayıt başlatılıyor`)
  return acik
}

function isAkisiDenetle(ad: string, yml: string): string[] {
  const kod = yorumsuz(yml)
  const ihlal: string[] = []
  const yukluyor = /actions\/upload-artifact@/.test(kod)
  if (/--(trace|video)[ =]/.test(kod)) ihlal.push(`${ad}: komut satırından trace/video açılıyor`)
  if (yukluyor && /playwright-report|test-results|blob-report/.test(kod)) ihlal.push(`${ad}: Playwright çıktısı yükleniyor`)
  if (yukluyor && /E2E_[A-Z_]*PASSWORD/.test(kod)) ihlal.push(`${ad}: giriş sırrı kullanan iş akışı artefakt yüklüyor`)
  return ihlal
}

describe('INV-E2E-CIKTI-1 · kimlik bilgisi taşıyabilecek test çıktısı yüklenmez', () => {
  const ayar = oku('playwright.config.ts')
  const specler = dosyalar('e2e', /\.ts$/)
  const isAkislari = dosyalar('.github/workflows', /\.ya?ml$/)
  const smoke = oku('.github/workflows/e2e-smoke.yml')

  it('evren boş değil', () => {
    expect(specler.length).toBeGreaterThan(2)
    expect(isAkislari).toContain('.github/workflows/e2e-smoke.yml')
    expect(smoke).toMatch(/E2E_ADMIN_PASSWORD/)
  })

  it('kök ayarda trace ve video kapalı', () => {
    expect(ayarDenetle(ayar)).toEqual([])
  })

  it('hiçbir spec kaydı yeniden açmaz', () => {
    expect(specler.flatMap((g) => specDenetle(g, oku(g)))).toEqual([])
  })

  it('hiçbir iş akışı Playwright çıktısı ya da giriş yapan işin artefaktını yüklemez', () => {
    expect(isAkislari.flatMap((g) => isAkisiDenetle(g, oku(g)))).toEqual([])
  })

  it.each([
    ['trace açılır', "trace: 'off'", "trace: 'retain-on-failure'"],
    ['video açılır', "video: 'off'", "video: 'on'"],
    ['trace satırı silinir', "trace: 'off',", ''],
  ])('SABOTAJ ayar: %s', (_ad, eski, yeni) => {
    const bozuk = ayar.replace(eski, yeni)
    expect(bozuk).not.toBe(ayar)
    expect(ayarDenetle(bozuk)).not.toEqual([])
  })

  it.each([
    ["test.use({ trace: 'on' })"],
    ["await context.tracing.start({ snapshots: true })"],
    ["const c = await browser.newContext({ recordVideo: { dir: 'v' } })"],
  ])('SABOTAJ spec: %s', (satir) => {
    expect(specDenetle('x.e2e.ts', satir)).not.toEqual([])
  })

  it.each([
    ['rapor yükleme adımı geri gelir', '\n      - uses: actions/upload-artifact@abc\n        with:\n          path: playwright-report/\n'],
    ['başka adla yükleme', '\n      - uses: actions/upload-artifact@abc\n        with:\n          path: cikti/\n'],
    ['komut satırından trace', '\n      - run: pnpm exec playwright test --trace on\n'],
  ])('SABOTAJ iş akışı: %s', (_ad, ek) => {
    expect(isAkisiDenetle('e2e-smoke.yml', smoke + ek)).not.toEqual([])
  })
})
