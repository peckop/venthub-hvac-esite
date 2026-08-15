'use client'

import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'

import { adminButtonPrimaryClass } from '../../../utils/adminUi'

/**
 * TOPLU FİYAT GÜNCELLEME PANELİ
 *
 * `BulkActionToolbar`'dan çıkarıldı: o bileşen `BulkBar` ile MÜKERRERDİ (aynı işi
 * yapan iki yapışkan toplu-işlem çubuğu, üstelik farklı görsel dillerde — biri koyu
 * cam, diğeri açık zeminli emoji'li). Cetvel §4'ün "aynı işlem farklı sayfada farklı
 * görünmemeli" maddesi bunu yasaklıyor.
 *
 * Panel MANTIĞI ve GÖRÜNÜMÜ bilerek OLDUĞU GİBİ taşındı — bu commit birleştirme
 * commit'i, giydirme değil. Görsel kalibrasyon Faz 3'te tek seferde yapılacak;
 * şimdi restyle etmek davranış değişikliğini görsel değişiklikle karıştırırdı.
 *
 * Cetvel: docs/standards/admin-design-standard.md §4.6 (alan hatası inline)
 */

export interface BulkPricePanelProps {
  onApply: (mode: 'percent' | 'fixed', value: number) => void
  /** `BulkBar` panel render-prop'undan gelen kapatıcı. */
  onClose: () => void
}

const PERCENT_ICON = '% '
const LIRA_ICON = '₺ '

export function BulkPricePanel({ onApply, onClose }: BulkPricePanelProps): React.ReactNode {
  const { t } = useI18n()
  const [priceMode, setPriceMode] = React.useState<'percent' | 'fixed'>('percent')
  const [priceValue, setPriceValue] = React.useState('')
  /**
   * Alan doğrulama hatası INLINE — `alert()` yerine (cetvel §4.6):
   * NN/g: "an error in a form should be reported on the page, next to where it
   * occurred, so that users can refer to the error message while they fix the problem."
   */
  const [priceError, setPriceError] = React.useState<string | null>(null)

  const apply = (): void => {
    const parsed = parseFloat(priceValue)
    if (isNaN(parsed)) {
      setPriceError(t('admin.toolbar.invalidNumberAlert'))
      return
    }
    setPriceError(null)
    onApply(priceMode, parsed)
    setPriceValue('')
    onClose()
  }

  const modeButtonClass = (active: boolean): string =>
    `flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
      active
        ? 'bg-primary-navy text-white border-primary-navy'
        : 'bg-gray-50 border-gray-200 hover:border-primary-navy'
    }`

  return (
    <div className="bg-white text-gray-800 rounded-xl shadow-2xl p-4 min-w-280px border border-gray-200">
      <div className="text-sm font-semibold mb-3 text-primary-navy">
        {t('admin.toolbar.bulkPriceUpdate')}
      </div>
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setPriceMode('percent')}
          aria-pressed={priceMode === 'percent'}
          className={modeButtonClass(priceMode === 'percent')}
        >
          {PERCENT_ICON}
          {t('admin.toolbar.percentage')}
        </button>
        <button
          type="button"
          onClick={() => setPriceMode('fixed')}
          aria-pressed={priceMode === 'fixed'}
          className={modeButtonClass(priceMode === 'fixed')}
        >
          {LIRA_ICON}
          {t('admin.toolbar.fixedAmount')}
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={priceValue}
          onChange={(e) => {
            setPriceValue(e.target.value)
            setPriceError(null)
          }}
          aria-invalid={priceError ? true : undefined}
          aria-describedby={priceError ? 'bulk-price-error' : undefined}
          placeholder={
            priceMode === 'percent'
              ? t('admin.toolbar.placeholderPercent')
              : t('admin.toolbar.placeholderFixed')
          }
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30"
        />
        <button type="button" onClick={apply} className={`${adminButtonPrimaryClass} !py-2 !text-xs`}>
          {t('admin.common.apply')}
        </button>
      </div>
      {priceError && (
        <p id="bulk-price-error" role="alert" className="mt-2 text-xs text-rose-500">
          {priceError}
        </p>
      )}
      <div className="text-xs text-gray-400 mt-2">
        {priceMode === 'percent'
          ? t('admin.toolbar.priceHintPercent')
          : t('admin.toolbar.priceHintFixed')}
      </div>
    </div>
  )
}

export default BulkPricePanel
