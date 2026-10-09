'use client'

import { ArrowRight, ExternalLink,Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { supabaseBrowserClient } from '@/lib/supabase/client'

import { BrandIcon } from '../components/HVACIcons'
import Breadcrumb from '../components/navigation/Breadcrumb'
import FamilyCard from '../components/products/FamilyCard'
import { type BrandText,brandText, HVAC_BRANDS } from '../data/brands'
import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import useScrollAnimation, { scrollAnimationClasses } from '../hooks/useScrollAnimation'
import { useI18n } from '../i18n/I18nProvider'
import { getFamiliesEnriched } from '../lib/services/family.service'
import type { FamilyListItem } from '../types/ui-models'

/**
 * Kurumsal özet satırları — VERİ katmanı (bkz. `src/data/brands.ts` başlığı).
 * REC-98 (2026-08-31): eskiden tek dilliydi; `/en/brands/<slug>` canlıda Türkçe kalıyordu.
 *
 * İki ayrım KASITLI:
 *  · `labelKey` = ARAYÜZ etiketi → sözlükten gelir (`brands.detail.*`).
 *  · `value`    = VERİ → dile göre burada taşınır; dilden bağımsız olan (yıl, özel ad)
 *                 düz `string` bırakılır — çevrilecek bir şeyi yok.
 * Ölü alanlar (founded/headquarters/website) KALDIRILDI: render `brand.*` okuyor,
 * bunlar hiç kullanılmıyordu (ölçüldü: yalnız `stats` okunuyor).
 *
 * URN-79 (2026-10-09): marka HİKÂYESİ (`story`) alanı KALKTI. Vortice / Avens / Nicotra hikâyeleri üreticinin kendi
 * övgüsüydü ("dünya çapında tanınan", "lider konumdadır", "Türkiye'nin önde gelen yerli markası", "dünya lideridir" —
 * kaynak dizininde karşılığı yok) ve sayfa metni artık TEK kaynaktan gelir: `brands.ts` kaydındaki nötr `description` +
 * sunucunun DB'den kurduğu `urunOzeti` (ürün aileleri ve kategorileri). Satırlardan şunlar da kalktı (kaynak dizininde
 * marka adıyla geçmiyor, ölçüldü 2026-10-09): Avens "Kuruluş 2010" ve "Garanti 2 Yıl" (Avens fiyat listesinde 2 yıl yok;
 * garanti-servis sayfasıyla çelişiyordu), Nicotra "Kuruluş 1959".
 */
type BrandStat = { labelKey: string; value: BrandText | string }

const BRAND_DETAILS: Record<string, {
  stats?: BrandStat[]
}> = {
  vortice: {
    stats: [
      { labelKey: 'estPrefix', value: '1954' },
      { labelKey: 'statCountries', value: '90+' },
      { labelKey: 'statGroup', value: 'Vortice Group' }
    ]
  },
  avens: {
    stats: [
      { labelKey: 'statProduction', value: { tr: 'Türkiye', en: 'Türkiye' } }
    ]
  },
  // OPS-51 (2026-10-04): Casals'ın eski hikâyesi ("140 yıl / en köklü / tercih edilen") ve 1881 / 140+ yıl satırları
  // KAYNAKSIZDI → çıkarıldı. Kalan satır: Vortice Group şirketi (Casals katalog baskısındaki "VORTICE GROUP COMPANIES" listesi).
  casals: {
    stats: [
      { labelKey: 'statGroup', value: 'Vortice Group' }
    ]
  },
  'nicotra-gebhardt': {
    stats: [
      { labelKey: 'statGroup', value: 'Regal Rexnord' },
      { labelKey: 'statExpertise', value: { tr: 'Endüstriyel Fan', en: 'Industrial Fans' } }
    ]
  }
  // OPS-51: `flexiva` kaydı KALDIRILDI — "global marka / patentli sızdırmazlık" hikâyesi ve "CE Sertifikalı / Türkiye /
  // Kanal Sistemleri" satırları kaynaksızdı (kaynak dizininde Flexiva için 0 sayfa). Sayfa `brands.ts` kaydına düşer.
}

export interface BrandDetailPageProps {
  initialBrandSlug?: string
  /**
   * OPS-51: markanın DB'de aktif ürünü yok (sunucu kararı; `markaUrunDurumu.ts`). Üst veri (noindex) ve site haritasıyla
   * AYNI kaynaktan gelir — ürün sayısı sıfırken "teklif isteyin" cümlesi ve bağlantısı çizilir, ürün girince kalkar.
   * Verilmezse `false` (bugünkü "ürünleri henüz katalogda değil" cümlesi).
   */
  urunsuz?: boolean
  /**
   * URN-79: markanın sitedeki ürün aileleri ve kategorileri, sunucuda DB'den kurulmuş HAZIR cümle(ler)
   * (`markaSayfasi.tsx` → `markaKatalogOzetMetni`, dil çözülmüş). Boş ya da verilmezse paragraf hiç çizilmez (uydurma metin yok).
   */
  urunOzeti?: string
}

const BrandDetailPage: React.FC<BrandDetailPageProps> = ({ initialBrandSlug, urunsuz = false, urunOzeti = '' }) => {
  const { t, lang } = useI18n()
  // Localize Routes proxy'si: bileşendeki TÜM Routes.x() çağrıları dil-önekli olur (SSOT).
  const Routes = useLocalizedRoutes()
  const params = useParams()
  const slug = (initialBrandSlug || params?.slug) as string

  const [heroIconRef, heroIconVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })
  const [heroTitleRef, heroTitleVisible] = useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 })
  const [heroMetaRef, heroMetaVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })
  
  // Normalize slug for matching
  const brand = HVAC_BRANDS.find((b) => 
    b.slug === slug || (slug === 'nicotra' && b.slug === 'nicotra-gebhardt')
  )
  
  const detail = brand ? BRAND_DETAILS[brand.slug] : null
  // URN-79: "Kurumsal Özet" kutusu yalnız çizilecek bir satır VARSA çizilir (satır = kayıttaki özet satırı, merkez ya da web sitesi).
  // Aksi hâlde başlığı olup içi boş bir kutu kalırdı (kaynağı doğrulanamayan satırlar kaldırıldıkça bu olasılık arttı).
  const ozetSatirlari = detail?.stats ?? []
  const ozetVar = ozetSatirlari.length > 0 || !!brand?.headquarters || !!brand?.website

  const [families, setFamilies] = useState<FamilyListItem[]>([])
  const [loading, setLoading] = useState(true)

  // --- GATEWAY ADAPTATION: CENTRAL FAMILY ENGINE (F5-B) ---
  useEffect(() => {
    const loadFamilies = async () => {
      if (!brand) return
      setLoading(true)
      try {
        const { items } = await getFamiliesEnriched(supabaseBrowserClient, {
          brand: brand.name,
          limit: 12
        })
        setFamilies(items)
      } catch (e) {
        console.error('Error loading brand families:', e)
      } finally {
        setLoading(false)
      }
    }
    loadFamilies()
  }, [brand])

  const breadcrumbItems = [
    { label: t('category.breadcrumbHome'), href: Routes.home() },
    { label: t('brands.pageTitle'), href: Routes.brands() },
    { label: brand?.name || slug }
  ]

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('brands.notFound')}</h1>
          <Link 
            href={Routes.brands()} 
            aria-label={t('brands.backToAll')}
            className="text-cyan-600 font-bold uppercase tracking-widest text-xs underline underline-offset-8"
          >
            {t('brands.backToAll')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* REC-100: <Seo> KALDIRILDI — bu rotanın `generateMetadata`'sı title/description/
          canonical/og'yi zaten dile göre üretiyor (REC-98'de düzeltildi). İkinci yazıcı
          canlıda ÜÇ canonical'a yol açıyordu ve sonuncusu `http://localhost:3000` idi. */}

      {/* STANDARD BREADCRUMB */}
      <Breadcrumb items={breadcrumbItems} variant="transparent" className="pt-6" />

      {/* Brand Hero: Ultra Premium Cinema Look */}
      <section className="relative h-60vh lg:h-70vh flex items-center justify-center overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hvac_installation_close_up_premium_3.webp" 
            alt={brand.name} 
            fill 
            sizes="100vw"
            className="object-cover opacity-20 brightness-50" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950" />
          <div className="absolute inset-0 bg-brand-detail-radial" />
        </div>

        <div className="relative z-10 max-w-page mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div ref={heroIconRef} className={scrollAnimationClasses.fadeUp(heroIconVisible) + " mb-12 flex justify-center"}>
            <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-hvac-3xl bg-white p-8 shadow-white-glow-lg flex items-center justify-center overflow-hidden">
              {/* Marka adı hemen altında h1 olarak yazıyor — logo dekoratif (REC-268). */}
              <BrandIcon brand={brand.name} className="w-full h-full" dekoratif />
            </div>
          </div>

          <h1 ref={heroTitleRef} className={scrollAnimationClasses.scaleIn(heroTitleVisible) + " text-6xl lg:text-9xl font-extralight tracking-tighter leading-tight"}>
            {brand.name}
          </h1>

          <div ref={heroMetaRef} className={scrollAnimationClasses.fadeIn(heroMetaVisible) + " mt-8 flex flex-wrap justify-center gap-8 text-xs font-black uppercase tracking-hvac-loose text-cyan-400"}>
            {/* Kaynağı doğrulanamayan alan YAZILMAZ (brands.ts başlığı): yoksa satır hiç çizilmez, "Kuruluş" etiketi
                değersiz kalmaz (OPS-51: Casals'ta kuruluş yılı, Flexiva'da ülke/kuruluş/uzmanlık yok). */}
            {brand.country && (
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-glow-sm" />
                {brandText(brand.country, lang)} {t('brands.detail.originSuffix')}
              </div>
            )}
            {brand.founded && (
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-glow-sm" />
                {t('brands.detail.estPrefix')} {brand.founded}
              </div>
            )}
            {brand.specialty && (
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-glow-sm" />
                {brandText(brand.specialty, lang)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Brand Identity & Vision */}
      <section className="py-24 lg:py-32">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-hvac-layout-detail gap-24 items-start">
            <div>
              <div className="text-cyan-600 text-xs font-black uppercase tracking-hvac-wide mb-8 text-center lg:text-left">
                {t('brands.detail.heritage')}
              </div>
              <h2 className="text-4xl lg:text-6xl font-extralight tracking-tighter leading-hvac-11 mb-12 text-center lg:text-left text-slate-900">
                {t('brands.detail.authorityTitle').split(' ').slice(0, 1).join(' ')} <br />
                <span className="font-medium text-slate-950 italic">
                  {t('brands.detail.authorityTitle').split(' ').slice(1).join(' ')}
                </span>
              </h2>
              <div className="mb-12 space-y-6 text-center lg:text-left max-w-3xl">
                <p className="text-xl text-slate-500 font-light leading-relaxed">
                  {brandText(brand.description, lang)}
                </p>
                {/* URN-79: ürün aileleri ve kategorileri sunucuda DB'den kurulur (`markaSayfasi.tsx`); yoksa paragraf çizilmez. */}
                {urunOzeti && (
                  <p className="text-base text-slate-500 font-light leading-relaxed">{urunOzeti}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-12">
                <div className="p-8 rounded-hvac-xl bg-slate-50 border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">{t('brands.detail.globalVision')}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-light">
                    {brand.name}{t('common.comma')} {t('brands.detail.globalVisionDesc')}
                  </p>
                </div>
                <div className="p-8 rounded-hvac-xl bg-slate-50 border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">{t('brands.detail.technicalExcellence')}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-light">
                    {t('brands.detail.technicalExcellenceDesc')}
                  </p>
                </div>
              </div>
            </div>

            <aside className="sticky top-32 space-y-8">
              <div className="rounded-hvac-2xl bg-slate-950 p-10 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl" />
                <div className="relative z-10">
                  {ozetVar && (
                  <>
                  <div className="text-xs font-bold uppercase tracking-hvac-relaxed text-cyan-400 mb-8">
                    {t('brands.detail.corporateSnapshot')}
                  </div>
                  
                  <div className="space-y-6">
                    {ozetSatirlari.map((stat, i) => (
                      <div key={i} className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">
                          {t(`brands.detail.${stat.labelKey}`)}
                        </span>
                        <span className="text-sm font-medium">
                          {typeof stat.value === 'string' ? stat.value : brandText(stat.value, lang)}
                        </span>
                      </div>
                    ))}
                    {brand.headquarters && (
                      <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">
                          {t('brands.detail.headquarters')}
                        </span>
                        <span className="text-sm font-medium">{brandText(brand.headquarters, lang)}</span>
                      </div>
                    )}
                    {brand.website && (
                      <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">
                          {t('brands.detail.webAuthority')}
                        </span>
                        <a 
                          href={brand.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          aria-label={t('brands.detail.officialSite')}
                          className="text-sm font-medium text-cyan-400 hover:underline flex items-center gap-2"
                        >
                          {t('brands.detail.officialSite')} <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                  </>
                  )}

                  <Link href={Routes.contact()}>
                    <button
                      aria-label={t('brands.detail.requestCatalog')}
                      className={`${ozetVar ? 'mt-12 ' : ''}w-full py-5 bg-white text-slate-950 font-black uppercase text-xs tracking-widest rounded-2xl transition-transform hover:bg-cyan-400 active:scale-95`}
                    >
                      {t('brands.detail.requestCatalog')}
                    </button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Featured Brand Products Grid */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-center md:text-left">
            <div>
              <div className="text-cyan-600 text-xs font-black uppercase tracking-hvac-wide mb-4">{t('brands.detail.curatedSolutions')}</div>
              <h2 className="text-4xl font-light tracking-tighter text-slate-950">
                {t('brands.detail.featuredSystems').split(' ').slice(0, 2).join(' ')} <span className="font-medium">{t('brands.detail.featuredSystems').split(' ').slice(2).join(' ')}</span>
              </h2>
            </div>
            <Link 
              href={Routes.products({ brand: brand.name })} 
              aria-label={t('brands.detail.allProductGroups')}
              className="text-xs font-bold uppercase tracking-hvac-relaxed text-slate-400 hover:text-cyan-600 transition-colors flex items-center gap-3 justify-center"
            >
              <span>{t('brands.detail.allProductGroups')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-slate-200 rounded-hvac-xl animate-pulse" />)}
            </div>
          ) : families.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* priority=false — cetvel §R7/§R9 gereği karar YAZILI. Marka sayfası için
                  fold ölçümü YAPILMADI; mevcut davranış korunuyor. Ölçülür ve fold üstünde
                  kart çıkarsa değer burada değişir. */}
              {families.map((family) => (
                <FamilyCard key={family.id} family={family} layout="grid" priority={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-hvac-3xl border border-dashed border-slate-200">
              <Package className="mx-auto text-slate-200 mb-4" size={48} />
              {/* `urunsuz` = sunucunun DB'deki aktif ürün sayısından türettiği karar (`markaSayfasi.tsx` →
                  `markaUrunDurumu.ts`); üst veri/site haritasıyla AYNI kaynak (statik bayrak YOK, OPS-51). */}
              {/* Teklif yolu = iletişim formu (`Routes.contact()`): özel teklif akışının depodaki sayfası
                  (EnhancedNeedsWizard "customOffer" ve contactPage.heroDesc "özel teklifler" aynı rotaya gider);
                  sepet tabanlı QuoteRequestButton ürünsüz markada boş listeyle çalışmaz. */}
              <p className="text-slate-400 font-light italic">
                {urunsuz ? t('brands.detail.productsOnRequest', { ad: brand.name }) : t('brands.detail.noProducts')}
              </p>
              {urunsuz && (
                <Link
                  href={Routes.contact()}
                  className="mt-4 inline-block text-cyan-600 font-bold uppercase tracking-widest text-xs underline underline-offset-8 focus-visible:outline-2"
                >
                  {t('brands.detail.productsOnRequestCta')}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default BrandDetailPage
