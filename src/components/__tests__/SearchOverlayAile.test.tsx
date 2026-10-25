/**
 * URN-139 — öneri kutusunda SERİ (ürün ailesi) önerisi.
 *
 * NİÇİN: canlıda `get_search_suggestions` seri/aile dalına sahip değildi; `jet fan` yazan
 * ziyaretçi "JET Serisi"ni öneri olarak hiç görmüyordu (cetvel arama-standard.md §6, K6.1).
 * Migration (20261025120000) RPC'ye `type: 'family'` satırı ekledi; bu kapı istemci tarafını
 * ölçer: seri satırı çiziliyor mu · EN'de çeviri adı kullanılıyor mu (çeviri yoksa ad) · tıklayınca
 * ve klavye Enter'ıyla DİL ÖNEKLİ adrese gidiliyor mu (INV-SEARCH-ROUTE-1 ile aynı ilke).
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const ftsCagrisi = vi.fn()
const oneriCagrisi = vi.fn()

vi.mock('../../lib/services/product.service', () => ({
  ftsSearchProducts: (...a: unknown[]) => ftsCagrisi(...a),
  getSearchSuggestions: (...a: unknown[]) => oneriCagrisi(...a),
}))

const sabit = vi.hoisted(() => ({
  push: vi.fn(),
  router: { push: (...a: unknown[]) => sabit.push(...a) },
  kategoriler: { categories: [] as unknown[], getCategoryBySlug: () => undefined },
  rotalar: { home: () => '/tr', products: () => '/tr/urunler' },
}))

vi.mock('next/navigation', () => ({ useRouter: () => sabit.router }))

// Çeviri fonksiyonu modül düzeyinde TEK KEZ kurulur (bkz. SearchOverlayTekListe.test.tsx notu);
// dil testten teste bu nesne üzerinde değiştirilir.
const sabitCeviri = vi.hoisted(() => {
  const sozluk: Record<string, Record<string, string>> = {
    tr: {
      'search.placeholder': 'Ara',
      'search.noResults': 'Sonuç bulunamadı',
      'search.noResultsAdvice': 'Farklı bir terim deneyin',
      'search.keyboardHint': 'Ok tuşları ile gezinebilirsiniz',
      'search.enterHint': 'Seçmek için',
      'search.failed': 'Arama şu an yapılamadı.',
      'search.retry': 'Tekrar dene',
      'search.familyCaption': 'Ürün serisi',
      'common.close': 'Kapat',
    },
    en: {
      'search.placeholder': 'Search',
      'search.noResults': 'No results',
      'search.noResultsAdvice': 'Try another term',
      'search.keyboardHint': 'Use arrow keys',
      'search.enterHint': 'Select',
      'search.failed': 'Search failed.',
      'search.retry': 'Try again',
      'search.familyCaption': 'Product series',
      'common.close': 'Close',
    },
  }
  const durum = { lang: 'tr' }
  const t = (k: string) => sozluk[durum.lang]?.[k] ?? k
  return {
    get lang() { return durum.lang },
    set lang(v: string) { durum.lang = v },
    t,
  }
})

vi.mock('../../i18n/I18nProvider', () => ({ useI18n: () => sabitCeviri }))
vi.mock('../../contexts/CategoryContext', () => ({ useCategories: () => sabit.kategoriler }))
vi.mock('../../hooks/useLocalizedRoutes', () => ({ useLocalizedRoutes: () => sabit.rotalar }))
vi.mock('../../lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../lib/images/productImage', () => ({ resolveProductImageUrl: () => null }))
vi.mock('../../utils/getCategoryIcon', () => ({ getCategoryIcon: () => () => null }))

import SearchOverlay from '../SearchOverlay'

const JET_SERISI = {
  type: 'family',
  label: 'JET Serisi',
  url: '/products/jet-serisi',
  metadata: { slug: 'jet-serisi', name_i18n: { tr: 'JET Serisi', en: 'SEAT JET Series Acid-Resistant Fans' } },
}

const ekranMetni = () => document.body.textContent ?? ''
const kalem = (parca: string) =>
  screen.getAllByRole('button').find((b) => (b.textContent ?? '').includes(parca))

async function ara(sorgu = 'jet fan') {
  render(<SearchOverlay open onClose={vi.fn()} />)
  await userEvent.type(screen.getByPlaceholderText(sabitCeviri.lang === 'en' ? 'Search' : 'Ara'), sorgu)
}

describe('SearchOverlay — seri önerisi (URN-139)', () => {
  beforeEach(() => {
    sabit.push.mockClear()
    ftsCagrisi.mockReset()
    oneriCagrisi.mockReset()
    ftsCagrisi.mockResolvedValue([])
    sabitCeviri.lang = 'tr'
    // jsdom'da yok; aktif kalem görünüme kaydırılırken (fare üstüne gelme / ok tuşu) çağrılır.
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('TR: seri satırı ad + "Ürün serisi" etiketiyle çizilir', async () => {
    oneriCagrisi.mockResolvedValue([JET_SERISI])
    await ara()

    await waitFor(() => expect(ekranMetni()).toContain('Serisi'), { timeout: 3000 })
    expect(ekranMetni()).toContain('Ürün serisi')
    // Ham anahtar sızmamalı.
    expect(ekranMetni()).not.toContain('search.familyCaption')
    // Seri satırı boş durum ekranını da kapatır (ne ürün ne kısayol DEĞİL).
    expect(ekranMetni()).not.toContain('Sonuç bulunamadı')
  })

  it('TR: name_i18n.tr doluysa o görünür (SSOT familyName), boşsa ad', async () => {
    oneriCagrisi.mockResolvedValue([
      { type: 'family', label: 'SEAT Serisi', url: '/products/seat-serisi', metadata: { slug: 'seat-serisi', name_i18n: { tr: 'SEAT Storm Jet Asit Dayanımlı Fanlar', en: 'SEAT Storm Jet Acid-Resistant Fans' } } },
      { type: 'family', label: 'Vortice Bravo S', url: '/products/vortice-bravo-s', metadata: { slug: 'vortice-bravo-s', name_i18n: { tr: '', en: 'Vortice Bravo S' } } },
    ])
    await ara()

    await waitFor(() => expect(ekranMetni()).toContain('SEAT Storm Jet Asit Dayanımlı Fanlar'), { timeout: 3000 })
    expect(ekranMetni()).toContain('Vortice Bravo S')
    expect(ekranMetni()).not.toContain('SEAT Serisi')
  })

  it('TR: tıklayınca DİL ÖNEKLİ seri adresine gider (ham adres değil)', async () => {
    oneriCagrisi.mockResolvedValue([JET_SERISI])
    await ara()
    await waitFor(() => expect(kalem('Ürün serisi')).toBeDefined(), { timeout: 3000 })

    // fireEvent: userEvent.click önce fareyi üstüne getirir, bileşen her çizimde kalem anahtarını
    // yeniler (`key={...Math.random()}`) ve tıklama yeni düğüme düşmeden kaybolur (yalnız testte görülür).
    fireEvent.click(kalem('Ürün serisi')!)

    expect(sabit.push).toHaveBeenCalledTimes(1)
    const hedef = String(sabit.push.mock.calls[0][0])
    expect(hedef.startsWith('/tr/')).toBe(true)
    expect(hedef).toContain('jet-serisi')
  })

  it('EN: etiket metadata.name_i18n.en adıdır, adres /en önekli', async () => {
    sabitCeviri.lang = 'en'
    oneriCagrisi.mockResolvedValue([JET_SERISI])
    await ara()

    await waitFor(() => expect(ekranMetni()).toContain('SEAT JET Series Acid-Resistant Fans'), { timeout: 3000 })
    expect(ekranMetni()).toContain('Product series')

    fireEvent.click(kalem('Product series')!)
    const hedef = String(sabit.push.mock.calls[0][0])
    expect(hedef.startsWith('/en/')).toBe(true)
    expect(hedef).toContain('jet-serisi')
  })

  it('EN: çeviri adı yoksa (boş / eksik metadata) birincil ada düşer, çökmez', async () => {
    sabitCeviri.lang = 'en'
    oneriCagrisi.mockResolvedValue([
      { type: 'family', label: 'Vortice Bravo S', url: '/products/vortice-bravo-s', metadata: { slug: 'vortice-bravo-s', name_i18n: { tr: 'Vortice Bravo S', en: '   ' } } },
      { type: 'family', label: 'Casals NIMUS Santrifüj Fanlar', url: '/products/casals-nimus', metadata: {} },
      { type: 'family', label: 'AVenS Hız Anahtarları', url: '/products/avens-hiz-anahtarlari', metadata: null },
    ])
    await ara('fan')

    await waitFor(() => expect(ekranMetni()).toContain('Vortice Bravo S'), { timeout: 3000 })
    expect(ekranMetni()).toContain('Casals NIMUS Santrifüj Fanlar')
    expect(ekranMetni()).toContain('AVenS Hız Anahtarları')
  })

  it('klavye: Enter ilk kaleme (seri) gider; seri, kategori ve markayla AYNI listede durur', async () => {
    oneriCagrisi.mockResolvedValue([
      { type: 'category', label: 'Fanlar', url: '/category/fans', metadata: {} },
      JET_SERISI,
      { type: 'brand', label: 'SEAT', url: '/products?brand=SEAT', metadata: {} },
    ])
    await ara()
    await waitFor(() => expect(ekranMetni()).toContain('Ürün serisi'), { timeout: 3000 })
    expect(ekranMetni()).toContain('Fanlar')
    expect(ekranMetni()).toContain('SEAT')

    // Ok aşağı → ikinci kalem (seri), Enter → git.
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(sabit.push).toHaveBeenCalledTimes(1)
    expect(String(sabit.push.mock.calls[0][0])).toContain('jet-serisi')
  })
})
