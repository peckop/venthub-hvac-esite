import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../index.css'
import { Providers, ClientLayout } from '../components/layout/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: "VentHub - Endüstriyel Havalandırma",
    description: "Türkiye'nin En Büyük B2B HVAC ve Endüstriyel Fan Platformu",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="tr">
            <body className={inter.className}>
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
                                    "url": "https://venthub.com"
                                })
                            }}
                        />
                        {children}
                    </ClientLayout>
                </Providers>
            </body>
        </html>
    )
}
