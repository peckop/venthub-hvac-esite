/**
 * REC-340 — arama TEK AŞAMALI olmalı.
 *
 * NİÇİN BU TEST VAR: Recep canlıda aradı ve *"ben bu şekilde 2 aramalı bir arama motoru
 * bilmiyorum, kullanıcı olarak ben de zorlandıysam bir yerde sorun var değil mi?"* dedi.
 * Yazarken açılan kutu ile "tüm sonuçlar" adımı ayrı iki RPC'ye bağlıydı ve farklı sonuç
 * veriyorlardı: "jet fan" öneri kutusunda 0, tam aramada 20 sonuç.
 *
 * Kapı dört şeyi ölçer: kullanıcı yazar yazmaz ÜRÜNLERİ görüyor mu · ara bir "tüm sonuçları
 * göster" adımı KALMADI mı · kategori/marka kısayolları ürünlerle AYNI listede mi · öneri
 * çağrısından gelen ürün ikinci kez basılıyor mu.
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const ftsCagrisi = vi.fn()
const oneriCagrisi = vi.fn()

vi.mock('../../lib/services/product.service', () => ({
  ftsSearchProducts: (...a: unknown[]) => ftsCagrisi(...a),
  getSearchSuggestions: (...a: unknown[]) => oneriCagrisi(...a),
}))

// ⚠Kancaların döndürdüğü nesneler de TEK KEZ kurulur (bkz. aşağıdaki çeviri notu).
const sabitKancalar = vi.hoisted(() => ({
  router: { push: () => undefined },
  kategoriler: { categories: [] as unknown[], getCategoryBySlug: () => undefined },
  rotalar: { home: () => '/tr', products: () => '/tr/urunler' },
}))

vi.mock('next/navigation', () => ({ useRouter: () => sabitKancalar.router }))

// ⚠Çeviri fonksiyonu modül düzeyinde TEK KEZ kurulur. Gerçek `useI18n` onu `useMemo` ile
// kararlı döndürür; her çağrıda yeni fonksiyon üreten bir sahte, `t`'ye bağlı effect'i sonsuz
// döngüye sokar ve test bellek taşmasıyla düşer (2026-09-16'da tam olarak bu yaşandı).
// Sahte gerçeği taklit etmiyorsa test kördür.
const sabitCeviri = vi.hoisted(() => {
  const s: Record<string, string> = {
    'search.placeholder': 'Ara',
    'search.noResults': 'Sonuç bulunamadı',
    'search.noResultsAdvice': 'Farklı bir terim deneyin',
    'search.keyboardHint': 'Ok tuşları ile gezinebilirsiniz',
    'search.enterHint': 'Seçmek için',
    'search.failed': 'Arama şu an yapılamadı.',
    'search.retry': 'Tekrar dene',
    'common.close': 'Kapat',
  }
  const t = (k: string) => s[k] || k
  return { lang: 'tr', t }
})

vi.mock('../../i18n/I18nProvider', () => ({ useI18n: () => sabitCeviri }))

vi.mock('../../contexts/CategoryContext', () => ({
  useCategories: () => sabitKancalar.kategoriler,
}))

vi.mock('../../hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => sabitKancalar.rotalar,
}))

vi.mock('../../lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../lib/images/productImage', () => ({ resolveProductImageUrl: () => null }))
vi.mock('../../utils/getCategoryIcon', () => ({ getCategoryIcon: () => () => null }))

import SearchOverlay from '../SearchOverlay'

const URUNLER = [
  { id: '1', name: 'Jet Fan 20', sku: 'JET-20', brand: 'SEAT', price: 1000, rank: 0.9, family_slug: 'jet', cover_image_path: null },
  { id: '2', name: 'Jet Fan 35', sku: 'JET-35', brand: 'SEAT', price: 2000, rank: 0.8, family_slug: 'jet', cover_image_path: null },
]

// ⚠Arama kelimesi `<mark>` ile vurgulandığı için ürün adı DOM'da parçalıdır ("<mark>Jet</mark>
// Fan 20"). `getByText` tek düğüm arar ve bulamaz; bu yüzden ölçüm kullanıcının GÖRDÜĞÜ bütün
// metne ve tıklanabilir kalemlere bakar.
const ekranMetni = () => document.body.textContent ?? ''
const kalemler = (parca: string) =>
  screen.getAllByRole('button').filter((b) => (b.textContent ?? '').includes(parca))

describe('SearchOverlay — arama TEK AŞAMALI (REC-340)', () => {
  it('kullanıcı yazar yazmaz ÜRÜNLERİ gösterir, ikinci bir adım beklemez', async () => {
    ftsCagrisi.mockResolvedValue(URUNLER)
    oneriCagrisi.mockResolvedValue([])

    render(<SearchOverlay open onClose={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Ara'), 'jet fan')

    await waitFor(() => expect(ekranMetni()).toContain('Jet Fan 20'), { timeout: 3000 })
    expect(ekranMetni()).toContain('Jet Fan 35')
    // Ürün araması, kullanıcı hiçbir şeye basmadan koşmuş olmalı.
    expect(ftsCagrisi).toHaveBeenCalled()
  })

  it('ara adım KALMADI — "tüm sonuçları gör" / "detaylı ara" düğmesi YOK', async () => {
    ftsCagrisi.mockResolvedValue(URUNLER)
    oneriCagrisi.mockResolvedValue([])

    render(<SearchOverlay open onClose={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Ara'), 'jet fan')

    await waitFor(() => expect(ekranMetni()).toContain('Jet Fan 20'), { timeout: 3000 })
    const metin = ekranMetni().toLowerCase()
    expect(metin).not.toContain('tüm sonuçlar')
    expect(metin).not.toContain('detaylı ara')
    expect(metin).not.toContain('view all results')
    // Anahtar adı da sızmamalı (sözlükten silindi; ham anahtar basılırsa yakalanır).
    expect(metin).not.toContain('allresultsfor')
  })

  it('kategori kısayolu ürünlerle AYNI listede görünür', async () => {
    ftsCagrisi.mockResolvedValue(URUNLER)
    oneriCagrisi.mockResolvedValue([
      { type: 'category', label: 'Jet Fanlar', url: '/category/jet-fans', metadata: {} },
    ])

    render(<SearchOverlay open onClose={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Ara'), 'jet fan')

    await waitFor(() => expect(ekranMetni()).toContain('Jet Fanlar'), { timeout: 3000 })
    // Kısayol ve ürün AYNI anda ekranda — iki ayrı görünüm arasında geçiş yok.
    expect(ekranMetni()).toContain('Jet Fan 20')
  })

  it('öneri çağrısından gelen ÜRÜN kalemleri listeye ikinci kez basılmaz', async () => {
    ftsCagrisi.mockResolvedValue(URUNLER)
    oneriCagrisi.mockResolvedValue([
      { type: 'product', label: 'Jet Fan 20', url: '/products/jet?sku=JET-20', metadata: {} },
      { type: 'brand', label: 'SEAT', url: '/products?brand=SEAT', metadata: {} },
    ])

    render(<SearchOverlay open onClose={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Ara'), 'jet fan')

    await waitFor(() => expect(ekranMetni()).toContain('Jet Fan 20'), { timeout: 3000 })
    // Aynı ürün hem kısayol hem sonuç olarak basılsaydı kullanıcı iki ayrı küme görürdü.
    expect(kalemler('Jet Fan 20')).toHaveLength(1)
    // Marka kısayolu ise kendi kalemi olarak durur (ürün satırlarındaki marka etiketinden ayrı).
    expect(kalemler('SEAT').some((b) => !(b.textContent ?? '').includes('Jet Fan'))).toBe(true)
  })

  // 2026-09-17 canlı: `İNLİNE` araması veritabanı süre aşımına düştü ve ekran "Sonuç bulunamadı"
  // dedi — oysa 24 ürün vardı. Hata, boş sonuç gibi SÖYLENMEZ ve müşteriye yeniden deneme yolu verilir.
  it('arama HATA verirse "sonuç bulunamadı" demez; tekrar dene aynı sorguyu yeniden çalıştırır', async () => {
    ftsCagrisi.mockReset()
    oneriCagrisi.mockReset()
    ftsCagrisi.mockRejectedValueOnce({ code: '57014', message: 'canceling statement due to statement timeout' })
    ftsCagrisi.mockResolvedValue(URUNLER)
    oneriCagrisi.mockResolvedValue([])
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(<SearchOverlay open onClose={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Ara'), 'inline')

    await waitFor(() => expect(ekranMetni()).toContain('Arama şu an yapılamadı.'), { timeout: 3000 })
    expect(ekranMetni()).not.toContain('Sonuç bulunamadı')
    const cagriOnce = ftsCagrisi.mock.calls.length

    await userEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }))

    await waitFor(() => expect(ekranMetni()).toContain('Jet Fan 20'), { timeout: 3000 })
    expect(ftsCagrisi.mock.calls.length).toBe(cagriOnce + 1)
    expect(ekranMetni()).not.toContain('Arama şu an yapılamadı.')
  })
})
