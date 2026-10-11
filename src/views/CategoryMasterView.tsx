'use client'

import dynamic from 'next/dynamic'
import React, { useMemo } from 'react'

import { type CategoryViewModelLite } from '../components/home/GuidedCategoryDiscovery'
import Pagination from '../components/ui/Pagination'
import { useCategoryGateway } from '../hooks/useCategoryGateway'
import { useCategoryViewModel } from '../hooks/useCategoryViewModel'
import { useI18n } from '../i18n/I18nProvider'
import { compareText } from '../i18n/sort'
import type { DomainCategory } from '../lib/type-converters'
import type { FamilyListItem, KatalogSayilari } from '../types/ui-models'

// ssr:false BİLİNÇLİ KALDIRILDI (SSR boş-kabuk kök sebebiydi): client bileşende
// ssr:false, SSR sırasında en yakın Suspense sınırını komple CSR'a düşürür —
// kategori//products sayfaları Haziran'dan beri bota/LCP'ye boş <main> sunuyordu.
// dynamic() code-splitting için kalır; ağır 3D (CategoryOrbitCarousel) kendi
// izole Suspense'inde ssr:false olarak ProductsDiscoveryView içinde durur.
//
// ⭐BU GÖRÜNÜMLERİ SARAN SUSPENSE YOK — BİLİNÇLİ (URN-25, 2026-10-03). Mekanizma İKİ KOLLU:
// bir Suspense sınırının sardığı içerik, (a) askıya alınırsa (`dynamic()` sunucuda `React.lazy`
// gibi askıya alır) ya da (b) büyükse (Fizz, içerik `progressiveChunkSize` ≈ 12800 bayt üstündeyse
// TAMAMLANMIŞ olsa bile) sınırın DIŞINA, akış bloğuna (`<div hidden id="S:0">`) yazılır; görünür
// yerde yalnız fallback (spinner) iskeleti kalır. Ham HTML'de sayfa gövdesi (h1 dahil) gizli
// blokta kalıyordu (kategori ve /products). İkinci kol bu işte izole ölçülmedi; kaynağı
// çürütücü ölçümüdür (dynamic'siz `brands/page.tsx` da S:0 üretiyor). Sonuç değişmez: BÜYÜK GÖVDEYİ
// SARAN HER Suspense aynı arızayı verir, bu yüzden Suspense yalnız `useSearchParams` okuyan
// küçük yaprağı (Pagination) sarar (kural 5). Sınır olmayınca gövde HTML'e düz yazılır.
const CategoryGridView = dynamic(() => import('./category/CategoryGridView'))
const CategoryLandingView = dynamic(() => import('./category/CategoryLandingView'))
const CategorySeriesView = dynamic(() => import('./category/CategorySeriesView'))
const CategoryShowcaseView = dynamic(() => import('./category/CategoryShowcaseView'))
const ProductsDiscoveryView = dynamic(() => import('./ProductsDiscoveryView'))

/**
 * Görünüm modunun YÜRÜRLÜKTEKİ hâli — `display_mode` sütunu ne derse desin, veri onu
 * taşıyamıyorsa mod düşer.
 *
 * NİÇİN VAR (canlı ölçüm, 2026-08-26): `CategoryShowcaseView` yalnız `subCategories` alır,
 * `families` ALMAZ; showcase'te sayfalama da kapalıdır. Yani **alt kategorisi olmayan** bir
 * showcase kategorisi müşteriye HİÇBİR ŞEY listelemez — ileriye giden tek bir bağlantı bile
 * çıkmaz. O gün canlıda iki bağımsız örnekte ölçülmüştü ve etkilenen 27 aktif üründü.
 *
 * ⚠ **TAZELİK NOTU (2026-09-08): YUKARIDAKİ ÖRNEK ADRESLER ARTIK GEÇERLİ DEĞİL.**
 * Bu yorum bugün bir ölçümü yanlış yola soktu: içindeki `/tr/category/endustriyel-havalandirma`
 * adresi "7 alt kategorili çalışan örnek" diye anılıyordu, oysa DB'de **öyle bir slug yok** —
 * ne kanonik kolonda ne `metadata.slug.{tr,en}` içinde. Örnekler silindi, gerekçe bırakıldı:
 * vakanın kendisi gerçekti, adresleri bayattı. Yalan söyleyen bir yorum, olmayan bir yorumdan
 * daha pahalıdır.
 *
 * **Bugünkü ölçüm (prod, yalnız SELECT):** `display_mode='showcase'` olup alt kategorisi
 * sıfır olan kategori **YOK** — yani aşağıdaki fonksiyonun düzelttiği hâl bugün hiç oluşmuyor.
 * Fonksiyon yine de duruyor ve durmalı: veri yarın yeniden o hâle gelebilir, koruma ucuz.
 *
 * NİÇİN AYRI FONKSİYON: mod İKİ yerde okunuyor — hangi görünümün çizileceği ve sayfalamanın
 * gösterilip gösterilmeyeceği. İkisi ayrı ayrı hesaplanırsa sessizce ayrışır (bu dosyada zaten
 * bir kez oldu). Tek kaynak, iki tüketici.
 */
