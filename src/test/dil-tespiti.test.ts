import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { tercihEdilenDil } from '../utils/dilTespiti'

/**
 * INV-DIL-TESPITI-1 · dil öneksiz adreste ziyaretçi TERCİH ettiği dile gider, yedek diline değil.
 *
 * Çapa (2026-09-23 canlı): `curl -H "Accept-Language: tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
 * https://venthub.com.tr/category/fans` → 307 `/en/category/fans`. Türkçe Chrome'un varsayılan
 * başlığı; İngilizce yalnız yedek dil. Eski kod `includes('en')` idi.
 */
describe('INV-DIL-TESPITI-1 — Accept-Language öncelik sırasıyla okunur', () => {
  it('Türkçe Chrome varsayılanı → tr (canlı kusurun çapası)', () => {
    expect(tercihEdilenDil('tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7')).toBe('tr')
  })

  it('İngilizce tarayıcı → en', () => {
    expect(tercihEdilenDil('en-US,en;q=0.9')).toBe('en')
    expect(tercihEdilenDil('en-GB,en;q=0.9,tr;q=0.8')).toBe('en')
  })

  it('q ağırlığı sıradan önce gelir; eşitlikte listede önce gelen', () => {
    expect(tercihEdilenDil('en;q=0.5,tr;q=0.8')).toBe('tr')
    expect(tercihEdilenDil('en,tr')).toBe('en')
    expect(tercihEdilenDil('tr,en')).toBe('tr')
  })

  it('desteklenmeyen birincil dil atlanır, ilk desteklenene bakılır', () => {
    expect(tercihEdilenDil('de-DE,de;q=0.9,en;q=0.5')).toBe('en')
    expect(tercihEdilenDil('fr-FR,fr;q=0.9')).toBe('tr')
  })

  it('q=0 "istemiyorum" demektir; bozuk / boş başlık varsayılana düşer', () => {
    expect(tercihEdilenDil('en;q=0,tr;q=0.1')).toBe('tr')
    expect(tercihEdilenDil('en;q=0')).toBe('tr')
    expect(tercihEdilenDil('')).toBe('tr')
    expect(tercihEdilenDil(null)).toBe('tr')
    expect(tercihEdilenDil(';;,,')).toBe('tr')
    expect(tercihEdilenDil('en;q=abc,tr;q=0.2')).toBe('tr')
  })

  it("'en' harflerini içeren başka dil İngilizce sayılmaz", () => {
    // Eski `includes('en')` bunları İngilizce sayıyordu.
    expect(tercihEdilenDil('fr-CH, fr;q=0.9, de;q=0.7, *;q=0.5')).toBe('tr')
    expect(tercihEdilenDil('tr-TR,tr;q=0.9,ro-RO;q=0.8,sl-SI;q=0.7,gen;q=0.1')).toBe('tr')
  })

  it("middleware'de alt dize ile dil tespiti geri gelmez (statik kol)", () => {
    const kaynak = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf8')
    expect(kaynak).not.toMatch(/accept-language[^\n]*\)\s*(\|\|\s*'')?\s*\n?[^\n]*includes\(/i)
    expect(kaynak).not.toMatch(/acceptLang[^\n]*\.includes\(\s*['"]en['"]\s*\)/)
    expect(kaynak).toMatch(/tercihEdilenDil\(/)
  })
})
