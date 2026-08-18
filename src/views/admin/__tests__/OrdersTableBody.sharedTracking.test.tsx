import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import OrdersTableBody from '../OrdersTableBody'

/**
 * PAYLAŞILAN TAKİP NUMARASI — SUNUCU REDDİ (409) SONRASI ONAY VE TEKRAR GÖNDERİM.
 *
 * ÖLÇÜLEN KUSUR (2026-08-17): `admin-update-shipping`, takip numarası BAŞKA bir
 * siparişte kayıtlıysa 409 `tracking_number_in_use` döner ve yalnız
 * `allow_shared_tracking: true` taşıyan isteği yazar. Hiçbir istemci bu bayrağı
 * göndermiyordu → sunucudaki kaçış kapısı ULAŞILAMAZDI ve admin yalnız "bazıları
 * başarısız" görüyordu; hangi kararın istendiğini bile bilmiyordu.
 *
 * `OrdersTableBody.bulkShipping.test.tsx` PARTİ İÇİ mükerrerliği ölçer (aynı numara
 * iki seçili siparişe yazılıyor). Bu dosya ondan farklı bir sınıfı ölçer: numara
 * SEÇİMİN DIŞINDAKİ bir siparişte kayıtlı — istemci bunu ÖNCEDEN bilemez, ancak
 * sunucunun 409'undan öğrenir. İki sınıf ayrı testler ister; biri diğerini kapsamaz.
 */

interface QueryChain {
  select: () => QueryChain
  order: () => QueryChain
  ilike: () => QueryChain
  eq: () => QueryChain
  in: () => QueryChain
  is: () => QueryChain
  gte: () => QueryChain
  lte: () => QueryChain
  range: () => Promise<unknown>
  limit: () => Promise<unknown>
  maybeSingle: () => Promise<unknown>
  single: () => Promise<unknown>
}

const sb = vi.hoisted(() => {
  const ordersData = [
    {
      id: 'order-1',
      status: 'confirmed',
      conversation_id: 'conv-1',
      total_amount: 1500,
      created_at: '2026-06-12T09:00:00.000Z',
      order_number: 'VH-2026-0001',
      customer_name: 'Ahmet Yılmaz',
      customer_email: 'ahmet@example.com',
      customer_phone: '+90 555 111 2233',
    },
    {
      id: 'order-2',
      status: 'confirmed',
      conversation_id: 'conv-2',
      total_amount: 2500,
      created_at: '2026-06-12T10:00:00.000Z',
      order_number: 'VH-2026-0002',
      customer_name: 'Zeynep Kaya',
      customer_email: 'zeynep@example.com',
      customer_phone: '+90 555 222 3344',
    },
  ]

  function makeChain(result: unknown): QueryChain {
    const chain: QueryChain = {
      select: () => chain,
      order: () => chain,
      ilike: () => chain,
      eq: () => chain,
      in: () => chain,
      is: () => chain,
      gte: () => chain,
      lte: () => chain,
      range: () => Promise.resolve(result),
      limit: () => Promise.resolve(result),
      maybeSingle: () => Promise.resolve(result),
      single: () => Promise.resolve(result),
    }
    return chain
  }

  const invoke = vi.fn().mockResolvedValue({ error: null })

  const client = {
    from(table: string): QueryChain {
      if (table === 'venthub_orders') {
        return makeChain({ data: { carrier: null, tracking_number: null }, error: null })
      }
      if (table === 'shipping_email_events') return makeChain({ data: [], error: null })
      if (table === 'order_notes') return makeChain({ data: [], error: null })
      return makeChain({ data: ordersData, count: ordersData.length, error: null })
    },
    functions: { invoke },
  }

  return { ordersData, invoke, client }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/lib/audit', () => ({ logAdminAction: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/ensureSessionFresh', () => ({ ensureSessionFresh: () => Promise.resolve() }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({
    canWrite: () => true,
    canAccess: () => true,
    isReadOnly: false,
    role: 'admin',
    loading: false,
    roleLoading: false,
  }),
}))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params
        ? `${key}|${Object.entries(params)
            .map(([name, value]) => `${name}=${String(value)}`)
            .join('&')}`
        : key,
    lang: 'tr',
  }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/orders',
}))

interface InvokeBody {
  order_id: string
  tracking_number: string
  allow_shared_tracking?: unknown
}

/** `supabase-js` non-2xx'te `FunctionsHttpError` üretir; `context` ham `Response`'tur. */
function conflictResponse() {
  return {
    error: {
      context: new Response(JSON.stringify({ error: 'tracking_number_in_use' }), { status: 409 }),
    },
  }
}

function bodies(): InvokeBody[] {
  return sb.invoke.mock.calls.map((call) => (call[1] as { body: InvokeBody }).body)
}

function renderBoard(): void {
  render(
    <ConfirmProvider>
      <OrdersTableBody />
    </ConfirmProvider>,
  )
}

