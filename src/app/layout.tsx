import '../index.css'

import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'

import { SITE_URL } from '@/config/siteUrl'

import { ClientLayout,Providers } from '../components/layout/ClientLayout'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })

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
        <html lang="tr" data-scroll-behavior="smooth">
            <body className={`${inter.variable} ${inter.className}`}>
                <Providers>
                    <ClientLayout>
                        <script
                            id="json-ld-website"
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{
                                __html: JSON.stringify({
                                    "@context": "https://schema.org",
                                    "@type": "WebSite",
                                    "name": "VentHub",
                                    "url": SITE_URL
                                }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
                            }}
                        />
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
                      REC-138 kapısı bunu PDP'de yakaladı (3 > 2) — eşik yükseltilmedi,
                      çünkü sorun eşikte değil, kuralın ihlalindeydi (CLAUDE.md kural 5).
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
