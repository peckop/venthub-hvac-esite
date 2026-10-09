import '../index.css'

import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Archivo, IBM_Plex_Mono, Inter, Source_Serif_4 } from 'next/font/google'
import { Suspense } from 'react'

import { YENI_GORUNUM } from '@/config/features'
import { SITE_URL } from '@/config/siteUrl'

import { ClientLayout,Providers } from '../components/layout/ClientLayout'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })

/*
  YENİ GÖRÜNÜM FONTLARI (TSR-9, Faz 2b; plan v2.2 §1.2). ÜÇ AİLE de `preload: false`:
  Next, `next-font-loader` modülü grafikte VARSA `preload: true` fontu bayrak kapalıyken de
  HER sayfanın HTML'ine `<link rel=preload>` basar (S1 spike 2026-10-05, ölçüldü). `preload: false`
  `<link>`i 0 yapar; bedel: `@font-face` CSS'i kapalıyken de CSS'e girer (plan §1.3: kabul).
  Açılış PR'ı yalnız Archivo'yu `true` yapar.
  `variable` adları mevcut CSS değişkenleriyle ÇAKIŞMAZ (`--font-sans` Inter'indir; DS'in
  `--font-sans/-serif/-mono` adları `index.css` `:root[data-gorunum='yeni']` kapsamında bu üç adı gösterir).
  `subsets`: DS tipografisi Türkçe karakter (ğ, ş, İ) ister → `latin-ext`.
*/
const archivo = Archivo({
    subsets: ['latin', 'latin-ext'],
    display: 'swap',
    variable: '--font-archivo',
    preload: false,
})
const kaynakSerif = Source_Serif_4({
    subsets: ['latin', 'latin-ext'],
    display: 'swap',
    variable: '--font-source-serif',
    preload: false,
})
const plexMono = IBM_Plex_Mono({
    subsets: ['latin', 'latin-ext'],
    weight: ['400', '500'],
    display: 'swap',
    variable: '--font-plex-mono',
    preload: false,
})

