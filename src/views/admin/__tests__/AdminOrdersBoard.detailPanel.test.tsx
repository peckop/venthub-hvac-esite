import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import AdminOrdersBoard from '../AdminOrdersBoard'

/**
 * D14 — "HANDLER VAR AMA ÖLÜ" REGRESYON TESTİ.
 *
 * Eski `MiniDetailPanel` şöyleydi:
 *
 *   <div role="presentation"
 *        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }} />
 *
 * `tabIndex` taşımayan bir `<div>` ODAK ALAMAZ; `keydown` odaklanmış öğeden
 * kabararak gelir → bu handler HİÇBİR ZAMAN tetiklenmedi. Yüzeyde `role="dialog"`
 * ve `aria-modal="true"` ZATEN vardı; yani yalnız o ikisini doğrulayan bir test
 * YEŞİL yanardı ve kusuru göremezdi. Ayırt edici madde ESC'in GERÇEKTEN kapatması.
 *
 * Aşağıdaki test tuşu BELGE üzerinde ateşler (`fireEvent.keyDown(document, …)`).
 * Eski kodda dinleyici panelin çocuğundaydı; belge üzerinde ateşlenen bir olay
 * bir ÇOCUK dinleyicisini tetikleyemez → test KIRMIZI olurdu. Yeni kodda dinleyici
 * Radix'in `DismissableLayer`'ında belge seviyesindedir → YEŞİL.
 */

interface QueryChain {
  select: () => QueryChain
  order: () => QueryChain
  eq: () => QueryChain
  limit: () => Promise<unknown>
  maybeSingle: () => Promise<unknown>
  single: () => Promise<unknown>
}

const sb = vi.hoisted(() => {
  const ordersData = [
    {
      id: 'b1aaaa11bbbb2222',
      status: 'confirmed',
      user_id: 'u1',
      total_amount: 4200,
      created_at: '2026-06-12T09:00:00.000Z',
      order_number: 'VH-2026-0009',
      customer_name: 'Zeynep Kaya',
      customer_email: 'zeynep@example.com',
      customer_phone: '+90 555 000 1122',
      payment_status: 'paid',
    },
  ]

  function makeChain(result: unknown): QueryChain {
    const chain: QueryChain = {
      select: () => chain,
      order: () => chain,
      eq: () => chain,
      limit: () => Promise.resolve(result),
      maybeSingle: () => Promise.resolve(result),
      single: () => Promise.resolve(result),
    }
    return chain
  }

  const client = {
    from(table: string): QueryChain {
      if (table === 'order_notes') return makeChain({ data: [], error: null })
      if (table === 'shipping_email_events') return makeChain({ data: [], error: null })
      if (table === 'venthub_orders') {
        return makeChain({ data: { carrier: null, tracking_number: null }, error: null })
      }
      return makeChain({ data: ordersData, count: ordersData.length, error: null })
    },
  }

  return { ordersData, client }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/lib/ensureSessionFresh', () => ({ ensureSessionFresh: () => Promise.resolve() }))
vi.mock('@/lib/orderStatusService', () => ({
  updateOrderStatus: vi.fn().mockResolvedValue({ ok: true }),
}))
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
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/orders',
}))

/* @hello-pangea/dnd jsdom'da gerçek ölçüm yapmaya çalışır; pano yerleşimi bu
   testin konusu değil — sürükle-bırak kabuğu geçirgen bileşenlerle taklit edilir. */
interface DroppableRenderProps {
  innerRef: (el: HTMLElement | null) => void
  droppableProps: Record<string, unknown>
  placeholder: React.ReactNode
}
interface DraggableRenderProps {
  innerRef: (el: HTMLElement | null) => void
  draggableProps: Record<string, unknown>
  dragHandleProps: Record<string, unknown>
}

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => children,
  Droppable: ({
    children,
  }: {
    children: (provided: DroppableRenderProps, snapshot: { isDraggingOver: boolean }) => React.ReactNode
  }) =>
    children(
      { innerRef: () => {}, droppableProps: {}, placeholder: null },
      { isDraggingOver: false },
    ),
  Draggable: ({
    children,
  }: {
    children: (provided: DraggableRenderProps, snapshot: { isDragging: boolean }) => React.ReactNode
  }) =>
    children(
      { innerRef: () => {}, draggableProps: { style: {} }, dragHandleProps: {} },
      { isDragging: false },
    ),
}))

async function openDetailPanel(): Promise<void> {
  render(<AdminOrdersBoard />)
  const card = await screen.findByText('Zeynep Kaya')
  await userEvent.click(card)
}

describe('AdminOrdersBoard · sipariş detay yüzeyi', () => {
  it('role=dialog + aria-modal=true + erişilebilir ad taşır', async () => {
    await openDetailPanel()

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName(/VH-2026-0009/)
    expect(dialog).toHaveAccessibleDescription('admin.orders.board.detail.description')
  })

  it('ESC GERÇEKTEN kapatır — belge seviyesinde dinlenir (D14 regresyonu)', async () => {
    await openDetailPanel()
    await screen.findByRole('dialog')

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('kapatma butonu ile de kapanır', async () => {
    await openDetailPanel()
    await screen.findByRole('dialog')

    await userEvent.click(screen.getByRole('button', { name: 'admin.orders.board.detail.close' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})
