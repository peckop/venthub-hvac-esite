import React from 'react'
import { Search } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

interface ProductsHeroProps {
    searchValue: string
    onSearchChange: (value: string) => void
    searchInputRef?: React.RefObject<HTMLInputElement>
}

/**
 * Products Hub Hero Section
 * Premium gradient hero with search functionality
 */
const ProductsHero: React.FC<ProductsHeroProps> = ({
    searchValue,
    onSearchChange,
    searchInputRef
}) => {
    const { t } = useI18n()

    return (
        <section className="relative bg-gradient-to-br from-primary-navy via-slate-800 to-primary-navy rounded-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-blue rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Content */}
            <div className="relative z-10 px-8 py-12 md:py-16 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-200 font-medium">
                        {t('products.hubBadge') || 'Türkiye\'nin HVAC Uzmanı'}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                    {t('products.hubTitle') || 'Profesyonel HVAC Çözümleri'}
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                    {t('products.hubSubtitle') || 'Hava perdesi, endüstriyel fan ve ısı geri kazanım sistemleri. İhtiyacınıza uygun ürünü birlikte bulalım.'}
                </p>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={t('products.searchPlaceholder') || 'Ürün veya model ara...'}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProductsHero
