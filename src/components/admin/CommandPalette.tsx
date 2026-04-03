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
    X,
    Activity
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

    return (
        <div className="fixed inset-0 z-[100]" onKeyDown={handleKeyDown}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0A0F1E]/60 backdrop-blur-md"
                onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <div className="relative flex items-start justify-center pt-[15vh]">
                <div className="w-full max-w-[640px] glass-strong rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden mx-4 animate-in zoom-in-95 duration-200">
                    {/* Search Input */}
                    <div className="flex items-center border-b border-white/5 px-6 py-5">
                        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mr-4 cyan-glow">
                            <Search className="h-5 w-5 text-cyan-400 shrink-0" />
                        </div>
                        <input
                            ref={inputRef}
                            autoFocus
                            placeholder="Bir komut veya ürün ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-lg font-medium"
                        />
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                            <kbd className="px-2.5 py-1 text-[10px] font-black text-cyan-400 bg-cyan-400/10 rounded-lg border border-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">ESC</kbd>
                            <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                                <X size={20} className="text-slate-500 hover:text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="max-h-[450px] overflow-y-auto p-3 scrollbar-hide">
                        {loading && (
                            <div className="p-8 text-center">
                                <Activity className="animate-spin text-cyan-400 mx-auto mb-2" size={24} />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic tracking-widest">Sistem Taranıyor...</p>
                            </div>
                        )}

                        {/* Navigation Group */}
                        {filteredNav.length > 0 && (
                            <div className="mb-4">
                                <div className="px-4 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Navigasyon</div>
                                <div className="space-y-1">
                                    {filteredNav.map((item, idx) => {
                                        const Icon = item.icon
                                        const isActive = activeIndex === idx
                                        return (
                                            <button
                                                key={item.href}
                                                onClick={() => { setOpen(false); router.push(item.href as import('next').Route) }}
                                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-all text-left group ${
                                                    isActive 
                                                        ? 'bg-cyan-400 text-[#0A0F1E] shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#0A0F1E]/10' : 'bg-white/5 text-slate-500 group-hover:text-cyan-400'}`}>
                                                    <Icon size={18} className="shrink-0" />
                                                </div>
                                                <span className="flex-1">{item.label}</span>
                                                {isActive && <ArrowRight size={16} className="text-[#0A0F1E]" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Products Group */}
                        {products.length > 0 && (
                            <div className="mt-2">
                                <div className="px-4 my-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Ürün Kataloğu</div>
                                <div className="space-y-1">
                                    {products.map((p, idx) => {
                                        const globalIdx = filteredNav.length + idx
                                        const isActive = activeIndex === globalIdx
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => { setOpen(false); router.push(`/admin/products?id=${p.id}` as import('next').Route) }}
                                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-all text-left group ${
                                                    isActive 
                                                        ? 'bg-cyan-400 text-[#0A0F1E] shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#0A0F1E]/10' : 'bg-white/5 text-slate-500 group-hover:text-cyan-400'}`}>
                                                    <Package size={18} className="shrink-0" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="truncate">{p.name}</div>
                                                    <div className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-[#0A0F1E]/60' : 'text-slate-500'}`}>SKU: {p.sku}</div>
                                                </div>
                                                {isActive && <ArrowRight size={16} className="text-[#0A0F1E]" />}
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
                                <p className="text-sm font-bold text-slate-400">"{search}" için sonuç bulunamadı.</p>
                                <p className="text-[11px] text-slate-600 mt-2 font-medium">Lütfen farklı anahtar kelimeler deneyin.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <kbd className="px-1.5 py-0.5 glass rounded border border-white/10 text-white">⏎</kbd>
                                Seç
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <kbd className="px-1.5 py-0.5 glass rounded border border-white/10 text-white">↑↓</kbd>
                                Gezin
                            </div>
                        </div>
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                             VentHub AI Search Engine
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommandPalette
