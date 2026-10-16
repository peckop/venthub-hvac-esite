import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

/**
 * HRT-65 (OPS-168 O3): `scripts/belge/dosya-alani-olc.cjs` commit başlığından rolü ve yoldan öbeği doğru çıkarır.
 * Betik salt-okumadır; burada yalnız saf işlevler ölçülür (git çağrısı yok).
 */
const require = createRequire(import.meta.url)
const olc = require('../../../scripts/belge/dosya-alani-olc.cjs') as {
  rolAdi: (oge: string) => string | null
  basliktanRol: (baslik: string) => string | null
  obek: (yol: string) => string
  tablo: (s: unknown) => string
}

describe('dosya-alani-olc: rol çıkarımı ve yol öbeği', () => {
  it('Türkçe harfli rol önekleri ASCII rol adına iner', () => {
    expect(olc.rolAdi('HARİTA')).toBe('HARITA')
    expect(olc.rolAdi('ARAÇ')).toBe('ARAC')
    expect(olc.rolAdi('GEO-SEO')).toBe('GEO-SEO')
    expect(olc.rolAdi('ÜRÜN')).toBe('URUN')
    expect(olc.rolAdi('chore')).toBeNull()
    expect(olc.rolAdi('Merge')).toBeNull()
  })

  it('commit başlığından rol: "ROL (KART): ..." biçimi tanınır, öneksiz başlık role yazılmaz', () => {
    expect(olc.basliktanRol('HARİTA (HRT-60): kim birleştirir')).toBe('HARITA')
    expect(olc.basliktanRol('ALTYAPI (ALT-91): dizin tetiği (#1976)')).toBe('ALTYAPI')
    expect(olc.basliktanRol('GEO-SEO (SEO-55 Parça B): bildirici')).toBe('GEO-SEO')
    expect(olc.basliktanRol('chore: bağımlılık')).toBeNull()
    expect(olc.basliktanRol('Merge pull request #1948')).toBeNull()
  })

  it('yol öbeği: src altında üç düzey, öteki yollarda iki düzey, kök dosya kendisi', () => {
    expect(olc.obek('src/lib/seo/jsonld.ts')).toBe('src/lib/seo/')
    expect(olc.obek('docs/standards/belge-yonetimi-standard.md')).toBe('docs/standards/')
    expect(olc.obek('scripts/belge/rol-karti-uret.cjs')).toBe('scripts/belge/')
    expect(olc.obek('.claude/hooks/x.cjs')).toBe('.claude/hooks/')
    expect(olc.obek('tailwind.config.js')).toBe('tailwind.config.js')
  })

  it('tablo: iki rolün dokunduğu öbek ORTAK bölümünde iki rolle yazılır', () => {
    const s = olc.tablo({
      gun: 14,
      dal: 'origin/master',
      commit: 3,
      onekSiz: 0,
      roller: { ARAC: { 'scripts/ci/': 4 }, ALTYAPI: { 'scripts/ci/': 9 } },
      ortak: { 'scripts/ci/': ['ARAC', 'ALTYAPI'] },
    })
    expect(s).toContain('## ORTAK')
    expect(s).toContain('| scripts/ci/ | ARAC, ALTYAPI |')
  })
})
