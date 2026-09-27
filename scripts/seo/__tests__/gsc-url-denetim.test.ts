/**
 * INV-GSC-URL-DENETIM-1 · Googlebot gözüyle sayfa denetiminin ağsız parçaları (REC-402;
 * cetvel docs/standards/yayin-gorunurluk-denetim-standard.md).
 *
 * Kilitlenenler: yanıt düz satıra çevrilir, hata yanıtı "denetlenemeyen" sayılır (sessiz sıfır değil);
 * getirme SUCCESSFUL değilse ya da robots engeli varsa KIRMIZI; hiç taranmamış sayfa ayrı sayılır, kırmızı değil;
 * son tarama yaşı kovalara bölünür.
 */
import { describe, it, expect } from 'vitest'
import { satirCikar, ozetle } from '../gsc-url-denetim.mjs'

const yanit = (getirme: string, robots = 'ALLOWED', sonTarama: string | null = '2026-09-20T00:00:00Z') => ({
  inspectionResult: { indexStatusResult: { verdict: getirme === 'SUCCESSFUL' ? 'PASS' : 'FAIL', coverageState: 'x', pageFetchState: getirme, robotsTxtState: robots, indexingState: 'INDEXING_ALLOWED', lastCrawlTime: sonTarama ?? undefined, crawledAs: 'MOBILE' } },
})
const SIMDI = Date.parse('2026-09-27T00:00:00Z')

describe('INV-GSC-URL-DENETIM-1', () => {
  it('yanıt satıra çevrilir; hata yanıtı denetlenemeyen sayılır', () => {
    expect(satirCikar('a', yanit('SUCCESSFUL')).getirme).toBe('SUCCESSFUL')
    expect(satirCikar('b', { error: { code: 403, message: 'yetki yok' } }).hata).toContain('403')
    expect(satirCikar('c', {}).hata).toBe('indexStatusResult yok')
  })
  it('⭐ayırt edici: başarılı getirme temiz; sunucu hatası ve robots engeli KIRMIZI; hiç taranmamış kırmızı değil', () => {
    const s = [
      satirCikar('ok', yanit('SUCCESSFUL')),
      satirCikar('sunucu', yanit('SERVER_ERROR')),
      satirCikar('robots', yanit('SUCCESSFUL', 'DISALLOWED')),
      satirCikar('yeni', { inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', pageFetchState: 'PAGE_FETCH_STATE_UNSPECIFIED' } } }),
      satirCikar('hata', { error: { code: 500, message: 'x' } }),
    ]
    const o = ozetle(s, SIMDI)
    expect(o.kirmizi.map((k: { adres: string }) => k.adres).sort()).toEqual(['hata', 'robots', 'sunucu'])
    expect(o.hicTaranmamis).toBe(1)
    expect(o.denetlenemeyen).toBe(1)
    expect(ozetle([s[0]], SIMDI).kirmizi).toEqual([])
  })
  it('son tarama yaşı kovalara bölünür', () => {
    const o = ozetle([
      satirCikar('a', yanit('SUCCESSFUL', 'ALLOWED', '2026-09-25T00:00:00Z')),
      satirCikar('b', yanit('SUCCESSFUL', 'ALLOWED', '2026-09-10T00:00:00Z')),
      satirCikar('c', yanit('SUCCESSFUL', 'ALLOWED', '2026-08-01T00:00:00Z')),
    ], SIMDI)
    expect(o.taramaYasiGun).toEqual({ '0-7': 1, '8-30': 1, '31+': 1 })
  })
})
