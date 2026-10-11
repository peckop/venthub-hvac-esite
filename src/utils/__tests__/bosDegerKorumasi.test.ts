import { describe, expect, it } from 'vitest'

import { doluMetinler, doluMu } from '../bosDegerKorumasi'

/**
 * URN-84 — sözlükte BOŞ ('') bırakılan değerin çizimde boş öğe üretmemesi için tek yardımcı.
 * Bileşen testleri (sections/bosDegerKorumasi.test.tsx, components/__tests__/…) bu sözleşmeye dayanır.
 */
describe('doluMu', () => {
  it.each([
    ['Isıtılacak girişler', true],
    [' x ', true],
    ['', false],
    ['   ', false],
    ['\n\t', false],
  ])('%j → %s', (girdi, beklenen) => {
    expect(doluMu(girdi)).toBe(beklenen)
  })

  // Sayı ve nesne artık DERLENMEZ (parametre `string | null | undefined`): o girdiler için çalışma anı testi yazılmaz,
  // sözleşmeyi derleyici tutar. Metin olmayan tek yasal değerler:
  it('dize olmayan yasal değerler boştur (undefined, null)', () => {
    expect(doluMu(undefined)).toBe(false)
    expect(doluMu(null)).toBe(false)
  })
})

describe('doluMetinler', () => {
  it('boş ve yalnız-boşluk öğeleri atar, sırayı korur', () => {
    expect(doluMetinler(['a', '', 'b', '  ', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('hepsi boşsa boş dizi döner', () => {
    expect(doluMetinler(['', ' '])).toEqual([])
  })

  it('liste yoksa (null/undefined) boş dizi döner, fırlatmaz', () => {
    expect(doluMetinler(undefined)).toEqual([])
    expect(doluMetinler(null)).toEqual([])
  })

  it('null ve undefined öğeleri de atar', () => {
    expect(doluMetinler(['a', undefined, null, 'b'])).toEqual(['a', 'b'])
  })
})
