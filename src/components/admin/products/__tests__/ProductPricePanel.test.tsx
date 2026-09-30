import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'
import type {
  ClearProductPriceResult,
  ProductPricePanelState,
  SetProductPriceResult,
} from '@/lib/services/pricingProductPrice.service'

import ProductPricePanel from '../ProductPricePanel'
import { VAT_PREFERENCE_KEY } from '../productPriceInput'

/**
 * ÜRÜN FİYAT YAN PANELİ (REC-412 Faz 2a) — cetvel pricing-standard §12.1.
 * Hizmet katmanı taklit edilir (gerçeği pricingProductPrice.service.test.ts sınar); burada panelin SÖZLEŞMESİ sınanır:
 * KDV seçimi + önizleme, yazımdan sonra vitrin geri okuma sonucunun DÜRÜSTÇE söylenmesi, kısmi başarıda "tekrar dene",
 * sessiz başarı YOK, yetki bayrağı, kaldırma onayı.
 */

const m = vi.hoisted(() => ({
  load: vi.fn(),
  set: vi.fn(),
  clear: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowserClient: { auth: { getUser: () => Promise.resolve({ data: { user: { id: 'u1' } } }) } },
}))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key}|${JSON.stringify(params)}` : key),
    lang: 'tr',
  }),
}))
vi.mock('@/lib/services/pricingProductPrice.service', async (importOriginal) => {
  const gercek = await importOriginal<typeof import('@/lib/services/pricingProductPrice.service')>()
  return {
    ...gercek,
    loadProductPricePanelState: m.load,
    setProductPrice: m.set,
    clearProductPrice: m.clear,
  }
})

const URUN = { id: 'p1', name: 'Çatı Tipi Fan', sku: 'CTF-100' }

function durum(partial: Partial<ProductPricePanelState> = {}): ProductPricePanelState {
  return {
    storefront: { status: 'beklenen-yok', net: 1000, gross: 1200, isDerived: true },
    fixedRule: null,
    otherFixedRules: 0,
    ...partial,
  }
}

function setSonuc(partial: Partial<SetProductPriceResult> = {}): SetProductPriceResult {
  return {
    rule: {} as SetProductPriceResult['rule'],
    recalc: 'tamam',
    verification: { status: 'dogrulandi', net: 2000, gross: 2400, isDerived: true },
    golgelendi: false,
    kazananKuralId: 'r1',
    ...partial,
  }
}

function renderPanel(props: Partial<React.ComponentProps<typeof ProductPricePanel>> = {}) {
  const onSaved = vi.fn()
  const onClose = vi.fn()
  const view = render(
    <ConfirmProvider>
      <ProductPricePanel open product={URUN} canReflect onClose={onClose} onSaved={onSaved} {...props} />
    </ConfirmProvider>,
  )
  return { ...view, onSaved, onClose }
}

async function amountInput(): Promise<HTMLInputElement> {
  const el = await screen.findByLabelText('admin.products.pricePanel.amountLabel')
  if (!(el instanceof HTMLInputElement)) throw new Error('tutar alanı input değil')
  return el
}

describe('ProductPricePanel', () => {
  beforeEach(() => {
    m.load.mockReset()
    m.set.mockReset()
    m.clear.mockReset()
    window.localStorage.clear()
    m.load.mockResolvedValue(durum())
  })

  it('açılışta ürünü ve vitrinde görünen fiyatı (KDV hariç/dahil) gösterir; sabit fiyat yoksa bunu söyler', async () => {
    renderPanel()

    expect(await screen.findByText('Çatı Tipi Fan')).toBeInTheDocument()
    expect(screen.getByText('CTF-100')).toBeInTheDocument()
    expect(await screen.findByText('admin.products.pricePanel.ruleNone')).toBeInTheDocument()
    expect(screen.getByText(/1\.200/)).toBeInTheDocument()
    expect(m.load).toHaveBeenCalledWith(expect.anything(), 'p1')
  })

  it('kayıtlı sabit kural varsa alanları ondan doldurur (tutar + KDV modu) ve "kaldır" düğmesini gösterir', async () => {
    m.load.mockResolvedValue(
      durum({ fixedRule: { id: 'r1', fixedPrice: 2400, vatIncluded: false, vatRatePct: 20 } }),
    )
    renderPanel()

    const input = await amountInput()
    await waitFor(() => expect(input.value).toBe('2400'))
    const haric = screen.getByLabelText('admin.products.pricePanel.vatExcluded')
    expect(haric).toBeChecked()
    expect(screen.getByRole('button', { name: 'admin.products.pricePanel.clear' })).toBeInTheDocument()
  })

  it('kayıt yoksa KDV seçimi son tercihten gelir (varsayılan KDV dahil)', async () => {
    window.localStorage.setItem(VAT_PREFERENCE_KEY, 'false')
    renderPanel()
    await amountInput()
    await waitFor(() => expect(screen.getByLabelText('admin.products.pricePanel.vatExcluded')).toBeChecked())
  })

  it('tutar yazılınca vitrinde görünecek KDV hariç/dahil önizleme çıkar; seçici önizlemeyi değiştirir', async () => {
    renderPanel()
    const input = await amountInput()

    fireEvent.change(input, { target: { value: '1200' } })
    expect(await screen.findByText(/previewBoth\|.*1\.000.*1\.200/)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('admin.products.pricePanel.vatExcluded'))
    expect(await screen.findByText(/previewBoth\|.*1\.200.*1\.440/)).toBeInTheDocument()
  })

  it('KDV dahil girilen tutar kuruş yuvarlamasıyla kayıyorsa bunu AÇIKÇA söyler', async () => {
    renderPanel()
    const input = await amountInput()

    fireEvent.change(input, { target: { value: '999,99' } })

    expect(await screen.findByText(/previewRounding/)).toBeInTheDocument()
  })

  it('geçersiz tutarda alan hatası (aria-invalid + alert) gösterir ve Kaydet kapalı kalır', async () => {
    renderPanel()
    const input = await amountInput()

    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.blur(input)

    expect(await screen.findByRole('alert')).toHaveTextContent('admin.products.pricePanel.invalidAmount')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('button', { name: 'admin.products.pricePanel.save' })).toBeDisabled()
    expect(m.set).not.toHaveBeenCalled()
  })

  it('kaydet: hizmeti yönetici bayrağı ve panel yöntemiyle çağırır, vitrinde ÖLÇÜLEN fiyatı söyler, tabloyu yeniler, KDV tercihini saklar', async () => {
    m.set.mockResolvedValue(setSonuc())
    const { onSaved } = renderPanel()
    const input = await amountInput()

    fireEvent.change(input, { target: { value: '2.400' } })
    fireEvent.click(screen.getByLabelText('admin.products.pricePanel.vatExcluded'))
    fireEvent.click(screen.getByRole('button', { name: 'admin.products.pricePanel.save' }))

    await waitFor(() => expect(m.set).toHaveBeenCalledTimes(1))
    expect(m.set).toHaveBeenCalledWith(
      expect.anything(),
      'p1',
      { amount: 2400, vatIncluded: false },
      { yontem: 'panel', recalculate: true, updatedBy: 'u1' },
    )
    expect(await screen.findByText(/result\.verified/)).toBeInTheDocument()
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(window.localStorage.getItem(VAT_PREFERENCE_KEY)).toBe('false')
  })

  it('vitrin beklenenden FARKLI ya da satır YOK ise sessiz başarı vermez: uyarı gösterir', async () => {
    m.set.mockResolvedValueOnce(
      setSonuc({
        verification: { status: 'farkli', net: 1000, gross: 1200, isDerived: false, expected: { net: 2000, gross: 2400 } },
      }),
    )
    renderPanel()
    fireEvent.change(await amountInput(), { target: { value: '2400' } })
    fireEvent.click(screen.getByRole('button', { name: 'admin.products.pricePanel.save' }))
    expect(await screen.findByText(/result\.different/)).toBeInTheDocument()
    expect(screen.queryByText(/result\.verified/)).not.toBeInTheDocument()

    m.set.mockResolvedValueOnce(setSonuc({ verification: { status: 'yok' } }))
    fireEvent.click(screen.getByRole('button', { name: 'admin.products.pricePanel.save' }))
    expect(await screen.findByText('admin.products.pricePanel.result.missing')).toBeInTheDocument()
  })

  it('kural yazıldı ama yeniden hesap düştü: kısmi başarı AÇIK yazılır ve "tekrar dene" aynı kaydı yeniden çağırır', async () => {
    m.set.mockResolvedValueOnce(setSonuc({ recalc: 'hata', recalcError: 'ağ yok', verification: null }))
    renderPanel()
    fireEvent.change(await amountInput(), { target: { value: '2400' } })
    fireEvent.click(screen.getByRole('button', { name: 'admin.products.pricePanel.save' }))

    expect(await screen.findByText(/result\.recalcFailed\|.*ağ yok/)).toBeInTheDocument()
    expect(screen.queryByText(/result\.verified/)).not.toBeInTheDocument()

    m.set.mockResolvedValueOnce(setSonuc())
    fireEvent.click(await screen.findByRole('button', { name: 'admin.products.pricePanel.retry' }))
    await waitFor(() => expect(m.set).toHaveBeenCalledTimes(2))
    expect(await screen.findByText(/result\.verified/)).toBeInTheDocument()
  })

  it('başka bir kural vitrini belirliyorsa (gölgelenme) uyarır ve kural sayfasına bağlantı verir', async () => {
    m.set.mockResolvedValue(setSonuc({ golgelendi: true, kazananKuralId: 'baska' }))
    renderPanel()
    fireEvent.change(await amountInput(), { target: { value: '2400' } })
    fireEvent.click(screen.getByRole('button', { name: 'admin.products.pricePanel.save' }))

    expect(await screen.findByText('admin.products.pricePanel.result.shadowed')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /result\.shadowedLink/ })
    expect(link).toHaveAttribute('href', '/admin/pricing/rules')
  })

  it('elle düzenlenmiş satır atlandıysa "neden yansımadı" sayacını gösterir', async () => {
    m.set.mockResolvedValue(
      setSonuc({ summary: { skippedManual: 2, skippedFxLocked: 1 } as SetProductPriceResult['summary'] }),
    )
    renderPanel()
    fireEvent.change(await amountInput(), { target: { value: '2400' } })
    fireEvent.click(screen.getByRole('button', { name: 'admin.products.pricePanel.save' }))

    expect(await screen.findByText(/result\.skippedManual\|.*2/)).toBeInTheDocument()
    expect(screen.getByText(/result\.skippedFxLocked\|.*1/)).toBeInTheDocument()
  })

  it('kural yazımı düşerse hata bölgesi (role=alert) gösterir; ham hata yutulmaz', async () => {
    m.set.mockRejectedValue({ code: '42501', message: 'yetki yok' })
    renderPanel()
    fireEvent.change(await amountInput(), { target: { value: '2400' } })
    fireEvent.click(screen.getByRole('button', { name: 'admin.products.pricePanel.save' }))

    expect(await screen.findByText(/saveFailed\|.*yetki yok/)).toBeInTheDocument()
  })

  it('vitrine yansıtma yetkisi yoksa (canReflect=false) yeniden hesap İSTENMEZ ve "yönetici yansıtmalı" denir', async () => {
    m.set.mockResolvedValue(setSonuc({ recalc: 'yapilmadi', verification: null }))
    renderPanel({ canReflect: false })
    fireEvent.change(await amountInput(), { target: { value: '2400' } })
    fireEvent.click(screen.getByRole('button', { name: 'admin.products.pricePanel.save' }))

    await waitFor(() => expect(m.set).toHaveBeenCalledTimes(1))
    expect(m.set.mock.calls[0][3]).toMatchObject({ recalculate: false })
    expect(await screen.findByText('admin.products.pricePanel.result.notReflected')).toBeInTheDocument()
  })

  it('kaldır: onay ister; onaylanınca hizmeti çağırır ve sonucu söyler; vazgeçilirse hiçbir şey yazılmaz', async () => {
    m.load.mockResolvedValue(durum({ fixedRule: { id: 'r1', fixedPrice: 2400, vatIncluded: true, vatRatePct: 20 } }))
    const sonuc: ClearProductPriceResult = {
      removed: 1,
      recalc: 'tamam',
      verification: { status: 'beklenen-yok', net: 1000, gross: 1200, isDerived: true },
    }
    m.clear.mockResolvedValue(sonuc)
    const { onSaved } = renderPanel()

    fireEvent.click(await screen.findByRole('button', { name: 'admin.products.pricePanel.clear' }))
    fireEvent.click(await screen.findByRole('button', { name: 'admin.products.pricePanel.clearCancelLabel' }))
    expect(m.clear).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'admin.products.pricePanel.clear' }))
    fireEvent.click(await screen.findByRole('button', { name: 'admin.products.pricePanel.clearConfirmLabel' }))

    await waitFor(() => expect(m.clear).toHaveBeenCalledTimes(1))
    expect(m.clear).toHaveBeenCalledWith(expect.anything(), 'p1', { yontem: 'panel', recalculate: true })
    expect(await screen.findByText('admin.products.pricePanel.result.cleared')).toBeInTheDocument()
    expect(onSaved).toHaveBeenCalled()
  })

  it('sabit kural yoksa "kaldır" düğmesi hiç görünmez', async () => {
    renderPanel()
    await amountInput()
    expect(screen.queryByRole('button', { name: 'admin.products.pricePanel.clear' })).not.toBeInTheDocument()
  })

  it('yükleme düşerse hata + "tekrar dene" gösterir ve tekrar dene yeniden okur', async () => {
    m.load.mockRejectedValueOnce({ message: 'ağ yok' })
    renderPanel()

    expect(await screen.findByText(/loadFailed\|.*ağ yok/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'admin.products.pricePanel.retry' }))

    await amountInput()
    expect(m.load).toHaveBeenCalledTimes(2)
  })

  it('bu panelin yönetmediği ek sabit kurallar (kampanya/para birimli) varsa bunu söyler', async () => {
    m.load.mockResolvedValue(durum({ otherFixedRules: 2 }))
    renderPanel()

    expect(await screen.findByText(/otherRules\|.*2/)).toBeInTheDocument()
  })

  it('vitrinde satış satırı yoksa "Teklif Alın" bilgisini söyler', async () => {
    m.load.mockResolvedValue(durum({ storefront: { status: 'yok' } }))
    renderPanel()

    expect(await screen.findByText('admin.products.pricePanel.storefrontNone')).toBeInTheDocument()
  })

  it('kapalıyken hiçbir şey okumaz ve render etmez', () => {
    renderPanel({ open: false })
    expect(m.load).not.toHaveBeenCalled()
    expect(screen.queryByText('Çatı Tipi Fan')).not.toBeInTheDocument()
  })
})
