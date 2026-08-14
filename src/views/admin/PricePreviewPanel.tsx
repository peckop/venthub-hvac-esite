'use client'

import { AlertTriangle, ExternalLink, Loader2, Percent, Search, X } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import AccessDenied from '../../components/admin/AccessDenied'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useRole } from '../../hooks/useRole'
import { formatCurrency, formatNumber } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { type PriceResolution,resolvePrice } from '../../lib/services/pricing.service'
import { loadBrandIdByName, toPricingProductInput } from '../../lib/services/pricingAdmin.service'
import { supabaseBrowserClient as supabase } from '../../lib/supabase/client'
import {
  adminCardPaddedClass,
  adminInputClass,
  adminSelectClass,
  adminSelectStyle,
  adminSettingsLabelClass,
} from '../../utils/adminUi'

/**
 * Fiyat önizleme paneli (W3-T3) — `resolvePrice` motorunu TEK ürün için TEK
 * çağrıyla koşturup maliyet/sonuç/hesaplama izini gösterir. `/admin/pricing/rules`
 * sayfasındaki "Önizle" linki `?productId=` ile buraya derin bağ atar; segment/
 * para birimi/adet de URL'e yazılır (sayfalar arası paylaşılabilir bağlantı).
 */

type ScopeKey = 'variant' | 'product' | 'brand' | 'category' | 'global'

const SCOPE_KEYS: Record<number, ScopeKey> = {
  0: 'variant',
  1: 'product',
  2: 'brand',
  3: 'category',
  4: 'global',
}

const SEGMENT_LABEL_KEYS: Record<string, string> = {
  individual: 'admin.pricing.common.segment.individual',
  dealer: 'admin.pricing.common.segment.dealer',
  corporate: 'admin.pricing.common.segment.corporate',
}

interface ProductSearchRow {
  id: string
  name: string
  sku: string
  brand: string
  category_id: string | null
  purchase_price: number
  purchase_currency: string
  purchase_rate_to_base: number | null
  cost_in_base: number | null
}

interface PriceListOption {
  id: string
  name: string
  user_type: string | null
}

const PRODUCT_SELECT =
  'id,name,sku,brand,category_id,purchase_price,purchase_currency,purchase_rate_to_base,cost_in_base'
const SEARCH_DEBOUNCE_MS = 300
const SEARCH_LIMIT = 20
const BASE_BOOK_VALUE = 'base'
const FALLBACK_CURRENCIES = ['TRY', 'EUR', 'USD']

