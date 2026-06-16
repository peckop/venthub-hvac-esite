'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { endOfDay } from 'date-fns'
import { Info, ShoppingCart, X } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { type BulkAction, BulkBar } from '../../components/admin/data-table/BulkBar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import DateRangePicker from '../../components/admin/DateRangePicker'
import ExportMenu from '../../components/admin/ExportMenu'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { formatDateTime } from '../../i18n/datetime'
import { formatCurrency } from '../../i18n/format'
import type { Lang } from '../../i18n/I18nContext'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import type { Database } from '../../types/database.types'

/* ---- model ---- */
interface AdminOrderRow {
  id: string
  status: 'pending' | 'paid' | 'confirmed' | 'shipped' | 'cancelled' | 'refunded' | 'partial_refunded' | string
  conversation_id?: string | null
  total_amount?: number | null
  created_at: string
  order_number?: string | null
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
}

interface EmailLog {
  subject: string
  email_to: string
  provider_message_id: string | null
  created_at: string
  carrier: string | null
  tracking_number: string | null
}

interface OrderNote {
  id: string
  note: string
  created_at: string
  user_id: string | null
}

const PAGE_SIZE = 50

const ORDER_SELECT =
  'id,status,conversation_id,total_amount,created_at,order_number,customer_name,customer_email,customer_phone'

const SORT_COLUMN_MAP: Record<string, string> = {
  created: 'created_at',
  id: 'id',
  status: 'status',
  conversation: 'conversation_id',
  amount: 'total_amount',
}

/* ---- helper'lar (module-level) ---- */
function formatAmount(v?: number | null, lang: Lang = 'tr'): string {
  if (typeof v === 'number') return formatCurrency(v, lang, { maximumFractionDigits: 0 })
  return '-'
}

function safeDate(iso: string, lang: Lang = 'tr'): string {
  try {
    return formatDateTime(iso, lang)
  } catch {
    return iso
  }
}

function prettyStatus(s: string, t: (key: string, params?: Record<string, unknown>) => string): string {
  if (!s) return s
  const key = s.toLowerCase()
  switch (key) {
    case 'pending':
      return t('admin.orders.statusLabels.pending')
    case 'paid':
      return t('admin.orders.statusLabels.paid')
    case 'confirmed':
      return t('admin.orders.statusLabels.confirmed')
    case 'shipped':
      return t('admin.orders.statusLabels.shipped')
    case 'delivered':
      return t('admin.orders.statusLabels.delivered')
    case 'cancelled':
      return t('admin.orders.statusLabels.cancelled')
    case 'refunded':
      return t('admin.orders.statusLabels.refunded')
    case 'partial_refunded':
      return t('admin.orders.statusLabels.partialRefunded')
    default:
      return s
  }
}

function badgeClass(s: string): string {
  if (!s)
    return 'inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-hvac-snug px-3 py-1.5 rounded-full border bg-white/5 text-slate-400 border-white/5 ring-1 ring-white/10 shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-colors'
  const base =
    'inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-hvac-snug px-3 py-1.5 rounded-full border group-hover:scale-105 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.1)]'
  const key = s.toLowerCase()
  switch (key) {
    case 'pending':
      return `${base} bg-slate-500/10 text-slate-400 border-slate-500/20 ring-1 ring-slate-500/10`
    case 'paid':
      return `${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-1 ring-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]`
    case 'confirmed':
      return `${base} bg-cyan-500/10 text-cyan-400 border-cyan-500/20 ring-1 ring-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]`
    case 'shipped':
      return `${base} bg-amber-500/10 text-amber-400 border-amber-500/20 ring-1 ring-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]`
    case 'delivered':
      return `${base} bg-indigo-500/10 text-indigo-400 border-indigo-500/20 ring-1 ring-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]`
    case 'cancelled':
      return `${base} bg-rose-500/10 text-rose-400 border-rose-500/20 ring-1 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]`
    case 'refunded':
    case 'partial_refunded':
      return `${base} bg-orange-500/10 text-orange-400 border-orange-500/20 ring-1 ring-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]`
    default:
      return `${base} bg-white/5 text-slate-400 border-white/5 ring-1 ring-white/10 shadow-[0_0_15px_rgba(0,0,0,0.1)]`
  }
}

