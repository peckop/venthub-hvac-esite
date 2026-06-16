'use client'

import {
    Activity,
    ArrowRight,
    LayoutDashboard,
    Package,
    Search,
    Settings,
    ShoppingCart,
    TrendingUp,
    Users,
    X} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { useI18n } from '../../i18n/I18nProvider'

interface SearchResult { id: string; name: string; sku: string }

const CommandPalette: React.FC = () => {
    const { t } = useI18n()
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [products, setProducts] = React.useState<SearchResult[]>([])
    const [loading, setLoading] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(0)
    const router = useRouter()
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Static nav items
    const navItems = React.useMemo(() => [
        { label: t('admin.menu.dashboard') || 'Panel (Dashboard)', icon: LayoutDashboard, href: '/admin' },
        { label: t('admin.menu.orders') || 'Sipariş Yönetimi', icon: ShoppingCart, href: '/admin/orders' },
        { label: t('admin.menu.products') || 'Ürün Kataloğu', icon: Package, href: '/admin/products' },
        { label: t('admin.menu.inventory') || 'Stok Durumu', icon: TrendingUp, href: '/admin/inventory' },
        { label: t('admin.menu.users') || 'Kullanıcı Yönetimi', icon: Users, href: '/admin/users' },
        { label: t('admin.menu.settings') || 'Ayarlar', icon: Settings, href: '/admin/inventory/settings' },
    ], [t])

    // Total selectable items
    const totalItems = React.useMemo(() => {
        const filteredNav = search.length > 0
            ? navItems.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
            : navItems
        return filteredNav.length + products.length
    }, [navItems, products, search])

    // Toggle open on CTRL+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(prev => !prev)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    // Reset state when opened
    React.useEffect(() => {
        if (open) {
            setSearch('')
            setProducts([])
            setActiveIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    // Product search logic (debounced)
    React.useEffect(() => {
        if (search.length < 2) {
            setProducts([])
            return
        }

        const searchProducts = async () => {
            setLoading(true)
            const { data } = await supabase
                .from('products')
                .select('id, name, sku')
                .ilike('name', `%${search}%`)
                .limit(5)

            if (data) setProducts(data as SearchResult[])
            setLoading(false)
        }

        const timer = setTimeout(searchProducts, 300)
        return () => clearTimeout(timer)
    }, [search])

    // Reset active index on filter change
    React.useEffect(() => {
        setActiveIndex(0)
    }, [search, products])

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(prev => (prev + 1) % Math.max(1, totalItems))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(prev => (prev - 1 + totalItems) % Math.max(1, totalItems))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            selectItem(activeIndex)
        } else if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    const selectItem = (index: number) => {
        const filteredNav = search.length > 0
            ? navItems.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
            : navItems

        if (index < filteredNav.length) {
            setOpen(false)
            router.push(filteredNav[index].href as import('next').Route)
        } else {
            const prodIndex = index - filteredNav.length
            if (products[prodIndex]) {
                setOpen(false)
                router.push(`/admin/products?id=${products[prodIndex].id}` as import('next').Route)
            }
        }
    }

    if (!open) return null

    const filteredNav = search.length > 0
        ? navItems.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
        : navItems

    const noResultsMsg = t('admin.ui.noResultsForTerm', { term: search })
    const skuLabel = 'SKU:'
    const enterKeySymbol = '⏎'
    const arrowKeysSymbol = '↑↓'
    const aiSearchEngineLabel = 'VentHub AI Search Engine'

    return (
        <div 
            className="fixed inset-0 z-modal" 
            role="dialog"
            aria-modal="true"
            aria-label={t('admin.ui.commandPalette')}
        >
            {/* Backdrop */}
            <button
                type="button"
                className="absolute inset-0 w-full h-full bg-surface-deep/60 backdrop-blur-md cursor-default border-none outline-none"
                onClick={() => setOpen(false)}
                aria-label={t('admin.ui.closeSearch')}
                tabIndex={-1}
            />

            {/* Dialog */}
            <div className="relative flex items-start justify-center pt-15vh">
                <div className="w-full max-w-640px glass-strong rounded-hvac-xl shadow-elevation-4 border border-white/10 overflow-hidden mx-4 animate-in zoom-in-95 duration-200">
                    {/* Search Input */}
                    <div className="flex items-center border-b border-white/5 px-6 py-5">
                        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mr-4 cyan-glow">
                            <Search className="h-5 w-5 text-cyan-400 shrink-0" />
                        </div>
                        <input
                            ref={inputRef}
                            onKeyDown={handleKeyDown}
                            placeholder={t('admin.ui.searchCommandPlaceholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-lg font-medium"
                        />
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                            <kbd className="px-2.5 py-1 text-xs font-black text-cyan-400 bg-cyan-400/10 rounded-lg border border-cyan-400/20 shadow-glow-sm">ESC</kbd>
                            <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-white/5 transition-colors" aria-label={t('admin.ui.close')}>
                                <X size={20} className="text-slate-500 hover:text-white" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="max-h-450px overflow-y-auto p-3 scrollbar-hide">
                        {loading && (
                            <div className="p-8 text-center">
                                <Activity className="animate-spin text-cyan-400 mx-auto mb-2" size={24} />
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic tracking-widest">{t('admin.ui.scanningSystem')}</p>
                            </div>
                        )}

                        {/* Navigation Group */}
                        {filteredNav.length > 0 && (
                            <div className="mb-4">
                                <div className="px-4 mb-3 text-xs font-bold text-slate-500 uppercase tracking-hvac-normal">{t('admin.ui.navigation')}</div>
                                <div className="space-y-1">
                                    {filteredNav.map((item, idx) => {
                                        const Icon = item.icon
                                        const isActive = activeIndex === idx
                                        return (
                                            <button
                                                key={item.href}
                                                onClick={() => { setOpen(false); router.push(item.href as import('next').Route) }}
                                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-colors text-left group ${
                                                    isActive 
                                                        ? 'bg-cyan-400 text-surface-deep shadow-glow-md' 
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-surface-deep/10' : 'bg-white/5 text-slate-500 group-hover:text-cyan-400'}`}>
                                                    <Icon size={18} className="shrink-0" />
                                                </div>
                                                <span className="flex-1">{item.label}</span>
                                                {isActive && <ArrowRight size={16} className="text-surface-deep" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Products Group */}
                        {products.length > 0 && (
                            <div className="mt-2">
                                <div className="px-4 my-3 text-xs font-bold text-slate-500 uppercase tracking-hvac-normal">{t('admin.ui.productCatalog')}</div>
                                <div className="space-y-1">
                                    {products.map((p, idx) => {
                                        const globalIdx = filteredNav.length + idx
                                        const isActive = activeIndex === globalIdx
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => { setOpen(false); router.push(`/admin/products?id=${p.id}` as import('next').Route) }}
                                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-colors text-left group ${
                                                    isActive 
                                                        ? 'bg-cyan-400 text-surface-deep shadow-glow-md' 
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-surface-deep/10' : 'bg-white/5 text-slate-500 group-hover:text-cyan-400'}`}>
                                                    <Package size={18} className="shrink-0" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="truncate">{p.name}</div>
                                                    <div className={`text-xs font-mono mt-0.5 ${isActive ? 'text-surface-deep/60' : 'text-slate-500'}`}>{skuLabel} {p.sku}</div>
                                                </div>
                                                {isActive && <ArrowRight size={16} className="text-surface-deep" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && filteredNav.length === 0 && products.length === 0 && search.length > 1 && (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                    <Search size={32} className="text-slate-600" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">{noResultsMsg}</p>
                                <p className="text-xs text-slate-600 mt-2 font-medium">{t('admin.ui.tryDifferentKeywords')}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <kbd className="px-1.5 py-0.5 glass rounded border border-white/10 text-white">{enterKeySymbol}</kbd>
                                {t('admin.ui.select')}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <kbd className="px-1.5 py-0.5 glass rounded border border-white/10 text-white">{arrowKeysSymbol}</kbd>
                                {t('admin.ui.navigate')}
                            </div>
                        </div>
                        <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                             {aiSearchEngineLabel}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommandPalette
