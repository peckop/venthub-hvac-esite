import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import AdminLogisticsTableBody from '../AdminLogisticsTableBody'

/**
 * LOJİSTİK TOPLU YAZIM — PAYLAŞILAN TAKİP NUMARASI ONAYI.
 *
 * ÖLÇÜLEN KUSUR (2026-08-17): bu yüzey `admin-update-shipping`'i çağırıyor ama 409
 * `tracking_number_in_use` reddine hiç TEPKİ VERMİYORDU: onay sormuyor, bayrağı
 * göndermiyor, admine yalnız "N kayıt güncellenemedi" diyordu. Sipariş yüzeyinde en
 * azından bir onay diyaloğu vardı (o da isteğe iletilmiyordu); burada onay diye bir
 * şey YOKTU — yani sunucudaki kaçış kapısı bu ekrandan tamamen ulaşılamazdı.
 *
 * Bu dosya davranışı ölçer: 409 → onay → bayraklı TEKRAR gönderim.
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
}

const sb = vi.hoisted(() => {
  const rows = [
    {
      id: 'order-1',
      order_number: 'VH-2026-0001',
      customer_name: 'Ahmet Yılmaz',
      created_at: '2026-06-12T09:00:00.000Z',
      carrier: 'Aras',
      tracking_number: 'TRK-AAA-1',
    },
    {
      id: 'order-2',
      order_number: 'VH-2026-0002',
      customer_name: 'Zeynep Kaya',
      created_at: '2026-06-12T10:00:00.000Z',
      carrier: 'Aras',
      tracking_number: 'TRK-BBB-2',
    },
  ]

  const invoke = vi.fn().mockResolvedValue({ error: null })

  function makeChain(): QueryChain {
    const chain: QueryChain = {
      select: () => chain,
      order: () => chain,
      ilike: () => chain,
      eq: () => chain,
      in: () => chain,
      is: () => chain,
      gte: () => chain,
      lte: () => chain,
      range: () => Promise.resolve({ data: rows, count: rows.length, error: null }),
      limit: () => Promise.resolve({ data: rows, count: rows.length, error: null }),
    }
    return chain
  }

  return { rows, invoke, client: { from: () => makeChain(), functions: { invoke } } }
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
  usePathname: () => '/admin/logistics',
}))

interface InvokeBody {
  order_id: string
  tracking_number: string
  allow_shared_tracking?: unknown
}

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

async function selectAllAndShip(): Promise<void> {
  // Künye `#` ile birlikte tek bir metin düğümüne render edilir → regex ile eşleştirilir.
  await screen.findByText(/VH-2026-0001/)
  for (const box of screen.getAllByLabelText('admin.dataTable.labels.rowSelect')) {
    await userEvent.click(box)
  }
  await userEvent.click(await screen.findByRole('button', { name: 'admin.logistics.shipOrders' }))
}

beforeEach(() => {
  sb.invoke.mockReset()
})

describe('AdminLogisticsTableBody · sunucu 409 → paylaşılan takip onayı', () => {
  it('409 alan kayıt için onay sorulur ve onaylanınca bayrakla TEKRAR gönderilir', async () => {
    sb.invoke.mockImplementation((_name: string, opts: { body: InvokeBody }) => {
      if (opts.body.order_id !== 'order-1') return Promise.resolve({ error: null })
      return Promise.resolve(
        opts.body.allow_shared_tracking === true ? { error: null } : conflictResponse(),
      )
    })

    render(
      <ConfirmProvider>
        <AdminLogisticsTableBody />
      </ConfirmProvider>,
    )
    await selectAllAndShip()

    const alert = await screen.findByRole('alertdialog')
    expect(alert).toHaveAccessibleName('admin.common.sharedTracking.title')

    await userEvent.click(
      within(alert).getByRole('button', { name: 'admin.common.sharedTracking.confirmLabel' }),
    )

    await waitFor(() => expect(sb.invoke).toHaveBeenCalledTimes(3))
    const all = bodies()
    expect(all[0].allow_shared_tracking).toBeUndefined()
    expect(all[1].allow_shared_tracking).toBeUndefined()
    expect(all[2].order_id).toBe('order-1')
    expect(all[2].allow_shared_tracking).toBe(true)
  })

  it('onay verilmezse bayraklı istek gönderilmez', async () => {
    sb.invoke.mockImplementation((_name: string, opts: { body: InvokeBody }) =>
      Promise.resolve(opts.body.order_id === 'order-1' ? conflictResponse() : { error: null }),
    )

    render(
      <ConfirmProvider>
        <AdminLogisticsTableBody />
      </ConfirmProvider>,
    )
    await selectAllAndShip()

    const alert = await screen.findByRole('alertdialog')
    await userEvent.click(
      within(alert).getByRole('button', { name: 'admin.common.sharedTracking.cancelLabel' }),
    )

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(sb.invoke).toHaveBeenCalledTimes(2)
    expect(bodies().every((b) => b.allow_shared_tracking === undefined)).toBe(true)
  })
})
