'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const PageComponent = dynamic(() => import('../views/HomePage'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
        </div>
    )
})

export default function RootPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "VentHub",
        "url": "https://venthub.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://venthub.com/products?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PageComponent />
        </>
    )
}
