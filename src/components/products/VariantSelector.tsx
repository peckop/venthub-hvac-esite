'use client'

import { LayoutGrid, List, Search } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import type { FamilyVariant } from '../../lib/services/family.service'
import { formatSpecValue } from '../../utils/productHelpers'
import { specFieldLabel } from '../../utils/specLabel'

/**
 * F5-B W2.2 — Aile varyant seçici.
 *
 * Bir ailede 1…81 varyant olabilir (seat-storm-jet). Tek bir kontrol tipi bu
 * aralığı taşıyamadığı için görünüm varyant sayısına göre kademelenir:
 *
 *   n ≤ 8            → hap (pill) listesi, arama yok
 *   9 ≤ n ≤ 19       → aranabilir kompakt liste
 *   n ≥ 20           → aranabilir liste + MATRİS görünümü (ayırt edici spec kolonları)
 *
 * Seçim yukarı bildirilir; URL (?sku=) yönetimi çağıranın işidir (router.replace).
 */

/** Hap listesi üst sınırı — üzerinde arama kutusu açılır. */
export const VARIANT_PILL_MAX = 8
/** Matris görünümünün sunulmaya başladığı varyant sayısı. */
export const VARIANT_MATRIX_MIN = 20
/** Matriste gösterilecek en fazla ayırt edici spec kolonu (yatay taşmayı sınırlar). */
export const VARIANT_MATRIX_MAX_COLUMNS = 5

export interface VariantSelectorProps {
  variants: FamilyVariant[]
  selectedSku: string | null
  onSelect: (sku: string) => void
  /** Fiyat gösterimi kapalıysa (Teklif Alın modeli) fiyat kolonu "Teklif" yazar. */
  quoteMode: boolean
  /**
   * W4b · Gösterilen varyant fiyatlarının KDV semantiği — `get_family_detail` KÖK
   * düzeyindeki `price_tax_included`. Bireysel/anon BRÜT (KDV dahil), bayi/kurumsal NET.
   * `null`/verilmemiş = bilinmiyor → fiyat kolonu etiketsiz kalır (yanlış etiket yerine
   * hiç etiket). Sabit "KDV Dahil" varsayımı W4b'de kaldırıldı.
   */
  priceTaxIncluded?: boolean | null
}

function variantLabel(v: FamilyVariant): string {
  return v.model_code || v.sku
}

/**
 * Varyantları AYIRT EDEN spec anahtarları: tüm varyantların technical_specs
 * anahtar birleşimi içinden, birden fazla farklı değer taşıyanlar (sabit değerli
 * anahtar matriste bilgi taşımaz). Kapsam (kaç varyantta var) ve alfabetik sıra
 * ile deterministik sıralanır.
 */
