'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { CheckCircle, ChevronRight, Clock, FileText, Hourglass, SearchX, XCircle } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { allowedAdminQuoteActions, isQuoteStatus } from '@/lib/quotes/quoteStatusMachine'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import AdminToolbar from '../../../components/admin/AdminToolbar'
import { DataTableKit } from '../../../components/admin/data-table/DataTableKit'
import { FacetedFilter } from '../../../components/admin/data-table/FacetedFilter'
import type { AdminColumn, DataTableFacet } from '../../../components/admin/data-table/types'
import { type FetchParams, type FetchResult, useAdminTable } from '../../../hooks/useAdminTable'
import { useRole } from '../../../hooks/useRole'
import { formatDate, formatTime } from '../../../i18n/datetime'
import { formatCurrency } from '../../../i18n/format'
import { useI18n } from '../../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../../lib/ensureSessionFresh'
import { type QuoteItemRow, type QuoteRow, type QuoteSource } from '../../../lib/services/quoteService'
import type { Database } from '../../../types/database.types'
import { adminTableActionPrimaryClass } from '../../../utils/adminUi'

/**
 * Admin teklif kuyruğu — T067-VH (cetvel Q7: DataTableKit + useAdminTable +
 * mutateWithAudit; yeni sayfa kendi dizininde, kit çekirdeğine dokunulmaz).
 *
 * Statü aksiyonları SSOT'tan çizilir (`allowedAdminQuoteActions`, R1); fiyatlama
 * yalnız buradan yazılır (cetvel Q3/R5 — DB tarafı kolon-grant ile ayrıca kilitli).
 */

interface QuoteAdminRow extends QuoteRow {
  items: QuoteItemRow[]
  customer_name: string | null
  customer_email: string | null
  /** ADMIN #566 dersi: e-posta GÖSTERİLEMİYOR ≠ YOK. RPC düşerse bilinmiyor deriz. */
  customerLookupFailed: boolean
}

const STATUS_VALUES = ['requested', 'quoted', 'accepted', 'rejected', 'expired'] as const
const SOURCE_VALUES = ['pdp', 'cart', 'project'] as const
const EMPTY_DASH = '—'

function isQuoteSource(value: string): value is QuoteSource {
  return (SOURCE_VALUES as readonly string[]).includes(value)
}

interface CustomerIdentity {
  name: string | null
  email: string | null
}

/**
 * Müşteri kimliği zenginleştirmesi — admin_list_all_users RPC (GRANT: PR #566).
 * GRANT henüz prod'da değilse 403 düşer; bu YOKLUK değil GÖSTEREMEME'dir —
 * satırlar customerLookupFailed=true taşır ve hücre bunu söyler.
 */
async function fetchCustomerMap(
  supabase: SupabaseClient<Database>,
  userIds: string[],
): Promise<{ map: Map<string, CustomerIdentity>; failed: boolean }> {
  const map = new Map<string, CustomerIdentity>()
  if (userIds.length === 0) return { map, failed: false }

  const { data, error } = await supabase.rpc('admin_list_all_users')
  if (!error && data) {
    for (const u of data) {
      map.set(u.id, { name: u.full_name || null, email: u.email || null })
    }
    return { map, failed: false }
  }

  // Fallback: user_profiles (e-posta içermez ama isim verebilir).
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, full_name')
    .in('id', userIds)
  if (!profileError && profiles) {
    for (const p of profiles) {
      map.set(p.id, { name: p.full_name, email: null })
    }
  }
  return { map, failed: true }
}

