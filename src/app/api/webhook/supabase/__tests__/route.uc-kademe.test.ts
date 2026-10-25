import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * URN-144 (karar 410) — üç kademeli kategori ağacında tazeleme kümesi.
 *
 * (1) KÖK adı/slug'ı değişince yalnız doğrudan çocuklar değil TORUN (yaprak) sayfaları da tazelenir: yaprak
 *     kırıntısında kökün adı ve bağlantısı yer alır.
 * (2) Ürün değişimi ata zincirinin sayfalarını da tazeler; ürün sütunları KARMA olabilir (category_id = orta,
 *     subcategory_id = yaprak) — kök kimliği sütunlarda hiç geçmeyebilir.
 * (3) İki kademede küme DEĞİŞMEZ (route.tags.test.ts DEĞİŞMEDEN yeşil kalır; burada ayrıca sabitlenir).
 *
 * Kimlikler ve slug'lar test verisidir.
 */
const revalidatePathMock = vi.fn()
const revalidateTagMock = vi.fn()

vi.mock('next/cache', () => ({
  revalidateTag: (...a: unknown[]) => revalidateTagMock(...a),
  revalidatePath: (...a: unknown[]) => revalidatePathMock(...a),
}))

type Satir = { id: string; slug: string | null; metadata?: unknown; parent_id: string | null }

const depo = vi.hoisted(() => ({
  satirlar: new Map<string, { id: string; slug: string | null; metadata?: unknown; parent_id: string | null }>(),
  torunHatasi: { deger: null as string | null },
  tekSorgular: [] as string[],
}))

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: vi.fn((tablo: string) => {
      let kolon: string | undefined
      let deger: string | undefined
      const b = {
        select: vi.fn(() => b),
        eq: vi.fn((k: string, v: string) => {
          kolon = k
          deger = v
          return b
        }),
        is: vi.fn(() => b),
        order: vi.fn(() => b),
        limit: vi.fn(() => b),
        then: (coz: (v: { data: unknown; error: { message: string } | null }) => unknown) => {
          if (tablo === 'categories' && kolon === 'parent_id' && deger) {
            const cocuklar = [...depo.satirlar.values()].filter((s) => s.parent_id === deger)
            // Hata enjeksiyonu yalnız KÖK OLMAYAN bir satırın çocuk (torun) sorgusunda.
            const hata = depo.torunHatasi.deger !== null && depo.satirlar.get(deger)?.parent_id != null
            return coz({ data: hata ? null : cocuklar, error: hata ? { message: depo.torunHatasi.deger! } : null })
          }
          return coz({ data: undefined, error: null })
        },
        single: vi.fn(async () => {
          if (tablo === 'categories' && deger) {
            depo.tekSorgular.push(deger)
            return { data: depo.satirlar.get(deger) ?? null, error: null }
          }
          return { data: null, error: null }
        }),
      }
      return b
    }),
  },
}))

const SIR = 'test-webhook-secret-mock'
const istek = (govde: unknown) =>
  new NextRequest('http://localhost/api/webhook/supabase', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-webhook-secret': SIR },
    body: JSON.stringify(govde),
  })

const meta = (tr: string, en: string) => ({ slug: { tr, en } })
const KOK: Satir = { id: 'k', slug: 'accessories', metadata: meta('aksesuarlar', 'accessories'), parent_id: null }
const ORTA: Satir = { id: 'o', slug: 'control-systems', metadata: meta('elektrik-aksesuarlari', 'control-systems'), parent_id: 'k' }
const YAPRAK: Satir = { id: 'y', slug: 'frequency-converters', metadata: meta('frekans-konvertorleri', 'frequency-converters'), parent_id: 'o' }
const YAPRAK2: Satir = { id: 'y2', slug: 'speed-controllers', metadata: meta('hiz-kontrol', 'speed-controllers'), parent_id: 'o' }
const YAPRAK3: Satir = { id: 'y3', slug: 'spare-parts-sensors', metadata: meta('sensorler-ve-koruma', 'spare-parts-sensors'), parent_id: 'm' }
const MEKANIK: Satir = { id: 'm', slug: 'mechanical-accessories', metadata: meta('mekanik-aksesuarlar', 'mechanical-accessories'), parent_id: 'k' }

