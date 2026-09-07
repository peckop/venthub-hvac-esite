'use client'
import { AnimatePresence,motion } from 'framer-motion'
import { LayoutGrid, List } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
/**
 * @view ProductsDiscoveryView
 * @description "Ürünleri Keşfet" sayfası.
 *
 * MİMARİ & UX:
 * 1. 3D Carousel sticky olarak sayfanın üstünde kalır.
 * 2. Varsayılan (seçim yokken veya tepe noktasındayken) büyüktür (500px).
 * 3. Kategori seçildiğinde ürünler yüklenirken aşağıya doğru ekran kayar,
 *    bu esnada 3D Carousel de 120px/200px bandına küçülür (compact mod).
 * 4. Sabit (sticky) küçülmüş moddayken üstüne tıklanırsa YERİNDE genişler.
 * 5. Kullanıcı ekranın en tepesine döndüğünde eski büyük haline döner.
 */
import React, { Suspense, useCallback, useRef, useState } from 'react'

import type { FamilyListItem } from '@/types/ui-models'

import GuidedCategoryDiscovery, { type CategoryViewModelLite } from '../components/home/GuidedCategoryDiscovery'
import FamilyCard from '../components/products/FamilyCard'
import { ScrollObserver } from '../components/ui/ScrollObserver'
import { UC_BOYUT_MUSTERI_YUZEYINDE } from '../config/features'
import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { useI18n } from '../i18n/I18nProvider'

const CategoryOrbitCarousel = dynamic(
    () => import('../components/products/CategoryOrbitCarousel'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-hvac-section bg-surface-darker flex items-center justify-center overflow-hidden">
                {/* Premium, spinner-less nebula glow placeholder */}
                <div className="w-300px h-300px bg-cyan-500/5 blur-100 rounded-full animate-pulse" />
            </div>
        )
    }
)

interface ProductsDiscoveryViewProps {
    /**
     * REC-213-A — keşif sayfasının KATEGORİ KAPISI.
     *
     * Eskiden burada `initialCategories?: DomainCategory[]` diye bir prop vardı ve bu
     * bileşen onu HİÇ OKUMUYORDU — tanımlıydı, destructure bile edilmiyordu. Tek geçen
     * yer `views/ProductsPage.tsx` idi; o da uygulama ağacında çizilmeyen, yalnız
     * `utils/prefetch.ts` tarafından paket ısıtmak için `import()` edilen bir sarmalayıcı.
     * Yani prop uçtan uca ölüydü. (İlk taramamda yalnız iki dosyaya bakıp "hiçbir yerden
     * geçilmiyor" demiştim; `tsc` beni düzeltti — kayda geçsin.)
     *
     * Yerine gerçekten çizilen bu prop geldi; tipi de kartın ihtiyacı olan şey (çözülmüş
     * ad/açıklama/slug), ham satır değil.
     */
    kategoriler?: CategoryViewModelLite[]
    /** F5-B W2.1: keşif listesi de AİLE satırı basar (mükerrer varyant kartı yok). */
    families?: FamilyListItem[]
    /** Sunucu sayfalamasının toplamı — başlık sayacı sayfa uzunluğunu değil TOPLAMI gösterir. */
    total?: number
    isLoading?: boolean
}

type ViewMode = 'grid' | 'list'



