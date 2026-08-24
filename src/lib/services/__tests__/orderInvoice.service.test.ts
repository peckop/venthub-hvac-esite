import { describe, expect, it, vi } from 'vitest'

import {
  createInvoice,
  listInvoices,
  listUninvoicedPaidOrders,
} from '@/lib/services/orderInvoice.service'

/**
 * FATURA DEFTERİ SERVİSİ — davranış testi (T132-VH).
 *
 * Buradaki asıl iddia şu: servis **sessizce boş değer üretmez**. `order_invoices` tipleri
 * migration prod'a inene kadar `database.types.ts` içinde yok; dönen satırlar çalışma
 * anında okunuyor. Böyle bir yerde en sinsi kusur, alan adı değiştiğinde/kaybolduğunda
 * satırın boş dizelerle dolu olarak "başarıyla" dönmesidir — ekran boş görünür, hata yoktur,
 * kimse bakmaz. Bu yüzden zorunlu alan eksikse eşleyici HATA verir ve R3 bunu ölçer.
 */

interface SahteCevap {
  data?: unknown
  error?: { message: string } | null
  count?: number | null
}

/** Zincirlenebilir sahte sorgu: her ara çağrı kendini döndürür, sonunda cevaba çözülür. */
function sahteIstemci(cevap: SahteCevap, kayit?: { son?: Record<string, unknown> }) {
  const sonuc = {
    data: cevap.data ?? null,
    error: cevap.error ?? null,
    count: cevap.count ?? null,
  }
  const builder: Record<string, unknown> = {}
  const zincir = () => builder
  for (const ad of ['select', 'order', 'range', 'eq', 'limit']) builder[ad] = vi.fn(zincir)
  builder.insert = vi.fn((payload: Record<string, unknown>) => {
    if (kayit) kayit.son = payload
    return builder
  })
  builder.single = vi.fn(() => Promise.resolve(sonuc))
  builder.then = (cb: (v: typeof sonuc) => unknown) => Promise.resolve(sonuc).then(cb)

  return {
    from: vi.fn(() => builder),
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'admin-1' } } })) },
  }
}

const TAM_SATIR = {
  id: 'inv-1',
  order_id: 'ord-1',
  invoice_no: 'VH2026000001',
  invoice_date: '2026-08-20',
  invoice_type: 'individual',
  issued_by: 'admin-1',
  note: null,
  created_at: '2026-08-20T09:00:00Z',
}

describe('orderInvoice.service', () => {
  it('R1 — defter satırları okunur ve sayaç aktarılır', async () => {
    const istemci = sahteIstemci({ data: [TAM_SATIR], count: 1 })
    const { rows, count } = await listInvoices(istemci as never)

    expect(count).toBe(1)
    expect(rows).toHaveLength(1)
    expect(rows[0].invoice_no).toBe('VH2026000001')
    expect(rows[0].note).toBeNull()
    expect(istemci.from).toHaveBeenCalledWith('order_invoices')
  })

  it('R2 — faturasız sipariş listesi VIEW’dan okunur (istemcide süzülmez)', async () => {
    const istemci = sahteIstemci({
      data: [
        {
          id: 'ord-9',
          order_number: 'VH-9',
          created_at: '2026-08-20T08:00:00Z',
          total_amount: '1250.5',
          customer_name: 'Test',
          customer_email: 't@example.com',
          invoice_type: 'corporate',
        },
      ],
    })

    const rows = await listUninvoicedPaidOrders(istemci as never)

    // Filtre DB'de: servis "faturalanmış mı" diye ikinci bir sorgu ATMAZ.
    expect(istemci.from).toHaveBeenCalledTimes(1)
    expect(istemci.from).toHaveBeenCalledWith('view_admin_uninvoiced_orders')
    // PostgREST numeric alanı metin olarak dönebilir; sayıya çevrildiğini ölç.
    expect(rows[0].total_amount).toBe(1250.5)
  })

  it('R3 — ASIL İDDİA: zorunlu alan eksikse SESSİZCE boş satır üretmez, hata verir', async () => {
    const eksik = { ...TAM_SATIR, invoice_no: undefined }
    const istemci = sahteIstemci({ data: [eksik] })

    await expect(listInvoices(istemci as never)).rejects.toThrow(/invoice_no/)
  })

  it('R4 — fatura numarası kırpılır, boş not NULL olur, kesen kullanıcı yazılır', async () => {
    const kayit: { son?: Record<string, unknown> } = {}
    const istemci = sahteIstemci({ data: TAM_SATIR }, kayit)

    await createInvoice(istemci as never, {
      orderId: 'ord-1',
      invoiceNo: '  VH2026000001  ',
      invoiceDate: '2026-08-20',
      invoiceType: 'individual',
      note: '   ',
    })

    expect(kayit.son?.invoice_no).toBe('VH2026000001')
    expect(kayit.son?.note).toBeNull()
    expect(kayit.son?.issued_by).toBe('admin-1')
  })

  it('R5 — boş fatura numarası DB’ye hiç gitmez', async () => {
    const istemci = sahteIstemci({ data: TAM_SATIR })

    await expect(
      createInvoice(istemci as never, {
        orderId: 'ord-1',
        invoiceNo: '   ',
        invoiceDate: '2026-08-20',
      }),
    ).rejects.toThrow(/boş olamaz/)

    expect(istemci.from).not.toHaveBeenCalled()
  })

  it('R6 — DB hatası yutulmaz', async () => {
    const istemci = sahteIstemci({ error: { message: 'duplicate key value' } })
    await expect(listInvoices(istemci as never)).rejects.toMatchObject({
      message: 'duplicate key value',
    })
  })
})
