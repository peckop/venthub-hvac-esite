import React from 'react'
import HomePage from '../views/HomePage'
import { getCategories, getProducts, type Category, type Product } from '../lib/supabase'

export const metadata = {
    title: 'VentHub - Endüstriyel Havalandırma Çözümleri',
    description: 'Havalandırma sistemlerinde uzman kadro, kaliteli ürünler ve profesyonel çözümler. VentHub ile temiz havaya ulaşın.',
    alternates: {
        canonical: 'https://venthub-hvac.com/',
    },
}

export default async function RootPage() {
    // Değişkenleri doğru tiplerle tanımlayarak 'never[]' hatasını engelliyoruz
    let categories: Category[] = []
    let products: Product[] = []

    try {
        const [catData, prodData] = await Promise.all([
            getCategories(),
            getProducts(12)
        ])
        categories = (catData as Category[]) || []
        products = (prodData as Product[]) || []
    } catch (error) {
        console.error('SSR Data Fetch Error:', error)
    }

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
            <HomePage initialCategories={categories} initialProducts={products} />
        </>
    )
}
