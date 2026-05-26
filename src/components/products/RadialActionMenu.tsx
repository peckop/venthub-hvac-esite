import React, { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Eye, MessageSquareText, ArrowLeft, Package } from 'lucide-react'

export interface RadialMenuItem {
    id: string
    label: string
    icon: React.ReactNode
    color: string
    glowColor: string
    onClick: () => void
}

// Alt kategori için basitleştirilmiş tip
interface SubcategoryItem {
    slug: string
    label: string
}

interface RadialActionMenuProps {
    isOpen: boolean
    onClose: () => void
    position: { x: number; y: number }
    categoryId: string
    subcategories?: { slug: string; label: string }[]
    onSelectProducts: () => void
    onSelectQuote: () => void
    onSelectSubcategory: (subSlug: string) => void
}

// KEY'i okunabilir label'a çevir (Artık genel i18n veya map'ten gelmeliydi, ama geriye uyumluluk için burada veya dışarıdan gelmeli)
// Yukarıdaki subcategories prop üzerinden geçildiğinden getSubcategoriesForCategory silindi.

/**
 * Radial Action Menu - Alt Kategori Destekli
 * 
 * Seviye 1: Ana menü (Alt Kategoriler, Ürünleri Gör, Teklif Al)
 * Seviye 2: Alt kategoriler (dinamik)
 */
