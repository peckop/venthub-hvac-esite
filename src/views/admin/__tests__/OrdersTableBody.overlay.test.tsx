import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import OrdersTableBody from '../OrdersTableBody'

/**
 * SİPARİŞ YÜZEYLERİ — a11y sözleşmesi (cetvel §4.3, §4.8).
 *
 * 2026-08-15 ölçümü: `OrdersTableBody.tsx`teki üç overlay elle yazılmış
 * `<div className="fixed inset-0 …">` idi ve §4.8'in 11 maddesinden 8'i eksikti
 * (`role="dialog"` yok · `aria-modal` yok · erişilebilir ad yok · odak tuzağı yok ·
 * açılışta/kapanışta odak yönetimi yok · ESC yok — dosyada TEK BİR keydown
 * handler'ı yoktu · gövde kaydırma kilidi yok).
 *
 * Bu testler o üç maddeyi (rol · aria-modal · erişilebilir ad · ESC) yüzey başına
 * doğrular. Hepsi modal DEĞİL: e-posta kayıtları salt-okunur olduğu için §4.3'e
 * göre NON-MODAL panel; onun sözleşmesi ayrıca test ediliyor (aria-modal OLMAMALI,
 * arka içerik erişilebilir kalmalı, kapanışta odak tetikleyiciye dönmeli).
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
      id: 'o1aaaa11bbbb2222',
      status: 'confirmed',
      conversation_id: 'conv-1',
      total_amount: 1500,
      created_at: '2026-06-12T09:00:00.000Z',
      order_number: 'VH-2026-0001',
      customer_name: 'Ahmet Yılmaz',
      customer_email: 'ahmet@example.com',
      customer_phone: '+90 555 111 2233',
    },
  ]

  const emailLogs = [
    {
      subject: 'Siparişiniz kargoya verildi',
      email_to: 'ahmet@example.com',
      provider_message_id: 'msg-1',
      created_at: '2026-06-12T10:00:00.000Z',
      carrier: 'Aras',
      tracking_number: 'TR-1',
    },
  ]

  const notesData = [
    { id: 'n1', note: 'Müşteri teslimat saati sordu.', created_at: '2026-06-12T11:00:00.000Z', user_id: null },
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

  const client = {
    from(table: string): QueryChain {
      if (table === 'venthub_orders') {
        return makeChain({ data: { carrier: 'Aras', tracking_number: 'TR-1' }, error: null })
      }
      if (table === 'shipping_email_events') return makeChain({ data: emailLogs, error: null })
      if (table === 'order_notes') return makeChain({ data: notesData, error: null })
      return makeChain({ data: ordersData, count: ordersData.length, error: null })
    },
    functions: { invoke: vi.fn().mockResolvedValue({ error: null }) },
  }

  return { ordersData, emailLogs, notesData, client }
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
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/orders',
}))

function renderBoard(): void {
  render(
    <ConfirmProvider>
      <OrdersTableBody />
    </ConfirmProvider>,
  )
}

/** Satır aksiyonunu adıyla tıkla (t mock'u anahtarı aynen döndürür). */
async function clickRowAction(name: string): Promise<HTMLElement> {
  const button = (await screen.findAllByRole('button', { name }))[0]
  await userEvent.click(button)
  return button
}

describe('OrdersTableBody · kargo yüzeyi — MODAL (cetvel §4.1: <5 girdili form)', () => {
  it('role=dialog + aria-modal=true + erişilebilir ad taşır', async () => {
    renderBoard()
    await screen.findByText('VH-2026-0001')
    await clickRowAction('admin.orders.actions.shipping')

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    // §4.8/8: aria-labelledby görünür başlığa bağlı → erişilebilir ad boş olamaz.
    expect(dialog).toHaveAccessibleName('admin.orders.modals.shipping.title')
    // §4.8/11: dialog'da opsiyonel ama biz her yüzeyde veriyoruz.
    expect(dialog).toHaveAccessibleDescription('admin.orders.modals.shipping.description')
  })

  it('ESC ile kapanır (odak diyalog içindeyken bile belge seviyesinde dinlenir)', async () => {
    renderBoard()
    await screen.findByText('VH-2026-0001')
    await clickRowAction('admin.orders.actions.shipping')
    await screen.findByRole('dialog')

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('tab sırasında görünür bir kapatma butonu var (APG §4.8/9)', async () => {
    renderBoard()
    await screen.findByText('VH-2026-0001')
    await clickRowAction('admin.orders.actions.shipping')
    await screen.findByRole('dialog')

    expect(screen.getByRole('button', { name: 'admin.orders.modals.shipping.close' })).toBeVisible()
  })
})

describe('OrdersTableBody · notlar yüzeyi — MODAL (yazma barındırır)', () => {
  it('role=dialog + aria-modal=true + erişilebilir ad taşır ve ESC ile kapanır', async () => {
    renderBoard()
    await screen.findByText('VH-2026-0001')
    await clickRowAction('admin.orders.actions.notes')

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('admin.orders.modals.notes.title')

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})

describe('OrdersTableBody · e-posta kayıtları — NON-MODAL PANEL (cetvel §4.3)', () => {
  it('role=region + erişilebilir ad taşır, aria-modal TAŞIMAZ', async () => {
    renderBoard()
    await screen.findByText('VH-2026-0001')
    await clickRowAction('admin.orders.actions.logs')

    const panel = await screen.findByRole('region', { name: 'admin.orders.modals.logs.title' })
    // §4.8'in aria-modal tuzağı: gerçekten modal DAVRANMAYAN bir yüzeyi modal
    // diye işaretlemek APG'nin deyimiyle "severe negative ramifications" üretir.
    expect(panel).not.toHaveAttribute('aria-modal')
    // Arka içerik ERİŞİLEBİLİR kalır — panelin non-modal olmasının tüm anlamı bu.
    expect(screen.getByText('VH-2026-0001')).toBeInTheDocument()
  })

  it('ESC ile kapanır ve odak tetikleyiciye döner', async () => {
    renderBoard()
    await screen.findByText('VH-2026-0001')
    const trigger = await clickRowAction('admin.orders.actions.logs')
    await screen.findByRole('region', { name: 'admin.orders.modals.logs.title' })

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'admin.orders.modals.logs.title' })).toBeNull(),
    )
    // §4.3 sözleşmesi: kapanışta odak tetikleyiciye döner.
    expect(trigger).toHaveFocus()
  })

  it('kayıtları listeler', async () => {
    renderBoard()
    await screen.findByText('VH-2026-0001')
    await clickRowAction('admin.orders.actions.logs')
    await screen.findByRole('region', { name: 'admin.orders.modals.logs.title' })

    expect(await screen.findByText(sb.emailLogs[0].subject)).toBeInTheDocument()
  })
})
