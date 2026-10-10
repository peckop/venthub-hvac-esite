import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'
import type { DbCategory } from '@/types/db-rows'

import CategoryFormModal from '../CategoryFormModal'

/**
 * METADATA KORUMASI (Kanban ADM-11).
 *
 * `categories.metadata` kolonu güncellemede TÜMDEN değiştirilir ve kolonu koruyan
 * tetik yoktur. Form yalnız iki metriğin (metric1/metric2) sahibidir; slug (TR/EN
 * görünen adres), description_i18n, hide_price, model_type, hero_* ve seo_*_en
 * gibi diğer anahtarlar formun DEĞİLDİR. Form bunları kaydetmeden hemen önce
 * satırın GÜNCEL metadata'sını okuyup birleştirerek yazmalıdır; okuma başarısızsa
 * hiçbir şey yazılmamalıdır.
 */

type ReadResult = {
  data: { metadata: unknown } | null
  error: { message: string } | null
}

const h = vi.hoisted(() => ({
  read: { data: null, error: null } as ReadResult,
  selectColumns: vi.fn<(columns: string) => void>(),
  readEq: vi.fn<(column: string, value: string) => void>(),
  updatePayload: vi.fn<(payload: Record<string, unknown>) => void>(),
  updateEq: vi.fn<(column: string, value: string) => void>(),
  insertPayload: vi.fn<(payload: Record<string, unknown>) => void>(),
  toastError: vi.fn<(message: string) => void>(),
  toastSuccess: vi.fn<(message: string) => void>(),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowserClient: {
    from: () => ({
      select: (columns: string) => {
        h.selectColumns(columns)
        if (columns === 'metadata') {
          return {
            eq: (column: string, value: string) => {
              h.readEq(column, value)
              return {
                maybeSingle: () => Promise.resolve({ data: h.read.data, error: h.read.error }),
              }
            },
          }
        }
        // Üst kategori seçenekleri sorgusu (form açılışında).
        return { is: () => ({ neq: () => Promise.resolve({ data: [], error: null }) }) }
      },
      update: (payload: Record<string, unknown>) => {
        h.updatePayload(payload)
        return {
          eq: (column: string, value: string) => {
            h.updateEq(column, value)
            return Promise.resolve({ error: null })
          },
        }
      },
      insert: (payload: Record<string, unknown>) => {
        h.insertPayload(payload)
        return Promise.resolve({ error: null })
      },
    }),
  },
}))
vi.mock('sonner', () => ({ toast: { error: h.toastError, success: h.toastSuccess } }))
vi.mock('@/i18n/I18nProvider', () => ({ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }))
vi.mock('@/components/ui/VentImage', () => ({ default: () => null }))

/** Satırın veritabanındaki GÜNCEL metadata'sı (başka yazarların eklediği anahtarlar dahil). */
const FRESH_METADATA = {
  slug: { tr: 'fanlar', en: 'fans' },
  description_i18n: { tr: 'Fan açıklaması', en: 'Fan description' },
  hide_price: true,
  model_type: 'axial',
  hero_title: 'Fanlar',
  seo_title_en: 'Fans | VentHub',
  seo_desc_en: 'English search description',
  metric1: { label: 'Debi', value: '1' },
  metric2: { label: 'Basınç', value: '2' },
}

/** Form açılışındaki BAYAT kopya: yalnız metrikler var, diğer anahtarlar yok. */
function makeCategory(metadata: DbCategory['metadata']): DbCategory {
  return {
    id: 'cat-1',
    name: 'Fanlar',
    slug: 'fans',
    parent_id: null,
    description: '',
    seo_title: '',
    seo_desc: '',
    is_featured: false,
    sort_order: 1,
    image_url: null,
    is_active: true,
    level: 0,
    display_mode: null,
    marketing_title: null,
    menu_label: null,
    translation_key: null,
    tenant_id: 'tenant-1',
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
    authority_content: null,
    metadata,
  }
}

const STALE_COPY: DbCategory['metadata'] = {
  metric1: { label: 'Debi', value: '1' },
  metric2: { label: 'Basınç', value: '2' },
}

function renderModal(category: DbCategory | null) {
  const onSuccess = vi.fn()
  const onOpenChange = vi.fn()
  render(
    <ConfirmProvider>
      <CategoryFormModal open onOpenChange={onOpenChange} category={category} onSuccess={onSuccess} />
    </ConfirmProvider>,
  )
  return { onSuccess, onOpenChange }
}

function submitForm(): void {
  const form = document.getElementById('category-form')
  if (!(form instanceof HTMLFormElement)) throw new Error('category-form bulunamadı')
  fireEvent.submit(form)
}

/**
 * Metrik girdileri 'Metrikler' sekmesindedir ve sekme içeriği yalnız etkinken
 * DOM'dadır (Radix Tabs). Sekmeyi açıp (ilk çağrıda) girdiyi değiştirir.
 */
async function typeIntoPlaceholder(placeholderKey: string, value: string): Promise<void> {
  let input = screen.queryByPlaceholderText(placeholderKey)
  if (!input) {
    fireEvent.mouseDown(await screen.findByRole('tab', { name: 'admin.categories.tabMetrics' }), { button: 0 })
    input = await screen.findByPlaceholderText(placeholderKey)
  }
  fireEvent.change(input, { target: { value } })
}

/** Güncellemede gönderilen metadata nesnesini döndürür; yoksa testi anlamlı mesajla düşürür. */
function sentMetadata(): Record<string, unknown> {
  const payload = h.updatePayload.mock.calls[0]?.[0]
  const metadata = payload?.metadata
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    throw new Error('update çağrısında metadata nesnesi yok')
  }
  return metadata as Record<string, unknown>
}

describe('CategoryFormModal — kayıtta metadata korunur (ADM-11)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.read = { data: { metadata: FRESH_METADATA }, error: null }
  })

  it('güncelleme: slug, description_i18n, hide_price, model_type, seo_*_en duruyor; metric1/metric2 güncelleniyor', async () => {
    const { onSuccess } = renderModal(makeCategory(STALE_COPY))

    await typeIntoPlaceholder('admin.categories.metric1ValuePlaceholder', '42')
    await typeIntoPlaceholder('admin.categories.metric2LabelPlaceholder', 'Yeni etiket')
    submitForm()

    await waitFor(() => expect(h.updatePayload).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))

    const metadata = sentMetadata()

    // Formun sahip olmadığı anahtarlar AYNEN duruyor (bayat kopyada hiç yoktular:
    // yani değer, kaydetmeden hemen önceki GÜNCEL okumadan geliyor).
    expect(metadata.slug).toEqual({ tr: 'fanlar', en: 'fans' })
    expect(metadata.description_i18n).toEqual({ tr: 'Fan açıklaması', en: 'Fan description' })
    expect(metadata.hide_price).toBe(true)
    expect(metadata.model_type).toBe('axial')
    expect(metadata.hero_title).toBe('Fanlar')
    expect(metadata.seo_title_en).toBe('Fans | VentHub')
    expect(metadata.seo_desc_en).toBe('English search description')

    // Formun sahip olduğu metrikler kullanıcının girdiğiyle güncelleniyor.
    expect(metadata.metric1).toEqual({ label: 'Debi', value: '42' })
    expect(metadata.metric2).toEqual({ label: 'Yeni etiket', value: '2' })

    // Başka hiçbir anahtar eklenmedi ya da düştü.
    expect(Object.keys(metadata).sort()).toEqual(Object.keys(FRESH_METADATA).sort())

    // Okuma doğru satıra, yazma aynı satıra gitti.
    expect(h.selectColumns).toHaveBeenCalledWith('metadata')
    expect(h.readEq).toHaveBeenCalledWith('id', 'cat-1')
    expect(h.updateEq).toHaveBeenCalledWith('id', 'cat-1')
  })

  it('okuma hata verirse update ÇAĞRILMAZ, kullanıcıya açık hata gösterilir', async () => {
    h.read = { data: null, error: { message: 'bağlantı koptu' } }
    const { onSuccess, onOpenChange } = renderModal(makeCategory(STALE_COPY))

    await typeIntoPlaceholder('admin.categories.metric1ValuePlaceholder', '42')
    submitForm()

    await waitFor(() => expect(h.toastError).toHaveBeenCalledTimes(1))
    expect(h.toastError.mock.calls[0]?.[0]).toContain('bağlantı koptu')
    expect(h.updatePayload).not.toHaveBeenCalled()
    expect(h.toastSuccess).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('satır gelmezse (data null, hata yok) update ÇAĞRILMAZ, kullanıcıya açık hata gösterilir', async () => {
    h.read = { data: null, error: null }
    const { onSuccess } = renderModal(makeCategory(STALE_COPY))

    await typeIntoPlaceholder('admin.categories.metric1ValuePlaceholder', '42')
    submitForm()

    await waitFor(() => expect(h.toastError).toHaveBeenCalledTimes(1))
    expect(h.updatePayload).not.toHaveBeenCalled()
    expect(h.toastSuccess).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('güncel metadata null ise boş nesneden başlanır: yalnız iki metrik yazılır', async () => {
    h.read = { data: { metadata: null }, error: null }
    renderModal(makeCategory(STALE_COPY))

    await typeIntoPlaceholder('admin.categories.metric1ValuePlaceholder', '42')
    submitForm()

    await waitFor(() => expect(h.updatePayload).toHaveBeenCalledTimes(1))
    expect(sentMetadata()).toEqual({
      metric1: { label: 'Debi', value: '42' },
      metric2: { label: 'Basınç', value: '2' },
    })
  })

  it('güncel metadata nesne değilse (dizi) boş nesneden başlanır, dizi indeksleri sızmaz', async () => {
    h.read = { data: { metadata: ['x', 'y'] }, error: null }
    renderModal(makeCategory(STALE_COPY))

    await typeIntoPlaceholder('admin.categories.metric1ValuePlaceholder', '42')
    submitForm()

    await waitFor(() => expect(h.updatePayload).toHaveBeenCalledTimes(1))
    expect(Object.keys(sentMetadata()).sort()).toEqual(['metric1', 'metric2'])
  })

  it('ekleme dalı değişmedi: metadata okunmaz, yalnız iki metrik ile yeni satır eklenir', async () => {
    const { onSuccess } = renderModal(null)

    fireEvent.change(await screen.findByLabelText('admin.categories.formName'), { target: { value: 'Yeni' } })
    fireEvent.change(screen.getByLabelText('admin.categories.formSlug'), { target: { value: 'new' } })
    await typeIntoPlaceholder('admin.categories.metric1ValuePlaceholder', '7')
    submitForm()

    await waitFor(() => expect(h.insertPayload).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))

    expect(h.insertPayload.mock.calls[0]?.[0]?.metadata).toEqual({
      metric1: { label: '', value: '7' },
      metric2: { label: '', value: '' },
    })
    expect(h.selectColumns).not.toHaveBeenCalledWith('metadata')
    expect(h.updatePayload).not.toHaveBeenCalled()
  })
})
