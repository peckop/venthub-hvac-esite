'use client';
import { Info } from 'lucide-react'
import React from 'react'

import { BottomCTA, TrustSignals } from '@/components/category/sections'
import Breadcrumb from '@/components/navigation/Breadcrumb'
import FamilyCard from '@/components/products/FamilyCard'
import VentImage from '@/components/ui/VentImage'
import { productImagePlaceholder, resolveProductImageUrl } from '@/lib/images/productImage'
import type { SeriesLanding } from '@/lib/services/family.service'

import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'
import { getCategoryDisplayName, getLocalizedCategorySlug } from '../../utils/categoryHelpers'

/**
 * T138-VH K1 — SERİ LANDING görünümü.
 *
 * "KART = MODEL, SERİ = LANDING" kararının (2026-08-21, Recep) görünen yüzü: seri kendi
 * sayfasında satılmaz, altındaki MODELLERİ tanıtır. Kullanıcı kapasiteyi karttan seçer —
 * piyasadaki (avensair/seat/vortice/danfoss) alışkanlık budur.
 *
 * KABUK YENİDEN KULLANILIR, yeni şablon icat EDİLMEZ: hero + breadcrumb + `FamilyCard`
 * ızgarası + `BottomCTA` bileşimi `CategoryLandingView` ile aynıdır; kart sözleşmesi de
 * aynı (`FamilyListItem`). Kategoriye özel bölümler (sihirbaz, SSS, tip karşılaştırma)
 * BURADA YOK — onlar kategori düzlemine ait.
 *
 * STİL NOTU: kabuk `CategoryLandingView`'den alındı ama sınıfları BİREBİR kopyalanmadı —
 * o dosya legacy (`max-w-7xl`, ham `slate-*`, çıplak `font-black`) ve INV-9 ratchet'i yeni
 * kodda bunları saydırmıyor. Buradaki karşılıkları cetvelden: konteyner `max-w-page` (§2.1),
 * gri = `light-gray`/`steel-gray`/`industrial-gray` token'ları (§2.2), başlık `font-bold`
 * (§2.5 — `font-black` yalnız `text-display` eşliğinde, o rol bu repoda henüz kullanılmıyor).
 *
 * Metinlerin tamamı sözlükten; yeni i18n anahtarı EKLENMEDİ (sözlük başka şeridin
 * dosyası — mevcut `category.*` anahtarları yeniden kullanılır).
 */
interface SeriesLandingViewProps {
  series: SeriesLanding['series']
  models: SeriesLanding['models']
  lang: string
}

const SeriesLandingView: React.FC<SeriesLandingViewProps> = ({ series, models, lang }) => {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()

  const description =
    (lang === 'en' ? series.description?.en : series.description?.tr) ||
    series.description?.tr ||
    series.description?.en ||
    t('category.landing.descriptionFallback')

  // Seri satırının kendi görseli yoktur (doğrudan varyantı yok) — kapak ilk modelden gelir.
  const heroImage =
    resolveProductImageUrl({ cover_image_path: models[0]?.cover_image_path ?? null }) ??
    productImagePlaceholder(series.slug)

  // T138-VH K7: K1 burada yalnız İKİ basamak basıyordu (Ana Sayfa > seri adı) — kategori
  // katmanı yoktu (ölçüldü). Desen `ProductDetailPageView.tsx`'teki mainCategory/subCategory
  // zincirinin AYNISI: kategori yoksa basamak hiç eklenmez (kırılmaz, kısalır), alt kategori
  // varsa üst kategorinin görünen slug'ıyla birlikte iki-segmentli URL kurulur (Routes.category
  // ikinci argümanı ilkiyle aynıysa otomatik tek segmente düşer — utils/routes.ts).
  const categorySlug = series.category ? getLocalizedCategorySlug(series.category, lang) : null
  const subcategorySlug = series.subcategory
    ? getLocalizedCategorySlug(series.subcategory, lang)
    : null

  const breadcrumbItems = [
    { label: t('category.breadcrumbHome'), href: '/' },
    ...(series.category
      ? [{ label: getCategoryDisplayName(series.category, t), href: Routes.category(categorySlug!) }]
      : []),
    ...(series.subcategory
      ? [
          {
            label: getCategoryDisplayName(series.subcategory, t),
            href: categorySlug
              ? Routes.category(categorySlug, subcategorySlug!)
              : Routes.category(subcategorySlug!),
          },
        ]
      : []),
    { label: series.name, href: '' }
  ]

  return (
    <div className="bg-clean-white">
      <div className="bg-light-gray/40 border-b border-light-gray relative overflow-hidden">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Breadcrumb items={breadcrumbItems} className="mb-10" />
              <div className="flex items-center gap-3 mb-6 text-primary-navy font-medium text-sm tracking-widest uppercase bg-primary-navy/5 w-fit px-4 py-2 rounded-hvac-sm border border-primary-navy/10">
                <Info size={16} />
                <span>{series.brand_name ?? t('category.landing.expertiseArea')}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-industrial-gray mb-8 leading-hvac-11 tracking-tight">
                {series.name}
              </h1>
              <p className="text-xl text-steel-gray max-w-prose leading-relaxed">
                {description}
              </p>
              {series.series_code && (
                <p className="mt-6 text-xs font-medium uppercase tracking-widest text-steel-gray/70">
                  {series.series_code}
                </p>
              )}
            </div>
            <div className="relative">
              <div className="absolute -inset-10 bg-secondary-blue/5 rounded-full blur-3xl" />
              <div className="relative aspect-square rounded-hvac-xl overflow-hidden shadow-2xl bg-clean-white">
                <VentImage
                  src={heroImage}
                  alt={series.name}
                  fallbackType="product"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-contain p-10"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modeller GİZLİ DEĞİL: seri sayfasının asıl içeriği model listesidir; kategori
          landing'indeki "ürünleri göster" katlaması burada sayfayı boş gösterirdi. */}
      <div id="products-anchor" className="scroll-mt-24" />
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4 border-b border-light-gray pb-8">
          <div>
            <h2 className="text-3xl font-bold text-industrial-gray uppercase tracking-tighter">
              {series.name} {t('category.landing.modelsSuffix')}
            </h2>
            <p className="text-sm text-steel-gray mt-2 font-medium uppercase tracking-widest">
              {t('category.family.count', { count: models.length })}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 content-auto">
          {models.map((model, index) => (
            <FamilyCard key={model.id} family={model} layout="grid" priority={index < 4} />
          ))}
        </div>
      </div>

      <TrustSignals />

      <BottomCTA showWizard={false} categoryName={series.name} />
    </div>
  )
}

export default SeriesLandingView
