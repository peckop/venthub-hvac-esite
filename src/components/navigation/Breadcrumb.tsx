'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'
import { canonicalOrigin } from '@/lib/seo/canonicalOrigin'
import { localizedHref } from '@/utils/routes'

export interface BreadcrumbItem {
    label: string
    href?: string
    icon?: React.ReactNode
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
    /** Bulunulan sayfanın kanonik yolu (dilsiz, `Routes.*`): JSON-LD son halkasının adresi. Verilmezse son öğenin `href`'i. */
    sayfaYolu?: string
    /** Arka plan stili: 'white' (varsayılan), 'transparent', 'dark' */
    variant?: 'white' | 'transparent' | 'dark'
    className?: string
}

/**
 * Breadcrumb Navigasyon Bileşeni
 * 
 * Kullanım:
 * ```tsx
 * <Breadcrumb items={[
 *   { label: 'Ana Sayfa', href: '/' },
 *   { label: 'Fans', href: '/category/fans' },
 *   { label: 'Aksiyel Fanlar' } // Son item href yok
 * ]} />
 * ```
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    sayfaYolu,
    variant = 'white',
    className = ''
}) => {
    const { lang } = useI18n()

    if (!items || items.length === 0) return null

    const bgClasses = {
        white: 'bg-white border-b',
        transparent: 'bg-transparent',
        dark: 'bg-primary-navy/10'
    }

    const textClasses = {
        white: {
            link: 'text-steel-gray hover:text-primary-navy',
            current: 'text-industrial-gray font-medium',
            separator: 'text-steel-gray'
        },
        transparent: {
            link: 'text-steel-gray hover:text-primary-navy',
            current: 'text-industrial-gray font-medium',
            separator: 'text-steel-gray'
        },
        dark: {
            link: 'text-primary-navy/70 hover:text-primary-navy',
            current: 'text-primary-navy font-medium',
            separator: 'text-primary-navy/50'
        }
    }

    const styles = textClasses[variant]
    
    // URN-164 (K1): konum yolu JSON-LD'si — ana sayfa halkası YOK (görünür liste aşağıda kalır), her halkanın
    // adresi dolu, SON halka sayfanın kanonik adresi (`sayfaYolu`; verilmezse son öğenin kendi `href`'i).
    // Adres bilinmiyorsa ya da 2 halkaya ulaşılamıyorsa (kök kategori) BreadcrumbList BASILMAZ.
    // REC-100: adres `SITE_URL` değil `canonicalOrigin()` (tarayıcı paketinde localhost sızıntısı olmasın).
    const sonYol = sayfaYolu ?? items[items.length - 1]?.href
    // Sözleşme: ilk öğe HER ZAMAN ana sayfadır (altı çağıranın hepsi; marka sayfası `Routes.home()` ile dil önekli verir).
    const halkalar = items.slice(1).map((item, index, dizi) => ({
        item,
        yol: index === dizi.length - 1 ? sonYol : item.href,
    }))
    const jsonLd =
        sonYol && halkalar.length >= 2 && halkalar.every((h) => !!h.yol)
            ? {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": halkalar.map((h, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": h.item.label,
                    "item": `${canonicalOrigin()}${localizedHref(h.yol as string, lang)}`
                }))
            }
            : null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={`${bgClasses[variant]} ${className}`}
        >
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
                />
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <ol className="flex items-center flex-wrap gap-y-1 text-sm">
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1
                        const isFirst = index === 0

                        return (
                            <li key={index} className="flex items-center">
                                {/* Separator (except first item) */}
                                {index > 0 && (
                                    <ChevronRight
                                        size={16}
                                        className={`mx-2 shrink-0 ${styles.separator}`}
                                        aria-hidden="true"
                                    />
                                )}

                                {/* Breadcrumb item */}
                                {isLast || !item.href ? (
                                    <span
                                        className={styles.current}
                                        aria-current="page"
                                    >
                                        {isFirst && <Home size={14} className="inline mr-1.5 -mt-0.5" aria-hidden="true" />}
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={localizedHref(item.href, lang)}
                                        className={`${styles.link} transition-colors flex items-center`}
                                    >
                                        {isFirst && <Home size={14} className="inline mr-1.5 -mt-0.5" aria-hidden="true" />}
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        )
                    })}
                </ol>
            </div>
        </nav>
    )
}



export default Breadcrumb



