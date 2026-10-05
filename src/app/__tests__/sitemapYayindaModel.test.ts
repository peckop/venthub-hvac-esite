import { afterEach, describe, expect, it, vi } from 'vitest'

import { sentetikVeri, yayindaModuluSahtele } from '@/config/__tests__/yayindaTestKiti'
import type { YayindaVeri as Veri } from '@/config/yayindaModeller'

/**
 * INV-YAYINDA-MODEL-3 — site haritasındaki model satırları = yayındaki liste ∩ aktif modeller (URN-31).
 *
 * K3B AÇIKKEN haritaya yalnız `sitemapModelMi(sku)` olan modeller girer: liste dışı model sayfası yok
 * (404), sürüm sayfası kanoniği temel modele (haritada ilan edilmez), boş liste = sıfır model satırı.
 * Adres BİÇİMİNDEN bağımsız: beklenen adresler aynı `adresUret` örneğinden alınır.
 * Fikstür = 5 aileye dağılmış 40 aktif model + arşivli + silinmiş satır; DB istemcisi sahte,
 * `getFamilySitemapData` GERÇEK koşar (aktiflik süzgeci servisin kendi kodunda ölçülür).
 */

type ModelSatiri = { sku: string; updated_at: string | null; status: string; deleted_at: string | null }
type AileSatiri = { slug: string; updated_at: string; products: ModelSatiri[] }

const sku = (n: number) => `TST-${String(n).padStart(4, '0')}`
const damga = (n: number) => new Date(Date.UTC(2026, 8, 1) + n * 3_600_000).toISOString()

function fikstur(): AileSatiri[] {
  const aileler: AileSatiri[] = Array.from({ length: 5 }, (_, i) => ({
    slug: `test-aile-${i + 1}`,
    updated_at: '2026-08-27T00:00:00.000Z',
    products: [],
  }))
  for (let n = 1; n <= 40; n++) {
    aileler[n % 5].products.push({ sku: sku(n), updated_at: damga(n), status: 'active', deleted_at: null })
  }
  aileler[0].products.push({ sku: 'TST-ARSIV', updated_at: damga(99), status: 'archived', deleted_at: null })
  aileler[1].products.push({ sku: 'TST-SILINMIS', updated_at: damga(98), status: 'active', deleted_at: '2026-09-30T00:00:00.000Z' })
  return aileler
}

/** Listede 4 temel model (3 ailede) + 1 sürüm + arşivli ve silinmiş SKU'lar (DB'de pasif) + DB'de olmayan SKU. */
const LISTE: Veri = sentetikVeri({
  modeller: {
    'test-aile-1': [sku(10), sku(5), 'TST-ARSIV'].sort(),
    'test-aile-2': [sku(1), 'TST-SILINMIS', 'TST-YOKTA'].sort(),
    'test-aile-3': [sku(2)],
  },
  surumler: { [sku(7)]: sku(2) },
})
const BOS: Veri = sentetikVeri()
const AKTIF_LISTEDE = [sku(5), sku(10), sku(1), sku(2)]

async function harita(k: { aileler: AileSatiri[]; enYayin: boolean; k3b: boolean; liste: Veri }) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://gercek.supabase.co')
  vi.doMock('@/config/features', async (orijinal) => ({
    ...(await orijinal<typeof import('@/config/features')>()),
    EN_YAYIN: k.enYayin,
    ADRES_SEMASI_K3B: k.k3b,
  }))
  vi.doMock('@/config/yayindaModeller', async (orijinal) =>
    yayindaModuluSahtele(await orijinal<typeof import('@/config/yayindaModeller')>(), () => k.liste),
  )
  vi.doMock('@/lib/supabase/static', () => {
    const zincir = {
      select: () => zincir,
      is: () => zincir,
      range: async () => ({ data: k.aileler, error: null }),
    }
    return {
      supabaseStaticClient: {
        from: () => zincir,
        rpc: async () => ({ data: [{ category_id: 'k1', product_count: 3 }], error: null }),
      },
    }
  })
  vi.doMock('@/lib/services/category.service', () => ({
    getCategories: async () => [
      { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
    ],
  }))
  vi.doMock('@/lib/services/family.service', async (orijinal) => ({
    ...(await orijinal<typeof import('@/lib/services/family.service')>()),
    getAllFamilySlugs: async () => k.aileler.map((a) => ({ slug: a.slug })),
  }))
  const { SITE_URL } = await import('../../config/siteUrl')
  const { adresUret } = await import('../../utils/adresUret')
  const { default: sitemap } = await import('../sitemap')
  const satirlar = await sitemap()
  const modelUrl = (aile: string, s: string, dil: 'tr' | 'en' = 'tr') =>
    `${SITE_URL}${adresUret({ tur: 'model', aileSlug: aile, sku: s }, dil, true)}`
  return { satirlar, base: SITE_URL, modelUrl }
}