function distinguishingSpecKeys(variants: FamilyVariant[]): string[] {
  const values = new Map<string, Set<string>>()
  const coverage = new Map<string, number>()

  for (const v of variants) {
    for (const [key, raw] of Object.entries(v.technical_specs ?? {})) {
      if (raw === null || raw === undefined || raw === '') continue
      if (!values.has(key)) values.set(key, new Set())
      values.get(key)!.add(String(raw))
      coverage.set(key, (coverage.get(key) ?? 0) + 1)
    }
  }

  return Array.from(values.entries())
    .filter(([, set]) => set.size > 1)
    .map(([key]) => key)
    .sort((a, b) => (coverage.get(b)! - coverage.get(a)!) || a.localeCompare(b))
    .slice(0, VARIANT_MATRIX_MAX_COLUMNS)
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedSku,
  onSelect,
  quoteMode,
  priceTaxIncluded = null,
}) => {
  const { t, lang } = useI18n()
  const [query, setQuery] = useState('')
  const [isMatrix, setIsMatrix] = useState(false)

  const total = variants.length
  const showSearch = total > VARIANT_PILL_MAX
  const canMatrix = total >= VARIANT_MATRIX_MIN

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang === 'en' ? 'en-US' : 'tr-TR')
    if (!q) return variants
    return variants.filter((v) =>
      [v.sku, v.model_code, v.name]
        .filter(Boolean)
        .some((field) => String(field).toLocaleLowerCase(lang === 'en' ? 'en-US' : 'tr-TR').includes(q))
    )
  }, [variants, query, lang])

  const specKeys = useMemo(
    () => (canMatrix && isMatrix ? distinguishingSpecKeys(variants) : []),
    [canMatrix, isMatrix, variants]
  )

  if (total <= 1) return null

  // W4b: `v.price` RPC'den gelen MOTOR fiyatıdır (display_price) — ham products.price DEĞİL.
  const priceCell = (v: FamilyVariant) =>
    quoteMode || v.price == null || Number(v.price) <= 0
      ? t('pdp.variant.quote')
      : formatCurrency(Number(v.price), lang, { currency: 'TRY', maximumFractionDigits: 0 })

  // Fiyat kolonu başlığı KDV semantiğini taşır (bilinmiyorsa sade "Fiyat" kalır).
  // Anahtarlar İKİ AYRI t() çağrısı — `t(cond ? 'a' : 'b')` biçimini INV-5 keycheck'i görmez.
  const taxSuffix =
    priceTaxIncluded == null ? null : priceTaxIncluded ? t('pdp.vatIncluded') : t('pdp.vatExcluded')
  const priceColumnLabel = taxSuffix
    ? `${t('pdp.variant.colPrice')} ${taxSuffix}`
    : t('pdp.variant.colPrice')

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex flex-col">
          <span className="text-xs font-black text-industrial-gray uppercase tracking-widest">
            {t('pdp.variant.heading')}
          </span>
          <span className="text-xs font-bold text-steel-gray uppercase tracking-widest opacity-60">
            {t('pdp.variant.count', { count: total })}
          </span>
        </div>

        {canMatrix && (
          <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-light-gray/50">
            <button
              type="button"
              onClick={() => setIsMatrix(false)}
              aria-pressed={!isMatrix}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${!isMatrix ? 'bg-primary-navy text-white' : 'text-steel-gray hover:text-primary-navy'}`}
            >
              <List size={12} />
              <span>{t('pdp.variant.viewList')}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMatrix(true)}
              aria-pressed={isMatrix}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${isMatrix ? 'bg-primary-navy text-white' : 'text-steel-gray hover:text-primary-navy'}`}
            >
              <LayoutGrid size={12} />
              <span>{t('pdp.variant.viewMatrix')}</span>
            </button>
          </div>
        )}
      </div>

      {showSearch && (
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-gray/60" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('pdp.variant.searchPlaceholder')}
            aria-label={t('pdp.variant.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-light-gray rounded-xl text-sm font-medium text-industrial-gray placeholder:text-steel-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy"
          />
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-xs font-bold text-steel-gray uppercase tracking-widest text-center py-6">
          {t('pdp.variant.noMatch')}
        </p>
      )}

      {/* n ≤ 8 → hap listesi */}
      {filtered.length > 0 && !showSearch && (
        <div className="flex flex-wrap gap-2">
          {filtered.map((v) => {
            const active = v.sku === selectedSku
            return (
              <button
                key={v.sku}
                type="button"
                onClick={() => onSelect(v.sku)}
                aria-pressed={active}
                className={`px-3.5 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${active
                  ? 'bg-primary-navy text-white border-primary-navy'
                  : 'bg-white text-industrial-gray border-light-gray hover:border-primary-navy hover:text-primary-navy'}`}
              >
                {variantLabel(v)}
              </button>
            )
          })}
        </div>
      )}

      {/* 9 ≤ n → aranabilir kompakt liste */}
      {filtered.length > 0 && showSearch && !isMatrix && (
        <ul className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
          {filtered.map((v) => {
            const active = v.sku === selectedSku
            return (
              <li key={v.sku}>
                <button
                  type="button"
                  onClick={() => onSelect(v.sku)}
                  aria-pressed={active}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${active
                    ? 'bg-air-blue/40 border-primary-navy'
                    : 'bg-white border-light-gray hover:border-primary-navy/40'}`}
                >
                  <span className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-industrial-gray uppercase tracking-widest truncate">
                      {variantLabel(v)}
                    </span>
                    <span className="text-xs font-medium text-steel-gray truncate">{v.name}</span>
                  </span>
                  <span className="text-xs font-black text-primary-navy whitespace-nowrap">
                    {priceCell(v)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* n ≥ 20 → matris: satır = varyant, kolon = ayırt edici spec */}
      {filtered.length > 0 && isMatrix && (
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div
              className="grid gap-2 px-3 pb-2 border-b border-light-gray"
              style={{ gridTemplateColumns: `minmax(9rem, 1fr) repeat(${specKeys.length + 1}, minmax(7rem, auto))` }}
            >
              <span className="text-xs font-black text-steel-gray uppercase tracking-widest">
                {t('pdp.variant.colModel')}
              </span>
              {specKeys.map((key) => (
                <span key={key} className="text-xs font-black text-steel-gray uppercase tracking-widest truncate">
                  {specFieldLabel(key, t)}
                </span>
              ))}
              <span className="text-xs font-black text-steel-gray uppercase tracking-widest text-right">
                {priceColumnLabel}
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto mt-1.5 space-y-1">
              {filtered.map((v) => {
                const active = v.sku === selectedSku
                return (
                  <button
                    key={v.sku}
                    type="button"
                    onClick={() => onSelect(v.sku)}
                    aria-pressed={active}
                    aria-label={t('pdp.variant.selectAria', { model: variantLabel(v) })}
                    className={`w-full grid gap-2 items-center px-3 py-2.5 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${active
                      ? 'bg-air-blue/40 border-primary-navy'
                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-light-gray'}`}
                    style={{ gridTemplateColumns: `minmax(9rem, 1fr) repeat(${specKeys.length + 1}, minmax(7rem, auto))` }}
                  >
                    <span className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-industrial-gray uppercase tracking-widest truncate">
                        {variantLabel(v)}
                      </span>
                      <span className="text-xs font-medium text-steel-gray truncate">{v.sku}</span>
                    </span>
                    {specKeys.map((key) => (
                      <span key={key} className="text-xs font-bold text-industrial-gray truncate">
                        {formatSpecValue(key, v.technical_specs?.[key] ?? null)}
                      </span>
                    ))}
                    <span className="text-xs font-black text-primary-navy text-right whitespace-nowrap">
                      {priceCell(v)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VariantSelector