export function etkinGorunumModu(
  displayMode: 'showcase' | 'landing' | 'series' | 'grid',
  altKategoriSayisi: number,
): 'showcase' | 'landing' | 'series' | 'grid' {
  if (displayMode === 'showcase' && altKategoriSayisi < 1) return 'series'
  return displayMode
}

interface CategoryMasterViewProps {
  initialCategory?: DomainCategory | null
  /** F5-B W2.1: liste birimi artık varyant değil AİLE satırıdır. */
  families?: FamilyListItem[]
  /** Sunucu sayfalaması: filtre setine göre toplam aile sayısı. */
  total?: number
  /** 1-tabanlı aktif sayfa (?page=). */
  page?: number
  /** Sunucu tarafındaki sayfa boyutu (24). */
  pageSize?: number
  initialSubCategories?: DomainCategory[]
  /**
   * REC-213-A — YALNIZ keşif (kategorisiz) hâlinde kullanılır: `/products` sayfasının
   * kategori kapısı. Kategori sayfalarında anlamsızdır ve oraya geçilmez; kırıntı yolu
   * ve alt kategori kartları o hâlin kendi kapısıdır.
   */
  kategoriler?: CategoryViewModelLite[]
  /**
   * URN-95: Vortice'nin katalogdaki aile ve model sayısı (sunucudan, `getBrandCatalogSummary` özeti). Yalnız
   * hava perdesi ve sessiz fan anlatısındaki iki Vortice bölümünün sayaç kartlarını besler; yoksa kartlar çizilmez.
   */
  vorticeKatalogSayilari?: KatalogSayilari | null
}

