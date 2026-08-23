import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-FANOUT-FAMILY-1 — `brands` ve `price_lists` dalları AİLE TÜRÜNE KÖR olmalıdır.
 *
 * NİÇİN BU TEST VAR (ölçüm 2026-08-22):
 * T138 model katmanı geldiğinde "bu iki dal model→seri fan-out yapmıyor" diye bir kalem
 * taşıdım. Canlı DB'de ölçünce **eksik çıkmadı**: her iki sorgu da `product_families`
 * üzerinde tür filtresi kullanmıyor, dolayısıyla seri (parent NULL) ve model (parent dolu)
 * satırlarının ikisi de doğal olarak kapsanıyor (6 model, 6'sı da serisiyle aynı markada).
 *
 * Yani eksik olan **fan-out değil, fan-out'un KAPISIYDI.** Bu davranış bugün bir
 * tesadüfe dayanıyor: sorguda filtre YOK. Yarın biri performans kaygısıyla ya da
 * "landing yalnız seri sayfasıdır" düşüncesiyle `.is('parent_family_id', null)` eklerse,
 * model sayfaları sessizce bayatlar — ne tip hatası ne kırmızı test verir, yalnız vitrin
 * eski fiyatı göstermeye devam eder. Bu test tam o değişikliği kırmızıya çevirir.
 *
 * KAPSAM KANARYASI: fixture'da bilerek BİR MODEL ailesi var. Sorgu tür filtresi
 * kazanırsa (a) testi düşer.
 */

type FamilyRow = {
  id: string
  slug: string | null
  brand_id: string | null
  parent_family_id: string | null
  deleted_at: string | null
}

const revalidateTagMock = vi.fn()
const revalidatePathMock = vi.fn()

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}))

/**
 * Bu dalların sorgusu `.single()` DEĞİL, doğrudan `await builder` ile tüketiliyor
 * (çok satır döner). Bu yüzden mock builder **thenable** olmalı; ayrıca `eq`/`is`
 * filtrelerini GERÇEKTEN uygular — aksi halde "silinmiş aile tazelenmez" gibi bir
 * iddia ölçülmüş olmaz, yalnız çağrının yapıldığı görülmüş olurdu.
 */
const { familyRows } = vi.hoisted(() => ({ familyRows: [] as FamilyRow[] }))

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: (table: string) => {
      const filters: Array<(row: FamilyRow) => boolean> = []
      const run = (): { data: FamilyRow[]; error: null } => {
        if (table !== 'product_families') return { data: [], error: null }
        return { data: familyRows.filter((r) => filters.every((f) => f(r))), error: null }
      }
      const builder = {
        select: () => builder,
        eq: (col: keyof FamilyRow, val: unknown) => {
          filters.push((r) => r[col] === val)
          return builder
        },
        is: (col: keyof FamilyRow, val: unknown) => {
          filters.push((r) => r[col] === val)
          return builder
        },
        single: async () => {
          const rows = run().data
          return { data: rows[0] ?? null, error: null }
        },
        then: (resolve: (value: { data: FamilyRow[]; error: null }) => unknown) => resolve(run()),
      }
      return builder
    },
  },
}))

const WEBHOOK_SECRET = 'test-webhook-secret-mock'

function buildRequest(payload: unknown): NextRequest {
  return new NextRequest('http://localhost/api/webhook/supabase', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-webhook-secret': WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
  })
}

const SERI: FamilyRow = {
  id: 'f-seri',
  slug: 'vortice-lineo-quiet',
  brand_id: 'b-vortice',
  parent_family_id: null,
  deleted_at: null,
}
/** ⚠ KANARYA: bu satır MODEL. Sorgu tür filtresi kazanırsa (a) testi düşer. */
const MODEL: FamilyRow = {
  id: 'f-model',
  slug: 'vortice-lineo-100-quiet',
  brand_id: 'b-vortice',
  parent_family_id: 'f-seri',
  deleted_at: null,
}
const BASKA_MARKA: FamilyRow = {
  id: 'f-seat',
  slug: 'seat-storm-jet',
  brand_id: 'b-seat',
  parent_family_id: null,
  deleted_at: null,
}
const SILINMIS: FamilyRow = {
  id: 'f-del',
  slug: 'kaldirilmis-aile',
  brand_id: 'b-vortice',
  parent_family_id: null,
  deleted_at: '2026-01-01T00:00:00Z',
}

