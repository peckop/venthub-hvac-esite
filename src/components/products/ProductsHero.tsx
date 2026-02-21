import React from 'react'
import { Search } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

interface ProductsHeroProps {
    searchValue: string
    onSearchChange: (value: string) => void
    searchInputRef?: React.RefObject<HTMLInputElement>
}

/**
 * Products Hub Hero Section - EXACT mockup design
 * Dark navy gradient with diagonal lines pattern and white search bar
 */
const ProductsHero: React.FC<ProductsHeroProps> = ({
    searchValue,
    onSearchChange,
    searchInputRef
}) => {
    const { t } = useI18n()

    return (
        <section className="relative bg-gradient-to-b from-[#0a1628] via-[#0f2040] to-[#0a1628] rounded-2xl overflow-hidden">
            {/* Background Pattern - Diagonal lines like mockup */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Grid Pattern */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Diagonal Lines - Top Right */}
                <svg className="absolute top-0 right-0 w-80 h-80 opacity-10" viewBox="0 0 200 200" fill="none">
                    <line x1="50" y1="0" x2="200" y2="150" stroke="white" strokeWidth="1" />
                    <line x1="80" y1="0" x2="200" y2="120" stroke="white" strokeWidth="1" />
                    <line x1="110" y1="0" x2="200" y2="90" stroke="white" strokeWidth="1" />
                    <line x1="140" y1="0" x2="200" y2="60" stroke="white" strokeWidth="1" />
                    {/* Arrow at end */}
                    <path d="M180 30 L200 50 L180 50 L180 30" fill="white" opacity="0.5" />
                    <path d="M190 60 L200 70 L195 70 L190 60" fill="white" opacity="0.3" />
                </svg>

                {/* Horizontal Lines */}
                <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 px-8 py-14 md:py-16 text-center">
                {/* Title - Bold white text like mockup */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 tracking-tight">
                    {t('products.hubTitle') || 'Profesyonel HVAC Çözümleri'}
                </h1>

                {/* Search Bar - WHITE background with rounded corners like mockup */}
                <div className="max-w-lg mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={t('products.searchPlaceholder') || 'Ürün veya kategori arayın...'}
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-gray-800 placeholder-gray-400 border-0 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all text-sm shadow-lg"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProductsHero



