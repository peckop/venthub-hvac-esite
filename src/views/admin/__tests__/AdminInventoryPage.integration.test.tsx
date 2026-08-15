import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import InventoryTableBody from '../InventoryTableBody'

/**
 * REGRESYON BEKÇİSİ — stok detay çekmecesi + CSV içe aktarma.
 *
 * `3c7ea6ff` ("total quality purge") `AdminInventoryPage`'i 770 → 27 satıra indirirken
 * çekmeceyi çağıran konteyner mantığını sildi; `dcc5a895` (DataTableKit göçü) de
 * `InventoryCsvImport` importer'ını düşürdü. İki dosya da TAM YAZILMIŞ hâlde kaldı,
 * hiçbir yerden çağrılmadı — yani lint/tsc/test hepsi YEŞİLDİ ve kullanıcıya görünen
 * işlev sessizce yok oldu. Bu testin tek işi o yolun bir daha koparsa KIRMIZI yanması.
 *
 * Ayrıca RBAC katman-1'i ölçer: yazma yetkisi olmayan kullanıcıda ne stok düzeltme
 * bölümü ne de CSV yüzeyi RENDER EDİLMEZ ("disabled" değil — hiç yok).
 *
 * `t` mock'u anahtarı aynen döndürür → sorgular sözlük anahtarlarıyla yapılır.
 */

const roleState = vi.hoisted(() => ({ canWrite: false }))

