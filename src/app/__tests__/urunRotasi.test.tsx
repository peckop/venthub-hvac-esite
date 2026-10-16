/**
 * K3-b `/[lang]/urun/[slug]` rotası bayrak kapalıyken HİÇBİR adres açmaz (REC-300 Faz 3b).
 *
 * NİÇİN: rota dosyası bugün depoda ama canlıda görünmemeli — bayrak kapalıyken bir `/tr/urun/...`
 * adresinin 200 dönmesi, aynı ürünün iki adresten yayınlanması demektir (REC-205 sınıfı). Açılış
 * yalnız Faz 3-C'de, tek PR'da.
 *
 * FAZ 3-C (URN-85 2/2): `features.ts` `ADRES_SEMASI_K3B` değerini `true` yaptı. Bu dosya iki kolu da ölçer:
 *  - KAPALI kol (geri alma merdiveni, runbook §7): bayrak burada KAPALIYA sabitlenir, rota 404 verir;
 *  - AÇIK kol (canlıdaki hâl): TR'de rota çözer ve aile sayfasını çizer, EN'de 404 kalır.
 * Bayrak bir ANAHTAR'dır (`bayrak.k3b`); `vi.mock` getter'ı her okumada güncel değeri verir.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

const cagri = vi.hoisted(() => ({ coz: vi.fn(), sayfa: vi.fn(), ustVeri: vi.fn() }))
const bayrak = vi.hoisted(() => ({ k3b: false }))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
}))
vi.mock('@/config/features', async (orijinal) => ({
  ...(await orijinal<typeof import('@/config/features')>()),
  get ADRES_SEMASI_K3B() {
    return bayrak.k3b
  },
}))
vi.mock('@/lib/data/urunSegmenti', () => ({ urunSegmentiniCoz: cagri.coz }))
vi.mock('../_components/aileSayfasi', () => ({
  AileSayfasi: cagri.sayfa,
  aileSayfasiUstVerisi: cagri.ustVeri,
}))

import { ADRES_SEMASI_K3B } from '../../config/features'
import Sayfa, { generateMetadata, generateStaticParams } from '../[lang]/urun/[slug]/page'

const p = (lang: string, slug: string) => ({ params: Promise.resolve({ lang, slug }) })

afterEach(() => {
  bayrak.k3b = false
  vi.clearAllMocks()
})

describe('/[lang]/urun/[slug] — bayrak KAPALI', () => {
  it('ön koşul: bayrak kapalı (bu dosyada sabitlenir; gerçek değer Faz 3-C ile `true`)', () => {
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
    expect(cagri.coz).not.toHaveBeenCalled()
  })

  it('derlemede önceden sayfa üretilmez', async () => {
    await expect(generateStaticParams()).resolves.toEqual([])
  })
})

describe('/[lang]/urun/[slug] — bayrak AÇIK (Faz 3-C, canlıdaki hâl)', () => {
  it('ön koşul: bayrak bu bloğun içinde açık', () => {
    bayrak.k3b = true
    expect(ADRES_SEMASI_K3B).toBe(true)
  })

  it('tr/<aile> → segment çözülür, aile sayfası çizilir (seçili model YOK)', async () => {
    bayrak.k3b = true
    cagri.coz.mockResolvedValue({ aileSlug: 'storm-serisi', sunucuSku: null })
    const el = (await Sayfa(p('tr', 'storm-serisi'))) as { type: unknown; props: Record<string, unknown> }
    expect(cagri.coz).toHaveBeenCalledWith('storm-serisi', 'tr')
    expect(el.type).toBe(cagri.sayfa)
    expect(el.props).toEqual({ lang: 'tr', slug: 'storm-serisi', sunucuSku: null })
  })

  it('tr/<slug>-p-<sku> → modelin SKU\'su sunucuda verilir (INV-MODEL-SSR-1)', async () => {
    bayrak.k3b = true
    cagri.coz.mockResolvedValue({ aileSlug: 'storm-serisi', sunucuSku: 'SEA-61143003' })
    const el = (await Sayfa(p('tr', 'storm-10-p-sea-61143003'))) as { type: unknown; props: Record<string, unknown> }
    expect(cagri.coz).toHaveBeenCalledWith('storm-10-p-sea-61143003', 'tr')
    expect(el.props).toEqual({ lang: 'tr', slug: 'storm-serisi', sunucuSku: 'SEA-61143003' })
  })

  it('en/<slug> → 404 kalır (EN bu rotayı kullanmaz: `/en/products/...` bugünkü rotada), veri katmanına gidilmez', async () => {
    bayrak.k3b = true
    await expect(Sayfa(p('en', 'storm-serisi'))).rejects.toThrow('NOT_FOUND')
    expect(cagri.coz).not.toHaveBeenCalled()
    expect(cagri.sayfa).not.toHaveBeenCalled()
  })

  it('üst veri aile sayfasının üreticisinden gelir (model adresinde kanonik modelin adresi)', async () => {
    bayrak.k3b = true
    cagri.coz.mockResolvedValue({ aileSlug: 'storm-serisi', sunucuSku: 'SEA-61143003' })
    cagri.ustVeri.mockResolvedValue({ title: 'Storm' })
    await expect(generateMetadata(p('tr', 'storm-10-p-sea-61143003'))).resolves.toEqual({ title: 'Storm' })
    expect(cagri.ustVeri).toHaveBeenCalledWith('tr', 'storm-serisi', 'SEA-61143003')
  })

  it('EN için üst veri boş (rota EN\'de açılmaz)', async () => {
    bayrak.k3b = true
    await expect(generateMetadata(p('en', 'storm-serisi'))).resolves.toEqual({})
    expect(cagri.coz).not.toHaveBeenCalled()
  })

  it('derlemede yine önceden sayfa üretilmez (talep üzerine, dynamicParams)', async () => {
    bayrak.k3b = true
    await expect(generateStaticParams()).resolves.toEqual([])
  })
})
