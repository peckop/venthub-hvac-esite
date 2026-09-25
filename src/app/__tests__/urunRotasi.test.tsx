/**
 * K3-b `/[lang]/urun/[slug]` rotası bayrak kapalıyken HİÇBİR adres açmaz (REC-300 Faz 3b).
 *
 * NİÇİN: rota dosyası bugün depoda ama canlıda görünmemeli — bayrak kapalıyken bir `/tr/urun/...`
 * adresinin 200 dönmesi, aynı ürünün iki adresten yayınlanması demektir (REC-205 sınıfı). Açılış
 * yalnız Faz 3-C'de, tek PR'da.
 */
import { describe, expect, it, vi } from 'vitest'

const cagri = vi.hoisted(() => ({ coz: vi.fn(), sayfa: vi.fn() }))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
}))
vi.mock('@/lib/data/urunSegmenti', () => ({ urunSegmentiniCoz: cagri.coz }))
vi.mock('../_components/aileSayfasi', () => ({
  AileSayfasi: cagri.sayfa,
  aileSayfasiUstVerisi: vi.fn(),
}))

import { ADRES_SEMASI_K3B } from '../../config/features'
import Sayfa, { generateMetadata, generateStaticParams } from '../[lang]/urun/[slug]/page'

const p = (lang: string, slug: string) => ({ params: Promise.resolve({ lang, slug }) })

describe('/[lang]/urun/[slug] — bayrak KAPALI', () => {
  it('ön koşul: bayrak kapalı', () => {
    expect(ADRES_SEMASI_K3B).toBe(false)
  })

  it.each([
    ['tr', 'storm-serisi'],
    ['tr', 'storm-10-p-sea-61143003'],
    ['en', 'storm-serisi'],
  ])('%s/%s → 404, veri katmanına HİÇ gidilmez', async (lang, slug) => {
    await expect(Sayfa(p(lang, slug))).rejects.toThrow('NOT_FOUND')
    expect(cagri.coz).not.toHaveBeenCalled()
    expect(cagri.sayfa).not.toHaveBeenCalled()
  })

  it('üst veri boş (başlık/canonical üretilmez)', async () => {
    await expect(generateMetadata(p('tr', 'storm-serisi'))).resolves.toEqual({})
  })

  it('derlemede önceden sayfa üretilmez', async () => {
    await expect(generateStaticParams()).resolves.toEqual([])
  })
})