describe('POST /api/webhook/supabase — INV-FANOUT-FAMILY-1 (brands / price_lists aile fan-out)', () => {
  const originalSecret = process.env.SUPABASE_WEBHOOK_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('SUPABASE_WEBHOOK_SECRET', WEBHOOK_SECRET)
    familyRows.length = 0
    familyRows.push(SERI, MODEL, BASKA_MARKA, SILINMIS)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    if (originalSecret === undefined) {
      delete process.env.SUPABASE_WEBHOOK_SECRET
    } else {
      process.env.SUPABASE_WEBHOOK_SECRET = originalSecret
    }
  })

  it('(a) brands → markanin SERI *ve* MODEL ailelerinin PDP yollari (TR+EN) tazelenir', async () => {
    const { POST } = await import('../route')

    const res = await POST(
      buildRequest({
        type: 'UPDATE',
        table: 'brands',
        schema: 'public',
        record: { id: 'b-vortice', name: 'Vortice' },
        old_record: { id: 'b-vortice', name: 'Vortice A.S.' },
      })
    )
    const json = await res.json()

    for (const lang of ['tr', 'en']) {
      expect(json.revalidatedPaths).toContain(`/${lang}/products/${SERI.slug}`)
      // Kanarya: model yolu düşerse fan-out tür filtresi kazanmış demektir.
      expect(json.revalidatedPaths).toContain(`/${lang}/products/${MODEL.slug}`)
    }
  })

  it('(b) brands → BASKA markanin ailesi tazelenmez (fan-out markayla sinirli)', async () => {
    const { POST } = await import('../route')

    const res = await POST(
      buildRequest({
        type: 'UPDATE',
        table: 'brands',
        schema: 'public',
        record: { id: 'b-vortice', name: 'Vortice' },
        old_record: null,
      })
    )
    const json = await res.json()

    expect(json.revalidatedPaths).not.toContain(`/tr/products/${BASKA_MARKA.slug}`)
    expect(json.revalidatedPaths).not.toContain(`/en/products/${BASKA_MARKA.slug}`)
  })

  it('(c) brands → silinmis aile (deleted_at dolu) tazelenmez', async () => {
    const { POST } = await import('../route')

    const res = await POST(
      buildRequest({
        type: 'UPDATE',
        table: 'brands',
        schema: 'public',
        record: { id: 'b-vortice', name: 'Vortice' },
        old_record: null,
      })
    )
    const json = await res.json()

    expect(json.revalidatedPaths).not.toContain(`/tr/products/${SILINMIS.slug}`)
  })

  it('(d) price_lists → TUM aktif aileler (seri + model, marka ayrimi yok); silinmis haric', async () => {
    const { POST } = await import('../route')

    const res = await POST(
      buildRequest({
        type: 'UPDATE',
        table: 'price_lists',
        schema: 'public',
        record: { id: 'pl-1', name: 'Bayi 2026' },
        old_record: null,
      })
    )
    const json = await res.json()

    for (const slug of [SERI.slug, MODEL.slug, BASKA_MARKA.slug]) {
      expect(json.revalidatedPaths).toContain(`/tr/products/${slug}`)
      expect(json.revalidatedPaths).toContain(`/en/products/${slug}`)
    }
    expect(json.revalidatedPaths).not.toContain(`/tr/products/${SILINMIS.slug}`)
  })

  it('(e) price_lists → kesif taglerine DOKUNMAZ (fiyat yalniz PDP yuzeyinde)', async () => {
    const { POST } = await import('../route')

    await POST(
      buildRequest({
        type: 'UPDATE',
        table: 'price_lists',
        schema: 'public',
        record: { id: 'pl-1' },
        old_record: null,
      })
    )

    expect(revalidateTagMock).not.toHaveBeenCalledWith('products-discovery')
    expect(revalidateTagMock).not.toHaveBeenCalledWith('home-data')
  })
})