function parseQty(raw: string): number {
  const n = parseInt(raw.replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

const PricePreviewPanel: React.FC = () => {
  const { t, lang } = useI18n()
  const locale = lang === 'en' ? 'en' : 'tr'
  const { role, loading: roleLoading } = useRole()
  const isPricingAdmin = role === 'super_admin' || role === 'admin' || role === 'moderator'

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  /* ---- URL state (paylaşılabilir derin bağ) ---- */
  const [productId, setProductId] = useState<string | null>(() => searchParams?.get('productId') ?? null)
  const [segment, setSegment] = useState<string>(() => searchParams?.get('segment') ?? '')
  const [currency, setCurrency] = useState<string>(() => searchParams?.get('currency') ?? '')
  const [quantity, setQuantity] = useState<number>(() => parseQty(searchParams?.get('qty') ?? '1'))

  useEffect(() => {
    const params = new URLSearchParams()
    if (productId) params.set('productId', productId)
    if (segment) params.set('segment', segment)
    if (currency) params.set('currency', currency)
    if (quantity !== 1) params.set('qty', String(quantity))
    const qs = params.toString()
    router.replace((qs ? `${pathname}?${qs}` : pathname) as Route, { scroll: false })
  }, [productId, segment, currency, quantity, pathname, router])

  /* ---- segment kitapları + etkin para birimleri ---- */
  const [priceLists, setPriceLists] = useState<PriceListOption[]>([])
  const [enabledCurrencies, setEnabledCurrencies] = useState<string[]>(FALLBACK_CURRENCIES)
  const [initLoading, setInitLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void (async () => {
      setInitLoading(true)
      setInitError(null)
      try {
        const [{ data: lists, error: listsErr }, { data: settingsRow, error: settingsErr }] = await Promise.all([
          supabase.from('price_lists').select('id, name, user_type').eq('is_active', true).order('user_type'),
          supabase.from('site_settings').select('value').eq('key', 'pricing').maybeSingle(),
        ])
        if (!alive) return
        if (listsErr) throw listsErr
        if (settingsErr) throw settingsErr
        setPriceLists(lists ?? [])
        const settingsValue = (settingsRow?.value || {}) as { enabled_currencies?: unknown }
        const raw = settingsValue.enabled_currencies
        const currencies =
          Array.isArray(raw) && raw.length > 0 && raw.every((v) => typeof v === 'string')
            ? (raw as string[])
            : FALLBACK_CURRENCIES
        setEnabledCurrencies(currencies)
      } catch (e) {
        if (!alive) return
        setInitError(e instanceof Error ? e.message : String(e))
      } finally {
        if (alive) setInitLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  /* ---- varsayılanlar: individual satırı / ilk etkin para birimi ---- */
  useEffect(() => {
    if (initLoading || segment) return
    const individual = priceLists.find((p) => p.user_type === 'individual')
    setSegment(individual ? individual.id : BASE_BOOK_VALUE)
  }, [initLoading, priceLists, segment])

  useEffect(() => {
    if (initLoading || currency) return
    setCurrency(enabledCurrencies[0] ?? 'TRY')
  }, [initLoading, enabledCurrencies, currency])

  const priceBookId = segment && segment !== BASE_BOOK_VALUE ? segment : null

  /* ---- ürün seçimi (deep-link geri yükleme + arama) ---- */
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchRow | null>(null)
  const [productLoadError, setProductLoadError] = useState<string | null>(null)
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<ProductSearchRow[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) {
      setSelectedProduct(null)
      setProductLoadError(null)
      return
    }
    if (selectedProduct?.id === productId) return
    let alive = true
    void (async () => {
      const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('id', productId).is('deleted_at', null).maybeSingle()
      if (!alive) return
      if (error || !data) {
        setProductLoadError(t('admin.pricing.preview.loadFailed'))
        return
      }
      setProductLoadError(null)
      setSelectedProduct(data)
    })()
    return () => {
      alive = false
    }
  }, [productId, selectedProduct, t])

  useEffect(() => {
    const needle = term.trim()
    // Arama terimi yokken de ilk N ürün listelenir: boş kutu "hiç ürün yok" gibi okunuyordu.
    // 1 harflik terim henüz anlamlı daraltma yapmadığı için o da listeyi olduğu gibi bırakır.
    const isBrowse = needle.length < 2
    setSearching(true)
    let alive = true
    const timer = setTimeout(() => {
      void (async () => {
        const pattern = `%${needle.replace(/[%,]/g, '')}%`
        let query = supabase.from('products').select(PRODUCT_SELECT).is('deleted_at', null)
        query = isBrowse
          ? query.order('name', { ascending: true })
          : query.or(`name.ilike.${pattern},sku.ilike.${pattern}`)
        const { data, error } = await query.limit(SEARCH_LIMIT)
        if (!alive) return
        // Hatayı yutma: sessiz boş liste, "ürün yok" ile "sorgu patladı"yı ayırt ettirmiyordu.
        setSearchError(error ? t('admin.pricing.common.loadFailed') : null)
        setResults(data ?? [])
        setSearching(false)
      })()
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [term, t])

  const pickProduct = useCallback((p: ProductSearchRow) => {
    setSelectedProduct(p)
    setProductId(p.id)
    setTerm('')
    setResults([])
  }, [])

  const clearProduct = useCallback(() => {
    setSelectedProduct(null)
    setProductId(null)
    setTerm('')
    setResults([])
  }, [])

  /* ---- marka köprüsü (bir kez yüklenir) ---- */
  const brandMapRef = useRef<Map<string, string> | null>(null)
  const [brandMapReady, setBrandMapReady] = useState(false)

  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        const map = await loadBrandIdByName(supabase)
        if (!alive) return
        brandMapRef.current = map
        setBrandMapReady(true)
      } catch (e) {
        console.error('loadBrandIdByName failed:', e)
        if (alive) setInitError(t('admin.pricing.preview.loadFailed'))
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  /* ---- resolvePrice — TEK ürün için TEK çağrı ---- */
  const [resolution, setResolution] = useState<PriceResolution | null>(null)
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedProduct || !brandMapReady || !brandMapRef.current || !currency) {
      setResolution(null)
      return
    }
    let alive = true
    setResolving(true)
    setResolveError(null)
    void (async () => {
      try {
        const input = toPricingProductInput(selectedProduct, brandMapRef.current!)
        const result = await resolvePrice(supabase, input, { priceBookId, currency, quantity })
        if (!alive) return
        setResolution(result)
      } catch (e) {
        if (!alive) return
        setResolveError(e instanceof Error ? e.message : String(e))
      } finally {
        if (alive) setResolving(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [selectedProduct, brandMapReady, priceBookId, currency, quantity])

  /* ---- K5: yükleniyor / yetki / hata / boş / içerik ---- */
  if (roleLoading) return <AdminSkeleton variant="form" fields={4} />
  if (!isPricingAdmin) return <AccessDenied />
  if (initLoading) return <AdminSkeleton variant="form" fields={4} />

  const resultScopeKey = resolution?.price ? SCOPE_KEYS[resolution.price.ruleScope] : undefined

  return (
    <div className="space-y-8">
      {initError ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold">
          {t('admin.pricing.common.loadFailed')}
        </div>
      ) : null}

      {/* ---- bağlam çubuğu: ürün · segment · para birimi · adet ---- */}
      <div className={`${adminCardPaddedClass} grid grid-cols-1 gap-6 md:grid-cols-4`}>
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="preview-product-search" className={adminSettingsLabelClass}>
            {t('admin.pricing.preview.product.label')}
          </label>

          {selectedProduct ? (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass border border-cyan-400/20 bg-cyan-400/5">
              <span className="text-sm font-black text-white truncate">{selectedProduct.name}</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{selectedProduct.sku}</span>
              <button
                type="button"
                onClick={clearProduct}
                aria-label={t('admin.pricing.preview.product.clear')}
                className="ml-auto p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/40"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="preview-product-search"
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder={t('admin.pricing.preview.product.searchPlaceholder')}
                  className={adminInputClass}
                />
                {searching ? (
                  <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 animate-spin" />
                ) : null}
              </div>

              {results.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto custom-scrollbar rounded-xl glass border border-white/10 divide-y divide-white/5">
                  {results.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => pickProduct(p)}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors focus-visible:bg-white/5 focus-visible:outline-none"
                      >
                        <span className="block text-sm font-bold text-white truncate">{p.name}</span>
                        <span className="block text-xs font-mono font-bold text-slate-500">{p.sku}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {searchError ? (
                <p className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <AlertTriangle size={14} />
                  {searchError}
                </p>
              ) : null}

              {!searching && !searchError && results.length === 0 ? (
                <p className="text-xs font-bold text-slate-500">{t('admin.pricing.preview.product.searchEmpty')}</p>
              ) : null}
            </>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="preview-segment" className={adminSettingsLabelClass}>
            {t('admin.pricing.preview.context.segmentLabel')}
          </label>
          <select
            id="preview-segment"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className={adminSelectClass}
            style={adminSelectStyle}
          >
            <option value={BASE_BOOK_VALUE}>{t('admin.pricing.common.segment.baseBook')}</option>
            {priceLists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.user_type && SEGMENT_LABEL_KEYS[p.user_type] ? t(SEGMENT_LABEL_KEYS[p.user_type]) : p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="preview-currency" className={adminSettingsLabelClass}>
              {t('admin.pricing.preview.context.currencyLabel')}
            </label>
            <select
              id="preview-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={adminSelectClass}
              style={adminSelectStyle}
            >
              {enabledCurrencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="preview-quantity" className={adminSettingsLabelClass}>
              {t('admin.pricing.preview.context.quantityLabel')}
            </label>
            <input
              id="preview-quantity"
              type="text"
              inputMode="numeric"
              value={String(quantity)}
              onChange={(e) => setQuantity(parseQty(e.target.value))}
              className={adminInputClass}
            />
          </div>
        </div>
      </div>

      {/* ---- içerik: boş durum ya da 3 kart ---- */}
      {productLoadError ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold">
          {productLoadError}
        </div>
      ) : !selectedProduct ? (
        <AdminEmptyState
          icon={Percent}
          title={t('admin.pricing.preview.empty.title')}
          description={t('admin.pricing.preview.empty.description')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ---- 1) maliyet ---- */}
          <div className={adminCardPaddedClass}>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6">
              {t('admin.pricing.preview.cost.title')}
            </h2>
            <dl className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                  {t('admin.pricing.preview.cost.purchasePrice')}
                </dt>
                <dd className="font-black text-white">
                  {formatCurrency(selectedProduct.purchase_price, locale, {
                    currency: selectedProduct.purchase_currency,
                  })}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                  {t('admin.pricing.preview.cost.exchangeRate')}
                </dt>
                <dd className="font-black text-white">
                  {selectedProduct.purchase_rate_to_base != null
                    ? formatNumber(selectedProduct.purchase_rate_to_base, locale, { maximumFractionDigits: 4 })
                    : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                  {t('admin.pricing.preview.cost.costInBase')}
                </dt>
                <dd className="font-black text-white">
                  {selectedProduct.cost_in_base != null ? formatCurrency(selectedProduct.cost_in_base, locale, { currency: 'TRY' }) : '—'}
                </dd>
              </div>
            </dl>
            {selectedProduct.cost_in_base == null ? (
              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold leading-relaxed">
                {t('admin.pricing.preview.noCostHint')}
              </div>
            ) : null}
          </div>

          {/* ---- 2) sonuç ---- */}
          <div className={adminCardPaddedClass}>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6">
              {t('admin.pricing.preview.result.title')}
            </h2>
            {resolving ? (
              <div className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                <Loader2 size={16} className="animate-spin text-cyan-400" />
                {t('admin.pricing.preview.resolving')}
              </div>
            ) : resolveError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold">
                {t('admin.pricing.common.loadFailed')}
              </div>
            ) : resolution?.price ? (
              <div className="space-y-4">
                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                      {t('admin.pricing.preview.result.net')}
                    </dt>
                    <dd className="font-black text-white">
                      {formatCurrency(resolution.price.net, locale, { currency: resolution.price.currency })}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                      {t('admin.pricing.preview.result.gross')}
                    </dt>
                    <dd className="font-black text-white">
                      {formatCurrency(resolution.price.gross, locale, { currency: resolution.price.currency })}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                      {t('admin.pricing.preview.result.vatRate')}
                    </dt>
                    <dd className="font-black text-white">
                      {locale === 'tr'
                        ? `%${formatNumber(resolution.price.vatRatePct, locale, { maximumFractionDigits: 2 })}`
                        : `${formatNumber(resolution.price.vatRatePct, locale, { maximumFractionDigits: 2 })}%`}
                    </dd>
                  </div>
                </dl>
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-xs">
                    {t('admin.pricing.preview.result.winningRule')}
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    {resultScopeKey ? (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-wider">
                        {t(`admin.pricing.common.scope.${resultScopeKey}`)}
                      </span>
                    ) : null}
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {resolution.price.ruleId.slice(0, 8)}
                    </span>
                    <Link
                      href={'/admin/pricing/rules' as Route}
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {t('admin.pricing.preview.result.viewRule')}
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/3 border border-white/10 text-slate-300 text-sm font-bold">
                {t('admin.pricing.common.quoteOnly')}
              </div>
            )}
          </div>

          {/* ---- 3) hesaplama izi ---- */}
          <div className={adminCardPaddedClass}>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6">
              {t('admin.pricing.preview.trace.title')}
            </h2>
            {resolution?.trace && resolution.trace.length > 0 ? (
              <ol className="space-y-1.5 text-xs font-mono leading-relaxed">
                {resolution.trace.map((line, i) => (
                  <li
                    key={i}
                    className={`flex gap-3 px-3 py-1.5 rounded-lg ${
                      line.startsWith('KAZANAN')
                        ? 'bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="text-slate-600 select-none">{i + 1}</span>
                    <span className="break-all">{line}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs font-bold text-slate-500">{t('admin.pricing.preview.trace.empty')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PricePreviewPanel
