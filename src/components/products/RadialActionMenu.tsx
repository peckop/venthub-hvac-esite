import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, FileText, Tag, Settings2 } from 'lucide-react'

export interface RadialMenuItem {
    id: string
    label: string
    icon: React.ReactNode
    color: string
    onClick: () => void
}

interface RadialActionMenuProps {
    isOpen: boolean
    onClose: () => void
    position: { x: number; y: number }
    categoryId: string
    categoryTitle: string
    onSelectSubcategories: () => void
    onSelectProductInfo: () => void
    onSelectPriceInfo: () => void
    onSelectTechnicalWizard: () => void
}

/**
 * Radial Action Menu
 * Kart tıklandığında etrafında radial olarak seçenekler belirir
 */
const RadialActionMenu: React.FC<RadialActionMenuProps> = ({
    isOpen,
    onClose,
    position,
    categoryTitle,
    onSelectSubcategories,
    onSelectProductInfo,
    onSelectPriceInfo,
    onSelectTechnicalWizard
}) => {
    // Menü öğeleri
    const menuItems: RadialMenuItem[] = [
        {
            id: 'subcategories',
            label: 'Alt Kategoriler',
            icon: <Layers className="w-5 h-5" />,
            color: 'from-cyan-500 to-blue-600',
            onClick: onSelectSubcategories
        },
        {
            id: 'product-info',
            label: 'Ürün Bilgi',
            icon: <FileText className="w-5 h-5" />,
            color: 'from-emerald-500 to-teal-600',
            onClick: onSelectProductInfo
        },
        {
            id: 'price-info',
            label: 'Fiyat Bilgisi',
            icon: <Tag className="w-5 h-5" />,
            color: 'from-amber-500 to-orange-600',
            onClick: onSelectPriceInfo
        },
        {
            id: 'technical-wizard',
            label: 'Teknik Seçim',
            icon: <Settings2 className="w-5 h-5" />,
            color: 'from-violet-500 to-purple-600',
            onClick: onSelectTechnicalWizard
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
        const radius = 100 // px
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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-40"
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
                        {/* Center Label */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                       bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full
                                       border border-white/20 text-white text-sm font-medium
                                       whitespace-nowrap pointer-events-none"
                        >
                            {categoryTitle}
                        </motion.div>

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
                                        damping: 15,
                                        stiffness: 300,
                                        delay: index * 0.05
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        item.onClick()
                                        onClose()
                                    }}
                                    className={`
                                        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                        pointer-events-auto cursor-pointer
                                        flex flex-col items-center gap-1
                                        group
                                    `}
                                >
                                    {/* Icon Circle */}
                                    <div className={`
                                        w-14 h-14 rounded-full
                                        bg-gradient-to-br ${item.color}
                                        flex items-center justify-center
                                        text-white shadow-lg
                                        transition-all duration-200
                                        group-hover:scale-110 group-hover:shadow-xl
                                        group-hover:shadow-cyan-500/30
                                        border-2 border-white/20
                                    `}>
                                        {item.icon}
                                    </div>

                                    {/* Label */}
                                    <span className="
                                        text-xs font-medium text-white
                                        bg-slate-900/80 px-2 py-1 rounded-md
                                        whitespace-nowrap
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity duration-200
                                        absolute -bottom-8
                                    ">
                                        {item.label}
                                    </span>
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
