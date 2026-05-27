'use client'

import React from 'react'
import { adminButtonPrimaryClass } from '../../utils/adminUi'

interface BulkActionToolbarProps {
    selectedCount: number
    onStatusChange: (status: string) => void
    onFeatureToggle: (featured: boolean) => void
    onDelete: () => void
    onPriceAdjust: (mode: 'percent' | 'fixed', value: number) => void
    onClearSelection: () => void
}

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
    selectedCount,
    onStatusChange,
    onFeatureToggle,
    onDelete,
    onPriceAdjust,
    onClearSelection,
}) => {
    const [showPricePanel, setShowPricePanel] = React.useState(false)
    const [priceMode, setPriceMode] = React.useState<'percent' | 'fixed'>('percent')
    const [priceValue, setPriceValue] = React.useState('')

    if (selectedCount === 0) return null

    return (
        <div className="sticky bottom-4 z-40 mx-auto max-w-4xl animate-slide-up">
            <div className="bg-primary-navy text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-3 flex-wrap">
                {/* Selection Info */}
                <div className="flex items-center gap-2 mr-2">
                    <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-medium">ürün seçili</span>
                    <button onClick={onClearSelection} className="text-white/60 hover:text-white text-xs ml-1 underline">
                        Temizle
                    </button>
                </div>

                <div className="h-6 w-px bg-white/20" />

                {/* Status Actions */}
                <button
                    onClick={() => onStatusChange('active')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-xs font-medium transition-colors"
                >
                    Aktif Yap
                </button>
                <button
                    onClick={() => onStatusChange('inactive')}
                    className="px-3 py-1.5 rounded-lg bg-gray-400/80 hover:bg-gray-400 text-xs font-medium transition-colors"
                >
                    Pasif Yap
                </button>

                <div className="h-6 w-px bg-white/20" />

                {/* Feature Toggle */}
                <button
                    onClick={() => onFeatureToggle(true)}
                    className="px-3 py-1.5 rounded-lg bg-yellow-500/80 hover:bg-yellow-500 text-xs font-medium transition-colors"
                >
                    Vitrine Çıkar
                </button>

                <div className="h-6 w-px bg-white/20" />

                {/* Price Adjustment */}
                <div className="relative">
                    <button
                        onClick={() => setShowPricePanel(!showPricePanel)}
                        className="px-3 py-1.5 rounded-lg bg-blue-400/80 hover:bg-blue-400 text-xs font-medium transition-colors"
                    >
                        💰 Fiyat Güncelle
                    </button>
                    {showPricePanel && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-800 rounded-xl shadow-2xl p-4 min-w-280px border border-gray-200">
                            <div className="text-sm font-semibold mb-3 text-primary-navy">Toplu Fiyat Güncelleme</div>
                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => setPriceMode('percent')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${priceMode === 'percent' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-gray-50 border-gray-200 hover:border-primary-navy'}`}
                                >
                                    % Yüzde
                                </button>
                                <button
                                    onClick={() => setPriceMode('fixed')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${priceMode === 'fixed' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-gray-50 border-gray-200 hover:border-primary-navy'}`}
                                >
                                    ₺ Sabit Tutar
                                </button>
                            </div>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    value={priceValue}
                                    onChange={(e) => setPriceValue(e.target.value)}
                                    placeholder={priceMode === 'percent' ? 'Örn: 15 (zam) veya -10 (indirim)' : 'Örn: 500 (ekle) veya -200 (düş)'}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30"
                                />
                                <button
                                    onClick={() => {
                                        const v = parseFloat(priceValue)
                                        if (isNaN(v)) return alert('Geçerli bir sayı giriniz.')
                                        onPriceAdjust(priceMode, v)
                                        setShowPricePanel(false)
                                        setPriceValue('')
                                    }}
                                    className={`${adminButtonPrimaryClass} !py-2 !text-xs`}
                                >
                                    Uygula
                                </button>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                                {priceMode === 'percent'
                                    ? 'Pozitif değer = Zam, Negatif değer = İndirim'
                                    : 'Pozitif değer = Fiyata Ekle, Negatif değer = Fiyattan Düş'}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-white/20" />

                {/* Delete */}
                <button
                    onClick={onDelete}
                    className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-xs font-medium transition-colors"
                >
                    🗑 Sil
                </button>
            </div>
        </div>
    )
}

export default BulkActionToolbar