const CategoryMasterView: React.FC<CategoryMasterViewProps> = ({
  initialCategory,
  families = [],
  total = 0,
  page = 1,
  pageSize = 24,
  initialSubCategories,
  kategoriler,
  vorticeKatalogSayilari
}) => {
  const { lang } = useI18n()

  // 1. Pure Data Layer (Gateway) — veri çekmez; kategori/alt kategori bağlamı + görünüm tercihleri
  const {
    category: rawCategory,
    parentCategory: rawParentCategory,
    subCategories: rawSubCategories,
    loading,
    filters,
    updateFilters
  } = useCategoryGateway(initialCategory, initialSubCategories)

  // 2. Presentation Layer (ViewModel)
  const { wrapCategory } = useCategoryViewModel()

  // 3. Derived UI State via ViewModel
  const category = useMemo(() => wrapCategory(rawCategory), [rawCategory, wrapCategory])
  const parentCategory = useMemo(() => wrapCategory(rawParentCategory), [rawParentCategory, wrapCategory])
  const availableBrands = useMemo(
    () => Array.from(new Set(families.map(f => f.brand_name).filter((b): b is string => !!b))),
    [families]
  )

  // Sayfa-içi (client) daraltma: sunucudan gelen 24'lük aile sayfası üzerinde çalışır.
  // Spec/fiyat filtreleri kaldırıldı — kalanlar aile satırında GERÇEKTEN uygulanabilir alanlar.
  const visibleFamilies = useMemo(() => {
    const query = filters.catSearch.trim().toLocaleLowerCase()
    let list = families

    if (query) {
      list = list.filter(f =>
        f.name.toLocaleLowerCase().includes(query) ||
        (f.brand_name ?? '').toLocaleLowerCase().includes(query) ||
        (f.series_code ?? '').toLocaleLowerCase().includes(query)
      )
    }
    if (filters.selectedBrands.length > 0) {
      list = list.filter(f => !!f.brand_name && filters.selectedBrands.includes(f.brand_name))
    }

    const sorted = [...list]
    if (filters.sortBy === 'variants') {
      sorted.sort((a, b) => b.variant_count - a.variant_count)
    } else {
      sorted.sort((a, b) => compareText(a.name, b.name, lang))
    }
    return sorted
  }, [families, filters, lang])

  /**
   * ⭐SAYFALAMA YALNIZ GERÇEKTEN BİRDEN ÇOK SAYFA VARSA ÇİZİLİR (REC-59, ölçüm 2026-09-08).
   *
   * `Pagination` içinde zaten `if (pageCount <= 1) return null` var — ama o kontrol
   * HOOK'LARDAN SONRA çalışır. Bileşen render edildiği an `useSearchParams()` çağrılır ve
   * bu, STATİK prerender'da o alt ağacı Suspense fallback'ine düşürür (CSR bailout).
   * Yani "hiçbir şey çizmeyen" bir bileşen, çizilmediği hâlde sayfanın bir parçasını
   * istemciye taşıyordu.
   *
   * ÖLÇÜLDÜ: kategori rotası statiğe geçtikten sonra üretilen HTML'de
   * `BAILOUT_TO_CLIENT_SIDE_RENDERING` işareti — `aksesuarlar.html` 3, `fanlar.html` 2.
   * Dosyalar üretilmişti ve İÇLERİ DOLUYDU; "46 dosya üretildi" ve "içerik var" ölçütlerinin
   * İKİSİ DE bunu ayırt etmedi. Kusuru ALTYAPI'nın e2e kapısı yakaladı (maxBailout 0).
   *
   * Koşulu ÇAĞIRANA taşımak hook'u hiç çağırmaz. Kategori rotasında `total > pageSize` artık
   * asla doğru olmaz (sayfa boyu 48, en kalabalık kategori 34) — yani orada sayfalama tümüyle
   * devre dışı. `/products` rotası aynı bileşeni kullanıyor ve o da `force-static` (`searchParams`
   * ALMAZ; sayfa boyu 72, ölçülen aile sayısı 47 — `urunlerSayfasi.tsx` K7 kolu), yani orada da
   * koşul bugün yanlış ve Pagination çizilmez. Aile sayısı 72'yi aştığı gün Pagination çizilir ve
   * `useSearchParams` bailout'u kendi sınırında kalır; o sınırı bu dosyada TEK Suspense yapan şey
   * INV-SSR-GOVDE-2'dir (içeriği değil yalnız Pagination'ı sarmalı).
   */
  const cokSayfaVar = total > pageSize
  const pagination = cokSayfaVar ? (
    <React.Suspense fallback={<div className="py-10" />}>
      <Pagination page={page} pageSize={pageSize} total={total} />
    </React.Suspense>
  ) : null

  if (!category && !loading) {
    return (
      <>
        <ProductsDiscoveryView kategoriler={kategoriler} families={visibleFamilies} total={total} isLoading={loading} />
        {pagination}
      </>
    )
  }

  // Yürürlükteki mod: sütun + verinin BİRLİKTE söylediği şey (bkz. etkinGorunumModu).
  const etkinMod = category
    ? etkinGorunumModu(category.displayMode, rawSubCategories?.length ?? 0)
    : null

  // Determine which view to render based on ViewModel's displayMode
  const renderView = () => {
    if (!category) return null

    switch (etkinMod) {
      case 'showcase':
        return (
          <CategoryShowcaseView
            category={category.raw}
            subCategories={rawSubCategories}
          />
        )
      case 'landing':
        return (
          <CategoryLandingView
            category={category.raw}
            parentCategory={parentCategory?.raw}
            families={visibleFamilies}
            vorticeKatalogSayilari={vorticeKatalogSayilari}
          />
        )
      case 'series':
        // Gelişmiş Beyaz Tasarım (Series)
        return (
          <CategorySeriesView
            category={category.raw}
            parentCategory={parentCategory?.raw}
            subCategories={rawSubCategories}
            families={visibleFamilies}
          />
        )
      default:
        // Eğer alt kategoriyse Series, ana kategoriyse Grid (Fallback)
        if (category.parentId) {
            return (
                <CategorySeriesView
                  category={category.raw}
                  parentCategory={parentCategory?.raw}
                  families={visibleFamilies}
                />
            )
        }

        // Eğer ana kategori ise ve alt kategorileri varsa Landing görünümü (alt kategorileri göstermek için)
        if (rawSubCategories && rawSubCategories.length > 0) {
            return (
              <CategoryLandingView
                category={category.raw}
                parentCategory={parentCategory?.raw}
                families={visibleFamilies}
                vorticeKatalogSayilari={vorticeKatalogSayilari}
              />
            )
        }

        return (
          <CategoryGridView
            category={category.raw}
            parentCategory={parentCategory?.raw}
            subCategories={rawSubCategories}
            availableBrands={availableBrands}
            families={visibleFamilies}
            filters={filters}
            onUpdateFilters={updateFilters}
            loading={loading}
          />
        )
    }
  }

  return (
    <div className="min-h-screen">
      {renderView()}
      {etkinMod !== 'showcase' && pagination}
    </div>
  )
}

export default CategoryMasterView
