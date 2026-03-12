import React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { format as _format } from 'date-fns'
import {
  adminSectionTitleClass,
  adminSubtitleClass,
  adminButtonSecondaryClass,
  adminTableHeadCellClass,
  adminTableContainerClass,
  adminSelectClass,
  adminSelectStyle
} from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ExportMenu from '../../components/admin/ExportMenu'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { logAdminAction } from '../../lib/audit'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import toast from 'react-hot-toast'
import { X, Truck, LayoutList, KanbanSquare, ShoppingCart, Info } from 'lucide-react'
import AdminOrdersBoard from './AdminOrdersBoard'
import DateRangePicker from '../../components/admin/DateRangePicker'
import { DateRange } from 'react-day-picker'
import { endOfDay } from 'date-fns'
import { useRole } from '../../hooks/useRole'
import { Lang } from '../../i18n/I18nContext'
import { useDragScroll } from '../../hooks/useDragScroll'

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

type SortKey = 'id' | 'status' | 'conversation' | 'amount' | 'created'

const AdminOrdersPage: React.FC = () => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('orders')
  const dragScrollRef = useDragScroll<HTMLDivElement>()

  const STATUSES: { value: string; label: string }[] = React.useMemo(() => ([
    { value: '', label: t('admin.orders.statusLabels.all') },
    { value: 'paid', label: t('admin.orders.statusLabels.paid') },
    { value: 'confirmed', label: t('admin.orders.statusLabels.confirmed') },
    { value: 'shipped', label: t('admin.orders.statusLabels.shipped') },
    { value: 'cancelled', label: t('admin.orders.statusLabels.cancelled') },
    { value: 'refunded', label: t('admin.orders.statusLabels.refunded') },
    { value: 'partial_refunded', label: t('admin.orders.statusLabels.partialRefunded') },
  ]), [t])

  const [viewMode, setViewMode] = React.useState<'list' | 'board'>('list')
  const [rows, setRows] = React.useState<AdminOrderRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [sortKey, setSortKey] = React.useState<SortKey>('created')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')

  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const PAGE_SIZE = 50

  const [status, setStatus] = React.useState('')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [query, setQuery] = React.useState('')
  const [debouncedQuery, setDebouncedQuery] = React.useState('')

  const [hasDeepLink] = React.useState(() => {
    if (typeof window === 'undefined') return false
    const qs = new URLSearchParams(window.location.search)
    return !!(qs.get('q') || qs.get('preset'))
  })

  const [shipOpen, setShipOpen] = React.useState(false)
  const [shipId, setShipId] = React.useState<string>('')
  const [carrier, setCarrier] = React.useState('')
  const [tracking, setTracking] = React.useState('')
  const [sendEmail, setSendEmail] = React.useState(true)
  const [bulkMode, setBulkMode] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [advBulk, setAdvBulk] = React.useState(false)
  const [advRows, setAdvRows] = React.useState<{ id: string; carrier: string; tracking: string }[]>([])

  const [logsOpen, setLogsOpen] = React.useState(false)
  const [logsLoading, setLogsLoading] = React.useState(false)
  interface EmailLog { subject: string; email_to: string; provider_message_id: string | null; created_at: string; carrier: string | null; tracking_number: string | null }
  const [emailLogs, setEmailLogs] = React.useState<EmailLog[]>([])

  interface OrderNote { id: string; note: string; created_at: string; user_id: string | null }
  const [notesOpen, setNotesOpen] = React.useState(false)
  const [notesOrderId, setNotesOrderId] = React.useState<string>('')
  const [noteInput, setNoteInput] = React.useState('')
  const [notes, setNotes] = React.useState<OrderNote[]>([])

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const searchParams = useSearchParams()
  const [presetPendingShipments, setPresetPendingShipments] = React.useState(false)
  const deepLinkAppliedRef = React.useRef(false)
  const lastFetchId = React.useRef(0)

  React.useEffect(() => {
    if (deepLinkAppliedRef.current) return
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const preset = urlParams.get('preset')
    if (preset === 'pendingShipments') {
      setPresetPendingShipments(true)
      setStatus('')
    }
    const qParam = urlParams.get('q')
    if (qParam) {
      deepLinkAppliedRef.current = true
      setQuery(qParam)
      setDebouncedQuery(qParam)
      setStatus('')
      setPresetPendingShipments(false)
    }
  }, [])

  React.useEffect(() => {
    if (!searchParams) return
    if (deepLinkAppliedRef.current) { deepLinkAppliedRef.current = false; return }

    const preset = searchParams.get('preset')
    const isPending = preset === 'pendingShipments'
    setPresetPendingShipments(isPending)
    if (isPending) setStatus('')

    const qParam = searchParams.get('q')
    if (qParam) {
      setQuery(qParam)
      setDebouncedQuery(qParam)
      setStatus('')
      setPresetPendingShipments(false)
    }
  }, [searchParams])

  const fetchOrders = React.useCallback(async () => {
    const fetchId = ++lastFetchId.current
    setLoading(true)
    try {
      await ensureSessionFresh()

      let qb = supabase
        .from('view_admin_orders')
        .select('id,status,conversation_id,total_amount,created_at,order_number,customer_name,customer_email,customer_phone', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (presetPendingShipments && !status) {
        qb = qb.in('status', ['confirmed', 'processing']).is('shipped_at', null)
      } else if (status) {
        qb = qb.eq('status', status)
      }

      const q = debouncedQuery.trim()
      if (q) {
        qb = qb.ilike('search_text', `%${q}%`)
      }

      if (dateRange?.from) qb = qb.gte('created_at', dateRange.from.toISOString())
      if (dateRange?.to) qb = qb.lte('created_at', endOfDay(dateRange.to).toISOString())

      const offset = (page - 1) * PAGE_SIZE
      qb = qb.range(offset, offset + PAGE_SIZE - 1)

      const { data, count, error: fetchErr } = await qb

      if (fetchId !== lastFetchId.current) return

      if (fetchErr) throw fetchErr

      setRows(Array.isArray(data) ? (data as AdminOrderRow[]) : [])
      setTotal(count || 0)
    } catch {
      if (fetchId === lastFetchId.current) {
        toast.error(t('admin.orders.toasts.loadError'))
      }
    } finally {
      if (fetchId === lastFetchId.current) {
        setLoading(false)
      }
    }
  }, [status, dateRange, page, debouncedQuery, presetPendingShipments, t])

  const pathname = usePathname()
  React.useEffect(() => {
    if (viewMode === 'list') fetchOrders()
  }, [fetchOrders, viewMode, pathname])

  const openShipModal = async (id: string) => {
    setBulkMode(false)
    setShipId(id)
    setCarrier('')
    setTracking('')
    setSendEmail(true)
    try {
      const { data } = await supabase
        .from('venthub_orders')
        .select('carrier, tracking_number')
        .eq('id', id)
        .maybeSingle()
      if (data) {
        const dto = data as { carrier?: string | null; tracking_number?: string | null }
        setCarrier(dto.carrier || '')
        setTracking(dto.tracking_number || '')
      }
    } catch { }
    setShipOpen(true)
  }
  const closeShipModal = () => setShipOpen(false)

  React.useEffect(() => {
    if (shipOpen && bulkMode) {
      setAdvRows(selectedIds.map(id => ({ id, carrier: '', tracking: '' })))
      setAdvBulk(false)
    }
  }, [shipOpen, bulkMode, selectedIds])

  async function openLogsModal(id: string) {
    setLogsOpen(true)
    setLogsLoading(true)
    try {
      const { data, error } = await supabase
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
  }
  const closeLogsModal = () => setLogsOpen(false)

  async function openNotesModal(id: string) {
    setNotesOrderId(id)
    setNotesOpen(true)
    try {
      const { data, error } = await supabase
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
  }
  const closeNotesModal = () => setNotesOpen(false)

  async function addNote() {
    if (!notesOrderId || !noteInput.trim()) return
    try {
      const { data, error } = await supabase
        .from('order_notes')
        .insert({ order_id: notesOrderId, note: noteInput.trim() })
        .select('id,note,created_at,user_id')
        .single()
      if (error) throw error
      setNotes(prev => [data as OrderNote, ...prev])
      setNoteInput('')
    } catch {
      toast.error(t('admin.orders.toasts.noteAddFailed'))
    }
  }

  async function deleteNote(noteId: string) {
    if (!noteId) return
    try {
      const { error } = await supabase
        .from('order_notes')
        .delete()
        .eq('id', noteId)
      if (error) throw error
      setNotes(prev => prev.filter(n => n.id !== noteId))
      toast.success(t('admin.orders.toasts.noteDeleteSuccess'))
    } catch {
      toast.error(t('admin.orders.toasts.noteDeleteFailed'))
    }
  }

  const submitShip = async () => {
    if (!bulkMode) {
      if (!shipId) return
      const curRow = rows.find(r => r.id === shipId)
      const isShipped = curRow?.status === 'shipped'
      if (!isShipped && (!carrier.trim() || !tracking.trim())) {
        alert(t('admin.orders.toasts.missingFields'))
        return
      }
      try {
        const turl = carrier && tracking ? generateTrackingUrl(carrier, tracking) : null
        const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', {
          body: {
            order_id: shipId,
            carrier: carrier.trim(),
            tracking_number: tracking.trim(),
            tracking_url: turl,
            send_email: !!sendEmail
          }
        })
        if (fnErr) throw fnErr
        await logAdminAction(supabase, {
          table_name: 'venthub_orders',
          row_pk: shipId,
          action: 'UPDATE',
          before: { status: curRow?.status },
          after: { status: isShipped ? curRow?.status : 'shipped', carrier, tracking_number: tracking },
          comment: 'shipment update'
        })
        setRows(prev => prev.map(r => r.id === shipId ? { ...r, status: isShipped ? r.status : 'shipped' } : r))
        setShipOpen(false)
        toast.success(isShipped ? t('admin.orders.toasts.shippingUpdateSuccess') : t('admin.orders.toasts.shippingCreateSuccess'))
      } catch {
        toast.error(t('admin.orders.toasts.shippingUpdateFailed'))
      }
      return
    }

    const targets = rows.filter(r => selectedIds.includes(r.id) && r.status !== 'shipped').map(r => r.id)
    if (targets.length === 0) { setShipOpen(false); return }
    try {
      if (!advBulk) {
        const turl = carrier && tracking ? generateTrackingUrl(carrier, tracking) : null
        const results = await Promise.all(targets.map(async (id) => {
          const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', {
            body: { order_id: id, carrier: carrier.trim() || '', tracking_number: tracking.trim() || '', tracking_url: turl, send_email: !!sendEmail }
          })
          return { id, ok: !fnErr }
        }))
        if (results.some(r => !r.ok)) throw new Error('Some failed')
        setRows(prev => prev.map(r => targets.includes(r.id) ? { ...r, status: 'shipped' } : r))
        setShipOpen(false)
        toast.success(t('admin.orders.bulk.shippingSuccess', { count: String(targets.length) }))
        setSelectedIds([])
        setBulkMode(false)
      } else {
        const mapById = new Map(advRows.map(x => [x.id, x]))
        const invalid = targets.filter(id => {
          const row = mapById.get(id)
          return !row || !row.carrier.trim() || !row.tracking.trim()
        })
        if (invalid.length > 0) {
          alert(t('admin.orders.toasts.missingAdvancedFields', { count: String(invalid.length) }))
          return
        }
        const results = await Promise.all(targets.map(async (id) => {
          const row = mapById.get(id)!
          const turl = generateTrackingUrl(row.carrier, row.tracking)
          const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', {
            body: { order_id: id, carrier: row.carrier.trim(), tracking_number: row.tracking.trim(), tracking_url: turl, send_email: !!sendEmail }
          })
          return { id, ok: !fnErr }
        }))
        if (results.some(r => !r.ok)) throw new Error('Some failed')
        setRows(prev => prev.map(r => targets.includes(r.id) ? { ...r, status: 'shipped' } : r))
        setShipOpen(false)
        toast.success(t('admin.orders.bulk.shippingSuccess', { count: String(targets.length) }))
        setSelectedIds([])
        setBulkMode(false)
      }
    } catch {
      toast.error(t('admin.orders.bulk.shippingFailed'))
    }
  }

  const sorted = React.useMemo(() => {
    const arr = [...rows]
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'id': return dir * a.id.localeCompare(b.id)
        case 'status': return dir * (a.status || '').localeCompare(b.status || '')
        case 'conversation': return dir * String(a.conversation_id || '').localeCompare(String(b.conversation_id || ''))
        case 'amount': return dir * ((a.total_amount || 0) - (b.total_amount || 0))
        case 'created': return dir * (Date.parse(a.created_at) - Date.parse(b.created_at))
        default: return 0
      }
    })
    return arr
  }, [rows, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'created' ? 'desc' : 'asc') }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? '▲' : '▼'
  }

  async function bulkCancelShipping() {
    const targets = rows.filter(r => selectedIds.includes(r.id) && r.status === 'shipped').map(r => r.id)
    if (targets.length === 0) return
    if (!window.confirm(t('admin.orders.bulk.confirmCancelShipping', { count: String(targets.length) }))) return
    try {
      const results = await Promise.all(targets.map(async (id) => {
        const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', { body: { order_id: id, cancel: true, send_email: false } })
        return { id, ok: !fnErr }
      }))
      const failed = results.filter(r => !r.ok).map(r => r.id)
      setRows(prev => prev.map(r => targets.includes(r.id) ? { ...r, status: failed.includes(r.id) ? r.status : 'confirmed' } : r))
      setSelectedIds([])
    } catch {
      // no-op
    }
  }

  function exportCsv() {
    const header = [t('admin.orders.export.headers.orderId'), t('admin.orders.export.headers.status'), t('admin.orders.export.headers.amount')]
    const lines = rows.map(r => [r.id, r.status, r.total_amount].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const blob = new Blob(['\ufeff' + [header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const [visibleCols, setVisibleCols] = React.useState({ id: true, status: true, conversation: true, amount: true, created: true })
  const [density, setDensity] = React.useState<Density>('comfortable')
  const colCount = 1 + (visibleCols.id ? 1 : 0) + (visibleCols.status ? 1 : 0) + (visibleCols.conversation ? 1 : 0) + (visibleCols.amount ? 1 : 0) + (visibleCols.created ? 1 : 0) + 1
  const headPad = density === 'compact' ? 'px-2 py-2' : ''

  return (
    <div className="h-full flex flex-col space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className={adminSectionTitleClass}>
            {t('admin.titles.orders')}
          </h1>
          <p className={adminSubtitleClass}>
            {viewMode === 'board' 
              ? 'Siparişleri sürükleyerek durumlarını hızlıca güncelleyin.' 
              : 'Tüm siparişleri listeleyin, filtreleyin ve yönetin.'}
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 glass-strong p-1 rounded-2xl border border-white/5 shrink-0 shadow-2xl">
          <button
            onClick={() => setViewMode('list')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all duration-500 ${
              viewMode === 'list' 
                ? 'bg-cyan-400 text-[#0A0F1E] shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutList size={14} /> {t('admin.orders.view_list') || 'Tablo'}
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all duration-500 ${
              viewMode === 'board' 
                ? 'bg-cyan-400 text-[#0A0F1E] shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <KanbanSquare size={14} /> {t('admin.orders.view_board') || 'Pano'}
          </button>
        </div>
      </header>

      {viewMode === 'list' && <AdminToolbar
        storageKey="toolbar:orders"
        persist={{ select: !hasDeepLink, toggles: !hasDeepLink, chips: !hasDeepLink }}
        search={{ value: query, onChange: setQuery, placeholder: t('admin.search.orders'), focusShortcut: '/' }}
        select={{ value: status, onChange: setStatus, title: t('admin.orders.filters.status'), options: STATUSES.map(s => ({ value: s.value, label: s.label })) }}
        toggles={[{ key: 'pendingShipments', label: t('admin.orders.filters.pendingShipments'), checked: presetPendingShipments, onChange: (v) => { setPresetPendingShipments(v); if (v) setStatus('') } }]}
        onClear={() => { setPresetPendingShipments(false); setStatus(''); setDateRange(undefined); setQuery(''); setPage(1) }}
        recordCount={total}
        rightExtra={(
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-start md:justify-end">
            <DateRangePicker value={dateRange} onChange={(d) => setDateRange(d)} />
            <ExportMenu items={[{ key: 'csv', label: t('admin.orders.export.csvLabel'), onSelect: exportCsv }]} />
            <ColumnsMenu
              columns={[
                { key: 'id', label: t('admin.orders.columns.orderId'), checked: visibleCols.id, onChange: (v) => setVisibleCols(s => ({ ...s, id: v })) },
                { key: 'status', label: t('admin.orders.columns.status'), checked: visibleCols.status, onChange: (v) => setVisibleCols(s => ({ ...s, status: v })) },
                { key: 'conversation', label: t('admin.orders.columns.conversationId'), checked: visibleCols.conversation, onChange: (v) => setVisibleCols(s => ({ ...s, conversation: v })) },
                { key: 'amount', label: t('admin.orders.columns.amount'), checked: visibleCols.amount, onChange: (v) => setVisibleCols(s => ({ ...s, amount: v })) },
                { key: 'created', label: t('admin.orders.columns.created'), checked: visibleCols.created, onChange: (v) => setVisibleCols(s => ({ ...s, created: v })) },
              ]}
              density={density}
              onDensityChange={setDensity}
            />
            <button onClick={fetchOrders} disabled={loading} className={`${adminButtonSecondaryClass}`}>{loading ? t('admin.ui.loadingShort') : t('admin.ui.refresh')}</button>
          </div>
        )}
      />}


      {viewMode === 'board' ? (
        <AdminOrdersBoard />
      ) : (
        <>
          <div className="flex items-center justify-end gap-3 mt-6 mb-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {t('admin.ui.prev')}
            </button>
            <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
              {t('admin.ui.pageLabel', { page: String(page), pages: String(Math.max(1, Math.ceil(total / PAGE_SIZE))) })}
            </span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {t('admin.ui.next')}
            </button>
          </div>

          <section className={adminTableContainerClass}>
            <div ref={dragScrollRef} className="overflow-x-auto w-full">
              <table className="min-w-[900px] w-full text-sm">
                <thead>
                  <tr>
                    <th className={`${adminTableHeadCellClass} ${headPad} w-10`}></th>
                    {visibleCols.id && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button onClick={() => toggleSort('id')}>{t('admin.orders.table.orderId')} {sortIndicator('id')}</button></th>)}
                    {visibleCols.status && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button onClick={() => toggleSort('status')}>{t('admin.orders.table.status')} {sortIndicator('status')}</button></th>)}
                    {visibleCols.conversation && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button onClick={() => toggleSort('conversation')}>{t('admin.orders.table.conversationId')} {sortIndicator('conversation')}</button></th>)}
                    {visibleCols.amount && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button onClick={() => toggleSort('amount')}>{t('admin.orders.table.amount')} {sortIndicator('amount')}</button></th>)}
                    {visibleCols.created && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button onClick={() => toggleSort('created')}>{t('admin.orders.table.created')} {sortIndicator('created')}</button></th>)}
                    <th className={`${adminTableHeadCellClass} ${headPad}`}>{t('admin.orders.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && rows.length === 0 ? (
                    <tr>
                      <td colSpan={colCount} className="p-0">
                        <AdminSkeleton variant="table" rows={10} count={colCount} />
                      </td>
                    </tr>
                  ) : sorted.length === 0 ? (
                    <tr>
                      <td colSpan={colCount} className="p-4">
                        <AdminEmptyState
                          icon={ShoppingCart}
                          title={t('admin.orders.states.noRecords') || "Sipariş bulunamadı"}
                          description="Arama kriterlerinize veya uyguladığınız filtrelere uygun bir sipariş kaydı mevcut değil."
                        />
                      </td>
                    </tr>
                  ) : (
                    sorted.map((r) => (
                      <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(r.id)} 
                            onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, r.id] : prev.filter(x => x !== r.id))} 
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/20 transition-all"
                          />
                        </td>
                        {visibleCols.id && (
                          <td className="px-6 py-5">
                            <div className="font-black text-white uppercase tracking-wider text-xs">{r.order_number || r.id.slice(0, 8)}</div>
                            {r.order_number && <div className="text-[10px] text-slate-500 mt-1 font-mono">{r.id.slice(0, 8)}...</div>}
                          </td>
                        )}
                        {visibleCols.status && (<td className="px-6 py-5"><span className={badgeClass(r.status)}>{prettyStatus(r.status, t)}</span></td>)}
                        {visibleCols.conversation && (<td className="px-6 py-5 text-[11px] font-medium text-slate-400 font-mono italic">{r.conversation_id || '-'}</td>)}
                        {visibleCols.amount && (<td className="px-6 py-5 font-black text-white text-xs tracking-wider">{formatAmount(r.total_amount, lang)}</td>)}
                        {visibleCols.created && (<td className="px-6 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">{safeDate(r.created_at, lang)}</td>)}
                        <td className="px-6 py-5">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {hasWriteAccess && (
                              <button onClick={() => openShipModal(r.id)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all">
                                {t('admin.orders.actions.shipping')}
                              </button>
                            )}
                            <button onClick={() => openLogsModal(r.id)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase text-amber-400 hover:bg-amber-500 hover:text-white transition-all">
                              {t('admin.orders.actions.logs')}
                            </button>
                            <button onClick={() => openNotesModal(r.id)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-500 hover:text-white transition-all">
                              {t('admin.orders.actions.notes')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Toplu İşlem Toolbar */}
            {bulkMode && hasWriteAccess && (
              <div className="mx-6 mb-6 px-6 py-4 rounded-[2rem] bg-cyan-500 text-white flex items-center justify-between shadow-[0_0_50px_rgba(34,211,238,0.2)] animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">{selectedIds.length} {t('admin.orders.bulk.selected')}</span>
                  <button onClick={() => setSelectedIds([])} className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
                    {t('admin.orders.bulk.clearSelection')}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setShipOpen(true); setBulkMode(true) }} 
                    className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl bg-cyan-400 text-[#0A0F1E] hover:bg-cyan-300 shadow-lg shadow-cyan-400/20 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Truck size={14} /> {t('admin.orders.bulk.shipSelected')}
                  </button>
                  <button onClick={bulkCancelShipping} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl bg-black/20 text-white hover:bg-black/30 transition-all flex items-center gap-2">
                    <X size={14} /> {t('admin.orders.bulk.cancelShipping')}
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {shipOpen && (
        <div className="fixed inset-0 bg-[#020617]/40 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
          <div className="glass-strong border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in-95 duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight">
                {t('admin.orders.modals.shipping.title')}
              </h3>
              <button onClick={closeShipModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all ring-1 ring-white/10">
                <X size={20} />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t('admin.orders.modals.shipping.carrierLabel')}</label>
                  <select 
                    value={carrier} 
                    onChange={e => setCarrier(e.target.value)} 
                    className={adminSelectClass}
                    style={adminSelectStyle}
                  >
                    <option value="" className="bg-[#0A0F1E]">{t('admin.orders.modals.shipping.carrierSelect')}</option>
                    <option value="Yurtiçi" className="bg-[#0A0F1E]">Yurtiçi</option>
                    <option value="Aras" className="bg-[#0A0F1E]">Aras</option>
                    <option value="MNG" className="bg-[#0A0F1E]">MNG</option>
                    <option value="PTT" className="bg-[#0A0F1E]">PTT</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t('admin.orders.modals.shipping.trackingLabel')}</label>
                  <input value={tracking} onChange={e => setTracking(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600" placeholder="Kargo Takip No" />
                </div>
              </div>
            </div>
            <div className="px-10 py-8 bg-white/[0.02] border-t border-white/5 flex justify-end gap-4">
              <button onClick={closeShipModal} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                {t('admin.orders.modals.shipping.cancel')}
              </button>
              <button onClick={submitShip} className="px-8 py-3 text-xs font-black uppercase tracking-widest bg-cyan-500 text-white rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all">
                {t('admin.orders.modals.shipping.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {logsOpen && (
        <div className="fixed inset-0 bg-[#020617]/40 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
          <div className="glass-strong border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden transform animate-in zoom-in-95 duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight">
                {t('admin.orders.modals.logs.title')}
              </h3>
              <button onClick={closeLogsModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all ring-1 ring-white/10">
                <X size={20} />
              </button>
            </div>
            <div className="p-10">
              <div className="max-h-[50vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-white/[0.02] overflow-hidden custom-scrollbar">
                {logsLoading ? (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                    <div className="animate-spin w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Veriler İşleniyor...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full text-sm divide-y divide-white/5">
                      <thead className="bg-white/5 sticky top-0 backdrop-blur-xl">
                        <tr>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('admin.orders.modals.logs.dateLabel') || 'Tarih'}</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('admin.orders.modals.logs.subjectLabel') || 'Konu'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {emailLogs.map((l, i) => (
                          <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{safeDate(l.created_at)}</td>
                            <td className="px-8 py-5 text-[12px] text-white font-medium flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                              {l.subject}
                            </td>
                          </tr>
                        ))}
                        {emailLogs.length === 0 && !logsLoading && (
                          <tr>
                            <td colSpan={2} className="px-8 py-20 text-center">
                              <div className="flex flex-col items-center gap-4 text-slate-500">
                                <Info size={32} className="opacity-20" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">E-posta kaydı bulunamadı</span>
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
            <div className="px-10 py-8 bg-white/[0.02] border-t border-white/5 flex justify-end">
              <button onClick={closeLogsModal} className="px-10 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                {t('admin.ui.close') || 'Kapat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notesOpen && (
        <div className="fixed inset-0 bg-[#020617]/40 backdrop-blur-xl flex items-center justify-center z-[101] p-4 animate-in fade-in duration-500">
          <div className="glass-strong border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden transform animate-in zoom-in-95 duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight">
                Sipariş Notları
              </h3>
              <button onClick={closeNotesModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all ring-1 ring-white/10">
                <X size={20} />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="flex gap-4">
                <input
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Not ekle..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                />
                <button
                  onClick={addNote}
                  className="px-8 py-4 bg-cyan-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                  Ekle
                </button>
              </div>
              <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {notes.map(n => (
                  <div key={n.id} className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 text-[13px] text-slate-300 leading-relaxed font-medium">{n.note}</div>
                      <button
                        onClick={() => deleteNote(n.id)}
                        className="p-1.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-all border border-rose-500/20"
                      >
                        SİL
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-4 font-black uppercase tracking-[0.2em]">{safeDate(n.created_at)}</div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-center py-16 text-slate-500 font-black uppercase tracking-[0.2em] text-[11px]">Henüz bir not eklenmemiş.</div>
                )}
              </div>
            </div>
            <div className="px-10 py-8 bg-white/[0.02] border-t border-white/5 flex justify-end">
              <button onClick={closeNotesModal} className="px-10 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatAmount(v?: number | null, lang: Lang = 'tr') {
  if (typeof v === 'number') return formatCurrency(v, lang, { maximumFractionDigits: 0 })
  return '-'
}

function safeDate(iso: string, lang: Lang = 'tr') {
  try { return formatDateTime(iso, lang) } catch { return iso }
}

function prettyStatus(s: string, t: (key: string, params?: Record<string, unknown>) => string) {
  if (!s) return s
  const key = s.toLowerCase()
  switch (key) {
    case 'pending': return t('admin.orders.statusLabels.pending')
    case 'paid': return t('admin.orders.statusLabels.paid')
    case 'confirmed': return t('admin.orders.statusLabels.confirmed')
    case 'shipped': return t('admin.orders.statusLabels.shipped')
    case 'delivered': return t('admin.orders.statusLabels.delivered')
    case 'cancelled': return t('admin.orders.statusLabels.cancelled')
    case 'refunded': return t('admin.orders.statusLabels.refunded')
    case 'partial_refunded': return t('admin.orders.statusLabels.partialRefunded')
    default: return s
  }
}

function badgeClass(s: string) {
  if (!s) return 'inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border bg-white/5 text-slate-400 border-white/5 ring-1 ring-white/10 shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all'
  const base = 'inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,0,0,0.1)]'
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

function generateTrackingUrl(carrier: string, tracking: string) {
  if (!carrier || !tracking) return null
  const c = carrier.toLowerCase()
  if (c.includes('yurtici')) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${tracking}`
  if (c.includes('aras')) return `https://www.araskargo.com.tr/kargo_takip/kargo_takip_detay.aspx?sorgu_no=${tracking}`
  if (c.includes('mng')) return `https://www.mngkargo.com.tr/gonderitakip?gonderino=${tracking}`
  if (c.includes('ptt')) return `https://gonderitakip.ptt.gov.tr/Track/Verify?id=${tracking}`
  return null
}

export default AdminOrdersPage