/*
  Kapalıyken BUGÜNKÜ `<body>` sınıfı (`inter.variable` + `inter.className`; ikisi BİRLİKTE değişir,
  çünkü `className` `font-family`'yi doğrudan yazar ve `--font-sans`'ı atlar). Açıkken yeni aile:
  Archivo `className`'i gövde fontunu, üç `variable` sınıfı `<html>`e basılır ki
  `:root[data-gorunum='yeni']` `var(--font-archivo)` vb. adları çözebilsin.
*/
const GOVDE_SINIFI = YENI_GORUNUM ? archivo.className : `${inter.variable} ${inter.className}`
const KOK_SINIFI = YENI_GORUNUM
    ? `${archivo.variable} ${kaynakSerif.variable} ${plexMono.variable}`
    : undefined

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: "VentHub - Endüstriyel Havalandırma",
    description: "Türkiye'nin En Büyük B2B HVAC ve Endüstriyel Fan Platformu",
    openGraph: {
        title: "VentHub - Endüstriyel Havalandırma",
        description: "Türkiye'nin En Büyük B2B HVAC ve Endüstriyel Fan Platformu",
        url: SITE_URL,
        siteName: 'VentHub',
        images: [
            {
                url: '/images/og-default.jpg',
                width: 1200,
                height: 630,
            },
        ],
        locale: 'tr_TR',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="tr"
            data-scroll-behavior="smooth"
            data-gorunum={YENI_GORUNUM ? 'yeni' : undefined}
            className={KOK_SINIFI}
        >
            <body className={GOVDE_SINIFI}>
                <Providers>
                    <ClientLayout>
                        {/* WebSite JSON-LD burada YOK (PR-1, bot karnesi 2026-09-24): kök düzen onu
                            HER sayfaya basıyordu, ana sayfa da kendi (SearchAction'lı) ikizini —
                            ana sayfada iki WebSite düğümü. Kimlik bloğu yalnız ana sayfada:
                            src/app/[lang]/page.tsx `jsonLds`. */}
                        {children}
                    </ClientLayout>

                    {/*
                      Vercel Web Analytics — anonim sayfa sayımı (REC, 2026-09-04 Recep onayı).

                      ⭐NİÇİN RIZA KAPISININ DIŞINDA — ÖLÇÜLDÜ, VARSAYILMADI:
                      Bu depoda kural yazılı: analitik etiketi rıza kapısının ARKASINDA durur
                      (`ConsentGatedAnalytics`), çünkü GA yüklendiği anda `_ga`/`_gid` çerezlerini
                      yazar — kapı "olay gönderimi" değil "script yükleme" seviyesinde olmak zorunda.
                      O gerekçe ÇEREZ yazan bir etiket içindir. Vercel'inki yazmıyor:
                      canlı betik (`/_vercel/insights/script.js`, 2026-09-04'te indirildi) içinde
                      `document.cookie` · `localStorage` · `sessionStorage` · `indexedDB` geçişi
                      **SIFIR**; taşıdığı alanlar yalnız `href` · `pathname` · `referrer` · `route`
                      · zaman damgası. Yani cihaza hiçbir şey yazılmıyor ve kalıcı kimlik üretilmiyor.
                      Ayırt edici soru "analitik mi" değil, **"cihaza bir şey yazıyor ve kişiyi
                      izliyor mu"** idi; cevap hayır olduğu için rıza kapısı gerekmiyor.

                      ⚠BU İDDİA BAYATLAYABİLİR: paket sürümü yükselince betik değişebilir.
                      Kapı (`INV-ANALITIK-1`) bu gerekçeyi ve yerleşimi ölçüyor; iddianın kendisi
                      ise sürüm yükseltmesinde YENİDEN ölçülmeli — kapı betiği indirip bakamaz.

                      Çerez Politikası §2'de bu durum yazılı: çerezli analitik YOK, çerezsiz
                      sayım VAR. Politika "hiç analitik yok" demiyor — sayfa yanıltmıyor.
                    */}
                    {/*
                      ⭐SUSPENSE ZORUNLU — ve bunu KAPI ÖĞRETTİ, tahmin etmedim:
                      `<Analytics/>` içeride `useSearchParams()` çağırıyor. Suspense'siz
                      bırakılınca, STATİK üretilen sayfalarda tüm ağaç istemciye düşüyor:
                      SSR HTML'ine `BAILOUT_TO_CLIENT_SIDE_RENDERING` markerı giriyor.
                      REC-138 kapısı bunu PDP'de yakaladı (3 > 2).

                      ⚠SUSPENSE MARKERI KALDIRMAZ, **KAPSAR** — bu ayrımı yanlış yazmıştım,
                      düzeltiyorum: Suspense eklendikten SONRA da PDP'de marker sayısı 3'tür
                      (bu commit'in kendisi 3 > 2 ile kırmızı koştu). Suspense'in yaptığı,
                      istemciye düşen parçayı bu küçük adaya HAPSETMEK: sınır olmasaydı sayfanın
                      tamamı istemciye düşerdi. Kanıtı aynı HTML'de: `<h1>` ve `>Model Seçimi<`
                      markerları hâlâ sunucudan geliyor, kolun tek şikâyeti SAYI idi.

                      Tavan (2 → 3) `tests/smoke/ssr-kurallari.ts` SAHİBİ tarafından çıkarıldı;
                      ben kendi işime uydurmak için kapıya dokunmadım. Muafiyet yazılamıyor,
                      çünkü markerın HTML'de kimliği yok — hangi adadan geldiği ayırt edilemez;
                      uygulanabilir tek ölçüt SAYIdır ve boşluk yine 0 (yarın kazara doğacak
                      4. bailout gene kırmızı verir).

                      Dinamik rotalarda marker doğmuyordu; kusur YALNIZ statik sınıfta
                      görünür — bu yüzden "ana sayfada sorun yok" yanıltıcı olurdu.
                      `fallback={null}`: bu bileşenin görsel çıktısı yok, bekletecek bir şey yok.
                    */}
                    <Suspense fallback={null}>
                        <Analytics />
                    </Suspense>
                </Providers>
            </body>
        </html>
    )
}
