'use client'

import { Heart, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import VentImage from '@/components/ui/VentImage'
import { useI18n } from '@/i18n/I18nProvider'
import { resolveProductImageUrl } from '@/lib/images/productImage'
import { VARIANT_LIST_COLUMNS } from '@/lib/services/product.columns'
import { supabaseBrowserClient } from '@/lib/supabase/client'
import { mapDatabaseProductToDomain } from '@/lib/type-converters'
import type { DbProduct } from '@/types/db-rows'
import type { Product } from '@/types/ui-models'

import { useFavorites } from '../../hooks/useFavorites'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'

/**
 * Favoriler v1 — kimlikler localStorage'da (useFavorites), ürün detayları DB'den
 * VARIANT_LIST_COLUMNS ile çekilir (kolon SSOT; PS-041 gereği liste bağlamında
 * technical_specs taşınmaz). Fiyat BİLEREK yok: fiyat yüzeyi eklemek
 * rendering-cache-standard'ın fiyat-yüzeyi kurallarına tabidir (INV-PRICE),
 * v1 kapsam dışı bırakıldı.
 */
export default function FavoritesPage() {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()
  const { favorites, removeFavorite } = useFavorites()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (favorites.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const { data, error } = await supabaseBrowserClient
          .from('products')
          .select(VARIANT_LIST_COLUMNS)
          .in('id', favorites)
        if (error) throw error
        if (cancelled) return
        const rows = (data as DbProduct[] | null) ?? []
        const mapped = rows.map(mapDatabaseProductToDomain)
        // localStorage sırasını koru (son eklenen sonda)
        const order = new Map(favorites.map((id, i) => [id, i]))
        mapped.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
        setProducts(mapped)
      } catch (e) {
        console.error('Favorites load error:', e)
        toast.error(t('account.favorites.loadError'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [favorites, t])

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary-navy" />
          {t('account.favorites.title')}
        </h2>
        <p className="text-sm text-slate-500 mt-1">{t('account.favorites.subtitle')}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-10 text-center">
          <div className="bg-slate-100 text-slate-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <Heart size={26} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{t('account.favorites.emptyTitle')}</h3>
          <p className="text-sm text-slate-500 mb-6">{t('account.favorites.emptyDesc')}</p>
          <Link
            href={Routes.products()}
            className="inline-block bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-2.5 px-6 rounded-xl transition-colors"
          >
            {t('account.favorites.browseCta')}
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map(p => (
            <li key={p.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4 flex items-center gap-4 group hover:shadow-md transition-shadow">
              <Link href={Routes.product(p.slug || '', p.sku)} className="shrink-0">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                  <VentImage
                    src={resolveProductImageUrl(p)}
                    alt={p.name}
                    width={64}
                    height={64}
                    className="object-contain w-full h-full"
                  />
                </div>
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={Routes.product(p.slug || '', p.sku)} className="block">
                  <div className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-navy transition-colors">{p.name}</div>
                </Link>
                {p.brand && <div className="text-xs text-slate-500 mt-0.5 truncate">{p.brand}</div>}
                {p.sku && <div className="text-xs text-slate-400 mt-0.5 truncate">{p.sku}</div>}
              </div>
              <button
                onClick={() => removeFavorite(p.id)}
                aria-label={t('account.favorites.remove')}
                title={t('account.favorites.remove')}
                className="shrink-0 w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 flex items-center justify-center transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
