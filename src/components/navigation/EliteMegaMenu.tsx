import React, { useEffect, useState } from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { Link } from 'react-router-dom'
import { ChevronDown, ExternalLink } from 'lucide-react'
import type { Category } from '../../lib/supabase'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import { trackEvent } from '../../utils/analytics'
import './EliteMegaMenu.css'

interface EliteMegaMenuProps {
    categories: Category[]
    onNavigate?: () => void
}

export const EliteMegaMenu: React.FC<EliteMegaMenuProps> = ({ categories, onNavigate }) => {
    const mainCategories = categories.filter(cat => cat.level === 0)
    const subCategories = categories.filter(cat => cat.level === 1)

    const getSubCategories = (parentId: string) => {
        return subCategories.filter(sub => sub.parent_id === parentId)
    }

    const handleLinkClick = (level: number, slug: string, parent?: string) => {
        trackEvent('category_click', { level, slug, parent, source: 'elite_megamenu' })
        onNavigate?.()
    }

    return (
        <NavigationMenu.Root className="elite-nav-root">
            <NavigationMenu.List className="elite-nav-list">
                {mainCategories.map((category) => {
                    const subs = getSubCategories(category.id)

                    if (subs.length === 0) {
                        // No subcategories - just a link
                        return (
                            <NavigationMenu.Item key={category.id}>
                                <Link
                                    to={`/category/${category.slug}`}
                                    onClick={() => handleLinkClick(0, category.slug)}
                                    className="elite-nav-trigger elite-nav-link"
                                >
                                    <span className="elite-nav-icon">
                                        {getCategoryIcon(category.slug, { size: 18 })}
                                    </span>
                                    <span>{category.name}</span>
                                </Link>
                            </NavigationMenu.Item>
                        )
                    }

                    return (
                        <NavigationMenu.Item key={category.id}>
                            <NavigationMenu.Trigger className="elite-nav-trigger">
                                <span className="elite-nav-icon">
                                    {getCategoryIcon(category.slug, { size: 18 })}
                                </span>
                                <span>{category.name}</span>
                                <ChevronDown
                                    className="elite-chevron"
                                    size={14}
                                    aria-hidden
                                />
                            </NavigationMenu.Trigger>

                            <NavigationMenu.Content className="elite-nav-content">
                                <div className="elite-content-grid">
                                    {/* Category Header */}
                                    <div className="elite-content-header">
                                        <div className="elite-header-icon">
                                            {getCategoryIcon(category.slug, { size: 32 })}
                                        </div>
                                        <div>
                                            <h3 className="elite-header-title">{category.name}</h3>
                                            <p className="elite-header-desc">{category.description}</p>
                                        </div>
                                    </div>

                                    {/* Subcategories Grid */}
                                    <div className="elite-subcats-grid">
                                        {subs.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                to={`/category/${category.slug}/${sub.slug}`}
                                                onClick={() => handleLinkClick(1, sub.slug, category.slug)}
                                                className="elite-subcat-link"
                                            >
                                                <span className="elite-subcat-name">{sub.name}</span>
                                                <span className="elite-subcat-arrow">→</span>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* View All Button */}
                                    <Link
                                        to={`/category/${category.slug}`}
                                        onClick={() => handleLinkClick(0, category.slug)}
                                        className="elite-view-all"
                                    >
                                        <span>Tüm {category.name}</span>
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </NavigationMenu.Content>
                        </NavigationMenu.Item>
                    )
                })}

                {/* Quick Links */}
                <NavigationMenu.Item>
                    <Link
                        to="/products"
                        onClick={() => handleLinkClick(0, 'products')}
                        className="elite-nav-trigger elite-nav-link elite-nav-primary"
                    >
                        Tüm Ürünler
                    </Link>
                </NavigationMenu.Item>

                <NavigationMenu.Indicator className="elite-nav-indicator">
                    <div className="elite-indicator-arrow" />
                </NavigationMenu.Indicator>
            </NavigationMenu.List>

            <div className="elite-viewport-wrapper">
                <NavigationMenu.Viewport className="elite-nav-viewport" />
            </div>
        </NavigationMenu.Root>
    )
}

// Mobile version - Full screen overlay
interface MobileMegaMenuProps {
    isOpen: boolean
    onClose: () => void
    categories: Category[]
}

export const MobileMegaMenu: React.FC<MobileMegaMenuProps> = ({ isOpen, onClose, categories }) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
    const mainCategories = categories.filter(cat => cat.level === 0)
    const subCategories = categories.filter(cat => cat.level === 1)

    const getSubCategories = (parentId: string) => {
        return subCategories.filter(sub => sub.parent_id === parentId)
    }

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="mobile-mega-overlay" onClick={onClose}>
            <div
                className="mobile-mega-panel"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mobile-mega-header">
                    <h2>Kategoriler</h2>
                    <button onClick={onClose} className="mobile-mega-close">
                        <span>✕</span>
                    </button>
                </div>

                {/* Categories */}
                <div className="mobile-mega-content">
                    {mainCategories.map((category) => {
                        const subs = getSubCategories(category.id)
                        const isExpanded = expandedCategory === category.id

                        return (
                            <div key={category.id} className="mobile-category-item">
                                <button
                                    className={`mobile-category-trigger ${isExpanded ? 'expanded' : ''}`}
                                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                                >
                                    <span className="mobile-cat-icon">
                                        {getCategoryIcon(category.slug, { size: 20 })}
                                    </span>
                                    <span className="mobile-cat-name">{category.name}</span>
                                    {subs.length > 0 && (
                                        <ChevronDown
                                            className={`mobile-cat-chevron ${isExpanded ? 'rotated' : ''}`}
                                            size={18}
                                        />
                                    )}
                                </button>

                                {subs.length > 0 && isExpanded && (
                                    <div className="mobile-subcats">
                                        {subs.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                to={`/category/${category.slug}/${sub.slug}`}
                                                onClick={onClose}
                                                className="mobile-subcat-link"
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                        <Link
                                            to={`/category/${category.slug}`}
                                            onClick={onClose}
                                            className="mobile-subcat-link mobile-view-all"
                                        >
                                            Tümünü Gör →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Quick Links */}
                    <div className="mobile-quick-links">
                        <Link to="/products" onClick={onClose} className="mobile-quick-link primary">
                            Tüm Ürünler
                        </Link>
                        <Link to="/brands" onClick={onClose} className="mobile-quick-link">
                            Markalar
                        </Link>
                        <Link to="/contact" onClick={onClose} className="mobile-quick-link">
                            İletişim
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EliteMegaMenu
