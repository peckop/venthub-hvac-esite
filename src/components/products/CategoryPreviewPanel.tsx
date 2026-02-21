import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Package, Tag, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface CategoryPreviewData {
    id: string
    title: string
    description: string
    image: string
    icon?: React.ReactNode
    color?: string
    productCount?: number
    priceRange?: { min: number; max: number }
}

interface CategoryPreviewPanelProps {
    category: CategoryPreviewData | null
    isOpen: boolean
    onClose: () => void
}

/**
 * Quick View / Ön İzleme Paneli
 * Sağdan açılan glassmorphism temalı bilgi paneli
 */
const CategoryPreviewPanel: React.FC<CategoryPreviewPanelProps> = ({ category, isOpen, onClose }) => {
  const router = useRouter()
    const navigate = useRouter()

    const handleNavigate = () => {
        if (category) {
            router.push(`/category/${category.id}`)
            onClose()
        }
    }

    // Backdrop tıklamasında kapat
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    // ESC tuşuyla kapat
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEsc)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && category && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleBackdropClick}
                    />

                    {/* Panel */}
                    <motion.aside
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] z-50 
                                   bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95
                                   backdrop-blur-xl border-l border-white/10 
                                   shadow-2xl shadow-black/50 overflow-hidden"
                    >
                        {/* Glassmorphism overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

                        {/* Header */}
                        <div className="relative flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                {category.icon && (
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color || 'from-cyan-500 to-blue-600'}`}>
                                        {category.icon}
                                    </div>
                                )}
                                <h2 className="text-xl font-bold text-white">{category.title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="relative p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                            {/* Category Image */}
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800">
                                <img
                                    src={category.image}
                                    alt={category.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                                    <Info className="w-4 h-4" />
                                    <span>Kategori Hakkında</span>
                                </div>
                                <p className="text-white/80 leading-relaxed">
                                    {category.description}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                {category.productCount !== undefined && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <div className="flex items-center gap-2 text-cyan-400 mb-1">
                                            <Package className="w-4 h-4" />
                                            <span className="text-xs font-medium">Ürün Sayısı</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">{category.productCount}</p>
                                    </div>
                                )}
                                {category.priceRange && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <div className="flex items-center gap-2 text-emerald-400 mb-1">
                                            <Tag className="w-4 h-4" />
                                            <span className="text-xs font-medium">Fiyat Aralığı</span>
                                        </div>
                                        <p className="text-lg font-bold text-white">
                                            ₺{category.priceRange.min.toLocaleString('tr-TR')} - ₺{category.priceRange.max.toLocaleString('tr-TR')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer CTA */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent">
                            <button
                                onClick={handleNavigate}
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-white
                                           bg-gradient-to-r ${category.color || 'from-cyan-500 to-blue-600'}
                                           hover:shadow-lg hover:shadow-cyan-500/25 
                                           transition-all duration-300 flex items-center justify-center gap-2
                                           group`}
                            >
                                <span>Kategoriye Git</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}

export default CategoryPreviewPanel





