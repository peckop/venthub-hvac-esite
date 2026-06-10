import '../index.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

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
                </Providers>
            </body>
        </html>
    )
}