function generateTrackingUrl(carrier: string, tracking: string): string | null {
  if (!carrier || !tracking) return null
  const c = carrier.toLowerCase()
  if (c.includes('yurtici')) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${tracking}`
  if (c.includes('aras')) return `https://www.araskargo.com.tr/kargo_takip/kargo_takip_detay.aspx?sorgu_no=${tracking}`
  if (c.includes('mng')) return `https://www.mngkargo.com.tr/gonderitakip?gonderino=${tracking}`
  if (c.includes('ptt')) return `https://gonderitakip.ptt.gov.tr/Track/Verify?id=${tracking}`
  return null
}

/* ---- fetcher: server-mode (search/sort/filter SUNUCUDA) ---- */
async function ordersFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<AdminOrderRow>> {
  await ensureSessionFresh()

  let query = supabase.from('view_admin_orders').select(ORDER_SELECT, { count: 'exact' })

  /* sıralama: server-side */
  const ascending = params.sort?.dir === 'asc'
  if (params.sort?.key) {
    query = query.order(SORT_COLUMN_MAP[params.sort.key] ?? 'created_at', { ascending })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  /* arama: search_text */
  const q = params.query.trim()
  if (q) query = query.ilike('search_text', `%${q}%`)

  /* durum filtresi */
  const status = params.filters.status?.[0]
  const preset = params.filters.preset?.[0]
  if (status) {
    query = query.eq('status', status)
  } else if (preset === 'pendingShipments') {
    query = query.in('status', ['confirmed', 'processing']).is('shipped_at', null)
  }

  /* tarih aralığı (endOfDay ISO değer çağıran tarafça uygulanır) */
  const from = params.filters.from?.[0]
  const to = params.filters.to?.[0]
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)
  if (error) throw error
  return { rows: (data ?? []) as AdminOrderRow[], totalMatched: typeof count === 'number' ? count : 0 }
}

const OrdersTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('orders')

  const table = useAdminTable<AdminOrderRow>({
    resource: 'orders',
    rowId: (r) => r.id,
    fetcher: ordersFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    pageSize: PAGE_SIZE,
    initialSort: { key: 'created', dir: 'desc' },
    syncUrl: true,
  })

  const { setFilter, setQuery } = table.filtering
  const filters = table.filtering.filters
  const statusVal = filters.status?.[0] ?? ''
  const presetActive = filters.preset?.[0] === 'pendingShipments'

  /* ---- modal state: kargo ---- */
  const [shipOpen, setShipOpen] = useState(false)
  const [shipId, setShipId] = useState<string>('')
  const [carrier, setCarrier] = useState('')
  const [tracking, setTracking] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [bulkMode, setBulkMode] = useState(false)

  /* ---- modal state: e-posta kayıtları (READ) ---- */
  const [logsOpen, setLogsOpen] = useState(false)
  const [logsLoading, setLogsLoading] = useState(false)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])

  /* ---- modal state: notlar ---- */
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesOrderId, setNotesOrderId] = useState<string>('')
  const [noteInput, setNoteInput] = useState('')
  const [notes, setNotes] = useState<OrderNote[]>([])

  /* ---- status filtre seçenekleri ---- */
  const statusOptions = useMemo(
    () => [
      { value: '', label: t('admin.orders.statusLabels.all') },
      { value: 'paid', label: t('admin.orders.statusLabels.paid') },
      { value: 'confirmed', label: t('admin.orders.statusLabels.confirmed') },
      { value: 'shipped', label: t('admin.orders.statusLabels.shipped') },
      { value: 'cancelled', label: t('admin.orders.statusLabels.cancelled') },
      { value: 'refunded', label: t('admin.orders.statusLabels.refunded') },
      { value: 'partial_refunded', label: t('admin.orders.statusLabels.partialRefunded') },
    ],
    [t],
  )

  /* ---- kargo modalı: tekil prefill (READ) ---- */
  const openShipModal = useCallback(async (id: string) => {
    setBulkMode(false)
    setShipId(id)
    setCarrier('')
    setTracking('')
    setSendEmail(true)
    try {
      const { data } = await supabaseBrowserClient
        .from('venthub_orders')
        .select('carrier, tracking_number')
        .eq('id', id)
        .maybeSingle()
      if (data) {
        const dto = data as { carrier?: string | null; tracking_number?: string | null }
        setCarrier(dto.carrier || '')
        setTracking(dto.tracking_number || '')
      }
    } catch {
      // no-op
    }
    setShipOpen(true)
  }, [])
  const closeShipModal = useCallback(() => setShipOpen(false), [])

  /* ---- e-posta kayıtları modalı (READ) ---- */
  const openLogsModal = useCallback(
    async (id: string) => {
      setLogsOpen(true)
      setLogsLoading(true)
      try {
        const { data, error } = await supabaseBrowserClient
          .from('shipping_email_events')
          .select('subject,email_to,provider_message_id,created_at,carrier,tracking_number')
          .eq('order_id', id)
          .order('created_at', { ascending: false })
          .limit(20)
        if (error) throw error
        setEmailLogs(Array.isArray(data) ? (data as EmailLog[]) : [])
      } catch {
        toast.error(t('admin.orders.toasts.emailLogsFailed'))
        setEmailLogs([])
      } finally {
        setLogsLoading(false)
      }
    },
    [t],
  )
  const closeLogsModal = useCallback(() => setLogsOpen(false), [])

  /* ---- notlar modalı (READ açılış) ---- */
  const openNotesModal = useCallback(
    async (id: string) => {
      setNotesOrderId(id)
      setNotesOpen(true)
      try {
        const { data, error } = await supabaseBrowserClient
          .from('order_notes')
          .select('id,note,created_at,user_id')
          .eq('order_id', id)
          .order('created_at', { ascending: false })
          .limit(50)
        if (error) throw error
        setNotes(Array.isArray(data) ? (data as OrderNote[]) : [])
      } catch {
        toast.error(t('admin.orders.toasts.notesFailed'))
        setNotes([])
      }
    },
    [t],
  )
  const closeNotesModal = useCallback(() => setNotesOpen(false), [])

  /* ---- (d) Not ekle — INSERT, mutateWithAudit kapısından ---- */
  const addNote = useCallback(async () => {
    const text = noteInput.trim()
    if (!notesOrderId || !text) return
    try {
      const inserted = await mutateWithAudit(supabaseBrowserClient, {
        resource: 'orders',
        canWrite: hasWriteAccess,
        action: 'INSERT',
        rowPk: notesOrderId,
        before: null,
        after: { note: text },
        auditedByEdge: false,
        fn: async () => {
          const { data, error } = await supabaseBrowserClient
            .from('order_notes')
            .insert({ order_id: notesOrderId, note: text })
            .select('id,note,created_at,user_id')
            .single()
          if (error) throw error
          return data as OrderNote
        },
      })
      setNotes((prev) => [inserted, ...prev])
      setNoteInput('')
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.orders.toasts.noPermission')
          : t('admin.orders.toasts.noteAddFailed'),
      )
    }
  }, [noteInput, notesOrderId, hasWriteAccess, t])

  /* ---- (e) Not sil — DELETE, mutateWithAudit kapısından ---- */
  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!noteId) return
      const target = notes.find((n) => n.id === noteId)
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'orders',
          canWrite: hasWriteAccess,
          action: 'DELETE',
          rowPk: noteId,
          before: { note: target?.note ?? '' },
          after: null,
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('order_notes').delete().eq('id', noteId)
            if (error) throw error
          },
        })
        setNotes((prev) => prev.filter((n) => n.id !== noteId))
        toast.success(t('admin.orders.toasts.noteDeleteSuccess'))
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.orders.toasts.noPermission')
            : t('admin.orders.toasts.noteDeleteFailed'),
        )
      }
    },
    [notes, hasWriteAccess, t],
  )

  /* ---- (a)+(b) Kargo gönder — tekil + toplu, tek mutateWithAudit ---- */
  const submitShip = useCallback(async () => {
    if (!bulkMode) {
      if (!shipId) return
      const curRow = table.rows.find((r) => r.id === shipId)
      const cur = curRow?.status ?? ''
      const isShipped = cur === 'shipped'
      if (!isShipped && (!carrier.trim() || !tracking.trim())) {
        toast.error(t('admin.orders.toasts.missingFields'))
        return
      }
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'orders',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: shipId,
          before: { status: cur },
          after: { status: isShipped ? cur : 'shipped', carrier, tracking_number: tracking },
          auditedByEdge: false,
          fn: async () => {
            const turl = carrier && tracking ? generateTrackingUrl(carrier, tracking) : null
            const { error: fnErr } = await supabaseBrowserClient.functions.invoke('admin-update-shipping', {
              body: {
                order_id: shipId,
                carrier: carrier.trim(),
                tracking_number: tracking.trim(),
                tracking_url: turl,
                send_email: !!sendEmail,
              },
            })
            if (fnErr) throw fnErr
          },
        })
        setShipOpen(false)
        toast.success(
          isShipped
            ? t('admin.orders.toasts.shippingUpdateSuccess')
            : t('admin.orders.toasts.shippingCreateSuccess'),
        )
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.orders.toasts.noPermission')
            : t('admin.orders.toasts.shippingUpdateFailed'),
        )
      }
      return
    }

    /* toplu kargo */
    const selected = table.selection.selectedIds
    const targets = table.rows.filter((r) => selected.includes(r.id) && r.status !== 'shipped').map((r) => r.id)
    if (targets.length === 0) {
      setShipOpen(false)
      return
    }
    if (!carrier.trim() || !tracking.trim()) {
      toast.error(t('admin.orders.toasts.missingFields'))
      return
    }
    try {
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'orders',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: null,
        before: null,
        after: { status: 'shipped', ids: targets },
        auditedByEdge: false,
        fn: async () => {
          const turl = carrier && tracking ? generateTrackingUrl(carrier, tracking) : null
          const results = await Promise.all(
            targets.map(async (id) => {
              const { error: fnErr } = await supabaseBrowserClient.functions.invoke('admin-update-shipping', {
                body: {
                  order_id: id,
                  carrier: carrier.trim(),
                  tracking_number: tracking.trim(),
                  tracking_url: turl,
                  send_email: !!sendEmail,
                },
              })
              return !fnErr
            }),
          )
          if (results.some((ok) => !ok)) throw new Error('Some failed')
        },
      })
      setShipOpen(false)
      setBulkMode(false)
      toast.success(t('admin.orders.toasts.bulkShippingSuccess', { count: String(targets.length) }))
      table.selection.clear()
      await table.reload()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.orders.toasts.noPermission')
          : t('admin.orders.toasts.bulkShippingFailed'),
      )
    }
  }, [bulkMode, shipId, carrier, tracking, sendEmail, hasWriteAccess, t, table])

  /* ---- (c) Toplu kargo iptal ---- */
  const bulkCancelShipping = useCallback(async () => {
    const selected = table.selection.selectedIds
    const targets = table.rows.filter((r) => selected.includes(r.id) && r.status === 'shipped').map((r) => r.id)
    if (targets.length === 0) return
    if (!window.confirm(t('admin.orders.bulk.confirmCancelShipping', { count: String(targets.length) }))) return
    try {
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'orders',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: null,
        before: null,
        after: { status: 'confirmed', ids: targets },
        auditedByEdge: false,
        fn: async () => {
          const results = await Promise.all(
            targets.map(async (id) => {
              const { error: fnErr } = await supabaseBrowserClient.functions.invoke('admin-update-shipping', {
                body: { order_id: id, cancel: true, send_email: false },
              })
              return !fnErr
            }),
          )
          if (results.some((ok) => !ok)) throw new Error('Some failed')
        },
      })
      toast.success(t('admin.orders.bulk.cancelSuccess', { count: String(targets.length) }))
      table.selection.clear()
      await table.reload()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.orders.toasts.noPermission')
          : t('admin.orders.bulk.cancelFailed'),
      )
    }
  }, [hasWriteAccess, t, table])

  /* ---- date-range picker ↔ filters.from/to ---- */
  const dateRange = useMemo<DateRange | undefined>(() => {
    const from = filters.from?.[0]
    const to = filters.to?.[0]
    if (!from && !to) return undefined
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    }
  }, [filters.from, filters.to])

  const onDateChange = useCallback(
    (range?: DateRange) => {
      setFilter('from', range?.from ? [range.from.toISOString()] : [])
      setFilter('to', range?.to ? [endOfDay(range.to).toISOString()] : [])
    },
    [setFilter],
  )

  const resetFilters = useCallback(() => {
    setQuery('')
    setFilter('status', [])
    setFilter('preset', [])
    setFilter('from', [])
    setFilter('to', [])
  }, [setQuery, setFilter])

  /* ---- export (CSV + XLS), fetchAllForExport üzerinden (tüm filtreli sonuç) ---- */
  const exportHeaders = useMemo(
    () => [
      t('admin.orders.export.headers.orderId'),
      t('admin.orders.export.headers.status'),
      t('admin.orders.export.headers.amount'),
    ],
    [t],
  )

  const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = rows.map((r) => [r.id, r.status, r.total_amount].map(escape).join(','))
    const csv = '﻿' + [exportHeaders.join(','), ...lines].join('\n')
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'orders.csv')
  }, [table, exportHeaders])

  const exportXls = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const head = exportHeaders.map((h) => `<th>${h}</th>`).join('')
    const body = rows
      .map((r) => `<tr><td>${r.id}</td><td>${r.status}</td><td>${r.total_amount ?? ''}</td></tr>`)
      .join('')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`
    downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel' }), 'orders.xls')
  }, [table, exportHeaders])

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<AdminOrderRow>[]>(
    () => [
      {
        key: 'id',
        header: t('admin.orders.table.orderId'),
        sortable: true,
        cell: (r) => {
          const shortId = `${r.id.slice(0, 8)}...`
          return (
            <div className="flex flex-col gap-1">
              <span className="font-black text-white uppercase tracking-wider text-xs">
                {r.order_number || r.id.slice(0, 8)}
              </span>
              {r.order_number && <span className="text-xs text-slate-500 font-mono">{shortId}</span>}
            </div>
          )
        },
      },
      {
        key: 'status',
        header: t('admin.orders.table.status'),
        sortable: true,
        hideable: true,
        cell: (r) => <span className={badgeClass(r.status)}>{prettyStatus(r.status, t)}</span>,
      },
      {
        key: 'conversation',
        header: t('admin.orders.table.conversationId'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <span className="text-xs font-medium text-slate-400 font-mono italic">{r.conversation_id || '-'}</span>
        ),
      },
      {
        key: 'amount',
        header: t('admin.orders.table.amount'),
        sortable: true,
        hideable: true,
        align: 'right',
        cell: (r) => (
          <span className="font-black text-white text-xs tracking-wider">{formatAmount(r.total_amount, lang)}</span>
        ),
      },
      {
        key: 'created',
        header: t('admin.orders.table.created'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {safeDate(r.created_at, lang)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: t('admin.orders.table.actions'),
        sortable: false,
        cell: (r) => (
          <div className="flex gap-2">
            {hasWriteAccess && (
              <button
                type="button"
                onClick={() => void openShipModal(r.id)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-black uppercase text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors"
              >
                {t('admin.orders.actions.shipping')}
              </button>
            )}
            <button
              type="button"
              onClick={() => void openLogsModal(r.id)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-black uppercase text-amber-400 hover:bg-amber-500 hover:text-white transition-colors"
            >
              {t('admin.orders.actions.logs')}
            </button>
            <button
              type="button"
              onClick={() => void openNotesModal(r.id)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-black uppercase text-slate-400 hover:bg-slate-500 hover:text-white transition-colors"
            >
              {t('admin.orders.actions.notes')}
            </button>
          </div>
        ),
      },
    ],
    [t, lang, hasWriteAccess, openShipModal, openLogsModal, openNotesModal],
  )

  /* ---- bulk actions ---- */
  const bulkActions = useMemo<BulkAction[]>(
    () => [
      {
        key: 'ship',
        label: t('admin.orders.bulk.shipSelected'),
        tone: 'default',
        onRun: async () => {
          setBulkMode(true)
          setCarrier('')
          setTracking('')
          setSendEmail(true)
          setShipOpen(true)
        },
      },
      {
        key: 'cancel',
        label: t('admin.orders.bulk.cancelShipping'),
        tone: 'warning',
        onRun: bulkCancelShipping,
      },
    ],
    [t, bulkCancelShipping],
  )

  return (
    <>
      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="orders"
        hasWriteAccess={hasWriteAccess}
        totalLabel={t('admin.ui.total')}
        emptyState={
          <AdminEmptyState
            icon={ShoppingCart}
            title={t('admin.orders.emptyTitle')}
            description={t('admin.orders.emptyDescription')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={ShoppingCart}
            title={t('admin.orders.emptyTitle')}
            description={t('admin.orders.filterEmptyDescription')}
          />
        }
        columnsButtonLabel={t('admin.common.view')}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:orders"
            search={{
              value: table.filtering.query,
              onChange: setQuery,
              placeholder: t('admin.search.orders'),
              focusShortcut: '/',
            }}
            select={{
              value: statusVal,
              onChange: (v) => setFilter('status', v ? [v] : []),
              title: t('admin.orders.filters.status'),
              options: statusOptions,
            }}
            toggles={[
              {
                key: 'pendingShipments',
                label: t('admin.orders.filters.pendingShipments'),
                checked: presetActive,
                onChange: (v) => {
                  setFilter('preset', v ? ['pendingShipments'] : [])
                  if (v) setFilter('status', [])
                },
              },
            ]}
            onClear={resetFilters}
            recordCount={table.totalMatched}
            rightExtra={
              <div className="flex flex-wrap items-center gap-2">
                <DateRangePicker value={dateRange} onChange={onDateChange} />
                <ExportMenu
                  items={[
                    { key: 'csv', label: t('admin.orders.export.csvLabel'), onSelect: () => void exportCsv() },
                    { key: 'xls', label: t('admin.orders.export.xlsLabel'), onSelect: () => void exportXls() },
                  ]}
                />
              </div>
            }
          />
        }
        bulkBarSlot={
          hasWriteAccess ? (
            <BulkBar
              selectedCount={table.selection.selectedIds.length}
              selectedLabel={t('admin.orders.bulk.selected', { count: table.selection.selectedIds.length })}
              clearLabel={t('admin.orders.bulk.clearSelection')}
              actions={bulkActions}
              onClear={table.selection.clear}
            />
          ) : null
        }
      />

      {shipOpen && (
        <div className="fixed inset-0 bg-surface-darker/40 backdrop-blur-xl flex items-center justify-center z-modal p-4 animate-in fade-in duration-500">
          <div className="glass-strong border border-white/10 rounded-hvac-2xl shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in-95 duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight">
                {bulkMode
                  ? t('admin.orders.modals.shipping.bulkTitle')
                  : t('admin.orders.modals.shipping.title')}
              </h3>
              <button
                type="button"
                onClick={closeShipModal}
                aria-label={t('admin.orders.modals.shipping.cancel')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors ring-1 ring-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label
                    htmlFor="ship-carrier"
                    className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal ml-1"
                  >
                    {t('admin.orders.modals.shipping.carrierLabel')}
                  </label>
                  <select
                    id="ship-carrier"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 transition-colors"
                  >
                    <option value="" className="bg-surface-deep">
                      {t('admin.orders.modals.shipping.carrierSelect')}
                    </option>
                    <option value="Yurtiçi" className="bg-surface-deep">
                      {t('admin.orders.modals.shipping.carriers.yurtici')}
                    </option>
                    <option value="Aras" className="bg-surface-deep">
                      {t('admin.orders.modals.shipping.carriers.aras')}
                    </option>
                    <option value="MNG" className="bg-surface-deep">
                      {t('admin.orders.modals.shipping.carriers.mng')}
                    </option>
                    <option value="PTT" className="bg-surface-deep">
                      {t('admin.orders.modals.shipping.carriers.ptt')}
                    </option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label
                    htmlFor="ship-tracking"
                    className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal ml-1"
                  >
                    {t('admin.orders.modals.shipping.trackingLabel')}
                  </label>
                  <input
                    id="ship-tracking"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 transition-colors placeholder:text-slate-600"
                    placeholder={t('admin.orders.modals.shipping.trackingPlaceholder')}
                  />
                </div>
                <label className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-500 focus-visible:ring-cyan-500/20"
                  />
                  {t('admin.orders.modals.shipping.sendEmailLabel')}
                </label>
              </div>
            </div>
            <div className="px-10 py-8 bg-white/2 border-t border-white/5 flex justify-end gap-4">
              <button
                type="button"
                onClick={closeShipModal}
                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                {t('admin.orders.modals.shipping.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void submitShip()}
                className="px-8 py-3 text-xs font-black uppercase tracking-widest bg-cyan-500 text-white rounded-xl shadow-glow-md hover:scale-105 active:scale-95 transition-transform"
              >
                {t('admin.orders.modals.shipping.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {logsOpen && (
        <div className="fixed inset-0 bg-surface-darker/40 backdrop-blur-xl flex items-center justify-center z-modal p-4 animate-in fade-in duration-500">
          <div className="glass-strong border border-white/10 rounded-hvac-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform animate-in zoom-in-95 duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight">
                {t('admin.orders.modals.logs.title')}
              </h3>
              <button
                type="button"
                onClick={closeLogsModal}
                aria-label={t('admin.orders.modals.logs.close')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors ring-1 ring-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-10">
              <div className="max-h-50vh overflow-y-auto rounded-hvac-xl border border-white/10 bg-white/2 overflow-hidden custom-scrollbar">
                {logsLoading ? (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                    <div className="animate-spin w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-hvac-relaxed text-slate-500">
                      {t('admin.common.loading')}
                    </span>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full text-sm divide-y divide-white/5">
                      <thead className="bg-white/5 sticky top-0 backdrop-blur-xl">
                        <tr>
                          <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-hvac-normal">
                            {t('admin.orders.modals.logs.table.date')}
                          </th>
                          <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-hvac-normal">
                            {t('admin.orders.modals.logs.table.subject')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/2">
                        {emailLogs.map((l, i) => (
                          <tr key={i} className="hover:bg-white/3 transition-colors group">
                            <td className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                              {safeDate(l.created_at, lang)}
                            </td>
                            <td className="px-8 py-5 text-xs text-white font-medium flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-admin-orders-glow-3" />
                              {l.subject}
                            </td>
                          </tr>
                        ))}
                        {emailLogs.length === 0 && !logsLoading && (
                          <tr>
                            <td colSpan={2} className="px-8 py-20 text-center">
                              <div className="flex flex-col items-center gap-4 text-slate-500">
                                <Info size={32} className="opacity-20" />
                                <span className="text-xs font-black uppercase tracking-hvac-relaxed italic">
                                  {t('admin.orders.modals.logs.noRecords')}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="px-10 py-8 bg-white/2 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={closeLogsModal}
                className="px-10 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                {t('admin.orders.modals.logs.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {notesOpen && (
        <div className="fixed inset-0 bg-surface-darker/40 backdrop-blur-xl flex items-center justify-center z-modal p-4 animate-in fade-in duration-500">
          <div className="glass-strong border border-white/10 rounded-hvac-2xl shadow-2xl w-full max-w-xl overflow-hidden transform animate-in zoom-in-95 duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight">
                {t('admin.orders.modals.notes.title')}
              </h3>
              <button
                type="button"
                onClick={closeNotesModal}
                aria-label={t('admin.orders.modals.notes.close')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors ring-1 ring-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-10 space-y-8">
              {hasWriteAccess && (
                <div className="flex gap-4">
                  <input
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={t('admin.orders.modals.notes.inputPlaceholder')}
                    aria-label={t('admin.orders.modals.notes.inputPlaceholder')}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 transition-colors placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => void addNote()}
                    className="px-8 py-4 bg-cyan-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-glow-md hover:scale-105 active:scale-95 transition-transform"
                  >
                    {t('admin.orders.modals.notes.add')}
                  </button>
                </div>
              )}
              <div className="max-h-40vh overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-6 bg-white/2 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 text-sm text-slate-300 leading-relaxed font-medium">{n.note}</div>
                      {hasWriteAccess && (
                        <button
                          type="button"
                          onClick={() => void deleteNote(n.id)}
                          aria-label={t('admin.orders.modals.notes.delete')}
                          className="p-1.5 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-rose-500/20"
                        >
                          {t('admin.orders.modals.notes.delete')}
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-4 font-black uppercase tracking-hvac-normal">
                      {safeDate(n.created_at, lang)}
                    </div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-center py-16 text-slate-500 font-black uppercase tracking-hvac-normal text-xs">
                    {t('admin.orders.modals.notes.noRecords')}
                  </div>
                )}
              </div>
            </div>
            <div className="px-10 py-8 bg-white/2 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={closeNotesModal}
                className="px-10 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                {t('admin.orders.modals.notes.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default OrdersTableBody