async function openBulkShipModal(): Promise<void> {
  await screen.findByText('VH-2026-0001')
  const rowBoxes = screen.getAllByLabelText('admin.dataTable.labels.rowSelect')
  for (const box of rowBoxes) {
    await userEvent.click(box)
  }
  await userEvent.click(await screen.findByRole('button', { name: 'admin.orders.bulk.shipSelected' }))
  await screen.findByRole('dialog')
  await userEvent.selectOptions(
    screen.getByLabelText('admin.orders.modals.shipping.carrierLabel'),
    'Aras',
  )
}

function inputForOrder(orderNumber: string): HTMLInputElement {
  return screen.getByLabelText(
    `admin.orders.modals.shipping.bulkList.trackingAriaLabel|order=${orderNumber}`,
  ) as HTMLInputElement
}

/**
 * İki AYRI numara yazılır: parti İÇİ mükerrerlik yok, yani mevcut ön-onay diyaloğu
 * tetiklenmez. Böylece testin ölçtüğü tek şey SUNUCU 409'una verilen tepkidir.
 */
async function fillDistinctTracking(): Promise<void> {
  await userEvent.type(inputForOrder('VH-2026-0001'), 'TRK-AAA-1')
  await userEvent.type(inputForOrder('VH-2026-0002'), 'TRK-BBB-2')
}

beforeEach(() => {
  sb.invoke.mockReset()
})

describe('OrdersTableBody · sunucu 409 → paylaşılan takip onayı', () => {
  it('409 gelen sipariş için onay sorulur ve ONAYLANIRSA allow_shared_tracking ile TEKRAR gönderilir', async () => {
    // order-1 çakışır, order-2 temiz geçer.
    sb.invoke.mockImplementation((_name: string, opts: { body: InvokeBody }) => {
      if (opts.body.order_id !== 'order-1') return Promise.resolve({ error: null })
      return Promise.resolve(opts.body.allow_shared_tracking === true ? { error: null } : conflictResponse())
    })

    renderBoard()
    await openBulkShipModal()
    await fillDistinctTracking()
    await userEvent.click(screen.getByRole('button', { name: 'admin.orders.modals.shipping.save' }))

    const alert = await screen.findByRole('alertdialog')
    expect(alert).toHaveAccessibleName('admin.common.sharedTracking.title')
    // Sayı ÇAKIŞAN sipariş sayısıdır (2 değil 1) — admin neyi onayladığını görmeli.
    expect(within(alert).getByText(/admin\.common\.sharedTracking\.description\|count=1/)).toBeInTheDocument()

    await userEvent.click(
      within(alert).getByRole('button', { name: 'admin.common.sharedTracking.confirmLabel' }),
    )

    // 2 ilk tur + 1 tekrar = 3. Temiz geçen sipariş TEKRAR GÖNDERİLMEZ.
    await waitFor(() => expect(sb.invoke).toHaveBeenCalledTimes(3))
    const all = bodies()
    const retry = all[2]
    expect(retry.order_id).toBe('order-1')
    expect(retry.allow_shared_tracking).toBe(true)
    expect(retry.tracking_number).toBe('TRK-AAA-1')
    // İlk tur beyansız gitmeli: bayrağı peşinen göndermek sunucu kapısını anlamsızlaştırır.
    expect(all[0].allow_shared_tracking).toBeUndefined()
    expect(all[1].allow_shared_tracking).toBeUndefined()
    expect(all.filter((b) => b.order_id === 'order-2')).toHaveLength(1)
  })

  it('onay VERİLMEZSE bayraklı istek hiç gönderilmez', async () => {
    sb.invoke.mockImplementation((_name: string, opts: { body: InvokeBody }) =>
      Promise.resolve(opts.body.order_id === 'order-1' ? conflictResponse() : { error: null }),
    )

    renderBoard()
    await openBulkShipModal()
    await fillDistinctTracking()
    await userEvent.click(screen.getByRole('button', { name: 'admin.orders.modals.shipping.save' }))

    const alert = await screen.findByRole('alertdialog')
    await userEvent.click(
      within(alert).getByRole('button', { name: 'admin.common.sharedTracking.cancelLabel' }),
    )

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(sb.invoke).toHaveBeenCalledTimes(2)
    expect(bodies().every((b) => b.allow_shared_tracking === undefined)).toBe(true)
  })

  it('409 OLMAYAN bir hatada onay SORULMAZ — yanlış soru yazma riski doğurur', async () => {
    sb.invoke.mockImplementation((_name: string, opts: { body: InvokeBody }) =>
      Promise.resolve(
        opts.body.order_id === 'order-1'
          ? { error: { context: new Response(JSON.stringify({ error: 'order_locked' }), { status: 409 }) } }
          : { error: null },
      ),
    )

    renderBoard()
    await openBulkShipModal()
    await fillDistinctTracking()
    await userEvent.click(screen.getByRole('button', { name: 'admin.orders.modals.shipping.save' }))

    await waitFor(() => expect(sb.invoke).toHaveBeenCalledTimes(2))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(bodies().every((b) => b.allow_shared_tracking === undefined)).toBe(true)
  })
})
