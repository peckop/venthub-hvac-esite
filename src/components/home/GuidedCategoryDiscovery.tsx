'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { normalizeImageUrl } from '@/utils/imageUtils'

import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'

export interface CategoryViewModelLite {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  image_url: string | null;
}

interface GuidedCategoryDiscoveryProps {
  displayCategories?: CategoryViewModelLite[]
  /**
   * Başlık kümesinin sözlük ANAHTARLARI — hazır metin DEĞİL (kural 7: çeviri bu
   * bileşenin içinde, `t()` ile çözülür; çağıran çözülmüş metin geçirirse dil
   * sağlayıcısı devre dışı kalırdı).
   *
   * NİÇİN VAR (REC-213-A): bu blok artık İKİ sayfada çiziliyor — ana sayfa ve
   * `/products`. Ana sayfanın başlığı ("Ürün Ailelerimiz" ekseni) ürün listesi
   * sayfasında yanlış konuşur; orada blok bir keşif kısayolu, sayfanın tezi değil.
   * Varsayılanlar ana sayfanın bugünkü anahtarları olduğu için ana sayfa BİREBİR
   * aynı kalır — davranış değişikliği yalnız yeni çağıranda.
   *
   * `null` geçmek o satırı hiç çizmez (ör. `/products` üstünde göz/giriş cümlesi
   * istemiyoruz; sayfanın kendi h1'i zaten var, ikinci bir tez kurmak vaat şişirir).
   */
  eyebrowKey?: string | null
  headingKey?: string
  introKey?: string | null
}

const FALLBACK_CATEGORY_IMAGE = '/images/vortice_lineo_futuristic.webp'

const GuidedCategoryDiscovery: React.FC<GuidedCategoryDiscoveryProps> = ({
  displayCategories = [],
  eyebrowKey = 'home.guidedDiscovery.eyebrowLabel',
  headingKey = 'home.guidedDiscovery.heading',
  introKey = 'home.guidedDiscovery.intro',
}) => {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()
  return (
    <section id="categories" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            {eyebrowKey && (
              <div
                data-observe="fade-up"
                className="opacity-0 -translate-x-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-x-0 transition-opacity-transform duration-700 ease-out text-xs font-bold uppercase tracking-hvac-relaxed text-cyan-600 mb-4"
              >
                {t(eyebrowKey)}
              </div>
            )}
            <h2 
              data-observe="fade-up"
              className="opacity-0 translate-y-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-y-0 transition-opacity-transform duration-700 ease-out delay-200 text-4xl font-light tracking-tighter text-slate-950 sm:text-6xl"
            >
              {t(headingKey)}
            </h2>
          </div>
          {introKey && (
            <p
              data-observe="fade-up"
              className="opacity-0 data-[in-view=true]:opacity-100 transition-opacity duration-700 ease-out delay-300 max-w-md text-lg text-slate-500 font-light leading-relaxed"
            >
              {t(introKey)}
            </p>
          )}
        </div>

        {/* Mobile: Horizontal Scroll | Desktop: Grid */}
        <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-2 md:overflow-visible md:pb-0">
          {displayCategories.map((category, idx) => {
            const finalSrc = normalizeImageUrl(category.image_url, FALLBACK_CATEGORY_IMAGE, 'category-images');

            const delayClass = ['delay-0', 'delay-100', 'delay-200', 'delay-300'][idx % 4];
            
            return (
              <div
                key={category.id}
                data-observe="fade-up"
                className={`opacity-0 translate-y-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-y-0 transition-opacity-transform duration-700 ease-out ${delayClass} group relative flex-shrink-0 w-280px sm:w-320px md:w-auto snap-center overflow-hidden bg-slate-100 aspect-square lg:aspect-orbit`}
              >
                <Link href={Routes.category(category.slug)} className="block w-full h-full relative z-10">
                  {/* Background Image with Fallback Logic */}
                  <div className="absolute inset-0 z-0 bg-slate-950">
                    <Image
                      src={finalSrc}
                      alt={category.displayName}
                      fill
                      sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-1.5s ease-out group-hover:scale-110 grayscale-30 group-hover:grayscale-0"
                    />
                    {/* Architectural Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Content Overlay - Centered and Minimal */}
                  <div className="absolute inset-0 z-10 p-10 flex flex-col items-center justify-center text-center">
                    <div 
                      className="flex flex-col items-center opacity-90 transition-opacity duration-700"
                    >
                      <h3 className="text-xl lg:text-2xl font-extralight text-white tracking-hvac-tight mb-4 transition-transform duration-700 group-hover:-translate-y-2">
                        {category.displayName}
                      </h3>

                      <div className="w-12 h-px bg-white/30 group-hover:w-24 group-hover:bg-cyan-500 transition-width-bg duration-700" />
                      
                      {/* ⚠MOBİLDE DAİMA AÇIK — Recep kararı (2026-09-07): "görünmeyen
                          açıklamalar mobilde görünmesi lazım, bunu da çözün".

                          ÖLÇÜLMÜŞ KUSUR: bu kutu `max-h-0 opacity-0` ile başlayıp yalnız
                          `group-hover` ile açılıyordu. DOKUNMATİK CİHAZDA HOVER YOKTUR —
                          390×844'te ölçüldü: altı kartın altısında da max-height 0px,
                          opacity 0. Yani paragraf mobil ziyaretçide HİÇ açılmıyordu.
                          Etkisi somut: URUN-KATALOG aynı gün 23 kategori paragrafını canlı
                          veritabanına yazdı (REC-146, 0/37 → 23/37) ve bu yüzeyde hiçbiri
                          mobilde görünmüyordu. Metin DOM'daydı — bot görüyor, insan görmüyor.

                          ÇÖZÜM MOBİL ÖNCELİKLİ: varsayılan (küçük ekran) AÇIK; `md:` ve
                          üstünde eski hover davranışı AYNEN korunur. Böylece masaüstü
                          tasarımı hiç değişmez, yalnız hover'ı OLMAYAN cihaz kazanır.
                          Tek dokunuşla açma seçeneği ELENDİ: kart zaten bir bağlantı,
                          ilk dokunuş sayfayı açar — açma/kapama jesti bağlantıyla çakışırdı.

                          `line-clamp-2` (aşağıdaki p) zaten var, yani metin uzasa bile kart
                          iki satırdan fazla büyümez — ızgara düzeni korunur.
                          Bekçi: INV-KART-ACIKLAMA-MOBIL-1. */}
                      <div className="mt-6 max-h-24 opacity-100 md:max-h-0 md:opacity-0 md:group-hover:max-h-24 md:group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
                        <p className="text-xs text-slate-200 font-light leading-relaxed tracking-wider mb-6 max-w-200px line-clamp-2">
                          {category.description || t('home.guidedDiscovery.cardFallback')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/20 group-hover:border-cyan-500/50 transition-colors duration-500" />
                  <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/20 group-hover:border-cyan-500/50 transition-colors duration-500" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default GuidedCategoryDiscovery
