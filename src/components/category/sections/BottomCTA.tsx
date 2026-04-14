import React from 'react'
import { ArrowUp, ThermometerSun, Package, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Routes } from '../../../utils/routes';


interface BottomCTAProps {
    /** Callback for opening the wizard (optional) */
    onOpenWizard?: () => void
    /** Callback for showing products (optional) */
    onShowProducts?: () => void
    /** Show wizard button (default: true for air curtains) */
    showWizard?: boolean
    /** Custom category name for dynamic text */
    categoryName?: string
}

/**
 * Sayfa sonu CTA bölümü
 * Kullanıcıyı belirli aksiyonlara yönlendirir:
 * - Modelleri İncele
 * - Bana Uygun Olanı Bul (Wizard)
 * - Uzman Desteği Al
 * - Başa Dön
 */
const BottomCTA: React.FC<BottomCTAProps> = ({
    onOpenWizard,
    onShowProducts,
    showWizard = true,
    categoryName = 'Ürünler'
}) => {
    const scrollToTop = () => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    return (
        <section className="bg-gradient-to-br from-primary-navy via-slate-800 to-primary-navy py-16 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-secondary-blue rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 will-change-transform" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 will-change-transform" />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Sıradaki Adımınız
                    </h2>
                    <p className="text-gray-300 max-w-xl mx-auto">
                        Size en uygun {categoryName.toLowerCase()} için yardımcı olalım
                    </p>
                </div>

                {/* CTA Cards Grid */}
                <div className={`grid gap-4 ${showWizard ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {/* Modelleri İncele */}
                    {onShowProducts && (
                        <button
                            onClick={onShowProducts}
                            className="group flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all"
                        >
                            <div className="w-14 h-14 bg-secondary-blue rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Package className="text-white" size={28} />
                            </div>
                            <span className="text-lg font-bold text-white mb-1">Modelleri İncele</span>
                            <span className="text-sm text-gray-400">Tüm ürünleri görüntüle</span>
                        </button>
                    )}

                    {/* Wizard Button */}
                    {showWizard && onOpenWizard && (
                        <button
                            onClick={onOpenWizard}
                            className="group flex flex-col items-center p-6 bg-gradient-to-br from-secondary-blue to-blue-600 rounded-2xl border border-blue-400/30 hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                        >
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                                <ThermometerSun className="text-yellow-300" size={28} />
                            </div>
                            <span className="text-lg font-bold text-white mb-1">Bana Uygun Olanı Bul</span>
                            <span className="text-sm text-blue-100">3 adımda doğru model</span>
                        </button>
                    )}

                    {/* Uzman Desteği */}
                    <Link
                        href={Routes.contact('consulting')}
                        className="group flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all"
                    >
                        <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare className="text-white" size={28} />
                        </div>
                        <span className="text-lg font-bold text-white mb-1">Uzman Desteği</span>
                        <span className="text-sm text-gray-400">Proje danışmanlığı al</span>
                    </Link>
                </div>

                {/* Scroll to Top */}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowUp size={18} className="group-hover:-translate-y-1 transition-transform" />
                        <span className="text-sm">Başa Dön</span>
                    </button>
                </div>
            </div>
        </section>
    )
}

export default BottomCTA



