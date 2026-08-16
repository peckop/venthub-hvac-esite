'use client'

import { Loader2, Search, X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n/I18nProvider'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { adminInputClass, adminSelectClass, adminSelectStyle } from '../../../utils/adminUi'

/**
 * Kural kapsamının HEDEF seçicisi (scope ↔ hedef DB CHECK'inin UI karşılığı):
 * 2 marka → marka listesi · 3 kategori → kategori listesi · 0/1 ürün → aramalı seçim.
 * scope 4 (global) hedef almaz — bileşen hiçbir şey render etmez.
 */

interface BrandOption {
  id: string
  name: string
}

interface CategoryOption {
  id: string
  name: string
}

interface ProductOption {
  id: string
  name: string
  sku: string
}

interface RuleScopeTargetPickerProps {
  scope: number
  value: string | null
  onChange: (targetId: string | null) => void
  disabled?: boolean
  error?: string | null
}

const SEARCH_DEBOUNCE_MS = 300
const SEARCH_LIMIT = 20

const RuleScopeTargetPicker: React.FC<RuleScopeTargetPickerProps> = ({
  scope,
  value,
  onChange,
  disabled = false,
  error = null,
}) => {
  const { t } = useI18n()

  const [brands, setBrands] = useState<BrandOption[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])

  const [term, setTerm] = useState('')
  const [results, setResults] = useState<ProductOption[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null)

  /* ---- marka listesi (scope 2) ---- */
  useEffect(() => {
    if (scope !== 2) return
    let alive = true
    void (async () => {
      const { data } = await supabase.from('brands').select('id, name').order('name')
      if (alive && data) setBrands(data)
    })()
    return () => {
      alive = false
    }
  }, [scope])

  /* ---- kategori listesi (scope 3) ---- */
  useEffect(() => {
    if (scope !== 3) return
    let alive = true
    void (async () => {
      const { data } = await supabase.from('categories').select('id, name').order('name')
      if (alive && data) setCategories(data)
    })()
    return () => {
      alive = false
    }
  }, [scope])

  /* ---- düzenlemede seçili ürünün adını geri yükle ---- */
  useEffect(() => {
    if (scope !== 0 && scope !== 1) return
    if (!value) {
      setSelectedProduct(null)
      return
    }
    if (selectedProduct?.id === value) return
    let alive = true
    void (async () => {
      const { data } = await supabase.from('products').select('id, name, sku').eq('id', value).maybeSingle()
      if (alive && data) setSelectedProduct(data)
    })()
    return () => {
      alive = false
    }
  }, [scope, value, selectedProduct])

  /* ---- debounced ürün araması (300ms) ---- */
  useEffect(() => {
    if (scope !== 0 && scope !== 1) return
    const needle = term.trim()
    if (needle.length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    let alive = true
    const timer = setTimeout(() => {
      void (async () => {
        const pattern = `%${needle.replace(/[%,]/g, '')}%`
        const { data } = await supabase
          .from('products')
          .select('id, name, sku')
          .is('deleted_at', null)
          .or(`name.ilike.${pattern},sku.ilike.${pattern}`)
          .order('name')
          .limit(SEARCH_LIMIT)
        if (!alive) return
        setResults(data ?? [])
        setSearching(false)
      })()
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [scope, term])

  const pickProduct = useCallback(
    (product: ProductOption) => {
      setSelectedProduct(product)
      setTerm('')
      setResults([])
      onChange(product.id)
    },
    [onChange],
  )

  const clearProduct = useCallback(() => {
    setSelectedProduct(null)
    setTerm('')
    setResults([])
    onChange(null)
  }, [onChange])

  if (scope === 4) return null

  const errorText = error ? (
    <p className="text-xs font-bold text-admin-danger mt-1 tracking-tighter">{error}</p>
  ) : null

  if (scope === 2) {
    return (
      <div className="space-y-2">
        <label htmlFor="rule-brand" className="block text-xs font-semibold text-admin-fg-muted">
          {t('admin.pricing.rules.form.brandTarget')}
        </label>
        <select
          id="rule-brand"
          value={value ?? ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value || null)}
          className={adminSelectClass}
          style={adminSelectStyle}
        >
          <option value="">{t('admin.pricing.rules.form.selectPlaceholder')}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        {errorText}
      </div>
    )
  }

  if (scope === 3) {
    return (
      <div className="space-y-2">
        <label htmlFor="rule-category" className="block text-xs font-semibold text-admin-fg-muted">
          {t('admin.pricing.rules.form.categoryTarget')}
        </label>
        <select
          id="rule-category"
          value={value ?? ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value || null)}
          className={adminSelectClass}
          style={adminSelectStyle}
        >
          <option value="">{t('admin.pricing.rules.form.selectPlaceholder')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-xs font-bold text-admin-fg-muted leading-relaxed">
          {t('admin.pricing.rules.form.categoryCascadeHint')}
        </p>
        {errorText}
      </div>
    )
  }

  /* scope 0/1 — ürün araması */
  return (
    <div className="space-y-2">
      <label htmlFor="rule-product-search" className="block text-xs font-semibold text-admin-fg-muted">
        {t('admin.pricing.rules.form.productTarget')}
      </label>

      {selectedProduct ? (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-admin-md bg-admin-surface border border-admin-accent/30 bg-admin-accent-weak">
          <span className="text-sm font-semibold text-admin-fg truncate">{selectedProduct.name}</span>
          <span className="text-xs font-mono font-bold text-admin-accent">{selectedProduct.sku}</span>
          <button
            type="button"
            onClick={clearProduct}
            disabled={disabled}
            aria-label={t('admin.pricing.rules.form.clearTarget')}
            className="ml-auto p-1 rounded-admin-md text-admin-fg-muted hover:text-admin-fg hover:bg-admin-surface-3 transition-colors focus-visible:ring-2 focus-visible:ring-admin-accent/30"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-fg-muted" />
            <input
              id="rule-product-search"
              type="text"
              value={term}
              disabled={disabled}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={t('admin.pricing.rules.form.productSearchPlaceholder')}
              className={adminInputClass}
            />
            {searching ? (
              <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-admin-accent animate-spin" />
            ) : null}
          </div>

          {results.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto custom-scrollbar rounded-admin-md bg-admin-surface border border-admin-border divide-y divide-admin-border">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pickProduct(p)}
                    className="w-full text-left px-4 py-2.5 hover:bg-admin-surface-2 transition-colors focus-visible:bg-admin-surface-2 focus-visible:outline-none"
                  >
                    <span className="block text-sm font-bold text-admin-fg truncate">{p.name}</span>
                    <span className="block text-xs font-mono font-bold text-admin-fg-muted">{p.sku}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {!searching && term.trim().length >= 2 && results.length === 0 ? (
            <p className="text-xs font-bold text-admin-fg-muted">{t('admin.pricing.rules.form.productSearchEmpty')}</p>
          ) : null}
        </>
      )}
      {errorText}
    </div>
  )
}

export default RuleScopeTargetPicker
