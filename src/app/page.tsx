import React from 'react'
import HomePage from '../views/HomePage'

export const metadata = {
    title: 'VentHub - Endüstriyel Havalandırma Çözümleri',
    description: 'Havalandırma sistemlerinde uzman kadro, kaliteli ürünler ve profesyonel çözümler. VentHub ile temiz havaya ulaşın.',
    alternates: {
        canonical: 'https://venthub-hvac.com/',
    },
}

export default function RootPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "VentHub",
        "url": "https://venthub-hvac.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://venthub-hvac.com/products?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomePage />
        </>
    )
}