const sb = vi.hoisted(() => {
  const velocityRows = [
    {
      product_id: 'p1',
      name: 'Kanal Tipi Fan',
      physical_stock: 12,
      reserved_stock: 2,
      available_stock: 10,
      warehouse_location: 'A-01',
      supplier_name: 'Vortice',
    },
  ]
  const productRows = [{ id: 'p1', category_id: 'c1', low_stock_threshold: 4 }]
  // `daily_velocity` / `days_until_empty` / `abc_class` `inventory_velocity`'de DEĞİL,
  // `inventory_summary`'de yaşar (prod şeması 2026-08-15'te doğrulandı).
  const summaryRows = [
    { product_id: 'p1', daily_velocity: 0.5, days_until_empty: 20, abc_class: 'A' },
  ]
  const categoryRows = [{ id: 'c1', name: 'Fanlar' }]
  const movementRows = [
    { id: 'm1', delta: 5, reason: 'manual_in', created_at: '2026-08-15T10:00:00.000Z' },
  ]
  const reservedRows = [
    {
      order_id: 'ORDER-1111',
      created_at: '2026-08-14T10:00:00.000Z',
      status: 'pending',
      payment_status: 'paid',
      quantity: 2,
    },
  ]

  interface QueryResult {
    data: unknown
    error: null
  }

  /** supabase-js zincirini taklit eder: her metot kendini döndürür, nesne await edilebilir. */
  function chain(result: QueryResult): Record<string, unknown> {
    const c: Record<string, unknown> = {}
    const self = () => c
    for (const m of [
      'select',
      'order',
      'ilike',
      'eq',
      'in',
      'limit',
      'range',
      'gte',
      'lte',
      'or',
      'maybeSingle',
      'single',
    ]) {
      c[m] = self
    }
    c.then = (resolve: (v: QueryResult) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject)
    return c
  }

  const client = {
    from(table: string) {
      switch (table) {
        case 'inventory_velocity':
          return chain({ data: velocityRows, error: null })
        case 'products':
          return chain({ data: productRows, error: null })
        case 'inventory_summary':
          return chain({ data: summaryRows, error: null })
        case 'categories':
          return chain({ data: categoryRows, error: null })
        case 'inventory_settings':
          return chain({ data: { default_low_stock_threshold: 5 }, error: null })
        case 'inventory_movements':
          return chain({ data: movementRows, error: null })
        case 'reserved_orders':
          return chain({ data: reservedRows, error: null })
        default:
          return chain({ data: [], error: null })
      }
    },
    // Prod'a yazan RPC'ler (`adjust_stock`, `reverse_inventory_batch`) burada ASLA
    // gerçek çağrı yapmaz; test yalnız yüzeyin varlığını ölçer, mutasyonu değil.
    rpc: () => Promise.resolve({ data: null, error: null }),
    channel() {
      const ch = { on: () => ch, subscribe: () => ch }
      return ch
    },
    removeChannel() {},
  }
  return { client, velocityRows }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({
    canWrite: () => roleState.canWrite,
    canAccess: () => true,
    isReadOnly: !roleState.canWrite,
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
  usePathname: () => '/admin/inventory',
}))

function renderPage() {
  return render(
    // InventoryCsvImport `useConfirm()` çağırır → sağlayıcı olmadan patlar.
    <ConfirmProvider>
      <InventoryTableBody />
    </ConfirmProvider>,
  )
}

describe('AdminInventoryPage — stok detay çekmecesi (regresyon bekçisi)', () => {
  beforeEach(() => {
    roleState.canWrite = true
    localStorage.clear()
  })

  it('satırdaki Detaylar aksiyonu çekmeceyi açar, ESC kapatır', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Kanal Tipi Fan')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /Kanal Tipi Fan — admin\.inventory\.stockDetails/ }),
    )

    const drawer = await screen.findByRole('dialog')
    // Çekmece başlığı = ürün adı (Dialog.Title → aria-labelledby otomatik bağlanır)
    expect(within(drawer).getByText('Kanal Tipi Fan')).toBeInTheDocument()
    // Modal sözleşmesi: aria-modal elle basılmalı (Radix basmaz)
    expect(drawer).toHaveAttribute('aria-modal', 'true')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('çekmece gerçek veriyle beslenir: rezerve siparişler + hareket geçmişi + eşik', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Kanal Tipi Fan')
    await user.click(
      screen.getByRole('button', { name: /Kanal Tipi Fan — admin\.inventory\.stockDetails/ }),
    )

    const drawer = await screen.findByRole('dialog')
    // reserved_orders → tablo yalnız satır varsa render olur (bileşen boşta null döner)
    expect(await within(drawer).findByText(/ER-1111/)).toBeInTheDocument()
    // inventory_movements → son hareket
    expect(within(drawer).getByText('manual_in')).toBeInTheDocument()
    // products.low_stock_threshold (4) çekmecedeki eşik alanına düşer
    expect(within(drawer).getByLabelText('admin.inventory.updateThresholdLevel')).toHaveValue(4)
  })

  it('yazma yetkisi YOKSA stok düzeltme ve CSV yüzeyi hiç render edilmez', async () => {
    roleState.canWrite = false
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Kanal Tipi Fan')
    // CSV tetikleyicisi yok
    expect(screen.queryByText('admin.inventory.csvLoad')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /Kanal Tipi Fan — admin\.inventory\.stockDetails/ }),
    )
    const drawer = await screen.findByRole('dialog')

    // Stok giriş/çıkış ve eşik düzenleme bölümleri "disabled" DEĞİL, HİÇ YOK
    expect(within(drawer).queryByText('admin.inventory.quickStockMovement')).not.toBeInTheDocument()
    expect(within(drawer).queryByText('admin.inventory.updateThresholdLevel')).not.toBeInTheDocument()
    // Okuma yüzeyleri yerinde
    expect(within(drawer).getByText('admin.inventory.reservedOrders')).toBeInTheDocument()
  })

  it('yazma yetkisi VARSA CSV içe aktarma tetiklenebilir ve modal açılır', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Kanal Tipi Fan')
    await user.click(screen.getByText('admin.inventory.csvLoad'))

    const modal = await screen.findByRole('dialog')
    expect(within(modal).getByText('admin.inventory.import.title')).toBeInTheDocument()
    expect(modal).toHaveAttribute('aria-modal', 'true')
    // Varsayılan KURU ÇALIŞTIRMA: prod stoğu kazara değişmesin (§4.7 risk kademesi)
    expect(within(modal).getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('kolon başlıklarındaki açıklama balonu klavyeyle açılır ve ESC ile kapanır (SC 1.4.13)', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Kanal Tipi Fan')
    const triggers = screen.getAllByRole('button', { name: 'admin.ui.moreInfo' })
    expect(triggers.length).toBeGreaterThan(0)

    triggers[0].focus()
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()

    // Dismissible: odağı/imleci OYNATMADAN kapanabilmeli
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
  })
})