const yollar = () => revalidatePathMock.mock.calls.map((c) => String(c[0]))
const yaprakYollari = (tr: string, en: string) => [`/tr/kategori/${tr}`, `/en/category/${en}`, `/tr/category/${tr}`]

describe('URN-144 — webhook tazeleme kümesi, üç kademe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('SUPABASE_WEBHOOK_SECRET', SIR)
    depo.satirlar = new Map([KOK, ORTA, YAPRAK, YAPRAK2, MEKANIK, YAPRAK3].map((s) => [s.id, s]))
    depo.torunHatasi.deger = null
    depo.tekSorgular.length = 0
  })
  afterEach(() => vi.unstubAllEnvs())

  it('(a) KÖK adı değişti: doğrudan çocuklar (orta, mekanik) VE torunlar (yapraklar) tazelenir', async () => {
    const { POST } = await import('../route')
    const kayit = (ad: string) => ({ ...KOK, name: ad, tenant_id: 't' })
    const res = await POST(istek({ type: 'UPDATE', table: 'categories', schema: 'public', record: kayit('Aksesuarlar'), old_record: kayit('Accessories') }))
    const json = (await res.json()) as { revalidatedPaths: string[]; fanoutTruncated: boolean }
    expect(res.status).toBe(200)
    expect(yollar()).toEqual(
      expect.arrayContaining([
        ...yaprakYollari('elektrik-aksesuarlari', 'control-systems'),
        ...yaprakYollari('mekanik-aksesuarlar', 'mechanical-accessories'),
        ...yaprakYollari('frekans-konvertorleri', 'frequency-converters'),
        ...yaprakYollari('hiz-kontrol', 'speed-controllers'),
        ...yaprakYollari('sensorler-ve-koruma', 'spare-parts-sensors'),
      ])
    )
    expect(json.revalidatedPaths).toEqual(expect.arrayContaining(yaprakYollari('frekans-konvertorleri', 'frequency-converters')))
    expect(json.fanoutTruncated).toBe(false)
    expect(new Set(yollar()).size).toBe(yollar().length)
  })

  it('(b) ORTA kademe adı değişti: yalnız kendi yaprakları (kök satırında değil: ek halka inilmez)', async () => {
    const { POST } = await import('../route')
    const kayit = (ad: string) => ({ ...ORTA, name: ad, tenant_id: 't' })
    await POST(istek({ type: 'UPDATE', table: 'categories', schema: 'public', record: kayit('Elektrik'), old_record: kayit('Control') }))
    expect(yollar()).toEqual(expect.arrayContaining(yaprakYollari('frekans-konvertorleri', 'frequency-converters')))
    expect(yollar().some((p) => p.includes('sensorler-ve-koruma'))).toBe(false)
  })

  it('(c) torun sorgusu HATASI yutulmaz: yanıt 500, kök ve çocuk yolları yine tazelenir', async () => {
    depo.torunHatasi.deger = 'ağ yok'
    const { POST } = await import('../route')
    const kayit = (ad: string) => ({ ...KOK, name: ad, tenant_id: 't' })
    const res = await POST(istek({ type: 'UPDATE', table: 'categories', schema: 'public', record: kayit('A'), old_record: kayit('B') }))
    const json = (await res.json()) as { error?: string }
    expect(res.status).toBe(500)
    expect(json.error).toContain('torun sorgusu')
    expect(yollar()).toEqual(expect.arrayContaining(yaprakYollari('elektrik-aksesuarlari', 'control-systems')))
  })

  it('(d) KARMA SÜTUN: ürün category_id = orta, subcategory_id = yaprak → KÖK sayfası da tazelenir', async () => {
    const { POST } = await import('../route')
    const urun = (ek: Record<string, unknown>) => ({ id: 'p', sku: 'S1', status: 'active', tenant_id: 't', ...ek })
    await POST(istek({
      type: 'UPDATE', table: 'products', schema: 'public',
      record: urun({ category_id: 'o', subcategory_id: 'y', name: 'B' }),
      old_record: urun({ category_id: 'o', subcategory_id: 'y', name: 'A' }),
    }))
    expect(yollar()).toEqual(
      expect.arrayContaining([
        ...yaprakYollari('frekans-konvertorleri', 'frequency-converters'),
        ...yaprakYollari('elektrik-aksesuarlari', 'control-systems'),
        ...yaprakYollari('aksesuarlar', 'accessories'), // sütunlarda YOK; ata zincirinden
      ])
    )
    // Aynı kimlik iki kez sorgulanmaz (istek-içi önbellek).
    const sayim = new Map<string, number>()
    for (const id of depo.tekSorgular) sayim.set(id, (sayim.get(id) ?? 0) + 1)
    expect([...sayim.values()].every((n) => n === 1)).toBe(true)
  })

  it('(e) yalnız yaprak sütunda (category_id = yaprak): orta VE kök sayfaları ata zincirinden tazelenir', async () => {
    const { POST } = await import('../route')
    const urun = (ek: Record<string, unknown>) => ({ id: 'p', sku: 'S1', status: 'active', tenant_id: 't', ...ek })
    await POST(istek({
      type: 'UPDATE', table: 'products', schema: 'public',
      record: urun({ category_id: 'y', name: 'B' }), old_record: urun({ category_id: 'y', name: 'A' }),
    }))
    expect(yollar()).toEqual(
      expect.arrayContaining([
        ...yaprakYollari('elektrik-aksesuarlari', 'control-systems'),
        ...yaprakYollari('aksesuarlar', 'accessories'),
      ])
    )
  })

  it('(f) İKİ KADEME: ürün (kök + alt sütunu) kümesi eskisiyle aynı; ek ata yolu yok', async () => {
    depo.satirlar = new Map([
      ['f', { id: 'f', slug: 'fans', metadata: meta('fanlar', 'fans'), parent_id: null }],
      ['a', { id: 'a', slug: 'duct-fans', metadata: meta('kanal-tipi-fanlar', 'duct-fans'), parent_id: 'f' }],
    ])
    const { POST } = await import('../route')
    const urun = (ek: Record<string, unknown>) => ({ id: 'p', sku: 'S1', status: 'active', tenant_id: 't', ...ek })
    await POST(istek({
      type: 'UPDATE', table: 'products', schema: 'public',
      record: urun({ category_id: 'f', subcategory_id: 'a', name: 'B' }),
      old_record: urun({ category_id: 'f', subcategory_id: 'a', name: 'A' }),
    }))
    const kategoriYollari = yollar().filter((p) => /\/(kategori|category)\//.test(p))
    // Beklenen = iki kimliğin KENDİ yolları (TR/EN görünen slug + kanonik EN slug, iki şema); kök zaten category_id.
    const kendi = (tr: string, en: string) => [
      ...yaprakYollari(tr, en), `/tr/category/${en}`, `/tr/kategori/${en}`,
    ]
    expect(new Set(kategoriYollari)).toEqual(
      new Set([...kendi('fanlar', 'fans'), ...kendi('kanal-tipi-fanlar', 'duct-fans')])
    )
  })

  it('(g) döngülü ata verisi sonsuz döngüye girmez', async () => {
    depo.satirlar = new Map([
      ['a', { id: 'a', slug: 'a-slug', metadata: null, parent_id: 'b' }],
      ['b', { id: 'b', slug: 'b-slug', metadata: null, parent_id: 'a' }],
    ])
    const { POST } = await import('../route')
    const urun = (ek: Record<string, unknown>) => ({ id: 'p', sku: 'S1', status: 'active', tenant_id: 't', ...ek })
    const res = await POST(istek({
      type: 'UPDATE', table: 'products', schema: 'public',
      record: urun({ category_id: 'a', name: 'B' }), old_record: urun({ category_id: 'a', name: 'A' }),
    }))
    expect(res.status).toBe(200)
    expect(yollar()).toEqual(expect.arrayContaining(['/tr/category/a-slug', '/tr/category/b-slug']))
  })
})
