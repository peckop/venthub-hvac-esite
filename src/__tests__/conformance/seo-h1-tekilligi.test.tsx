import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { FamilyListItem } from '@/types/ui-models'

import ProductsDiscoveryView from '../../views/ProductsDiscoveryView'

/**
 * INV-SEO-H1-1 · her vitrin sayfasının belgesinde TAM 1 ana başlık (h1)
 *
 * ÖLÇÜLMÜŞ BOŞLUK (2026-09-03, REC-127 · canlı sunucu HTML'i):
 *   /tr/products      → h1 = 0   (ilk başlık h2, altında h3'ler)
 *   /en/products      → h1 = 0
 *   /tr/category/...  → h1 = 1   (SAĞLAM — kusur burada DEĞİLDİ)
 * Yani hatanın sınıfı "hero istemciye düştü, bot görmüyor" DEĞİLDİ: gövde sunucuda
 * basılıyordu, sayfada h1 ETİKETİ hiç yoktu. Emirdeki teşhis buydu; ölçüm düzeltti.
 *
 * ⚠BU KAPININ SINIRI, ADIYLA: gerçek ölçüt sunucunun ÜRETTİĞİ HTML'dir; bu dosya onu
 * çalıştırmaz. Bu yüzden kapı iki kollu: (1) KARAR KOLU bileşeni gerçekten render eder ve
 * çıktıdaki h1'i SAYAR — kusurun yaşadığı yer orasıydı; (2) TRİPWIRE KOLU diğer vitrin
 * görünümlerinin kaynağında h1 arar, ama YORUMLARI TEMİZLEDİKTEN sonra sayar (yorumla
 * tatmin olan metin taraması ölçüm değildir). Tripwire "var mı" der, "SSR'da tek mi" demez.
 */

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('../../views/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k }),
}))

vi.mock('../../components/products/CategoryOrbitCarousel', () => ({
  default: () => <div data-testid="category-orbit-carousel" />,
}))

vi.mock('../../components/products/FamilyCard', () => ({
  default: ({ family }: { family: { id: string; name: string } }) => (
    <div data-testid={`family-card-${family.id}`}>{family.name}</div>
  ),
}))

/**
 * JSX sayımından ÖNCE yorumları sil — yorumdaki `<h1` kapıyı yeşile boyardı.
 *
 * ⚠`(?<!:)` ÖN-BAKIŞI ZORUNLU (INV-SCRUB-1): onsuz `https://...` içindeki `//` yorum
 * sanılır, satırın geri kalanı silinir ve bekçi SESSİZCE körleşir — hep yeşil kalır.
 * Bu kapıyı bugün ben tetikledim: ilk yazdığım sıyırıcı tam bu kusuru taşıyordu.
 */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/.*$/gm, '')
}

const VITRIN_GORUNUMLERI = [
  'src/views/ProductsDiscoveryView.tsx',
  'src/views/category/CategoryLandingView.tsx',
  'src/views/category/CategoryShowcaseView.tsx',
  'src/views/category/SeriesLandingView.tsx',
]

describe('INV-SEO-H1-1 · vitrin sayfalarında ana başlık tekilliği', () => {
  it('⭐KARAR KOLU — /products keşif görünümü TAM 1 h1 üretir (render edilerek sayıldı)', () => {
    const ham: unknown = [
      { id: '1', name: 'Family 1', slug: 'f1', brand_name: 'vortice', variant_count: 3, min_price: null, cover_image_path: null, total_count: 1 },
    ]
    render(<ProductsDiscoveryView families={ham as FamilyListItem[]} total={1} isLoading={false} />)

    const h1ler = screen.queryAllByRole('heading', { level: 1 })
    expect(
      h1ler.length,
      h1ler.length === 0
        ? '/products görünümünde h1 YOK — canlıda 2026-09-03 ölçülen kusur geri geldi. ' +
          'En üst başlık h2 ise belge ana başlıksız kalır; arama motoru sayfanın neyle ilgili ' +
          'olduğunu yalnız <title>den tahmin eder.'
        : `/products görünümünde ${h1ler.length} adet h1 var — ana başlık TEK olmalı.`,
    ).toBe(1)
  })

  it('⭐h1 metni sözlükten geliyor (ham metin değil) — i18n kuralı 7', () => {
    const ham: unknown = [
      { id: '1', name: 'Family 1', slug: 'f1', brand_name: 'vortice', variant_count: 3, min_price: null, cover_image_path: null, total_count: 1 },
    ]
    render(<ProductsDiscoveryView families={ham as FamilyListItem[]} total={1} isLoading={false} />)

    // Sahte `t` anahtarı aynen döndürüyor; h1 içeriği anahtarın KENDİSİ olmalı.
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(
      h1.textContent?.trim(),
      'h1 metni sözlük anahtarından gelmiyor — gömülü düz metin i18n kuralı 7 ihlalidir.',
    ).toBe('products.allProductsTitle')
  })

  it('TRİPWIRE — her vitrin görünümü kaynağında h1 taşıyor (yorumlar temizlenerek)', () => {
    const eksik = VITRIN_GORUNUMLERI.filter((yol) => {
      const kaynak = yorumsuz(readFileSync(resolve(process.cwd(), yol), 'utf8'))
      return !/<h1[\s>]/.test(kaynak)
    })
    expect(
      eksik,
      'Bu vitrin görünümlerinde h1 YOK — sayfa ana başlıksız yayınlanır: ' + eksik.join(', '),
    ).toEqual([])
  })

  it('ALT SINIR — sıyırıcı ŞEMAYI YEMİYOR ve hedef o satırdan GERÇEKTEN toplanıyor (INV-SCRUB-1)', () => {
    // Yalnız "sildi mi" diye bakmak yetmez: kapının istediği, sıyırılmış metinden hedefin
    // hâlâ toplanabildiğini ÖLÇMEK. URL'li satırda `<h1` varsa ikisi de kanıtlanır.
    const ornek = [
      'const dok = "https://venthub.com.tr/tr" // aciklama silinmeli',
      'return <h1 className="x">baslik</h1> // bu yorum da silinmeli',
      '/* blok yorum icinde <h1 sayilmamali */',
    ].join('\n')

    const temiz = yorumsuz(ornek)
    expect(temiz, 'sema yenmis — https:// icindeki // yorum sanildi').toContain('https://venthub.com.tr/tr')
    expect(temiz, 'satir yorumu silinmemis').not.toContain('aciklama silinmeli')
    expect(temiz, 'blok yorum silinmemis — yorumdaki <h1 kapiyi yesile boyardi').not.toContain('sayilmamali')
    expect(
      (temiz.match(/<h1[\s>]/g) ?? []).length,
      'siyirilmis metinden h1 TOPLANAMADI — siyirici hedefi de yemis olabilir',
    ).toBe(1)
  })

  it('vacuous-guard: tripwire gerçekten dosya okudu (boş evrende koşan kapı ölçüm değildir)', () => {
    const okunan = VITRIN_GORUNUMLERI.map((yol) => readFileSync(resolve(process.cwd(), yol), 'utf8').length)
    expect(okunan).toHaveLength(4)
    expect(Math.min(...okunan), 'Görünüm dosyalarından biri boş okundu — yol listesi bayat olabilir.').toBeGreaterThan(500)
  })
})
