'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { PackageSearch, Pencil, Plus, SearchX } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import VentImage from '@/components/ui/VentImage'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { adminSearchProducts } from '@/lib/services/product.service'
import { supabaseBrowserClient } from '@/lib/supabase/client'
import type { DbAdminSearchResult } from '@/types/db-rows'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import BulkActionToolbar from '../../components/admin/BulkActionToolbar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import ExportMenu from '../../components/admin/ExportMenu'
import ProductCsvImport from '../../components/admin/products/ProductCsvImport'
import ProductFormModal from '../../components/admin/products/ProductFormModal'
import ProductHealthBadge from '../../components/admin/products/ProductHealthBadge'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { type DomainProduct, toUIProductList } from '../../lib/type-converters'
import type { Database } from '../../types/database.types'
import type { DbProduct } from '../../types/db-rows'
import {
  adminButtonPrimaryClass,
  adminTableActionClass,
  adminTableActionDangerClass,
} from '../../utils/adminUi'

/* ---- model ---- */
// W4b: `price` domain tipinden çıkarıldı (satış fiyatı artık motorun işi). Admin ham
// kolonu görmeye devam edebilir — bu yüzden burada AÇIKÇA geri ekleniyor; müşteri
// yüzeyinde aynı şeyi yapmak INV-PRICE-1 ihlalidir.
type ProductRow = DomainProduct & { cover_path?: string; price?: number | null }

interface CategoryOpt {
  id: string
  name: string
}

const PRODUCT_SELECT =
  'id,name,sku,model_code,brand,status,category_id,price,purchase_price,stock_qty,low_stock_threshold,is_featured,slug'

const STATUS_KEYS = ['active', 'inactive', 'out_of_stock'] as const

/* anahtar → server-side sıralanabilir kolon (category server-side ad-sıralaması YOK → name fallback) */
const SORT_COLUMN_MAP: Record<string, string> = {
  name: 'name',
  sku: 'sku',
  status: 'status',
  price: 'price',
  stock: 'stock_qty',
}

/* ---- kapak görselleri: rows için product_images ilk path (20'lik chunk, non-fatal) ---- */
async function attachCovers(
  supabase: SupabaseClient<Database>,
  rows: ProductRow[],
): Promise<ProductRow[]> {
  const ids = rows.map((r) => r.id)
  if (ids.length === 0) return rows
  try {
    const chunkSize = 20
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += chunkSize) chunks.push(ids.slice(i, i + chunkSize))
    const results = await Promise.all(
      chunks.map((c) =>
        supabase
          .from('product_images')
          .select('product_id,path,sort_order')
          .in('product_id', c)
          .order('sort_order', { ascending: true }),
      ),
    )
    const map: Record<string, string> = {}
    results.forEach(({ data }) => {
      if (data) {
        ;(data as { product_id: string; path: string; sort_order: number }[]).forEach((r) => {
          if (map[r.product_id] == null) map[r.product_id] = r.path
        })
      }
    })
    return rows.map((r) => ({ ...r, cover_path: map[r.id] }))
  } catch (err) {
    console.warn('Cover image fetch failed (non-fatal):', err)
    return rows
  }
}

