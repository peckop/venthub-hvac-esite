'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { CheckCircle, ChevronRight, ClipboardList, FileText, PackageCheck, SearchX, XCircle } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useI18n } from '@/i18n/I18nProvider'
import { allowedNextPoStatuses, isManualPoTransitionAllowed } from '@/lib/purchasing/poStatusMachine'
import {
  type GoodsReceiptRow,
  listGoodsReceipts,
  processGoodsReceipt,
  type PurchaseOrderItemRow,
  type PurchaseOrderRow,
  setPurchaseOrderStatus,
} from '@/lib/services/purchasing.service'
import { supabaseBrowserClient } from '@/lib/supabase/client'
import { adminTableActionPrimaryClass } from '@/utils/adminUi'

import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import AdminToolbar from '../../../components/admin/AdminToolbar'
import { DataTableKit } from '../../../components/admin/data-table/DataTableKit'
import { FacetedFilter } from '../../../components/admin/data-table/FacetedFilter'
import type { AdminColumn, DataTableFacet } from '../../../components/admin/data-table/types'
import CreatePurchaseOrderPanel from '../../../components/admin/purchasing/CreatePurchaseOrderPanel'
import { type FetchParams, type FetchResult, useAdminTable } from '../../../hooks/useAdminTable'
import { useRole } from '../../../hooks/useRole'
import { formatDate } from '../../../i18n/datetime'
import { ensureSessionFresh } from '../../../lib/ensureSessionFresh'
import type { Database } from '../../../types/database.types'

/**
 * PO listesi — T062 D4 (cetvel §8: DataTableKit + useAdminTable; statü butonları
 * SSOT'tan ÜRETİLİR, elle liste yasak). Mutasyonlar purchasing.service üzerinden:
 * geçişler makine kapısından, mal kabul RPC'den geçer (INV-PURCH-1 R2), audit
 * kaydı servisin içindedir.
 */

const STATUS_VALUES = ['draft', 'ordered', 'partially_received', 'received', 'closed', 'cancelled'] as const
const EMPTY_DASH = '—'

interface PoAdminRow extends PurchaseOrderRow {
  supplier_name: string
  items: (PurchaseOrderItemRow & { product_name: string; product_sku: string })[]
}

async function purchasingFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<PoAdminRow>> {
  await ensureSessionFresh()

  let query = supabase
    .from('purchase_orders')
    .select('*, suppliers(name), purchase_order_items(*)', { count: 'exact' })

  const statuses = (params.filters.status ?? []).filter((s): s is (typeof STATUS_VALUES)[number] =>
    (STATUS_VALUES as readonly string[]).includes(s),
  )
  if (statuses.length === 1) query = query.eq('status', statuses[0])
  else if (statuses.length > 1) query = query.in('status', statuses)

  const term = params.query.trim()
  if (term) {
    const { data: supplierMatches, error: supplierError } = await supabase
      .from('suppliers')
      .select('id')
      .ilike('name', `%${term}%`)
    if (supplierError) throw supplierError
    const ids = (supplierMatches ?? []).map((s) => s.id)
    if (ids.length === 0) return { rows: [], totalMatched: 0 }
    query = query.in('supplier_id', ids)
  }

  const ascending = params.sort?.dir === 'asc'
  if (params.sort?.key === 'status') query = query.order('status', { ascending })
  else if (params.sort?.key === 'created_at') query = query.order('created_at', { ascending })
  else query = query.order('created_at', { ascending: false })

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)
  if (error) throw error

  const orders = data ?? []
  const totalMatched = typeof count === 'number' ? count : orders.length
  if (orders.length === 0) return { rows: [], totalMatched }

  const productIds = [...new Set(orders.flatMap((o) => o.purchase_order_items.map((i) => i.product_id)))]
  // R3: yalnız kimlik alanları — katalog fiyat alanları bu modülde OKUNMAZ bile.
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id, name, sku')
    .in('id', productIds)
  if (productError) throw productError
  const productMap = new Map((products ?? []).map((p) => [p.id, p]))

  const rows: PoAdminRow[] = orders.map((o) => ({
    ...o,
    supplier_name: o.suppliers?.name ?? EMPTY_DASH,
    items: o.purchase_order_items.map((i) => ({
      ...i,
      product_name: productMap.get(i.product_id)?.name ?? i.product_id,
      product_sku: productMap.get(i.product_id)?.sku ?? EMPTY_DASH,
    })),
  }))

  return { rows, totalMatched }
}