const RadialActionMenu: React.FC<RadialActionMenuProps> = ({
    isOpen,
    onClose,
    position,
    categoryId,
    subcategories: initialSubcategories = [],
    onSelectProducts,
    onSelectQuote,
    onSelectSubcategory
}) => {
    const [showSubcategories, setShowSubcategories] = useState(false)
    const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([])

    // Menü açıldığında alt kategorileri yükle (prop üstünden)
    useEffect(() => {
        if (isOpen && categoryId) {
            setSubcategories(initialSubcategories)
            setShowSubcategories(false) // Her açılışta ana menüden başla
        }
    }, [isOpen, categoryId, initialSubcategories])

    // ESC tuşu ile kapat
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showSubcategories) {
                    setShowSubcategories(false)
                } else {
                    onClose()
                }
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose, showSubcategories])

    // Backdrop tıklamasında kapat
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }, [onClose])

    const handleSubcategoriesClick = useCallback(() => {
        if (subcategories.length > 0) {
            setShowSubcategories(true)
        }
    }, [subcategories.length])

    const handleBack = useCallback(() => {
        setShowSubcategories(false)
    }, [])

    // ANA MENÜ: 3 seçenek
    const mainMenuItems: RadialMenuItem[] = [
        {
            id: 'subcategories',
            label: subcategories.length > 0 ? `Alt Kategoriler (${subcategories.length})` : 'Alt Kategori Yok',
            icon: <Layers className="w-7 h-7" />,
            color: subcategories.length > 0 ? 'from-cyan-400 via-cyan-500 to-blue-600' : 'from-gray-400 to-gray-500',
            glowColor: subcategories.length > 0 ? 'shadow-cyan-500/50' : 'shadow-gray-500/30',
            onClick: handleSubcategoriesClick
        },
        {
            id: 'products',
            label: 'Ürünleri Gör',
            icon: <Eye className="w-7 h-7" />,
            color: 'from-emerald-400 via-emerald-500 to-teal-600',
            glowColor: 'shadow-emerald-500/50',
            onClick: () => {
                onSelectProducts()
                onClose()
            }
        },
        {
            id: 'quote',
            label: 'Teklif Al',
            icon: <MessageSquareText className="w-7 h-7" />,
            color: 'from-amber-400 via-orange-500 to-red-500',
            glowColor: 'shadow-orange-500/50',
            onClick: () => {
                onSelectQuote()
                onClose()
            }
        }
    ]

    // Radial pozisyon hesaplama
    const getItemPosition = (index: number, total: number, radius: number = 120) => {
        const startAngle = -90 // Üstten başla
        const angleStep = 360 / total
        const angle = (startAngle + index * angleStep) * (Math.PI / 180)

        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        }
    }

    // Alt kategoriler için daha küçük radius
    const getSubcategoryPosition = (index: number, total: number) => {
        const radius = Math.min(100 + total * 8, 150) // Dinamik radius
        return getItemPosition(index, total, radius)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={handleBackdropClick}
                    />

                    {/* Menu Container */}
                    <div
                        className="fixed z-50 pointer-events-none"
                        style={{
                            left: position.x,
                            top: position.y,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {/* Merkez Glow Ring */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                       w-16 h-16 rounded-full
                                       bg-gradient-to-br from-cyan-500/20 to-purple-500/20
                                       border border-white/10 backdrop-blur-sm
                                       flex items-center justify-center"
                        >
                            {showSubcategories && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="pointer-events-auto p-2 rounded-full 
                                               hover:bg-white/10 transition-colors text-white/70"
                                    onClick={handleBack}
                                    title="Geri"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </motion.button>
                            )}
                        </motion.div>

                        {/* Ana Menü veya Alt Kategoriler */}
                        <AnimatePresence mode="wait">
                            {!showSubcategories ? (
                                // ANA MENÜ
                                <motion.div
                                    key="main-menu"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    {mainMenuItems.map((item, index) => {
                                        const pos = getItemPosition(index, mainMenuItems.length)
                                        const isDisabled = item.id === 'subcategories' && subcategories.length === 0

                                        return (
                                            <motion.button
                                                key={item.id}
                                                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                                                animate={{
                                                    scale: 1,
                                                    opacity: isDisabled ? 0.5 : 1,
                                                    x: pos.x,
                                                    y: pos.y
                                                }}
                                                exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                                                transition={{
                                                    type: 'spring',
                                                    damping: 12,
                                                    stiffness: 200,
                                                    delay: index * 0.08
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (!isDisabled) item.onClick()
                                                }}
                                                disabled={isDisabled}
                                                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                                           pointer-events-auto flex flex-col items-center gap-2 group
                                                           ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <motion.div
                                                    whileHover={!isDisabled ? { scale: 1.15 } : {}}
                                                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                                    className={`
                                                        w-16 h-16 rounded-full
                                                        bg-gradient-to-br ${item.color}
                                                        flex items-center justify-center
                                                        text-white shadow-xl ${item.glowColor}
                                                        transition-shadow duration-300
                                                        ${!isDisabled ? 'group-hover:shadow-2xl' : ''}
                                                        border-2 border-white/30
                                                        relative overflow-hidden
                                                    `}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
                                                    <span className="relative z-10">{item.icon}</span>
                                                </motion.div>

                                                <motion.span
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 + index * 0.05 }}
                                                    className="text-xs font-semibold text-white
                                                               bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg
                                                               whitespace-nowrap shadow-lg border border-white/10"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            </motion.button>
                                        )
                                    })}
                                </motion.div>
                            ) : (
                                // ALT KATEGORİLER
                                <motion.div
                                    key="subcategories-menu"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    {subcategories.map((sub, index) => {
                                        const pos = getSubcategoryPosition(index, subcategories.length)

                                        return (
                                            <motion.button
                                                key={sub.slug}
                                                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                                                animate={{
                                                    scale: 1,
                                                    opacity: 1,
                                                    x: pos.x,
                                                    y: pos.y
                                                }}
                                                exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                                                transition={{
                                                    type: 'spring',
                                                    damping: 12,
                                                    stiffness: 200,
                                                    delay: index * 0.05
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelectSubcategory(sub.slug)
                                                    onClose()
                                                }}
                                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                                           pointer-events-auto cursor-pointer
                                                           flex flex-col items-center gap-2 group"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="w-14 h-14 rounded-full
                                                               bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800
                                                               flex items-center justify-center
                                                               text-white shadow-lg shadow-slate-500/30
                                                               group-hover:shadow-xl group-hover:shadow-cyan-500/30
                                                               border-2 border-white/20
                                                               group-hover:border-cyan-400/50
                                                               transition-shadow duration-300"
                                                >
                                                    <Package className="w-5 h-5" />
                                                </motion.div>

                                                <motion.span
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.15 + index * 0.03 }}
                                                    className="text-xs font-medium text-white
                                                               bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-md
                                                               whitespace-nowrap shadow-lg border border-white/10
                                                               max-w-120px truncate"
                                                >
                                                    {sub.label}
                                                </motion.span>
                                            </motion.button>
                                        )
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default RadialActionMenu