const ProductsDiscoveryView: React.FC<ProductsDiscoveryViewProps> = ({
    kategoriler = [],
    families = [],
    total,
    isLoading = false
}) => {
    const router = useRouter()
    const { t } = useI18n()
    const Routes = useLocalizedRoutes()
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const productsRef = useRef<HTMLDivElement>(null)

    const handleSubcategorySelect = useCallback((
        categorySlug: string,
        subcategorySlug?: string
    ) => {
        // Doğrudan unified category yapısına yönlendir
        if (subcategorySlug) {
            router.push(Routes.category(categorySlug, subcategorySlug))
        } else {
            router.push(Routes.category(categorySlug))
        }
    }, [router, Routes])

    // ⚠ÜST DOLGU 3D SAHNESİNE AİTTİ — ÖLÇÜLDÜ (2026-09-07, yerel tarayıcı):
    // `pt-16 md:pt-24` aşağıdaki koyu kutuya 3D karusel için verilmişti. Karusel REC-94'te
    // kapandı; dolgu kaldı ve artık İÇİ BOŞ 96px'lik koyu bir şerit olarak duruyor
    // (kutu 96px'te başlıyor, ilk beyaz bölüm 192px'te — arada hiçbir şey yok).
    // Hemen altındaki bölüm kendi `py-24 sm:py-32`sini zaten getiriyor, yani başlık
    // 320px'e itiliyordu: 224px boşluk. Recep bunu canlı ekranda "üstte beyaz alan" diye
    // bildirdi; ölçüm onun tarifiyle örtüştü.
    // Aşağıdaki REC-94 yorumu aynı tuzağın BİR KAT AŞAĞISINI çözmüş ("bayrak kapalıyken
    // sarmalayıcı da render EDİLMEZ — aksi halde üstte boş bir şerit kalırdı"), ama dolgu
    // sarmalayıcının DIŞINDA durduğu için gözden kaçmış.
    // KOŞULLU: bayrak açılırsa 3D sahnesi geri gelir ve dolguya yine ihtiyaç duyar.
    return (
        <div className={`bg-surface-darker min-h-screen relative pb-12 w-full ${UC_BOYUT_MUSTERI_YUZEYINDE ? 'pt-16 md:pt-24' : ''}`}>
            
            {/* REC-94: 3D orbital kategori seçimi müşteri yüzeyinden kaldırıldı.
                Kutu KOŞULLU: bayrak kapalıyken sarmalayıcı da render EDİLMEZ — aksi halde
                sayfanın üstünde boş bir şerit ve gereksiz kenarlık kalırdı. Yerine gelecek
                kategori kartları ayrı PR'da (sıfır yeni bileşen, mevcut kanıtlı desen). */}
            {UC_BOYUT_MUSTERI_YUZEYINDE && <div className={`
                transition-max-height-opacity duration-700 ease-hvac-ease z-30 w-full overflow-hidden
                bg-surface-darker border-b border-white/5 shadow-2xl relative
            `}>
                <div className="relative w-full">
                    {/* ssr:false dynamic import en yakın Suspense sınırını CSR'a düşürür
                        (BAILOUT_TO_CLIENT_SIDE_RENDERING). Bu Suspense o bailout'u karuselle
                        SINIRLAR — aksi halde tüm keşif görünümü (aile grid'i dahil) SSR HTML'inden
                        düşüyordu (SEO/LCP zehirlenmesi; master'da da vardı, burada kapatıldı). */}
                    <Suspense
                        fallback={
                            <div className="w-full h-hvac-section bg-surface-darker flex items-center justify-center overflow-hidden">
                                <div className="w-300px h-300px bg-cyan-500/5 blur-100 rounded-full animate-pulse" />
                            </div>
                        }
                    >
                        <CategoryOrbitCarousel
                            onSubcategorySelect={handleSubcategorySelect}
                            compact={false}
                        />
                    </Suspense>
                </div>
            </div>}

            {/* ⭐REC-213-A — KATEGORİ KAPISI. Yukarıdaki yorumun "yerine gelecek kategori
                kartları ayrı PR'da" sözü BUDUR; o PR gelmemişti ve arada sayfa kategorisiz
                kaldı. Ölçüldü (canlı, 2026-09-07): /tr/products sayfasının HAM HTML'inde
                `/tr/category/…` bağlantısı SIFIRDI — kategori adları metin olarak vardı ama
                hiçbiri tıklanmıyordu. Yani 3D kapatılınca kategori ağacına giden kapı da
                kapanmış, kimse fark etmemişti.

                SIFIR YENİ BİLEŞEN: ana sayfanın kanıtlı kart ızgarası (GuidedCategoryDiscovery)
                aynen kullanılır; yalnız başlık anahtarları bu sayfaya göre verilir. Göz satırı
                ve giriş cümlesi BİLEREK yok — sayfanın kendi h1'i zaten tezi kuruyor, ikincisi
                vaat şişirir (K5 ruhu: sayfada tek ana ses).

                KOŞULLU: kategori yoksa blok hiç çizilmez — boş başlık bırakmak, yukarıdaki 3D
                kutusunun düştüğü tuzağın aynısı olurdu.

                ⚠SCROLLOBSERVER ŞART — ÖLÇÜLDÜ (2026-09-07, yerel Playwright):
                GuidedCategoryDiscovery'nin yedi öğesi `data-observe="fade-up"` + `opacity-0`
                ile başlar ve yalnız `data-in-view="true"` gelince açılır. O niteliği yazan tek
                şey `ScrollObserver` ve o BİLEŞEN AĞACA MOUNT EDİLMEZSE HİÇ ÇALIŞMAZ.
                Bu sayfaya taşındığında sağlayıcı beraberinde gelmedi: yedi öğenin YEDİSİ de
                opaklık 0'da kaldı — kaydırmak da açmadı (gözlemci hiç kurulmuyordu).
                Sonuç müşteri gözüyle: 3D'nin yerinde BOŞ BEYAZ ALAN. (Recep aynı ekranı
                bağımsız olarak gördü ve "üstte beyaz alan var" diye bildirdi.)
                Ayırt edici kontrol: aynı bileşen anasayfada ÇALIŞIYOR — çünkü HomePage
                ScrollObserver'ı mount ediyor. Yani bileşen bozuk değil, SAĞLAYICI EKSİKTİ.
                `data-observe` sessiz bir SÖZLEŞMEDİR: onu kullanan her ağaç sağlayıcıyı da
                mount etmek zorundadır, yoksa içerik render EDİLİR ama GÖRÜNMEZ.
                Bekçi: INV-GOZLEMCI-1 (src/__tests__/conformance/gozlemci-sozlesmesi.test.ts). */}
            {kategoriler.length > 0 && <ScrollObserver />}
            {kategoriler.length > 0 && (
                <GuidedCategoryDiscovery
                    displayCategories={kategoriler}
                    eyebrowKey={null}
                    headingKey="products.popularCategories"
                    introKey={null}
                />
            )}

            {/* --- Ürün Grid --- */}
            <AnimatePresence>
                    <motion.section
                        ref={productsRef}
                        id="products-grid"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-hvac-2xl relative z-20 px-4 md:px-8 lg:px-12 pt-10 pb-20 mt-8 max-w-page mx-auto min-h-60vh shadow-2xl"
                    >
                        {/* Başlık ve Toolbars */}
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
                            <div>
                                {/* ⭐h1, h2 DEĞİL (REC-127). Bu sayfanın (/[lang]/products) EN ÜST başlığı
                                    budur ve sayfada başka h1 YOKTU — canlıda ölçüldü: /tr/products ve
                                    /en/products SSR HTML'inde h1 sayısı SIFIRDI, ilk başlık h2, altında
                                    h3'ler vardı. Yani belge ana başlıksız bir gövdeyle başlıyordu.
                                    Görünüm DEĞİŞMEZ: boyut/ağırlık sınıflardan geliyor, etiketten değil.
                                    Kategori sayfalarında h1 ZATEN vardı (1/1 ölçüldü) — kusur yalnız burada. */}
                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight capitalize mb-2">
                                    {t('products.allProductsTitle')}
                                </h1>
                                {!isLoading && (
                                    <p className="text-slate-500 font-medium text-sm">
                                        {t('products.systemTotalPrefix')} <span className="text-cyan-600 font-bold px-1">{total ?? families.length}</span> {t('products.itemsListed')}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/60 shadow-inner">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        title={t('products.viewGrid')}
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        title={t('products.viewList')}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sonuçlar */}
                        {families.length === 0 && !isLoading ? (
                            <div className="py-32 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <LayoutGrid className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">{t('products.emptyTitle')}</h3>
                                <p className="text-slate-500 mb-6 max-w-sm">{t('products.emptyDesc')}</p>
                            </div>
                        ) : (
                            <div className={`transition-opacity duration-300 content-auto ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'} ${
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                    : 'flex flex-col gap-6 max-w-5xl mx-auto'
                            }`}>
                                {families.map((family, index) => {
                                    // SADECE ilk yüklenen görünür (veya ilk sayfa) ürünleri 3D animasyonunu beklesin.
                                    // Aşağıda kalan ürünler zaten scroll edildikçe belirecek, onlar için bekleme (delay) gereksizdir.
                                    const ESTIMATED_3D_ITEMS = 8;
                                    const TOTAL_3D_DURATION = ESTIMATED_3D_ITEMS * 0.18 + 1.2;
                                    const GRID_ENTRY_DELAY = TOTAL_3D_DURATION * 0.6; // 3D show devam ederken %60'ında grid başlar
                                    
                                    const isInitialView = index < 12; // Ortalama ilk ekranda / viewportta görünen ürün sayısı

                                    return (
                                        <motion.div
                                            key={family.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "50px" }}
                                            transition={{
                                                duration: 0.4,
                                                delay: isInitialView ? GRID_ENTRY_DELAY + (index * 0.05) : 0,
                                                ease: [0.16, 1, 0.3, 1]
                                            }}
                                        >
                                            {/* priority=false — ÖLÇÜLDÜ (cetvel §R7): bu sayfada
                                                ilk kart 928 px aşağıda, fold üstü kart SIFIR
                                                (üstte 3D karusel var). Fold altındaki görseli
                                                öncelikli yapmak gerçek LCP adayıyla yarışır. */}
                                            <FamilyCard
                                                priority={false}
                                                family={family}
                                                layout={viewMode}
                                            />
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.section>
            </AnimatePresence>
        </div>
    )
}

export default ProductsDiscoveryView
