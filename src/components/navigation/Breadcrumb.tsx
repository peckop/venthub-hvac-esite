import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { SITE_URL } from '@/config/siteUrl'

export interface BreadcrumbItem {
    label: string
    href?: string
    icon?: React.ReactNode
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
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
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    variant = 'white',
    className = ''
}) => {
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
    
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": item.href ? `${SITE_URL}${item.href}` : undefined
        }))
    };

    return (
        <nav
            aria-label="Breadcrumb"
            className={`${bgClasses[variant]} ${className}`}
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
            />
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
                                        href={item.href as import('next').Route}
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