/** Kabul formu taslağı — satır başına miktar + isteğe bağlı fatura maliyeti. */
interface ReceiptDraft {
  documentNo: string
  note: string
  qty: Record<string, string>
  unitCost: Record<string, string>
}

const emptyReceiptDraft: ReceiptDraft = { documentNo: '', note: '', qty: {}, unitCost: {} }

const inputClass =
  'h-9 rounded-admin-md bg-admin-surface border border-admin-border px-3 text-sm font-semibold text-admin-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40'

const PurchasingTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('purchasing')

  const table = useAdminTable<PoAdminRow>({
    resource: 'purchasing',
    rowId: (r) => r.id,
    fetcher: purchasingFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    pageSize: 50,
    initialSort: { key: 'created_at', dir: 'desc' },
    syncUrl: true,
  })

  const [showCreate, setShowCreate] = useState(false)
  const [facetCounts, setFacetCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    void (async () => {
      try {
        const { data, error } = await supabaseBrowserClient.from('purchase_orders').select('status')
        if (error) throw error
        const counts: Record<string, number> = {}
        for (const row of data ?? []) counts[row.status] = (counts[row.status] || 0) + 1
        setFacetCounts(counts)
      } catch (err) {
        console.warn('po facet counts failed', err)
      }
    })()
  }, [table.isLoading])

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [closeNoteFor, setCloseNoteFor] = useState<string | null>(null)
  const [closeNote, setCloseNote] = useState('')
  const [receipts, setReceipts] = useState<Record<string, GoodsReceiptRow[]>>({})
  const [receiptDrafts, setReceiptDrafts] = useState<Record<string, ReceiptDraft>>({})

  const statusLabel = useCallback((s: string) => t(`admin.purchasing.status.${s}`), [t])

  const statusBadgeClass = useCallback((status: string): string => {
    switch (status) {
      case 'draft': return 'bg-admin-surface-3 text-admin-fg-muted border-admin-border'
      case 'ordered': return 'bg-admin-accent-weak text-admin-accent border-admin-accent/30'
      case 'partially_received': return 'bg-admin-warning-weak text-admin-warning border-admin-warning/30'
      case 'received': return 'bg-admin-success-weak text-admin-success border-admin-success/30'
      case 'closed': return 'bg-admin-surface-3 text-admin-fg-muted border-admin-border'
      case 'cancelled': return 'bg-admin-danger-weak text-admin-danger border-admin-danger/30'
      default: return 'bg-admin-surface-3 text-admin-fg-muted border-admin-border'
    }
  }, [])

  const statusIcon = useCallback((status: string): React.ReactNode => {
    switch (status) {
      case 'received': return <CheckCircle className="text-admin-success" size={14} />
      case 'cancelled': return <XCircle className="text-admin-danger" size={14} />
      case 'partially_received': return <PackageCheck className="text-admin-warning" size={14} />
      default: return <ClipboardList className="text-admin-fg-muted" size={14} />
    }
  }, [])

  /* ---- elle statü geçişi — servis (makine kapısı + audit servisin içinde) ---- */
  const handleTransition = useCallback(
    async (row: PoAdminRow, next: string, noteForClose?: string) => {
      if (!hasWriteAccess) {
        toast.error(t('admin.purchasing.toasts.noPermission'))
        return
      }
      if (row.status === 'partially_received' && next === 'closed' && !noteForClose?.trim()) {
        setCloseNoteFor(row.id)
        return
      }
      try {
        setUpdatingId(row.id)
        await setPurchaseOrderStatus(supabaseBrowserClient, row.id, next, {
          closeNote: noteForClose?.trim() || undefined,
        })
        toast.success(t('admin.purchasing.toasts.statusUpdated', { status: statusLabel(next) }))
        setCloseNoteFor(null)
        setCloseNote('')
        await table.reload()
      } catch (err) {
        console.warn('po transition failed', err)
        toast.error(t('admin.purchasing.toasts.statusUpdateFailed'))
      } finally {
        setUpdatingId(null)
      }
    },
    [hasWriteAccess, statusLabel, t, table],
  )

  /* ---- mal kabul — TEK yol: servis → RPC (R2); zarf servis içinde okunur ---- */
  const submitReceipt = useCallback(
    async (row: PoAdminRow) => {
      if (!hasWriteAccess) {
        toast.error(t('admin.purchasing.toasts.noPermission'))
        return
      }
      const draft = receiptDrafts[row.id] ?? emptyReceiptDraft
      const lines = row.items
        .map((item) => {
          const qty = Number(draft.qty[item.id] ?? '')
          if (!Number.isInteger(qty) || qty <= 0) return null
          const rawCost = (draft.unitCost[item.id] ?? '').trim()
          const unitCost = rawCost === '' ? undefined : Number(rawCost)
          if (unitCost !== undefined && (!Number.isFinite(unitCost) || unitCost < 0)) return null
          return { product_id: item.product_id, qty, unit_cost: unitCost }
        })
        .filter((l): l is NonNullable<typeof l> => l !== null)

      if (lines.length === 0) {
        toast.error(t('admin.purchasing.toasts.receiptNoLines'))
        return
      }

      try {
        setUpdatingId(row.id)
        const result = await processGoodsReceipt(supabaseBrowserClient, {
          poId: row.id,
          documentNo: draft.documentNo,
          lines,
          note: draft.note.trim() || undefined,
        })
        if (result.success !== true) {
          toast.error(`${t('admin.purchasing.toasts.receiptFailed')}${result.error ? ` — ${result.error}` : ''}`)
          return
        }
        toast.success(
          t('admin.purchasing.toasts.receiptSuccess', {
            units: String(result.received_units ?? 0),
            count: String(result.processed_count ?? 0),
          }),
        )
        setReceiptDrafts((prev) => ({ ...prev, [row.id]: emptyReceiptDraft }))
        const list = await listGoodsReceipts(supabaseBrowserClient, row.id)
        setReceipts((prev) => ({ ...prev, [row.id]: list }))
        await table.reload()
      } catch (err) {
        console.warn('goods receipt failed', err)
        toast.error(t('admin.purchasing.toasts.receiptFailed'))
      } finally {
        setUpdatingId(null)
      }
    },
    [hasWriteAccess, receiptDrafts, t, table],
  )

  const loadReceipts = useCallback(async (poId: string) => {
    try {
      const list = await listGoodsReceipts(supabaseBrowserClient, poId)
      setReceipts((prev) => ({ ...prev, [poId]: list }))
    } catch (err) {
      console.warn('receipt list failed', err)
    }
  }, [])

  /* ---- genişleyen satır: kalemler + kabuller + kabul formu ---- */
  const renderExpanded = useCallback(
    (row: PoAdminRow) => {
      if (!(row.id in receipts)) void loadReceipts(row.id)
      const draft = receiptDrafts[row.id] ?? emptyReceiptDraft
      const receivable = hasWriteAccess && (row.status === 'ordered' || row.status === 'partially_received')
      const poReceipts = receipts[row.id] ?? []

      return (
        <div className="max-w-4xl mx-auto space-y-5 py-4">
          <div>
            <h4 className="text-xs font-semibold text-admin-accent mb-2">
              {t('admin.purchasing.detail.linesTitle')}
            </h4>
            <div className="space-y-2">
              {row.items.map((item) => {
                const remaining = item.qty_ordered - item.qty_received
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-end gap-3 bg-admin-surface p-3 rounded-admin-md border border-admin-border"
                  >
                    <div className="min-w-44 flex-1">
                      <div className="text-sm font-semibold text-admin-fg">{item.product_name}</div>
                      <div className="text-xs text-admin-fg-muted">{item.product_sku}</div>
                    </div>
                    <div className="text-xs font-bold text-admin-fg-muted">
                      {t('admin.purchasing.detail.ordered')}: <span className="text-admin-fg">{item.qty_ordered}</span>
                      {' · '}
                      {t('admin.purchasing.detail.received')}: <span className="text-admin-fg">{item.qty_received}</span>
                      {' · '}
                      {t('admin.purchasing.detail.remaining')}: <span className="text-admin-fg">{remaining}</span>
                    </div>
                    <div className="text-xs font-bold text-admin-fg-muted">
                      {t('admin.purchasing.detail.unitCost')}:{' '}
                      <span className="text-admin-fg">
                        {item.unit_cost} {item.currency}
                      </span>
                    </div>
                    {receivable && remaining > 0 && (
                      <>
                        <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
                          {t('admin.purchasing.receipt.qtyLabel')}
                          <input
                            type="number"
                            min="1"
                            max={remaining}
                            step="1"
                            value={draft.qty[item.id] ?? ''}
                            onChange={(e) =>
                              setReceiptDrafts((prev) => ({
                                ...prev,
                                [row.id]: { ...draft, qty: { ...draft.qty, [item.id]: e.target.value } },
                              }))
                            }
                            className={`${inputClass} w-24`}
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
                          {t('admin.purchasing.receipt.unitCostLabel')}
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={draft.unitCost[item.id] ?? ''}
                            onChange={(e) =>
                              setReceiptDrafts((prev) => ({
                                ...prev,
                                [row.id]: { ...draft, unitCost: { ...draft.unitCost, [item.id]: e.target.value } },
                              }))
                            }
                            className={`${inputClass} w-32`}
                          />
                        </label>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {receivable && (
            <div className="bg-admin-surface p-4 rounded-admin-lg border border-admin-border space-y-3">
              <h4 className="text-xs font-semibold text-admin-accent">
                {t('admin.purchasing.receipt.formTitle')}
              </h4>
              <p className="text-xs text-admin-fg-muted">{t('admin.purchasing.receipt.hint')}</p>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
                  {t('admin.purchasing.receipt.documentNo')}
                  <input
                    type="text"
                    value={draft.documentNo}
                    onChange={(e) =>
                      setReceiptDrafts((prev) => ({ ...prev, [row.id]: { ...draft, documentNo: e.target.value } }))
                    }
                    className={`${inputClass} w-48`}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
                  {t('admin.purchasing.receipt.note')}
                  <input
                    type="text"
                    value={draft.note}
                    onChange={(e) =>
                      setReceiptDrafts((prev) => ({ ...prev, [row.id]: { ...draft, note: e.target.value } }))
                    }
                    className={`${inputClass} w-56`}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void submitReceipt(row)}
                  disabled={updatingId === row.id || draft.documentNo.trim() === ''}
                  className={`${adminTableActionPrimaryClass} !px-4 disabled:opacity-50`}
                >
                  {t('admin.purchasing.receipt.submit')}
                </button>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-admin-accent mb-2">
              {t('admin.purchasing.detail.receiptsTitle')}
            </h4>
            {poReceipts.length === 0 ? (
              <p className="text-xs text-admin-fg-muted">{t('admin.purchasing.detail.noReceipts')}</p>
            ) : (
              <ul className="space-y-1">
                {poReceipts.map((r) => {
                  const noteText = r.note ? [EMPTY_DASH, r.note].join(' ') : null
                  return (
                    <li key={r.id} className="text-xs text-admin-fg flex items-center gap-2">
                      <FileText size={12} className="text-admin-fg-muted" />
                      <span className="font-semibold">{r.document_no}</span>
                      <span className="text-admin-fg-muted">{formatDate(r.received_at, lang)}</span>
                      {noteText && <span className="text-admin-fg-muted">{noteText}</span>}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )
    },
    [hasWriteAccess, lang, loadReceipts, receiptDrafts, receipts, submitReceipt, t, updatingId],
  )

  /* ---- kolonlar ---- */
  const columns = useMemo<AdminColumn<PoAdminRow>[]>(
    () => [
      {
        key: 'supplier',
        header: t('admin.purchasing.table.supplier'),
        cell: (r) => {
          const shortId = ['#', r.id.slice(-8).toUpperCase()].join('')
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-admin-fg tracking-tight">{r.supplier_name}</span>
              <span className="text-xs text-admin-fg-muted">{shortId}</span>
            </div>
          )
        },
      },
      {
        key: 'lines',
        header: t('admin.purchasing.table.lines'),
        hideable: true,
        cell: (r) => (
          <div className="max-w-xs">
            <div className="font-semibold text-xs text-admin-fg truncate">
              {r.items[0]?.product_name ?? EMPTY_DASH}
              {r.items.length > 1 && <span className="text-admin-fg-muted"> +{r.items.length - 1}</span>}
            </div>
            <div className="text-xs text-admin-fg-muted mt-0.5">
              {t('admin.purchasing.linesCount', { count: String(r.items.length) })} · {r.currency}
            </div>
          </div>
        ),
      },
      {
        key: 'status',
        header: t('admin.purchasing.table.status'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusBadgeClass(r.status)}`}
          >
            {statusIcon(r.status)}
            {statusLabel(r.status)}
          </span>
        ),
      },
      {
        key: 'expected',
        header: t('admin.purchasing.table.expected'),
        hideable: true,
        cell: (r) => (
          <span className="text-xs font-semibold text-admin-fg-muted">
            {r.expected_at ? formatDate(r.expected_at, lang) : EMPTY_DASH}
          </span>
        ),
      },
      {
        key: 'created_at',
        header: t('admin.purchasing.table.created'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <span className="font-semibold text-admin-fg text-xs">{formatDate(r.created_at, lang)}</span>
        ),
      },
      {
        key: 'actions',
        header: t('admin.purchasing.table.actions'),
        cell: (r) => {
          // SSOT'tan üret + türev hedefleri ele (elle seçilemezler) — cetvel §3.2.
          const manualTargets = allowedNextPoStatuses(r.status).filter((next) =>
            isManualPoTransitionAllowed(r.status, next),
          )
          if (!hasWriteAccess || manualTargets.length === 0) {
            return <span className="text-xs text-admin-fg-muted">{EMPTY_DASH}</span>
          }
          if (closeNoteFor === r.id) {
            return (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={closeNote}
                  onChange={(e) => setCloseNote(e.target.value)}
                  placeholder={t('admin.purchasing.actions.closeNotePlaceholder')}
                  className={`${inputClass} w-52 !h-7 text-xs`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!closeNote.trim()) {
                      toast.error(t('admin.purchasing.toasts.closeNoteRequired'))
                      return
                    }
                    void handleTransition(r, 'closed', closeNote)
                  }}
                  disabled={updatingId === r.id}
                  className={`${adminTableActionPrimaryClass} !px-3 !h-7 disabled:opacity-50`}
                >
                  {t('admin.purchasing.actions.confirmClose')}
                </button>
              </div>
            )
          }
          return (
            <div className="flex gap-1.5">
              {manualTargets.map((next) => (
                <button
                  key={next}
                  type="button"
                  onClick={() => void handleTransition(r, next)}
                  disabled={updatingId === r.id}
                  className={`${adminTableActionPrimaryClass} !px-3 !h-7 disabled:opacity-50 gap-1`}
                  title={t('admin.purchasing.actions.markAs', { status: statusLabel(next) })}
                  aria-label={t('admin.purchasing.actions.markAs', { status: statusLabel(next) })}
                >
                  <span className="text-xs font-semibold">{statusLabel(next)}</span>
                  <ChevronRight size={10} strokeWidth={3} />
                </button>
              ))}
            </div>
          )
        },
      },
    ],
    [closeNote, closeNoteFor, handleTransition, hasWriteAccess, lang, statusBadgeClass, statusIcon, statusLabel, t, updatingId],
  )

  const facets = useMemo<DataTableFacet[]>(
    () => [
      {
        key: 'status',
        label: t('admin.purchasing.table.status'),
        options: STATUS_VALUES.map((value) => ({
          value,
          label: statusLabel(value),
          count: facetCounts[value] ?? 0,
        })),
      },
    ],
    [facetCounts, statusLabel, t],
  )

  return (
    <div className="space-y-6">
      {hasWriteAccess && (
        <div className="flex justify-end">
          {!showCreate && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className={`${adminTableActionPrimaryClass} !px-4`}
            >
              {t('admin.purchasing.create.open')}
            </button>
          )}
        </div>
      )}
      {showCreate && (
        <CreatePurchaseOrderPanel
          onCreated={() => {
            setShowCreate(false)
            void table.reload()
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="purchasing"
        hasWriteAccess={hasWriteAccess}
        emptyState={
          <AdminEmptyState
            icon={ClipboardList}
            title={t('admin.purchasing.emptyTitle')}
            description={t('admin.purchasing.emptyDescription')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('admin.purchasing.emptyTitle')}
            description={t('admin.purchasing.filterEmptyDescription')}
          />
        }
        columnsButtonLabel={t('admin.purchasing.columnsButton')}
        expandLabel={t('admin.ui.details')}
        renderExpandedRow={renderExpanded}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:purchasing"
            search={{
              value: table.filtering.query,
              onChange: table.filtering.setQuery,
              placeholder: t('admin.purchasing.searchPlaceholder'),
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

export default PurchasingTableBody
