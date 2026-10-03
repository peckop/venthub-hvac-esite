import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-SITEMAP-MODEL-1 — aktif MODELLER site haritasına girer, YALNIZ adres şeması bayrağı AÇIKKEN
 * (REC-300 Faz 3e-2, OPS hükmü 2026-10-02: model `lastModified` = `products.updated_at`, migration yok).
 *
 * NİÇİN: yeni şemada model kendi sayfasına sahip (`/tr/urun/<aile>-p-<sku>`, `/en/products/<aile>-p-<sku>`);
 * haritadan ilan edilmezse keşif yavaşlar. Bayrak KAPALIYKEN model adresi `?sku=` sorgusudur (aile sayfasının
 * kopyası) ve haritaya GİRMEZ — canlı harita bugünkü haliyle kalır.
 *
 * YÖNTEM: veritabanı istemcisi sahte; GERÇEK `getFamilySitemapData` koşar (arşiv/pasif model süzgeci ve
 * "tek sorgu" kuralı servisin kendi kodunda ölçülür, mock'lanmaz). Fikstür = 441 aktif model + arşivli
 * SEA-61102010 (canlıdaki durum, 2026-10-02 ölçümü) + silinmiş bir aktif satır.
 *
 * ÖLÇMEDİĞİ: gerçek DB verisi, canlı `sitemap.xml` boyutu (≈96 KB / 528 URL tahmini araştırma ölçümüdür),
 * Google'ın kümelenmiş lastmod'a tepkisi (GEO-SEO izleme listesi).
 */

type ModelSatiri = { sku: string; updated_at: string | null; status: string; deleted_at: string | null }
type AileSatiri = { slug: string; updated_at: string; products: ModelSatiri[] }

const AILE_SAYISI = 5
const AKTIF_MODEL = 441
const ARSIV_SKU = 'SEA-61102010'

const sku = (n: number) => `TST-${String(n).padStart(4, '0')}`
const damga = (n: number) => new Date(Date.UTC(2026, 8, 1, 0, 0, 0) + n * 3_600_000).toISOString()

/** 441 aktif model 5 aileye dağılır; arşivli model ve silinmiş aktif model de fikstürde durur. */
function fikstur(): AileSatiri[] {
  const aileler: AileSatiri[] = Array.from({ length: AILE_SAYISI }, (_, i) => ({
    slug: `test-aile-${i + 1}`,
    updated_at: '2026-08-27T00:00:00.000Z',
    products: [],
  }))
  for (let n = 1; n <= AKTIF_MODEL; n++) {
    aileler[n % AILE_SAYISI].products.push({ sku: sku(n), updated_at: damga(n), status: 'active', deleted_at: null })
  }
  aileler[0].products.push({ sku: ARSIV_SKU, updated_at: damga(999), status: 'archived', deleted_at: null })
  aileler[1].products.push({ sku: 'TST-SILINMIS', updated_at: damga(998), status: 'active', deleted_at: '2026-09-30T00:00:00.000Z' })
  return aileler
}

interface Kosul {
  aileler: AileSatiri[]
  enYayin: boolean
  k3b: boolean
}

async function harita(kosul: Kosul) {
  const cagrilar: string[] = []
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://gercek.supabase.co')
  vi.doMock('@/config/features', async (orijinal) => ({
    ...(await orijinal<typeof import('@/config/features')>()),
    EN_YAYIN: kosul.enYayin,
    ADRES_SEMASI_K3B: kosul.k3b,
  }))
  vi.doMock('@/lib/supabase/static', () => {
    const zincir = {
      select: () => zincir,
      is: () => zincir,
      range: async () => ({ data: kosul.aileler, error: null }),
    }
    return {
      supabaseStaticClient: {
        from: (tablo: string) => {
          cagrilar.push(tablo)
          return zincir
        },
        rpc: async () => ({ data: [{ category_id: 'k1', product_count: 3 }], error: null }),
      },
    }
  })
  vi.doMock('@/lib/services/category.service', () => ({
    getCategories: async () => [
      { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
    ],
  }))
  // Yalnız `getAllFamilySlugs` (ayrı RPC yolu) sahte; `getFamilySitemapData` GERÇEK koşar.
  vi.doMock('@/lib/services/family.service', async (orijinal) => ({
    ...(await orijinal<typeof import('@/lib/services/family.service')>()),
    getAllFamilySlugs: async () => kosul.aileler.map((a) => ({ slug: a.slug })),
  }))
  const { SITE_URL } = await import('../../config/siteUrl')
  const { default: sitemap } = await import('../sitemap')
  const satirlar = await sitemap()
  return { satirlar, base: SITE_URL, cagrilar }
}

const modelSatirlari = <T extends { url: string }>(satirlar: T[]) => satirlar.filter((s) => s.url.includes('-p-'))

describe('INV-SITEMAP-MODEL-1 — aktif modeller site haritasında, yalnız bayrak AÇIKKEN', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.doUnmock('@/config/features')
    vi.doUnmock('@/lib/supabase/static')
    vi.doUnmock('@/lib/services/category.service')
    vi.doUnmock('@/lib/services/family.service')
    vi.resetModules()
  })

  describe('bayrak AÇIK', () => {
    it('TR (EN_YAYIN kapalı): 441 model satırı; arşivli ve silinmiş model yok; adres /tr/urun/<aile>-p-<sku>', async () => {
      const { satirlar, base } = await harita({ aileler: fikstur(), enYayin: false, k3b: true })
      const modeller = modelSatirlari(satirlar)
      expect(modeller).toHaveLength(AKTIF_MODEL)
      const yollar = modeller.map((s) => s.url.replace(base, ''))
      expect(yollar.every((y) => /^\/tr\/urun\/test-aile-[1-5]-p-tst-\d{4}$/.test(y))).toBe(true)
      expect(yollar.join('\n')).not.toContain(ARSIV_SKU.toLowerCase())
      expect(yollar.join('\n')).not.toContain('tst-silinmis')
      expect(new Set(yollar).size).toBe(AKTIF_MODEL)
      // EN_YAYIN kapalıyken `/en` eşi ilan edilmez (REC-204/3e-3): model satırında alternates alanı HİÇ yok, EN satırı yok.
      expect(modeller.some((s) => 'alternates' in s)).toBe(false)
      expect(modeller.some((s) => s.url.startsWith(`${base}/en/`))).toBe(false)
    })

    it('EN_YAYIN açık: 882 model satırı (441 × 2 dil); EN adresi /en/products/<aile>-p-<sku>; hreflang eşi satırın kendi adresini içerir', async () => {
      const { satirlar, base } = await harita({ aileler: fikstur(), enYayin: true, k3b: true })
      const modeller = modelSatirlari(satirlar)
      expect(modeller).toHaveLength(AKTIF_MODEL * 2)
      const en = modeller.filter((s) => s.url.startsWith(`${base}/en/`))
      expect(en).toHaveLength(AKTIF_MODEL)
      expect(en.every((s) => /^\/en\/products\/test-aile-[1-5]-p-tst-\d{4}$/.test(s.url.replace(base, '')))).toBe(true)
      for (const s of modeller) {
        const langs = (s.alternates as { languages?: Record<string, string> } | undefined)?.languages
        expect(langs).toBeDefined()
        expect(Object.values(langs ?? {})).toContain(s.url)
      }
    })

    it('her model satırı modelin KENDİ updated_at tarihini taşır; changefreq YOK (REC-498), priority 0.8', async () => {
      const { satirlar } = await harita({ aileler: fikstur(), enYayin: false, k3b: true })
      for (let n = 1; n <= AKTIF_MODEL; n++) {
        const satir = satirlar.find((s) => s.url.endsWith(`-p-${sku(n).toLowerCase()}`))
        expect(satir?.lastModified && new Date(satir.lastModified).toISOString(), sku(n)).toBe(damga(n))
        expect(satir && 'changefreq' in satir).toBe(false)
        expect(satir && 'changeFrequency' in satir).toBe(false)
        expect(satir?.priority).toBe(0.8)
      }
    })

    it('modelin updated_at değeri yoksa lastModified alanı HİÇ yazılmaz (uydurma tarih yok)', async () => {
      const aileler = fikstur()
      aileler[2].products.push({ sku: 'TST-TARIHSIZ', updated_at: null, status: 'active', deleted_at: null })
      const { satirlar } = await harita({ aileler, enYayin: false, k3b: true })
      const satir = satirlar.find((s) => s.url.endsWith('-p-tst-tarihsiz'))
      expect(satir).toBeDefined()
      expect(satir && 'lastModified' in satir).toBe(false)
    })

    it('yeni DB sorgusu EKLENMEDİ: harita üretimi product_families tablosunu TEK kez okur, başka tabloya dokunmaz', async () => {
      const { cagrilar } = await harita({ aileler: fikstur(), enYayin: true, k3b: true })
      expect(cagrilar).toEqual(['product_families'])
    })
  })

  describe('bayrak KAPALI — harita bayt bayt aynı', () => {
    for (const enYayin of [false, true]) {
      it(`EN_YAYIN ${enYayin ? 'açık' : 'kapalı'}: 441 modelli fikstür ile modelsiz fikstür AYNI çıktıyı verir; hiçbir adreste -p- ya da ?sku= yok`, async () => {
        const modelli = await harita({ aileler: fikstur(), enYayin, k3b: false })
        // Modelsiz fikstür: her ailede yalnız EN SON güncellenen aktif model kalır → aile lastmod'u (aile + aktif
        // varyantların en son tarihi) modelli fikstürle AYNI kalır; fark yalnız model sayısıdır.
        const modelsiz = await harita({
          aileler: fikstur().map((a) => {
            const aktif = a.products.filter((p) => p.status === 'active' && p.deleted_at === null)
            const enSon = aktif.reduce((x, y) => (Date.parse(y.updated_at ?? '') > Date.parse(x.updated_at ?? '') ? y : x))
            return { ...a, products: [enSon] }
          }),
          enYayin,
          k3b: false,
        })
        expect(modelSatirlari(modelli.satirlar)).toEqual([])
        expect(modelli.satirlar.some((s) => s.url.includes('?sku='))).toBe(false)
        // TÜM satır (url, lastModified, alternates, priority) birebir: bayrak kapalıyken model verisi çıktıya sızmaz.
        expect(modelli.satirlar).toEqual(modelsiz.satirlar)
      })
    }
  })
})
