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
                /* Kart artık SABİT ORANLI DEĞİL: görsel alanı `aspect-square` ile kendi
                   oranını taşıyor, metin paneli içeriğine göre uzuyor. Eskiden kartın
                   kendisi sabit orandaydı ve panel büyüyünce görselden yer çalıyordu —
                   ölçülen sonuç: aynı satırdaki kartların görsel yükseklikleri 164px ile
                   140px arasında değişiyordu. Izgara zaten hücreleri eşit yükseklikte
                   uzatır, yani kartlar yine hizalı kalır. */
                className={`opacity-0 translate-y-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-y-0 transition-opacity-transform duration-700 ease-out ${delayClass} group relative flex-shrink-0 w-280px sm:w-320px md:w-auto snap-center overflow-hidden bg-white`}
              >
                {/* ⭐RECEP KARARI (2026-09-07), lafzıyla: "zaten bizdeki A seçeneği ve ben
                    bundan rahatsızım.. Yani B". İki varyant canlı sayfa üzerine uygulanıp
                    390px'te fotoğraflandı, Recep yan yana görüp seçti.

                    B = metin fotoğrafın ÜSTÜNDE DEĞİL, ALTINDA düz zeminde.

                    NİÇİN: eski hâlde yazı doğrudan koyu görselin üstündeydi ve karartma
                    katmanı yoktu; okunurluk HER KARTIN KENDİ FOTOĞRAFINA bağlıydı, yani
                    tesadüfe bırakılmıştı. WCAG AA metin/zemin kontrastının en az 4,5:1
                    olmasını ister — düz fotoğraf üstüne yazıda bu GARANTİ EDİLEMEZ, çünkü
                    fotoğraf kartlar arasında değişir. Canlı a11y taramasında anasayfa
                    96/100 ve üç kırmızıdan biri kontrasttı.

                    YAN SONUÇ: masaüstü ve mobil artık AYNI. Hover'a bağlı gizleme kalmadı,
                    yani REC-266'da eklenen `md:` kırılımı gereksizleşti ve kaldırıldı.
                    Bekçi de yeni kurala uyarlandı: INV-KART-ACIKLAMA-MOBIL-1. */}
                <Link href={Routes.category(category.slug)} className="flex h-full w-full flex-col relative z-10">
                  {/* Görsel bölgesi — metin ARTIK BURAYA BİNMİYOR.
                      ⭐ZEMİN AÇIK, FİLTRE YOK (Recep, 2026-09-07): "resimler neden arka
                      planı beyaz değil… arka plan beyaz olan ilgili ürünle olmalı".
                      Eski hâl `bg-slate-950` + `grayscale-30` idi ve bu A düzeninin
                      GEREĞİYDİ: yazı fotoğrafın üstünde olduğu için fotoğrafı karartmak
                      zorunluydu. B'ye geçince o gerekçe ortadan kalktı; karartma kaldı ve
                      beyaz zeminli temiz ürün fotoğraflarını bile karanlık/soluk
                      gösteriyordu. Ürün fotoğrafı artık kendi zemininde görünür. */}
                  <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-white">
                    {/* ⭐ÜÇ ÖLÇÜLMÜŞ KUSUR BURADA ONARILDI (Recep, 2026-09-07):
                        1. MERKEZLEME — hesaplanan `object-position` `50% 0%` idi, yani
                           görseller ortadan değil ÜSTTEN hizalanıyordu. `object-center`
                           açıkça yazıldı.
                        2. KIRPMA — `object-cover` ürünün kenarlarını kesiyordu. Beyaz
                           zeminli ürün fotoğrafında doğrusu ürünün TAMAMINI göstermektir;
                           `object-contain` + iç boşluk.
                        3. ORANTISIZLIK — görsel alanı `flex-1` idi, yani yüksekliği
                           BAŞLIĞIN KAÇ SATIR OLDUĞUNA bağlıydı: beş kartta 164px, uzun
                           başlıklı "Isı Geri Kazanım Üniteleri (VMC)" kartında 140px
                           ölçüldü. Artık `aspect-square` — başlık ne olursa olsun eşit. */}
                    <Image
                      src={finalSrc}
                      alt={category.displayName}
                      fill
                      sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1200px) 50vw, 25vw"
                      className="object-contain object-center p-6 transition-transform duration-1.5s ease-out group-hover:scale-105"
                    />
                    {/* Köşe vurguları görselin İÇİNDE kalır; metin paneline taşmaz.
                        Renk açık zemine göre: beyaz üzerine beyaz kenar GÖRÜNMEZ olurdu. */}
                    <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-steel-gray/25 group-hover:border-secondary-blue/60 transition-colors duration-500" />
                    <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-steel-gray/25 group-hover:border-secondary-blue/60 transition-colors duration-500" />
                  </div>

                  {/* Metin paneli — düz zemin, sabit ve bilinen bir arka plan rengi.
                      Kontrast artık fotoğrafa değil bu tek renge bağlı, yani ölçülebilir. */}
                  <div className="bg-white px-5 py-4 text-left">
                    <div className="flex flex-col items-start">
                      <h3 className="text-base lg:text-lg font-light text-industrial-gray tracking-hvac-tight mb-2">
                        {category.displayName}
                      </h3>

                      <div className="w-12 h-px bg-steel-gray/30 group-hover:w-24 group-hover:bg-secondary-blue transition-width-bg duration-700" />
                      
                      {/* ⭐AÇIKLAMA HER GENİŞLİKTE AÇIK — gizleme kuralı KALMADI.
                          Eski hâl (REC-266) mobili açıp masaüstünde hover'a bırakıyordu;
                          B kararıyla ikisi de aynı oldu, yani `md:` kırılımına gerek yok.
                          `line-clamp-2` korunuyor: metin uzasa bile panel iki satırdan
                          fazla büyümez, ızgara düzeni bozulmaz. */}
                      <div className="mt-3">
                        <p className="text-xs text-steel-gray font-light leading-relaxed line-clamp-2">
                          {category.description || t('home.guidedDiscovery.cardFallback')}
                        </p>
                      </div>
                    </div>
                  </div>
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
