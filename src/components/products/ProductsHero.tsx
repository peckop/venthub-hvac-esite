import React from 'react'
import { Search } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

interface ProductsHeroProps {
    searchValue: string
    onSearchChange: (value: string) => void
    searchInputRef?: React.RefObject<HTMLInputElement>
}

/**
 * Products Hub Hero Section - Pixel-perfect mockup implementation
 * Dark navy gradient with centered title and clean search bar
 */
const ProductsHero: React.FC<ProductsHeroProps> = ({
    searchValue,
    onSearchChange,
    searchInputRef
}) => {
    const { t } = useI18n()

    return (
        <section className="relative bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-2xl overflow-hidden">
            {/* Subtle background pattern lines like mockup */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-600/20 to-transparent" />
                <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-600/10 to-transparent" />
                <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-600/10 to-transparent" />
                {/* Diagonal lines */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
                    <div className="absolute inset-0 transform rotate-45 translate-x-1/2 -translate-y-1/2">
                        <div className="w-full h-px bg-white mb-4" />
                        <div className="w-full h-px bg-white mb-4" />
                        <div className="w-full h-px bg-white mb-4" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 px-8 py-14 md:py-16 text-center">
                {/* Title - Large and bold like mockup */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 tracking-tight">
                    {t('products.hubTitle') || 'Profesyonel HVAC Çözümleri'}
                </h1>

                {/* Search Bar - Clean, rounded, centered like mockup */}
                <div className="max-w-md mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={t('products.searchPlaceholder') || 'Ürün veya kategori arayın...'}
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all text-sm"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProductsHero
