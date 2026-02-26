'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import {
    Search,
    Package,
    ShoppingCart,
    LayoutDashboard,
    Settings,
    Users,
    ArrowRight,
    TrendingUp,
    X
} from 'lucide-react'

interface SearchResult { id: string; name: string; sku: string }

const CommandPalette: React.FC = () => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [products, setProducts] = React.useState<SearchResult[]>([])
    const [loading, setLoading] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(0)
    const router = useRouter()
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Static nav items
    const navItems = React.useMemo(() => [
        { label: 'Panel (Dashboard)', icon: LayoutDashboard, href: '/admin' },
        { label: 'Sipariş Yönetimi', icon: ShoppingCart, href: '/admin/orders' },
        { label: 'Ürün Kataloğu', icon: Package, href: '/admin/products' },
        { label: 'Stok Durumu', icon: TrendingUp, href: '/admin/inventory' },
        { label: 'Kullanıcı Yönetimi', icon: Users, href: '/admin/users' },
        { label: 'Ayarlar', icon: Settings, href: '/admin/inventory/settings' },
    ], [])

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
            router.push(filteredNav[index].href)
        } else {
            const prodIndex = index - filteredNav.length
            if (products[prodIndex]) {
                setOpen(false)
                router.push(`/admin/products?id=${products[prodIndex].id}`)
            }
        }
    }

    if (!open) return null

    const filteredNav = search.length > 0
        ? navItems.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
        : navItems

    return (
        <div className="fixed inset-0 z-[100]" onKeyDown={handleKeyDown}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <div className="relative flex items-start justify-center pt-[15vh]">
                <div className="w-full max-w-[580px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mx-4">
                    {/* Search Input */}
                    <div className="flex items-center border-b border-slate-200 px-4 py-3">
                        <Search className="mr-3 h-5 w-5 text-slate-400 shrink-0" />
                        <input
                            ref={inputRef}
                            autoFocus
                            placeholder="Ara (ürün, sipariş, menü)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-base"
                        />
                        <div className="flex items-center gap-1.5 ml-auto shrink-0">
                            <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 rounded border border-slate-200">ESC</kbd>
                            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-slate-100 transition-colors">
                                <X size={14} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="max-h-[350px] overflow-y-auto p-2">
                        {loading && (
                            <div className="p-4 text-xs text-slate-400 flex items-center justify-center gap-2 italic">Aranıyor...</div>
                        )}

                        {/* Navigation Group */}
                        {filteredNav.length > 0 && (
                            <div>
                                <div className="px-2 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Navigasyon</div>
                                {filteredNav.map((item, idx) => {
                                    const Icon = item.icon
                                    return (
                                        <button
                                            key={item.href}
                                            onClick={() => { setOpen(false); router.push(item.href) }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all text-left ${activeIndex === idx ? 'bg-primary-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <Icon size={16} className="shrink-0" />
                                            <span className="flex-1">{item.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Products Group */}
                        {products.length > 0 && (
                            <div className="mt-2">
                                <div className="px-2 my-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ürünler</div>
                                {products.map((p, idx) => {
                                    const globalIdx = filteredNav.length + idx
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => { setOpen(false); router.push(`/admin/products?id=${p.id}`) }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all text-left ${activeIndex === globalIdx ? 'bg-primary-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <Package size={16} className="shrink-0 text-slate-400" />
                                            <span className="flex-1">{p.name}</span>
                                            <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && filteredNav.length === 0 && products.length === 0 && search.length > 1 && (
                            <div className="p-4 text-center text-sm text-slate-500">Sonuç bulunamadı.</div>
                        )}

                        {/* Footer hint */}
                        <div className="mt-2 pt-2 border-t border-slate-100 px-3 pb-1">
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                                <span>↑↓ Gezin</span>
                                <ArrowRight size={10} />
                                <span>Enter ile seç</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommandPalette
