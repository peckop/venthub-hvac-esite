'use client'

import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'

import { adminButtonPrimaryClass } from '../../utils/adminUi'

interface BulkActionToolbarProps {
    selectedCount: number
    onStatusChange: (status: string) => void
    onFeatureToggle: (featured: boolean) => void
    onDelete: () => void
    onPriceAdjust: (mode: 'percent' | 'fixed', value: number) => void
    onClearSelection: () => void
}

const PRICE_ICON = '💰 '
const PERCENT_ICON = '% '
const LIRA_ICON = '₺ '
const DELETE_ICON = '🗑 '

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
    selectedCount,
    onStatusChange,
    onFeatureToggle,
    onDelete,
    onPriceAdjust,
    onClearSelection,
}) => {
    const { t } = useI18n()
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
                    <span className="text-sm font-medium">{t('admin.toolbar.itemsSelected')}</span>
                    <button onClick={onClearSelection} className="text-white/60 hover:text-white text-xs ml-1 underline">
                        {t('admin.toolbar.clear')}
                    </button>
                </div>

                <div className="h-6 w-px bg-white/20" />

                {/* Status Actions */}
                <button
                    onClick={() => onStatusChange('active')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-xs font-medium transition-colors"
                >
                    {t('admin.toolbar.makeActive')}
                </button>
                <button
                    onClick={() => onStatusChange('inactive')}
                    className="px-3 py-1.5 rounded-lg bg-gray-400/80 hover:bg-gray-400 text-xs font-medium transition-colors"
                >
                    {t('admin.toolbar.makePassive')}
                </button>

                <div className="h-6 w-px bg-white/20" />

                {/* Feature Toggle */}
                <button
                    onClick={() => onFeatureToggle(true)}
                    className="px-3 py-1.5 rounded-lg bg-yellow-500/80 hover:bg-yellow-500 text-xs font-medium transition-colors"
                >
                    {t('admin.toolbar.feature')}
                </button>

                <div className="h-6 w-px bg-white/20" />

                {/* Price Adjustment */}
                <div className="relative">
                    <button
                        onClick={() => setShowPricePanel(!showPricePanel)}
                        className="px-3 py-1.5 rounded-lg bg-blue-400/80 hover:bg-blue-400 text-xs font-medium transition-colors"
                    >
                        {PRICE_ICON}{t('admin.toolbar.updatePrice')}
                    </button>
                    {showPricePanel && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-800 rounded-xl shadow-2xl p-4 min-w-280px border border-gray-200">
                            <div className="text-sm font-semibold mb-3 text-primary-navy">{t('admin.toolbar.bulkPriceUpdate')}</div>
                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => setPriceMode('percent')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${priceMode === 'percent' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-gray-50 border-gray-200 hover:border-primary-navy'}`}
                                >
                                    {PERCENT_ICON}{t('admin.toolbar.percentage')}
                                </button>
                                <button
                                    onClick={() => setPriceMode('fixed')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${priceMode === 'fixed' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-gray-50 border-gray-200 hover:border-primary-navy'}`}
                                >
                                    {LIRA_ICON}{t('admin.toolbar.fixedAmount')}
                                </button>
                            </div>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    value={priceValue}
                                    onChange={(e) => setPriceValue(e.target.value)}
                                    placeholder={priceMode === 'percent' ? t('admin.toolbar.placeholderPercent') : t('admin.toolbar.placeholderFixed')}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30"
                                />
                                <button
                                    onClick={() => {
                                        const v = parseFloat(priceValue)
                                        if (isNaN(v)) return alert(t('admin.toolbar.invalidNumberAlert'))
                                        onPriceAdjust(priceMode, v)
                                        setShowPricePanel(false)
                                        setPriceValue('')
                                    }}
                                    className={`${adminButtonPrimaryClass} !py-2 !text-xs`}
                                >
                                    {t('admin.common.apply')}
                                </button>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                                {priceMode === 'percent'
                                    ? t('admin.toolbar.priceHintPercent')
                                    : t('admin.toolbar.priceHintFixed')}
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
                    {DELETE_ICON}{t('admin.common.delete')}
                </button>
            </div>
        </div>
    )
}

export default BulkActionToolbar
