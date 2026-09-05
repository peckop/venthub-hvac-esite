import { AlertTriangle,ArrowLeft, Calculator, Info } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes';
import { useI18n } from '../../i18n/I18nProvider'
import Seo from '../Seo'


interface CalculatorLayoutProps {
    title: string
    description: string
    icon?: React.ReactNode
    backLink?: string
    backLabel?: string
    infoText?: string
    warningText?: string
    /**
     * ⏳GEÇİCİ — metadata'yı ROTA üretiyorsa bu layout `<Seo>` basmaz (REC-150 PR-1, 2026-09-05).
     *
     * NİÇİN GEREKLİ: `CalculatorLayout` TEK bileşen ama **dört rotayı birden** çeviriyor.
     * `<Seo>`'yu buradan kaldırmak dört rotayı aynı anda göç ettirmek demekti; oysa plan
     * adım adım ilerlemeyi ve her adımı ölçmeyi söylüyor. Bu bayrak, pilotun yarıçapını
     * TEK rotaya (`kanal`) daraltır: o rota `generateMetadata` yazar ve bayrağı açar,
     * diğer üçü bugünkü davranışını aynen sürdürür.
     *
     * ⚠BU BAYRAK KALICI DEĞİL: dört rota da göç ettiğinde `<Seo>` bu dosyadan tümden
     * kalkar ve bayrak SİLİNİR (REC-150 Adım 5). Geçici dikişi burada adıyla yazıyorum ki
     * yarın "bu ne işe yarıyordu" diye durmasın — geçici olduğu unutulan dikiş kalıcı olur.
     */
    metadataRotadanMi?: boolean
    children: React.ReactNode
}

/**
 * Ortak hesap makinesi layout wrapper
 * Premium görünüm, SEO, breadcrumb içerir
 */
const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
    title,
    description,
    icon,
    backLink,
    backLabel,
    infoText,
    warningText,
    metadataRotadanMi = false,
    children
}) => {
    const { t } = useI18n()
    const Routes = useLocalizedRoutes()
    /**
     * GERİ DÖNÜŞ = ÜRÜN SEÇİCİ (REC-148 B2/B3, 2026-09-05).
     *
     * NİÇİN DEĞİŞTİ — iki kusur birden vardı:
     *  1. HALKA KAPANMIYORDU: giriş Ürün Seçici, çıkış "/products". Bir aracı deneyip
     *     ikincisini denemek isteyen ziyaretçi seçiciye dönemiyordu; başka bir sayfaya
     *     düşüp yolu baştan aramak zorundaydı.
     *  2. Varsayılan `'/products'` DİL ÖNEKSİZ ham yoldu — aynı sayfadaki diğer bağlantılar
     *     `/tr/products` taşırken bu taşımıyordu (CLAUDE.md kural 7: elle yol yasak,
     *     `useLocalizedRoutes` kullanılır). Kural ihlali sessizdi çünkü middleware öneki
     *     sonradan ekliyor; ziyaretçi fazladan bir yönlendirme yiyordu.
     *
     * Çağıran açıkça `backLink` verirse ona saygı duyulur; varsayılan artık seçicidir.
     */
    const geriYol = backLink ?? Routes.urunSecici()
    return (
        <div className="min-h-screen bg-gradient-to-b from-light-gray to-white">
            {/* Rota kendi metadata'sını üretiyorsa İKİNCİ YAZICI olmayız (REC-150 PR-1).
                İki yazıcı aynı anda çalışınca sayfa iki <title> ve iki <meta description>
                basıyordu ve hangisinin kazandığı ORTAMA göre değişiyordu. */}
            {metadataRotadanMi ? null : (
            <Seo
                /**
                 * SEKME/ARAMA BAŞLIĞI TEK ADA BAĞLANDI (REC-148 B1, 2026-09-05).
                 *
                 * Buraya "VentHub Mühendislik Araçları" SABİT KODLANMIŞTI ve iki ayrı
                 * kusur taşıyordu:
                 *  1. Yeteneğin ONUNCU adıydı — K17 tek ad diyor, oysa bu ad sözlükte
                 *     hiç geçmiyordu; kimse "burada da bir ad var" diye bakmamıştı çünkü
                 *     sayfanın gövdesinde görünmüyor, yalnız sekmede ve arama sonucunda.
                 *  2. TÜRKÇE SABİTTİ — İngilizce ziyaretçi, sayfanın geri kalanı İngilizce
                 *     iken sekmesinde Türkçe bir ad görüyordu (CLAUDE.md kural 7 ihlali:
                 *     kullanıcıya görünen metin sözlükten gelir).
                 *
                 * ⚠SİTE ADI BURAYA YAZILMAZ: `Seo` bileşeni başlığın sonuna zaten
                 * "| VentHub" ekliyor. İlk yazışımda "· VentHub" koymuştum; önizlemede
                 * ölçtüğümde "… | Ürün Seçici · VentHub | VentHub" çıktı — kendi eklediğim
                 * fazlalık. Ölçmeseydim, mükerrerliği temizleyen PR mükerrerlik getirecekti.
                 */
                title={`${title} | ${t('urunSecici.ustBaslik')}`}
                description={description}
            />
            )}

            {/* Header */}
            <div className="bg-primary-navy text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <Link
                        href={geriYol as import('next').Route}
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        {backLabel ?? t('calculators.layout.backLabel')}
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                            {icon || <Calculator size={32} />}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
                            <p className="text-white/80 mt-1">{description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info/Warning Banners */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-3">
                {infoText && (
                    <div className="flex items-start gap-3 p-4 bg-secondary-blue/10 border border-secondary-blue/20 rounded-xl">
                        <Info className="text-secondary-blue flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-industrial-gray">{infoText}</p>
                    </div>
                )}
                {warningText && (
                    <div className="flex items-start gap-3 p-4 bg-warning-orange/10 border border-warning-orange/20 rounded-xl">
                        <AlertTriangle className="text-warning-orange flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-industrial-gray">{warningText}</p>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>

            {/* Footer Note */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="text-center text-sm text-steel-gray border-t border-light-gray pt-6">
                    <p>
                        {t('calculators.layout.disclaimer')}
                    </p>
                    <p className="mt-1 text-xs">
                        {t('calculators.layout.contactPrompt')}{' '}
                        <Link href={Routes.contact()} className="text-primary-navy hover:underline">
                            {t('calculators.layout.contactLink')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CalculatorLayout



