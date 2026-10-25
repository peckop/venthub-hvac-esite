/**
 * INV-ACIKLAMA-TAM-CUMLE-1 (URN-140, OPS emri SEO-61) — aile sayfasının meta açıklaması CÜMLE ORTASINDA kesilmez.
 *
 * NİÇİN VAR (canlı ölçüm 25 Ekim): /tr/products/danfoss-vlt-hvac-basic-drive-fc-101 açıklaması "…kontrolör sunan bir…"
 * diye bitiyordu; kaynak (`product_families.description`) 199 karakterlik TEK ve tam bir cümleydi, `meta_description`
 * kolonu boştu. Kırpıcı azami (155) içinde cümle sonu bulamayınca sözcük sınırında kesip "…" ekliyordu.
 * Şimdi azami içinde cümle sonu yoksa azamiyi aşan İLK TAM cümle (esnek tavan: `ACIKLAMA_ESNEK_AZAMI`) olduğu gibi gider.
 *
 * KAPI NE ÖLÇER: gerçek `aileSayfasiUstVerisi` (kırpıcı + zincir birlikte): (a) tek uzun cümle tam döner, og:description
 * ile aynı; (b) azami içinde tam cümle varsa o cümlede biter; (c) ilk cümle esnek tavanı da aşıyorsa dürüst kesik
 * (azami içinde, "…"); (d) EN aynı; (e) dolu `meta_description` zinciri önde gelir ve aynı kırpıcıdan geçer.
 * ÖLÇMEDİĞİ: canlı HTML'deki meta etiketi (birleşme sonrası tarayıcı bölmesiyle ayrıca ölçülür).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ACIKLAMA_AZAMI, ACIKLAMA_ESNEK_AZAMI } from '@/lib/seo/aciklamaKirp'

const durum = vi.hoisted(() => ({
  detail: null as unknown,
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => {
    throw new Error(`REDIRECT:${hedef}`)
  },
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/tr/products/x',
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/lib/data/preload', () => ({
  preloadFamily: vi.fn(),
  getCachedFamilyDetail: vi.fn(async () => durum.detail),
}))
vi.mock('@/lib/data/urunSegmenti', () => ({ urunRotasiBagimliliklari: vi.fn(() => ({})) }))
vi.mock('@/lib/data/productRoute', () => ({
  resolveProductRoute: vi.fn(async () => ({ kind: 'family', detail: durum.detail })),
}))
vi.mock('@/lib/bilgiMerkezi/tersDizin', () => ({ ilgiliRehberler: () => [] }))
vi.mock('@/i18n/I18nProvider', () => ({ useI18n: () => ({ lang: 'tr', t: (k: string) => k }) }))
vi.mock('../../contexts/CategoryContext', () => ({ useCategories: () => ({ categories: [] }) }))
vi.mock('../../hooks/useCartHook', () => ({ useCart: () => ({ addToCart: vi.fn() }) }))
vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: () => ({ isFavorite: () => false, toggleFavorite: vi.fn() }),
}))
vi.mock('../../hooks/useProjectLists', () => ({ useProjectLists: () => ({ refreshProjects: vi.fn() }) }))
vi.mock('../../lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../components/ImageGallery', () => ({ default: () => null }))
vi.mock('../../components/product/ProductSmartInference', () => ({ ProductSmartInference: () => null }))
vi.mock('../../components/products', () => ({ AddToProjectModal: () => null }))
vi.mock('../../components/quotes/QuoteRequestModal', () => ({ default: () => null }))

import { aileSayfasiUstVerisi } from '../_components/aileSayfasi'

/** Canlıdan (25 Ekim): danfoss-vlt-hvac-basic-drive-fc-101, `description` (199 / 211 karakter, tek cümle). */
const DANFOSS_TR =
  'Danfoss VLT HVAC Basic Drive FC101, HVAC uygulamalarına özel fonksiyonlar, EMC filtre, otomatik enerji optimizasyonu ve akıllı logic kontrolör sunan bir frekans konvertörü (motor sürücüsü) serisidir.'
