import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Eye, Wand2, MessageSquareText } from 'lucide-react'

export interface RadialMenuItem {
    id: string
    label: string
    icon: React.ReactNode
    color: string
    glowColor: string
    onClick: () => void
}

interface RadialActionMenuProps {
    isOpen: boolean
    onClose: () => void
    position: { x: number; y: number }
    categoryId: string
    onSelectSubcategories: () => void
    onSelectProducts: () => void
    onSelectWizard: () => void
    onSelectQuote: () => void
}

/**
 * Radial Action Menu - Optimized Version
 * 
 * B2B kullanıcı yolculuğuna göre optimize edilmiş seçenekler:
 * 1. Alt Kategoriler - Kategori içi gezinme
 * 2. Ürünleri Gör - Ana aksiyon
 * 3. Doğru Ürünü Bul - Wizard ile ürün seçimi
 * 4. Teklif Al - B2B için kritik CTA
 */
const RadialActionMenu: React.FC<RadialActionMenuProps> = ({
    isOpen,
    onClose,
    position,
    onSelectSubcategories,
    onSelectProducts,
    onSelectWizard,
    onSelectQuote
}) => {
    // Optimized menu items - B2B user journey focused
    const menuItems: RadialMenuItem[] = [
        {
            id: 'subcategories',
            label: 'Alt Kategoriler',
            icon: <Layers className="w-7 h-7" />,
            color: 'from-cyan-400 via-cyan-500 to-blue-600',
            glowColor: 'shadow-cyan-500/50',
            onClick: onSelectSubcategories
        },
        {
            id: 'products',
            label: 'Ürünleri Gör',
            icon: <Eye className="w-7 h-7" />,
            color: 'from-emerald-400 via-emerald-500 to-teal-600',
            glowColor: 'shadow-emerald-500/50',
            onClick: onSelectProducts
        },
        {
            id: 'wizard',
            label: 'Doğru Ürünü Bul',
            icon: <Wand2 className="w-7 h-7" />,
            color: 'from-violet-400 via-purple-500 to-pink-500',
            glowColor: 'shadow-purple-500/50',
            onClick: onSelectWizard
        },
        {
            id: 'quote',
            label: 'Teklif Al',
            icon: <MessageSquareText className="w-7 h-7" />,
            color: 'from-amber-400 via-orange-500 to-red-500',
            glowColor: 'shadow-orange-500/50',
            onClick: onSelectQuote
        }
    ]

    // ESC tuşu ile kapat
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // Backdrop tıklamasında kapat
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }, [onClose])

    // Radial pozisyon hesaplama (4 öğe için 90° aralıklarla)
    const getItemPosition = (index: number, total: number) => {
        const radius = 120 // px - daha geniş radius
        const startAngle = -90 // Üstten başla (derece)
        const angleStep = 360 / total
        const angle = (startAngle + index * angleStep) * (Math.PI / 180)

        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - blur efekti ile */}
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
                                       w-20 h-20 rounded-full
                                       bg-gradient-to-br from-cyan-500/20 to-purple-500/20
                                       border border-white/10 backdrop-blur-sm"
                        >
                            {/* Pulsing inner ring */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.2, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                                className="absolute inset-0 rounded-full bg-cyan-500/30"
                            />
                        </motion.div>

                        {/* Connection Lines */}
                        {menuItems.map((item, index) => {
                            const pos = getItemPosition(index, menuItems.length)
                            const angle = Math.atan2(pos.y, pos.x) * (180 / Math.PI)
                            const lineLength = Math.sqrt(pos.x * pos.x + pos.y * pos.y) - 40

                            return (
                                <motion.div
                                    key={`line-${item.id}`}
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 0.4 }}
                                    exit={{ scaleX: 0, opacity: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.05
                                    }}
                                    className="absolute left-1/2 top-1/2 h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent origin-left"
                                    style={{
                                        width: lineLength,
                                        transform: `rotate(${angle}deg) translateY(-50%)`
                                    }}
                                />
                            )
                        })}

                        {/* Menu Items */}
                        {menuItems.map((item, index) => {
                            const pos = getItemPosition(index, menuItems.length)

                            return (
                                <motion.button
                                    key={item.id}
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
                                        delay: index * 0.08
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        item.onClick()
                                        onClose()
                                    }}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                               pointer-events-auto cursor-pointer
                                               flex flex-col items-center gap-2
                                               group"
                                >
                                    {/* Icon Circle - Daha büyük ve gösterişli */}
                                    <motion.div
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`
                                            w-16 h-16 rounded-full
                                            bg-gradient-to-br ${item.color}
                                            flex items-center justify-center
                                            text-white shadow-xl ${item.glowColor}
                                            transition-shadow duration-300
                                            group-hover:shadow-2xl
                                            border-2 border-white/30
                                            relative overflow-hidden
                                        `}
                                    >
                                        {/* Inner shine effect */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
                                        <span className="relative z-10">{item.icon}</span>
                                    </motion.div>

                                    {/* Label - Her zaman görünür */}
                                    <motion.span
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + index * 0.05 }}
                                        className="text-xs font-semibold text-white
                                                   bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg
                                                   whitespace-nowrap shadow-lg
                                                   border border-white/10"
                                    >
                                        {item.label}
                                    </motion.span>
                                </motion.button>
                            )
                        })}
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default RadialActionMenu
