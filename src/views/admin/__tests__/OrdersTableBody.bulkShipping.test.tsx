import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import OrdersTableBody from '../OrdersTableBody'

/**
 * TOPLU KARGO — SİPARİŞ BAŞINA TAKİP NUMARASI (T058-VH, denetim raporu §4).
 *
 * ÖLÇÜLEN KUSUR (2026-08-16): toplu kargo dalı TEK bir `tracking` state'ini seçili
 * N siparişin HEPSİNE yazıyordu:
 *
 *     targets.map(async (id) => functions.invoke('admin-update-shipping', {
 *       body: { order_id: id, tracking_number: tracking.trim(), ... } }))
 *
 * Sonuç kozmetik değil, VERİ BOZAN'dı: farklı müşterilere ait N sipariş aynı takip
 * numarasını taşıyor ve her müşteriye BAŞKASININ kolisinin takip linki e-postayla
 * gidiyordu.
 *
 * Bu dosyanın asıl gerekçesi (b) testidir: `order_id` ↔ `tracking_number` EŞLEŞMESİNİ
 * doğrular. Eski kodda iki çağrının `tracking_number`'ı da aynı olurdu (kullanıcı zaten
 * tek alan görüyordu), dolayısıyla assert KIRMIZI olurdu. Yani bu test kusurun geri
 * gelmesini yapısal olarak engeller — "iki input render ediliyor mu" testi engellemez,
 * çünkü render doğru olup gönderim yine tek numarayı yazabilir.
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
  /**
   * `t` anahtarı aynen döndürür (diğer admin testlerindeki desen), AMA parametreleri
   * de ekler. Gerekçe: sipariş başına `aria-label` yalnız `{{order}}` parametresiyle
   * ayrışıyor; parametreler yutulursa iki girdinin erişilebilir adı AYNI olur ve
   * "her sipariş kendi alanını taşıyor" iddiası test edilemez hale gelir.
   */
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

/** `useConfirm()` sağlayıcı dışında çağrılırsa fırlatır → sarmak ZORUNLU. */
function renderBoard(): void {
  render(
    <ConfirmProvider>
      <OrdersTableBody />
    </ConfirmProvider>,
  )
}

/** Her iki siparişi de seç ve toplu kargo modalını aç. */
async function openBulkShipModal(): Promise<void> {
  await screen.findByText('VH-2026-0001')

  // `DataTableKit` satır kutusunun etiketi artık SÖZLÜKTEN geliyor (eskiden ham
  // Türkçe sabitti; EN kullanıcı ekran okuyucuda Türkçe duyuyordu). Bu takımın
  // i18n taklidi anahtarı aynen döndürdüğü için sorgu anahtarla yapılır — başlıktaki
  // "tümünü seç" kutusu farklı anahtar taşır, yani yalnız satırlar seçilir.
  const rowBoxes = screen.getAllByLabelText('admin.dataTable.labels.rowSelect')
  expect(rowBoxes).toHaveLength(2)
  for (const box of rowBoxes) {
    await userEvent.click(box)
  }

  await userEvent.click(await screen.findByRole('button', { name: 'admin.orders.bulk.shipSelected' }))
  await screen.findByRole('dialog')
}

async function selectCarrier(): Promise<void> {
  await userEvent.selectOptions(screen.getByLabelText('admin.orders.modals.shipping.carrierLabel'), 'Aras')
}

/** Belirli bir siparişin takip girdisi — erişilebilir ad künyeyi taşır. */
function inputForOrder(orderNumber: string): HTMLInputElement {
  return screen.getByLabelText(
    `admin.orders.modals.shipping.bulkList.trackingAriaLabel|order=${orderNumber}`,
  ) as HTMLInputElement
}

beforeEach(() => {
  sb.invoke.mockClear()
  sb.invoke.mockResolvedValue({ error: null })
})