/* ---- fetcher: server-mode (süzme, sıralama, range) ---- */
async function quotesFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<QuoteAdminRow>> {
  await ensureSessionFresh()
  let query = supabase.from('venthub_quotes').select('*', { count: 'exact' })

  // URL'den gelen filtre değerleri string'dir; typed kolona geçmeden SSOT/enum
  // bekçisiyle daraltılır (bilinmeyen değer sessizce süzülür, sorguya sızmaz).
  const statuses = (params.filters.status ?? []).filter(isQuoteStatus)
  if (statuses.length === 1) query = query.eq('status', statuses[0])
  else if (statuses.length > 1) query = query.in('status', statuses)

  const sources = (params.filters.source ?? []).filter(isQuoteSource)
  if (sources.length === 1) query = query.eq('source', sources[0])
  else if (sources.length > 1) query = query.in('source', sources)

  // Arama: başlıkta metin yok — terim kalem adı üzerinden quote id'lerine çevrilir.
  const term = params.query.trim()
  if (term) {
    const { data: matches, error: matchError } = await supabase
      .from('venthub_quote_items')
      .select('quote_id')
      .ilike('product_name', `%${term}%`)
    if (matchError) throw matchError
    const ids = [...new Set((matches ?? []).map((m) => m.quote_id))]
    if (ids.length === 0) return { rows: [], totalMatched: 0 }
    query = query.in('id', ids)
  }

  const sortKey = params.sort?.key
  const ascending = params.sort?.dir === 'asc'
  if (sortKey === 'status') query = query.order('status', { ascending })
  else if (sortKey === 'source') query = query.order('source', { ascending })
  else if (sortKey === 'created_at') query = query.order('created_at', { ascending })
  else query = query.order('created_at', { ascending: false })

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)
  if (error) throw error

  const quotes = data ?? []
  const totalMatched = typeof count === 'number' ? count : quotes.length
  if (quotes.length === 0) return { rows: [], totalMatched }

  const { data: items, error: itemsError } = await supabase
    .from('venthub_quote_items')
    .select('*')
    .in('quote_id', quotes.map((q) => q.id))
    .order('created_at', { ascending: true })
  if (itemsError) throw itemsError

  const itemsByQuote = new Map<string, QuoteItemRow[]>()
  for (const item of items ?? []) {
    const list = itemsByQuote.get(item.quote_id) ?? []
    list.push(item)
    itemsByQuote.set(item.quote_id, list)
  }

  const { map: customers, failed } = await fetchCustomerMap(
    supabase,
    [...new Set(quotes.map((q) => q.user_id))],
  )

  const rows: QuoteAdminRow[] = quotes.map((q) => ({
    ...q,
    items: itemsByQuote.get(q.id) ?? [],
    customer_name: customers.get(q.user_id)?.name ?? null,
    customer_email: customers.get(q.user_id)?.email ?? null,
    customerLookupFailed: failed,
  }))

  return { rows, totalMatched }
}

/** Kalem fiyat taslağı — kaydedilene kadar yerel. */
interface PriceDraft {
  unit_price: string
  currency: string
  valid_until: string
}

const QuotesTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('quotes')

  const table = useAdminTable<QuoteAdminRow>({
    resource: 'quotes',
    rowId: (r) => r.id,
    fetcher: quotesFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    pageSize: 50,
    initialSort: { key: 'created_at', dir: 'desc' },
    syncUrl: true,
  })

  const [facetCounts, setFacetCounts] = useState<{ status: Record<string, number>; source: Record<string, number> }>(
    { status: {}, source: {} },
  )

  const fetchFacetCounts = useCallback(async () => {
    try {
      const { data, error } = await supabaseBrowserClient.from('venthub_quotes').select('status, source')
      if (error) throw error
      const status: Record<string, number> = {}
      const source: Record<string, number> = {}
      for (const row of data ?? []) {
        status[row.status] = (status[row.status] || 0) + 1
        source[row.source] = (source[row.source] || 0) + 1
      }
      setFacetCounts({ status, source })
    } catch (err) {
      console.warn('Failed to fetch quote facet counts:', err)
    }
  }, [])

  useEffect(() => {
    void fetchFacetCounts()
  }, [fetchFacetCounts, table.isLoading])

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, PriceDraft>>({})

  const getStatusLabel = useCallback(
    (status: string): string => t(`quotes.statusLabels.${status}`),
    [t],
  )

  const getStatusIcon = useCallback((status: string): React.ReactNode => {
    switch (status) {
      case 'requested': return <Clock className="text-admin-warning" size={16} />
      case 'quoted': return <FileText className="text-admin-accent" size={16} />
      case 'accepted': return <CheckCircle className="text-admin-success" size={16} />
      case 'rejected': return <XCircle className="text-admin-danger" size={16} />
      case 'expired': return <Hourglass className="text-admin-fg-muted" size={16} />
      default: return <FileText className="text-admin-fg-subtle" size={16} />
    }
  }, [])

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'requested': return 'bg-admin-warning-weak text-admin-warning border-admin-warning/30'
      case 'quoted': return 'bg-admin-accent-weak text-admin-accent border-admin-accent/30'
      case 'accepted': return 'bg-admin-success-weak text-admin-success border-admin-success/30'
      case 'rejected': return 'bg-admin-danger-weak text-admin-danger border-admin-danger/30'
      case 'expired': return 'bg-admin-surface-3 text-admin-fg-muted border-admin-border'
      default: return 'bg-admin-surface-3 text-admin-fg-muted border-admin-border'
    }
  }, [])

  /* ---- fiyat taslağı kaydet — TEK mutateWithAudit kapısı ---- */
  const savePrices = useCallback(
    async (row: QuoteAdminRow) => {
      if (!hasWriteAccess) {
        toast.error(t('quotes.admin.toasts.noPermission'))
        return
      }
      const updates = row.items
        .map((item) => {
          const draft = drafts[item.id]
          if (!draft) return null
          const price = draft.unit_price.trim() === '' ? null : Number(draft.unit_price)
          if (price !== null && (!Number.isFinite(price) || price < 0)) return null
          return {
            itemId: item.id,
            unit_price: price,
            currency: draft.currency.trim() === '' ? null : draft.currency.trim().toUpperCase(),
            valid_until: draft.valid_until.trim() === '' ? null : new Date(draft.valid_until).toISOString(),
          }
        })
        .filter((u): u is NonNullable<typeof u> => u !== null)

      if (updates.length === 0) return

      try {
        setUpdatingId(row.id)
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'quotes',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: row.id,
          before: { items: row.items.map((i) => ({ id: i.id, unit_price: i.unit_price })) },
          after: { items: updates },
          auditedByEdge: false,
          fn: async () => {
                  for (const u of updates) {
              const { error } = await supabaseBrowserClient
                .from('venthub_quote_items')
                .update({ unit_price: u.unit_price, currency: u.currency, valid_until: u.valid_until })
                .eq('id', u.itemId)
              if (error) throw error
            }
          },
        })
        toast.success(t('quotes.admin.toasts.pricesSaved'))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('quotes.admin.toasts.noPermission')
            : t('quotes.admin.toasts.pricesSaveFailed'),
        )
      } finally {
        setUpdatingId(null)
      }
    },
    [drafts, hasWriteAccess, t, table],
  )

  /* ---- statü geçişi — SSOT + mutateWithAudit; bildirim best-effort ---- */
  const handleStatusUpdate = useCallback(
    async (row: QuoteAdminRow, newStatus: string) => {
      if (!hasWriteAccess) {
        toast.error(t('quotes.admin.toasts.noPermission'))
        return
      }
      const allowed = allowedAdminQuoteActions(row.status)
      if (!allowed.includes(newStatus as (typeof allowed)[number])) return

      // 'quoted' göndermeden önce TÜM kalemler fiyatlı olmalı — fiyatsız teklif
      // müşteriye "boş teklif" olarak düşer (Q6'daki e-postanın da anlamı kalmaz).
      if (newStatus === 'quoted' && row.items.some((i) => typeof i.unit_price !== 'number')) {
        toast.error(t('quotes.admin.toasts.priceRequired'))
        return
      }

      const oldStatus = row.status
      try {
        setUpdatingId(row.id)
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'quotes',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: row.id,
          before: { status: oldStatus },
          after: { status: newStatus },
          auditedByEdge: false,
          fn: async () => {
                  const { error } = await supabaseBrowserClient
              .from('venthub_quotes')
              .update({ status: newStatus })
              .eq('id', row.id)
            if (error) throw error

            // Müşteri bildirimi — best-effort (cetvel Q6: e-posta hatası statüyü geri
            // almaz). E-posta bilinmiyorsa (GRANT #566 henüz yoksa) sessizce atlanır —
            // kanal yokluğu ayrıca customerLookupFailed olarak görünür durumda.
            if (row.customer_email && (newStatus === 'quoted' || newStatus === 'expired')) {
              try {
                // Registry T067 kararı: müşteri e-postası v1'de TR (locale kolonu v2).
                const message =
                  newStatus === 'quoted'
                    ? 'Teklif talebiniz fiyatlandı. Hesabınızdaki "Tekliflerim" sayfasından inceleyip karar verebilirsiniz.'
                    : 'Teklifinizin geçerlilik süresi doldu. Dilerseniz yeni bir teklif talebi oluşturabilirsiniz.'
                await supabaseBrowserClient.functions.invoke('notification-service', {
                  body: {
                    type: 'email',
                    to: row.customer_email,
                    message,
                    priority: 'medium',
                    tenant_id: row.tenant_id,
                  },
                })
              } catch {
                /* swallow — bildirim hatası statüyü geri almaz */
              }
            }
          },
        })
        toast.success(t('quotes.admin.toasts.statusUpdated', { status: getStatusLabel(newStatus) }))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('quotes.admin.toasts.noPermission')
            : t('quotes.admin.toasts.statusUpdateFailed'),
        )
      } finally {
        setUpdatingId(null)
      }
    },
    [hasWriteAccess, t, getStatusLabel, table],
  )

  /* ---- genişleyen satır: kalemler + fiyat girişi ---- */
  const renderExpanded = useCallback(
    (row: QuoteAdminRow) => {
      const editable = hasWriteAccess && row.status === 'requested'
      return (
        <div className="max-w-4xl mx-auto space-y-4 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-0.5 bg-admin-accent" />
            <h4 className="text-xs font-semibold text-admin-accent">
              {t('quotes.admin.detail.itemsTitle')}
            </h4>
          </div>
          <div className="space-y-3">
            {row.items.map((item) => {
              const draft = drafts[item.id] ?? {
                unit_price: item.unit_price != null ? String(item.unit_price) : '',
                currency: item.currency ?? 'TRY',
                valid_until: item.valid_until ? item.valid_until.slice(0, 10) : '',
              }
              return (
                <div key={item.id} className="bg-admin-surface p-4 rounded-admin-lg border border-admin-border space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-semibold text-admin-fg text-sm">{item.product_name}</div>
                      <div className="text-xs text-admin-fg-muted font-bold mt-0.5">
                        {t('quotes.admin.detail.qty')}: {item.qty}
                      </div>
                      {item.note && (
                        <div className="text-xs text-admin-fg-muted mt-1 break-words">
                          {t('quotes.admin.detail.note')}: {item.note}
                        </div>
                      )}
                    </div>
                    {!editable && (
                      <div className="text-sm font-semibold text-admin-fg">
                        {typeof item.unit_price === 'number'
                          ? formatCurrency(Number(item.unit_price), lang, { currency: item.currency ?? 'TRY' })
                          : EMPTY_DASH}
                      </div>
                    )}
                  </div>
                  {editable && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
                        {t('quotes.admin.detail.unitPrice')}
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.unit_price}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, unit_price: e.target.value } }))}
                          className="h-9 rounded-admin-md bg-admin-surface border border-admin-border px-3 text-sm font-semibold text-admin-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
                        {t('quotes.admin.detail.currency')}
                        <input
                          type="text"
                          maxLength={3}
                          value={draft.currency}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, currency: e.target.value } }))}
                          className="h-9 rounded-admin-md bg-admin-surface border border-admin-border px-3 text-sm font-semibold text-admin-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
                        {t('quotes.admin.detail.validUntil')}
                        <input
                          type="date"
                          value={draft.valid_until}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, valid_until: e.target.value } }))}
                          className="h-9 rounded-admin-md bg-admin-surface border border-admin-border px-3 text-sm font-semibold text-admin-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {editable && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void savePrices(row)}
                disabled={updatingId === row.id}
                className={`${adminTableActionPrimaryClass} !px-4 disabled:opacity-50`}
              >
                {t('quotes.admin.detail.savePrices')}
              </button>
            </div>
          )}
        </div>
      )
    },
    [drafts, hasWriteAccess, lang, savePrices, t, updatingId],
  )

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<QuoteAdminRow>[]>(
    () => [
      {
        key: 'customer',
        header: t('quotes.admin.table.customer'),
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-admin-fg tracking-tight">
              {r.customer_name ?? `#${r.user_id.slice(-8).toUpperCase()}`}
            </span>
            <span
              className="text-xs text-admin-fg-muted font-bold"
              title={r.customerLookupFailed ? t('quotes.admin.emailUnavailable') : undefined}
            >
              {r.customer_email ?? (r.customerLookupFailed ? t('quotes.admin.emailUnavailable') : EMPTY_DASH)}
            </span>
          </div>
        ),
      },
      {
        key: 'items',
        header: t('quotes.admin.table.items'),
        hideable: true,
        cell: (r) => (
          <div className="max-w-xs">
            <div className="font-semibold text-xs text-admin-fg truncate">
              {r.items[0]?.product_name ?? EMPTY_DASH}
              {r.items.length > 1 && <span className="text-admin-fg-muted"> +{r.items.length - 1}</span>}
            </div>
            <div className="text-xs text-admin-fg-muted mt-0.5">
              {t('quotes.itemsCount', { count: r.items.length })}
            </div>
          </div>
        ),
      },
      {
        key: 'source',
        header: t('quotes.admin.table.source'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <span className="text-xs font-semibold text-admin-fg-muted">
            {t(`quotes.sourceLabels.${r.source}`)}
          </span>
        ),
      },
      {
        key: 'status',
        header: t('quotes.admin.table.status'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(r.status)}`}
          >
            {getStatusIcon(r.status)}
            {getStatusLabel(r.status)}
          </div>
        ),
      },
      {
        key: 'created_at',
        header: t('quotes.admin.table.date'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-admin-fg text-xs">{formatDate(r.created_at, lang)}</span>
            <span className="text-xs text-admin-fg-muted">{formatTime(r.created_at, lang)}</span>
          </div>
        ),
      },
      {
        key: 'actions',
        header: t('quotes.admin.table.actions'),
        cell: (r) => {
          const next = allowedAdminQuoteActions(r.status)
          if (!hasWriteAccess || next.length === 0) {
            return <span className="text-xs text-admin-fg-muted">{EMPTY_DASH}</span>
          }
          return (
            <div className="flex gap-1.5">
              {next.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => void handleStatusUpdate(r, status)}
                  disabled={updatingId === r.id}
                  className={`${adminTableActionPrimaryClass} !px-3 !h-7 disabled:opacity-50 gap-1`}
                  title={t('quotes.admin.actions.markAs', { status: getStatusLabel(status) })}
                  aria-label={t('quotes.admin.actions.markAs', { status: getStatusLabel(status) })}
                >
                  {updatingId === r.id ? (
                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-xs font-semibold">{getStatusLabel(status)}</span>
                      <ChevronRight size={10} strokeWidth={3} />
                    </>
                  )}
                </button>
              ))}
            </div>
          )
        },
      },
    ],
    [t, lang, hasWriteAccess, updatingId, handleStatusUpdate, getStatusLabel, getStatusColor, getStatusIcon],
  )

  const facets = useMemo<DataTableFacet[]>(
    () => [
      {
        key: 'status',
        label: t('quotes.admin.table.status'),
        options: STATUS_VALUES.map((value) => ({
          value,
          label: getStatusLabel(value),
          count: facetCounts.status[value] ?? 0,
        })),
      },
      {
        key: 'source',
        label: t('quotes.admin.table.source'),
        options: SOURCE_VALUES.map((value) => ({
          value,
          label: t(`quotes.sourceLabels.${value}`),
          count: facetCounts.source[value] ?? 0,
        })),
      },
    ],
    [facetCounts, t, getStatusLabel],
  )

  return (
    <div className="space-y-6">
      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="quotes"
        hasWriteAccess={hasWriteAccess}
        emptyState={
          <AdminEmptyState
            icon={FileText}
            title={t('quotes.admin.emptyTitle')}
            description={t('quotes.admin.emptyDescription')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('quotes.admin.emptyTitle')}
            description={t('quotes.admin.filterEmptyDescription')}
          />
        }
        columnsButtonLabel={t('quotes.admin.columnsButton')}
        expandLabel={t('admin.ui.details')}
        renderExpandedRow={renderExpanded}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:quotes"
            search={{
              value: table.filtering.query,
              onChange: table.filtering.setQuery,
              placeholder: t('quotes.admin.searchPlaceholder'),
              focusShortcut: '/',
            }}
            recordCount={table.totalMatched}
            onClear={table.filtering.clearAll}
            rightExtra={
              <div className="flex flex-wrap items-center justify-end gap-2">
                {facets.map((facet) => (
                  <FacetedFilter
                    key={facet.key}
                    facet={facet}
                    selected={table.filtering.filters[facet.key] ?? []}
                    onChange={(values) => table.filtering.setFilter(facet.key, values)}
                    clearLabel={t('admin.dataTable.filter.clearAll')}
                  />
                ))}
              </div>
            }
          />
        }
      />
    </div>
  )
}

export default QuotesTableBody