/* ---- fetcher: HİBRİT (arama → FTS RPC; aksi → normal query), DI ilk param supabase ---- */
async function productsFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<ProductRow>> {
  await ensureSessionFresh()

  const category = params.filters.category?.[0]
  const featured = params.filters.featured?.[0] === '1'
  const statuses = params.filters.status ?? []

  const term = params.query.trim()

  if (term) {
    /* ── FTS yolu (arama terimi varsa) ── */
    const offset = (params.page - 1) * params.pageSize
    const results = await adminSearchProducts(supabase, term, params.pageSize, offset, category || undefined)

    let filtered: DbAdminSearchResult[] = results
    if (statuses.length > 0) filtered = filtered.filter((r) => statuses.includes(r.status || ''))
    if (featured) filtered = filtered.filter((r) => r.is_featured)

    const rows = toUIProductList(filtered as DbProduct[]) as ProductRow[]
    // NOT: client-süzmeyle bu sayı yaklaşık olur — eski davranış, KORUNUR.
    const totalMatched =
      results.length > 0 ? Number(results[0].total_count || results.length) : 0
    const withCovers = await attachCovers(supabase, rows)
    return { rows: withCovers, totalMatched }
  }

  /* ── normal query yolu (arama terimi yoksa) ── */
  let query = supabase.from('products').select(PRODUCT_SELECT, { count: 'exact' })

  if (category) query = query.eq('category_id', category)
  if (featured) query = query.eq('is_featured', true)
  if (statuses.length === 1) query = query.eq('status', statuses[0])
  else if (statuses.length > 1) query = query.in('status', statuses)

  const sortKey = params.sort?.key
  const col = sortKey ? SORT_COLUMN_MAP[sortKey] : undefined
  const ascending = params.sort?.dir === 'asc'
  if (col) query = query.order(col, { ascending })
  else query = query.order('name', { ascending: true })

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)
  if (error) throw error

  const rows = toUIProductList((data as DbProduct[]) || []) as ProductRow[]
  const totalMatched = typeof count === 'number' ? count : 0
  const withCovers = await attachCovers(supabase, rows)
  return { rows: withCovers, totalMatched }
}

/* ---- lazy genişleyen satır: kit yalnız açıkken mount eder → mount'ta technical_specs yükle ---- */
interface ProductSpecsRowProps {
  productId: string
}

const ProductSpecsRow: React.FC<ProductSpecsRowProps> = ({ productId }) => {
  const { t } = useI18n()
  const [specs, setSpecs] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    let active = true
    void (async () => {
      const { data } = await supabaseBrowserClient
        .from('products')
        .select('technical_specs')
        .eq('id', productId)
        .maybeSingle()
      if (!active) return
      if (data?.technical_specs && typeof data.technical_specs === 'object') {
        setSpecs(data.technical_specs as Record<string, unknown>)
      } else {
        setSpecs({})
      }
    })()
    return () => {
      active = false
    }
  }, [productId])

  const entries = specs ? Object.entries(specs) : []

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-0.5 bg-cyan-400" />
        <h4 className="text-xs font-black text-cyan-400 uppercase tracking-hvac-relaxed">
          {t('admin.products.expand.title')}
        </h4>
      </div>
      {entries.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {entries.map(([key, val]) => (
            <div
              key={key}
              className="glass p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group/spec"
            >
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/spec:text-cyan-400/70 transition-colors">
                {key}
              </div>
              <div className="text-xs font-black text-slate-200 uppercase">{String(val)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-8 rounded-2xl border border-white/5 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {t('admin.products.expand.empty')}
          </p>
        </div>
      )}
    </div>
  )
}

/* ---- KAPILI inline-edit hücresi (price/stock); kaydet→saveInlineEdit (mutateWithAudit) ---- */
interface InlineNumberCellProps {
  value: string
  display: React.ReactNode
  widthClass: string
  low?: boolean
  ariaLabel?: string
  onSave: (num: number) => Promise<void>
}

const InlineNumberCell: React.FC<InlineNumberCellProps> = ({ value, display, widthClass, low, ariaLabel, onSave }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = useCallback(async () => {
    const num = parseFloat(draft)
    setEditing(false)
    if (Number.isNaN(num) || String(num) === value) return
    try {
      await onSave(num)
    } catch {
      // hata onSave içinde toast'lanır; geri al
      setDraft(value)
    }
  }, [draft, value, onSave])

  if (editing) {
    return (
      <div className="relative inline-block animate-in fade-in zoom-in duration-300">
        <input
          ref={inputRef}
          type="number"
          value={draft}
          aria-label={ariaLabel}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void commit()
            if (e.key === 'Escape') {
              setDraft(value)
              setEditing(false)
            }
          }}
          className={`${widthClass} text-right bg-surface-deep border-2 border-cyan-400/50 rounded-xl px-2 py-1 text-sm text-cyan-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/10 font-black`}
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`group/btn relative px-3 py-1.5 rounded-xl border transition-colors duration-300 flex flex-col items-end gap-0.5 ml-auto ${
        low
          ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20'
          : 'bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/10'
      }`}
    >
      <span className={`text-sm font-black ${low ? 'text-rose-400' : 'text-slate-100'} group-hover/btn:text-cyan-400 transition-colors`}>
        {display}
      </span>
      <Pencil size={8} className="text-slate-600 group-hover/btn:text-cyan-400 transition-colors" />
    </button>
  )
}

const ProductsTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('products')

  const table = useAdminTable<ProductRow>({
    resource: 'products',
    rowId: (r) => r.id,
    fetcher: productsFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    pageSize: 50,
    initialSort: { key: 'name', dir: 'asc' },
    syncUrl: true,
  })

  const { setFilter, setQuery } = table.filtering
  const filters = table.filtering.filters
  const categoryVal = filters.category?.[0] ?? ''
  const featuredOn = filters.featured?.[0] === '1'
  const activeStatuses = useMemo(() => filters.status ?? [], [filters.status])

  /* ---- kategoriler (filtre select + ad gösterimi) — tek-seferlik fetch ---- */
  const [cats, setCats] = useState<CategoryOpt[]>([])
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { data, error } = await supabaseBrowserClient
        .from('categories')
        .select('id,name')
        .order('name', { ascending: true })
      if (!cancelled && !error && data) setCats(data as CategoryOpt[])
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const catsMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of cats) map.set(c.id, c.name)
    return map
  }, [cats])

  /* ---- modal state (create + edit, body'de) ---- */
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const openCreate = useCallback(() => {
    setEditingId(null)
    setIsModalOpen(true)
  }, [])
  const openEdit = useCallback((id: string) => {
    setEditingId(id)
    setIsModalOpen(true)
  }, [])

  /* ---- (a) tekil silme — DELETE, mutateWithAudit kapısından ---- */
  const removeSingle = useCallback(
    async (r: ProductRow) => {
      if (!window.confirm(t('admin.products.confirm.deleteProduct'))) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'products',
          canWrite: hasWriteAccess,
          action: 'DELETE',
          rowPk: r.id,
          before: { ...r },
          after: null,
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('products').delete().eq('id', r.id)
            if (error) throw error
          },
        })
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.products.toasts.noPermission')
            : t('admin.products.toasts.deleteFailed', { msg: (e as Error).message || String(e) }),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- (b) toplu durum — UPDATE, mutateWithAudit kapısından ---- */
  const bulkStatusChange = useCallback(
    async (status: string) => {
      const ids = table.selection.selectedIds
      if (ids.length === 0) return
      if (!window.confirm(t('admin.products.bulk.statusConfirm', { count: String(ids.length), status }))) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'products',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: null,
          before: null,
          after: { status, ids },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('products').update({ status }).in('id', ids)
            if (error) throw error
          },
        })
        table.selection.clear()
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.products.toasts.noPermission')
            : t('admin.products.bulk.statusFailed'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- (c) toplu vitrin — UPDATE, mutateWithAudit kapısından (audit boşluğu kapandı) ---- */
  const bulkFeatureToggle = useCallback(
    async (featured: boolean) => {
      const ids = table.selection.selectedIds
      if (ids.length === 0) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'products',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: null,
          before: null,
          after: { is_featured: featured, ids },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient
              .from('products')
              .update({ is_featured: featured })
              .in('id', ids)
            if (error) throw error
          },
        })
        table.selection.clear()
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.products.toasts.noPermission')
            : t('admin.products.bulk.featureFailed'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- (d) toplu silme — DELETE, mutateWithAudit kapısından ---- */
  const bulkDelete = useCallback(async () => {
    const ids = table.selection.selectedIds
    if (ids.length === 0) return
    if (!window.confirm(t('admin.products.bulk.deleteConfirm', { count: String(ids.length) }))) return
    try {
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'products',
        canWrite: hasWriteAccess,
        action: 'DELETE',
        rowPk: null,
        before: { ids },
        after: null,
        auditedByEdge: false,
        fn: async () => {
          const { error } = await supabaseBrowserClient.from('products').delete().in('id', ids)
          if (error) throw error
        },
      })
      table.selection.clear()
      await table.reload()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.products.toasts.noPermission')
          : t('admin.products.bulk.deleteFailed'),
      )
    }
  }, [hasWriteAccess, t, table])

  /* ---- (e) toplu fiyat — UPDATE, mutateWithAudit kapısından (audit boşluğu kapandı) ---- */
  const bulkPriceAdjust = useCallback(
    async (mode: 'percent' | 'fixed', value: number) => {
      const ids = table.selection.selectedIds
      if (ids.length === 0) return
      if (!window.confirm(t('admin.products.bulk.priceConfirm', { count: String(ids.length) }))) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'products',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: null,
          before: null,
          after: { mode, value, ids },
          auditedByEdge: false,
          fn: async () => {
            const { data: products, error: fetchErr } = await supabaseBrowserClient
              .from('products')
              .select('id,price')
              .in('id', ids)
            if (fetchErr) throw fetchErr
            const updates = (products || []).map((p: { id: string; price: number | null }) => {
              const currentPrice = p.price ?? 0
              const newPrice =
                mode === 'percent'
                  ? Math.round(currentPrice * (1 + value / 100) * 100) / 100
                  : Math.round((currentPrice + value) * 100) / 100
              return { id: p.id, price: Math.max(0, newPrice) }
            })
            const results = await Promise.all(
              updates.map((u) =>
                supabaseBrowserClient.from('products').update({ price: u.price }).eq('id', u.id),
              ),
            )
            const errorResult = results.find((r) => r.error)
            if (errorResult?.error) throw errorResult.error
          },
        })
        table.selection.clear()
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.products.toasts.noPermission')
            : t('admin.products.bulk.priceFailed'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- (f) inline-edit kaydet — UPDATE, mutateWithAudit kapısından (audit boşluğu kapandı) ---- */
  const saveInlineEdit = useCallback(
    async (r: ProductRow, field: 'price' | 'stock_qty', raw: string | number) => {
      const num = typeof raw === 'number' ? raw : parseFloat(String(raw))
      if (Number.isNaN(num)) return
      const prev = field === 'price' ? r.price : r.stock_qty
      if (prev === num) return
      const payload = field === 'price' ? { price: num } : { stock_qty: num }
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'products',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: r.id,
          before: { [field]: prev },
          after: { [field]: num },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('products').update(payload).eq('id', r.id)
            if (error) throw error
          },
        })
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.products.toasts.noPermission')
            : t('admin.products.toasts.saveFailed', { msg: (e as Error).message || String(e) }),
        )
        throw e instanceof Error ? e : new Error('inline_edit_failed')
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- durum rozeti (i18n) ---- */
  const statusBadge = useCallback(
    (s?: string | null) => {
      const v = (s || '').toLowerCase()
      const baseClass = 'px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg border'
      if (v === 'active')
        return (
          <span className={`${baseClass} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
            {t('admin.products.statusLabels.active')}
          </span>
        )
      if (v === 'inactive')
        return (
          <span className={`${baseClass} bg-slate-500/10 text-slate-400 border-white/5`}>
            {t('admin.products.statusLabels.inactive')}
          </span>
        )
      if (v === 'out_of_stock')
        return (
          <span className={`${baseClass} bg-rose-500/10 text-rose-400 border-rose-500/20`}>
            {t('admin.products.statusLabels.out_of_stock')}
          </span>
        )
      return <span className={`${baseClass} bg-slate-500/10 text-slate-500 border-white/5`}>-</span>
    },
    [t],
  )

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<ProductRow>[]>(
    () => [
      {
        key: 'image',
        header: t('admin.products.table.image'),
        hideable: true,
        sortable: false,
        cell: (r) => (
          <div className="relative w-12 h-12 rounded-xl border border-white/5 overflow-hidden glass group-hover:border-white/10 transition-colors duration-500">
            {r.cover_path ? (
              <VentImage
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${r.cover_path}`}
                alt=""
                fallbackType="product"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-700 uppercase font-black text-xs">
                {t('admin.products.noImage')}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'name',
        header: t('admin.products.table.name'),
        sortable: true,
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-cyan-400 transition-colors">
              {r.name}
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">
              {r.brand || t('admin.products.brandless')}
            </span>
          </div>
        ),
      },
      {
        key: 'sku',
        header: t('admin.products.table.sku'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <code className="text-xs font-mono font-black text-cyan-400/70 bg-cyan-400/10 px-2 py-0.5 rounded-md w-max">
              {r.sku}
            </code>
            {r.model_code && (
              <span className="text-xs text-slate-500 font-black uppercase tracking-tighter">{r.model_code}</span>
            )}
          </div>
        ),
      },
      {
        key: 'category',
        header: t('admin.products.table.category'),
        sortable: false,
        hideable: true,
        cell: (r) => (
          <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">
            {r.category_id ? catsMap.get(r.category_id) || '-' : '-'}
          </span>
        ),
      },
      {
        key: 'status',
        header: t('admin.products.table.status'),
        sortable: true,
        hideable: true,
        cell: (r) => <div className="flex items-center">{statusBadge(r.status)}</div>,
      },
      {
        key: 'health',
        header: t('admin.products.table.health'),
        sortable: false,
        hideable: true,
        align: 'center',
        cell: (r) => (
          <div className="flex justify-center">
            <ProductHealthBadge
              stockQty={r.stock_qty || 0}
              threshold={r.low_stock_threshold || 10}
              status={r.status || 'inactive'}
              isFeatured={!!r.is_featured}
            />
          </div>
        ),
      },
      {
        key: 'price',
        header: t('admin.products.table.price'),
        sortable: true,
        hideable: true,
        align: 'right',
        cell: (r) =>
          hasWriteAccess ? (
            <InlineNumberCell
              value={r.price != null ? String(r.price) : ''}
              display={r.price != null ? formatCurrency(Number(r.price), lang) : '-'}
              widthClass="w-24"
              ariaLabel={t('admin.products.table.price')}
              onSave={(num) => saveInlineEdit(r, 'price', num)}
            />
          ) : (
            <span className="text-sm font-black text-slate-100">
              {r.price != null ? formatCurrency(Number(r.price), lang) : '-'}
            </span>
          ),
      },
      {
        key: 'stock',
        header: t('admin.products.table.stock'),
        sortable: true,
        hideable: true,
        align: 'right',
        cell: (r) => {
          const low = Number(r.stock_qty) < (r.low_stock_threshold || 10)
          return hasWriteAccess ? (
            <InlineNumberCell
              value={r.stock_qty != null ? String(r.stock_qty) : ''}
              display={(r.stock_qty != null ? Number(r.stock_qty) : null) ?? '-'}
              widthClass="w-20"
              low={low}
              ariaLabel={t('admin.products.table.stock')}
              onSave={(num) => saveInlineEdit(r, 'stock_qty', num)}
            />
          ) : (
            <span className={`text-sm font-black ${low ? 'text-rose-400' : 'text-slate-100'}`}>
              {(r.stock_qty != null ? Number(r.stock_qty) : null) ?? '-'}
            </span>
          )
        },
      },
      {
        key: 'actions',
        header: t('admin.products.table.actions'),
        sortable: false,
        align: 'center',
        cell: (r) =>
          hasWriteAccess ? (
            <div className="flex items-center justify-center gap-2">
              <button type="button" onClick={() => openEdit(r.id)} className={adminTableActionClass}>
                {t('admin.ui.edit')}
              </button>
              <button type="button" onClick={() => void removeSingle(r)} className={adminTableActionDangerClass}>
                {t('admin.ui.delete')}
              </button>
            </div>
          ) : null,
      },
    ],
    [t, lang, hasWriteAccess, catsMap, statusBadge, openEdit, removeSingle, saveInlineEdit],
  )

  /* ---- status chip'leri (kit filters.status Record üzerinden) ---- */
  const statusChips = useMemo(
    () =>
      STATUS_KEYS.map((s) => ({
        key: s,
        label: t(`admin.products.statusLabels.${s}`),
        active: activeStatuses.includes(s),
        onToggle: () => {
          const next = activeStatuses.includes(s)
            ? activeStatuses.filter((x) => x !== s)
            : [...activeStatuses, s]
          setFilter('status', next)
        },
      })),
    [t, activeStatuses, setFilter],
  )

  const categoryOptions = useMemo(
    () => [
      { value: '', label: t('admin.products.toolbar.allCategories') },
      ...cats.map((c) => ({ value: c.id, label: c.name.toUpperCase() })),
    ],
    [cats, t],
  )

  const resetFilters = useCallback(() => {
    setQuery('')
    setFilter('category', [])
    setFilter('status', [])
    setFilter('featured', [])
  }, [setQuery, setFilter])

  /* ---- export (CSV, tüm filtreli sonuç fetchAllForExport) ---- */
  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const cols = ['id', 'name', 'sku', 'category_id', 'status', 'price', 'stock_qty']
    const header = cols.join(',')
    const lines = rows.map((r) =>
      [
        r.id,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        r.sku,
        r.category_id || '',
        r.status || '',
        r.price != null ? String(r.price) : '',
        r.stock_qty != null ? String(r.stock_qty) : '',
      ].join(','),
    )
    const csv = '﻿' + [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [table])

  return (
    <div className="space-y-6">
      {hasWriteAccess && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className={`${adminButtonPrimaryClass} flex items-center gap-2 group`}
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>{t('admin.products.edit.new')}</span>
          </button>
        </div>
      )}

      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="products"
        hasWriteAccess={hasWriteAccess}
        totalLabel={t('admin.ui.total')}
        emptyState={
          <AdminEmptyState
            icon={PackageSearch}
            title={t('admin.products.emptyTitle')}
            description={t('admin.products.emptyDescription')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('admin.products.emptyTitle')}
            description={t('admin.products.filterEmptyDescription')}
          />
        }
        columnsButtonLabel={t('admin.common.view')}
        expandLabel={t('admin.ui.details')}
        renderExpandedRow={(r) => <ProductSpecsRow productId={r.id} />}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:products"
            sticky
            search={{
              value: table.filtering.query,
              onChange: setQuery,
              placeholder: t('admin.search.products'),
              focusShortcut: '/',
            }}
            select={{
              value: categoryVal,
              onChange: (v) => setFilter('category', v ? [v] : []),
              title: t('admin.products.toolbar.categoryTitle'),
              options: categoryOptions,
            }}
            chips={statusChips}
            toggles={[
              {
                key: 'featured',
                label: t('admin.products.toggles.featuredOnly'),
                checked: featuredOn,
                onChange: (v) => setFilter('featured', v ? ['1'] : []),
              },
            ]}
            onClear={resetFilters}
            recordCount={table.totalMatched}
            rightExtra={
              <div className="flex flex-wrap items-center justify-end gap-2">
                {hasWriteAccess && <ProductCsvImport categories={cats} onSuccess={() => void table.reload()} />}
                <ExportMenu
                  items={[
                    { key: 'csv', label: t('admin.products.export.csvLabel'), onSelect: () => void exportCsv() },
                  ]}
                />
              </div>
            }
          />
        }
        bulkBarSlot={
          hasWriteAccess ? (
            <BulkActionToolbar
              selectedCount={table.selection.selectedIds.length}
              onStatusChange={(status) => void bulkStatusChange(status)}
              onFeatureToggle={(featured) => void bulkFeatureToggle(featured)}
              onDelete={() => void bulkDelete()}
              onPriceAdjust={(mode, value) => void bulkPriceAdjust(mode, value)}
              onClearSelection={table.selection.clear}
            />
          ) : null
        }
      />

      <ProductFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        _productId={editingId}
        onSuccess={() => void table.reload()}
      />
    </div>
  )
}

export default ProductsTableBody
