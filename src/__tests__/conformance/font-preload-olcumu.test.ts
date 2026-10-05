import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-FONT-PRELOAD-1 — M6 font preload ölçümü (ALT-34, plan v2.2 §2.1 madde 2 / §4 M6).
 *
 * `scripts/ci/font-preload-olc.cjs` derleme çıktısından önyüklenen font bağlantılarını sayar. Bu dosya KARAR
 * MANTIĞINI sentetik girdiyle ölçer (gerçek ölçüm Linux CI'da, derlemeden sonra koşar) ve adımın iş akışına
 * bağlı olduğunu kaynak taramasıyla doğrular. Sabotaj kolları: fazladan aile, sınır aşımı, çözülemeyen dosya,
 * boş manifest ve Windows hep KIRMIZI ya da ÖLÇÜLEMEDİ verir, asla yeşil.
 */
const KOK = process.cwd()
const { degerlendir, aileAdi, fontFaceHaritasi, manifestOnyuklemeleri } = createRequire(import.meta.url)(
  join(KOK, 'scripts', 'ci', 'font-preload-olc.cjs'),
) as {
  degerlendir: (g: Record<string, unknown>) => { durum: string; mesaj: string; aileler: Record<string, number> }
  aileAdi: (s: string) => string
  fontFaceHaritasi: (css: string[]) => Map<string, string>
  manifestOnyuklemeleri: (m: unknown) => string[]
}

const css = (aile: string, dosyalar: string[]) =>
  dosyalar
    .map((d) => `@font-face{font-family:__${aile}_a1b2c3;font-style:normal;src:url(/_next/static/media/${d}) format("woff2")}`)
    .join('')

const INTER = 'static/media/aaaa1111-s.p.woff2'
const ARCH_LATIN = 'static/media/bbbb2222-s.p.woff2'
const ARCH_EXT = 'static/media/cccc3333-s.p.woff2'
const manifest = (...dosyalar: string[]) => ({ pages: {}, app: { '/layout': dosyalar }, appUsingSizeAdjust: false })
const CSS = [css('Inter', ['aaaa1111-s.p.woff2']), css('Archivo', ['bbbb2222-s.p.woff2', 'cccc3333-s.p.woff2'])]
const linux = { platform: 'linux', css: CSS }

describe('INV-FONT-PRELOAD-1 — font preload ölçümü karar mantığı', () => {
  it('kapalı kip: yalnız Inter → YEŞİL', () => {
    expect(degerlendir({ ...linux, manifest: manifest(INTER), beklenen: 'Inter' }).durum).toBe('yesil')
  })

  it('kapalı kip: Archivo da önyükleniyorsa → KIRMIZI (bayrak kapalıyken yeni font sızdı)', () => {
    const s = degerlendir({ ...linux, manifest: manifest(INTER, ARCH_LATIN), beklenen: 'Inter' })
    expect(s.durum).toBe('kirmizi')
    expect(s.mesaj).toContain('Archivo')
  })

  it('açık kip: yalnız Archivo, latin + latin-ext (2 bağlantı) → YEŞİL', () => {
    const s = degerlendir({ ...linux, manifest: manifest(ARCH_LATIN, ARCH_EXT), beklenen: 'Archivo', enCok: 2 })
    expect(s.durum).toBe('yesil')
    expect(s.aileler).toEqual({ Archivo: 2 })
  })

  it('açık kip: Inter de kalmışsa (iki font önyükleniyor) → KIRMIZI', () => {
    expect(degerlendir({ ...linux, manifest: manifest(INTER, ARCH_LATIN), beklenen: 'Archivo' }).durum).toBe('kirmizi')
  })

  it('sınır aşımı: Archivo 3 bağlantı, sınır 2 → KIRMIZI', () => {
    const css3 = [css('Archivo', ['bbbb2222-s.p.woff2', 'cccc3333-s.p.woff2', 'dddd4444-s.p.woff2'])]
    const s = degerlendir({
      platform: 'linux',
      css: css3,
      manifest: manifest(ARCH_LATIN, ARCH_EXT, 'static/media/dddd4444-s.p.woff2'),
      beklenen: 'Archivo',
      enCok: 2,
    })
    expect(s.durum).toBe('kirmizi')
  })

  it('ailesi CSS\'te bulunamayan önyükleme → KIRMIZI (ölçülemeyen preload geçti sayılmaz)', () => {
    const s = degerlendir({ ...linux, manifest: manifest(INTER, 'static/media/zzzz9999-s.p.woff2'), beklenen: 'Inter' })
    expect(s.durum).toBe('kirmizi')
    expect(s.mesaj).toContain('zzzz9999')
  })

  it('BOŞ manifest (Linux dahil) → ÖLÇÜLEMEDİ, yeşil değil', () => {
    for (const m of [{ pages: {}, app: {} }, {}, null, { app: { '/layout': [] } }]) {
      expect(degerlendir({ ...linux, manifest: m, beklenen: 'Inter' }).durum).toBe('olculemedi')
    }
  })

  it('Windows → dolu manifest olsa bile ÖLÇÜLEMEDİ (yalnız Linux/CI)', () => {
    const s = degerlendir({ platform: 'win32', css: CSS, manifest: manifest(INTER), beklenen: 'Inter' })
    expect(s.durum).toBe('olculemedi')
    expect(s.mesaj).toContain('Windows')
  })

  it('yardımcılar: aile adı, @font-face haritası, benzersiz önyükleme listesi', () => {
    expect(aileAdi('__Inter_a1b2c3')).toBe('Inter')
    expect(aileAdi('__Inter_Fallback_a1b2c3')).toBe('Inter')
    expect(aileAdi('__Archivo_Narrow_a1b2c3')).toBe('Archivo Narrow')
    expect(fontFaceHaritasi(CSS).get('bbbb2222-s.p.woff2')).toBe('Archivo')
    expect(manifestOnyuklemeleri({ app: { '/a': [INTER], '/b': [INTER, ARCH_LATIN] } })).toEqual([INTER, ARCH_LATIN])
  })

  it('CI adımı bağlı: e2e-smoke.yml derlemeden SONRA, smoke koşusundan ÖNCE ölçümü koşturuyor', () => {
    const yaml = readFileSync(join(KOK, '.github', 'workflows', 'e2e-smoke.yml'), 'utf8')
    const derleme = yaml.indexOf('pnpm run build:ci')
    const olcum = yaml.indexOf('scripts/ci/font-preload-olc.cjs --beklenen Inter')
    const smoke = yaml.indexOf('pnpm exec playwright test')
    expect(derleme, 'derleme adımı bulunamadı').toBeGreaterThan(-1)
    expect(olcum, 'font preload ölçüm adımı e2e-smoke.yml içinde yok').toBeGreaterThan(derleme)
    expect(smoke).toBeGreaterThan(olcum)
  })
})