describe('OrdersTableBody · toplu kargo — sipariş başına takip numarası', () => {
  it('(a) iki sipariş seçiliyken iki AYRI takip girdisi render edilir', async () => {
    renderBoard()
    await openBulkShipModal()

    const dialog = screen.getByRole('dialog')
    const inputs = within(dialog)
      .getAllByRole('textbox')
      .filter((el) => el.getAttribute('id')?.startsWith('ship-tracking-'))

    expect(inputs).toHaveLength(2)
    expect(inputs.map((el) => el.getAttribute('id'))).toEqual([
      'ship-tracking-order-1',
      'ship-tracking-order-2',
    ])
    // Girdiler kime ait olduğunu SÖYLEMELİ; aksi halde admin hangi kutuya ne
    // yazdığını göremez ve kusur "kullanıcı hatası" kılığında geri gelir.
    expect(within(dialog).getByText('VH-2026-0001')).toBeInTheDocument()
    expect(within(dialog).getByText('VH-2026-0002')).toBeInTheDocument()
    expect(within(dialog).getByText('Ahmet Yılmaz')).toBeInTheDocument()
    expect(within(dialog).getByText('Zeynep Kaya')).toBeInTheDocument()
  })

  it('(b) HER SİPARİŞE KENDİ numarası gönderilir — order_id ↔ tracking_number eşleşmesi', async () => {
    renderBoard()
    await openBulkShipModal()
    await selectCarrier()

    await userEvent.type(inputForOrder('VH-2026-0001'), 'TRK-AAA-1')
    await userEvent.type(inputForOrder('VH-2026-0002'), 'TRK-BBB-2')

    await userEvent.click(screen.getByRole('button', { name: 'admin.orders.modals.shipping.save' }))

    await waitFor(() => expect(sb.invoke).toHaveBeenCalledTimes(2))

    const bodies = sb.invoke.mock.calls.map(
      (call) => (call[1] as { body: { order_id: string; tracking_number: string; carrier: string } }).body,
    )
    const byOrder = new Map(bodies.map((b) => [b.order_id, b]))

    // ASIL ASSERT: eski kodda İKİSİ de aynı `tracking_number`'ı taşırdı → KIRMIZI.
    expect(byOrder.get('order-1')?.tracking_number).toBe('TRK-AAA-1')
    expect(byOrder.get('order-2')?.tracking_number).toBe('TRK-BBB-2')
    // Aynı numaranın iki siparişe yazılması tam da onarılan kusurdur.
    expect(byOrder.get('order-1')?.tracking_number).not.toBe(byOrder.get('order-2')?.tracking_number)
    // Taşıyıcı ORTAK kalır — tek gönderide aynı taşıyıcı normaldir.
    expect(byOrder.get('order-1')?.carrier).toBe('Aras')
    expect(byOrder.get('order-2')?.carrier).toBe('Aras')
  })

  it('(c) bir takip numarası boşken gönderim engellenir ve o alan aria-invalid alır', async () => {
    renderBoard()
    await openBulkShipModal()
    await selectCarrier()

    await userEvent.type(inputForOrder('VH-2026-0001'), 'TRK-AAA-1')
    // VH-2026-0002 bilerek BOŞ bırakıldı.

    await userEvent.click(screen.getByRole('button', { name: 'admin.orders.modals.shipping.save' }))

    // Hiçbir sipariş yazılmadı — kısmi yazma yok.
    expect(sb.invoke).not.toHaveBeenCalled()

    // Alan seviyesinde hata: yalnız EKSİK olan alan işaretlenir.
    const empty = inputForOrder('VH-2026-0002')
    await waitFor(() => expect(empty).toHaveAttribute('aria-invalid', 'true'))
    const describedBy = empty.getAttribute('aria-describedby')
    expect(describedBy).toBe('ship-tracking-error-order-2')
    expect(document.getElementById(describedBy as string)).toHaveAttribute('role', 'alert')

    // Dolu olan alan temiz kalır (toplu "hepsi kırmızı" davranışı yanlış yönlendirir).
    expect(inputForOrder('VH-2026-0001')).not.toHaveAttribute('aria-invalid')
  })

  it('taşıyıcı seçilmemişse alan seviyesinde hata verir ve gönderim yapılmaz', async () => {
    renderBoard()
    await openBulkShipModal()

    await userEvent.type(inputForOrder('VH-2026-0001'), 'TRK-AAA-1')
    await userEvent.type(inputForOrder('VH-2026-0002'), 'TRK-BBB-2')

    await userEvent.click(screen.getByRole('button', { name: 'admin.orders.modals.shipping.save' }))

    expect(sb.invoke).not.toHaveBeenCalled()
    const select = screen.getByLabelText('admin.orders.modals.shipping.carrierLabel')
    await waitFor(() => expect(select).toHaveAttribute('aria-invalid', 'true'))
    expect(select).toHaveAttribute('aria-describedby', 'ship-carrier-error')
  })

  it('MÜKERRER takip numarası bloklanmaz ama açık onay ister; onay verilmezse gönderilmez', async () => {
    renderBoard()
    await openBulkShipModal()
    await selectCarrier()

    await userEvent.type(inputForOrder('VH-2026-0001'), 'TRK-SAME')
    await userEvent.type(inputForOrder('VH-2026-0002'), 'TRK-SAME')

    await userEvent.click(screen.getByRole('button', { name: 'admin.orders.modals.shipping.save' }))

    // `window.confirm` YASAK → onay bir `alertdialog` yüzeyidir.
    const alert = await screen.findByRole('alertdialog')
    expect(alert).toHaveAccessibleName('admin.orders.bulk.duplicateTracking.title')
    expect(sb.invoke).not.toHaveBeenCalled()

    await userEvent.click(
      within(alert).getByRole('button', { name: 'admin.orders.bulk.duplicateTracking.cancelLabel' }),
    )
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(sb.invoke).not.toHaveBeenCalled()
  })

  it('mükerrer numara ONAYLANIRSA birleştirilmiş gönderi olarak yazılır', async () => {
    renderBoard()
    await openBulkShipModal()
    await selectCarrier()

    await userEvent.type(inputForOrder('VH-2026-0001'), 'TRK-SAME')
    await userEvent.type(inputForOrder('VH-2026-0002'), 'TRK-SAME')

    await userEvent.click(screen.getByRole('button', { name: 'admin.orders.modals.shipping.save' }))
    const alert = await screen.findByRole('alertdialog')
    await userEvent.click(
      within(alert).getByRole('button', { name: 'admin.orders.bulk.duplicateTracking.confirmLabel' }),
    )

    await waitFor(() => expect(sb.invoke).toHaveBeenCalledTimes(2))
    const bodies = sb.invoke.mock.calls.map(
      (call) => (call[1] as { body: { order_id: string; tracking_number: string } }).body,
    )
    expect(bodies.every((b) => b.tracking_number === 'TRK-SAME')).toBe(true)
  })
})