const aileOf = (s: string) => (fikstur().find((a) => a.products.some((p) => p.sku === s)) as AileSatiri).slug
const urlSeti = (satirlar: { url: string }[]) => new Set(satirlar.map((s) => s.url))

describe('INV-YAYINDA-MODEL-3 — site haritası modelleri = liste ∩ aktif', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    for (const m of ['@/config/features', '@/config/yayindaModeller', '@/lib/supabase/static', '@/lib/services/category.service', '@/lib/services/family.service']) {
      vi.doUnmock(m)
    }
    vi.resetModules()
  })

  it('K3B açık: model satırları TAM olarak listedeki aktif temel modeller (sürüm, liste dışı, arşivli, silinmiş, DB\'de olmayan YOK)', async () => {
    const { satirlar, modelUrl } = await harita({ aileler: fikstur(), enYayin: false, k3b: true, liste: LISTE })
    const bos = await harita({ aileler: fikstur(), enYayin: false, k3b: true, liste: BOS })
    const modelSatirlari = satirlar.filter((s) => !urlSeti(bos.satirlar).has(s.url))
    const beklenen = AKTIF_LISTEDE.map((s) => modelUrl(aileOf(s), s)).sort()
    expect(modelSatirlari.map((s) => s.url).sort()).toEqual(beklenen)
    // Sürüm kendi adresiyle haritada YOK (kanonik temele gider).
    expect(urlSeti(satirlar).has(modelUrl(aileOf(sku(7)), sku(7)))).toBe(false)
    expect(satirlar.some((s) => s.url.includes('?sku='))).toBe(false)
  })

  it('EN_YAYIN açık: her model iki dilde; hreflang eşi satırın kendi adresini içerir', async () => {
    const { satirlar, modelUrl } = await harita({ aileler: fikstur(), enYayin: true, k3b: true, liste: LISTE })
    for (const s of AKTIF_LISTEDE) {
      for (const dil of ['tr', 'en'] as const) {
        const satir = satirlar.find((r) => r.url === modelUrl(aileOf(s), s, dil))
        expect(satir, `${s} ${dil}`).toBeDefined()
        const diller = (satir?.alternates as { languages?: Record<string, string> } | undefined)?.languages
        expect(Object.values(diller ?? {})).toContain(satir?.url)
      }
    }
  })

  it('FAIL-CLOSED: boş liste → sıfır model satırı (441 değil, hiç)', async () => {
    const bos = await harita({ aileler: fikstur(), enYayin: false, k3b: true, liste: BOS })
    // Modelsiz fikstür (her ailede yalnız EN SON güncellenen model): çıktı bayt bayt aynı olmalı.
    const modelsiz = await harita({
      aileler: fikstur().map((a) => {
        const aktif = a.products.filter((p) => p.status === 'active' && p.deleted_at === null)
        const enSon = aktif.reduce((x, y) => (Date.parse(y.updated_at ?? '') > Date.parse(x.updated_at ?? '') ? y : x))
        return { ...a, products: [enSon] }
      }),
      enYayin: false,
      k3b: true,
      liste: BOS,
    })
    expect(bos.satirlar).toEqual(modelsiz.satirlar)
  })

  it.each([false, true])('K3B KAPALI (EN_YAYIN %s): dolu liste ile boş liste harita çıktısı BAYT BAYT aynı', async (enYayin) => {
    const dolu = await harita({ aileler: fikstur(), enYayin, k3b: false, liste: LISTE })
    const bos = await harita({ aileler: fikstur(), enYayin, k3b: false, liste: BOS })
    expect(JSON.stringify(dolu.satirlar)).toBe(JSON.stringify(bos.satirlar))
  })

  it('liste dolu ama DB\'de hiçbiri aktif değil → model satırı uydurulmaz', async () => {
    const aileler = fikstur().map((a) => ({ ...a, products: a.products.filter((p) => p.status !== 'active' || p.deleted_at !== null) }))
    const { satirlar } = await harita({ aileler, enYayin: false, k3b: true, liste: LISTE })
    const bos = await harita({ aileler, enYayin: false, k3b: true, liste: BOS })
    expect(satirlar).toEqual(bos.satirlar)
  })
})