const DANFOSS_EN =
  'The Danfoss VLT HVAC Basic Drive FC101 is a frequency converter (motor drive) series offering functions dedicated to HVAC applications, an EMC filter, automatic energy optimization, and a smart logic controller.'

function detayKur(aciklama: { tr: string; en: string }, meta: { tr: string; en: string } | null = null) {
  return {
    family: {
      id: 'f1',
      name: 'Danfoss VLT HVAC Basic Drive FC 101',
      name_i18n: { tr: 'Danfoss VLT HVAC Basic Drive FC 101', en: 'Danfoss VLT HVAC Basic Drive FC 101' },
      slug: 'danfoss-vlt-hvac-basic-drive-fc-101',
      series_code: null,
      description: aciklama,
      brand_name: 'Danfoss',
      category_id: null,
      subcategory_id: null,
      meta_title: null,
      meta_description: meta,
      category: null,
      subcategory: null,
    },
    variants: [],
    price_tax_included: null,
  }
}

beforeEach(() => {
  durum.detail = null
})

describe('aile meta açıklaması: cümle ortasında kesilmez', () => {
  it.each([
    ['tr', DANFOSS_TR],
    ['en', DANFOSS_EN],
  ] as const)('%s: tek uzun cümle (azami < uzunluk <= esnek tavan) TAM döner, og:description aynı, "…" yok', async (lang, ham) => {
    expect(ham.length).toBeGreaterThan(ACIKLAMA_AZAMI)
    expect(ham.length).toBeLessThanOrEqual(ACIKLAMA_ESNEK_AZAMI)
    durum.detail = detayKur({ tr: DANFOSS_TR, en: DANFOSS_EN })
    const m = await aileSayfasiUstVerisi(lang, 'danfoss-vlt-hvac-basic-drive-fc-101')
    expect(m.description).toBe(ham)
    expect(m.openGraph?.description).toBe(ham)
    expect(String(m.description)).not.toMatch(/…$/)
    expect(String(m.description)).toMatch(/\.$/)
  })

  it('azami içinde tam cümle varsa o cümlede biter (ikinci cümle eklenmez)', async () => {
    const s1 = 'Bu fan ailesi kanal hattına seri bağlanır ve asma tavan arasında görünmeden sessizce çalışır, bakım istemez.'
    const s2 = 'İkinci cümle ise ayrıca bir motor koruma sensörü ve uzaktan okunabilir hata ekranı içerir, uzun ömürlüdür.'
    expect(s1.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(s1.length + 1 + s2.length).toBeGreaterThan(ACIKLAMA_AZAMI)
    durum.detail = detayKur({ tr: `${s1} ${s2}`, en: `${s1} ${s2}` })
    const m = await aileSayfasiUstVerisi('tr', 'danfoss-vlt-hvac-basic-drive-fc-101')
    expect(m.description).toBe(s1)
    expect(m.openGraph?.description).toBe(s1)
  })

  it('ilk cümle esnek tavanı da aşıyorsa dürüst kesik: azami içinde, sözcük sınırında, "…"', async () => {
    const cok = `${'Bu cümle kanal hattında yüksek verimle çalışan fan ailesini ayrıntılı biçimde anlatır, '.repeat(5)}ve sonunda biter.`
    expect(cok.length).toBeGreaterThan(ACIKLAMA_ESNEK_AZAMI)
    durum.detail = detayKur({ tr: cok, en: cok })
    const m = await aileSayfasiUstVerisi('tr', 'danfoss-vlt-hvac-basic-drive-fc-101')
    const d = String(m.description)
    expect(d.endsWith('…')).toBe(true)
    expect(d.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
  })

  it('dolu meta_description zincirde önde gelir ve aynı kırpıcıdan geçer', async () => {
    durum.detail = detayKur({ tr: DANFOSS_TR, en: DANFOSS_EN }, { tr: 'Elle yazılmış kısa açıklama.', en: 'Hand-written short description.' })
    const m = await aileSayfasiUstVerisi('tr', 'danfoss-vlt-hvac-basic-drive-fc-101')
    expect(m.description).toBe('Elle yazılmış kısa açıklama.')
  })
})
