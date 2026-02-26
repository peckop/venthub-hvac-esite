import React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { format as _format } from 'date-fns'
import { adminSectionTitleClass, adminButtonPrimaryClass, adminButtonSecondaryClass, adminTableHeadCellClass, adminCardPaddedClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ExportMenu from '../../components/admin/ExportMenu'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import { logAdminAction } from '../../lib/audit'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import toast from 'react-hot-toast'
import { X, Search, Truck, FileText, Filter, Download, MoreVertical, Eye, AlertCircle, Trash2, Pencil } from 'lucide-react'

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

  const STATUSES: { value: string; label: string }[] = React.useMemo(() => ([
    { value: '', label: t('admin.orders.statusLabels.all') },
    { value: 'paid', label: t('admin.orders.statusLabels.paid') },
    { value: 'confirmed', label: t('admin.orders.statusLabels.confirmed') },
    { value: 'shipped', label: t('admin.orders.statusLabels.shipped') },
    { value: 'cancelled', label: t('admin.orders.statusLabels.cancelled') },
    { value: 'refunded', label: t('admin.orders.statusLabels.refunded') },
    { value: 'partial_refunded', label: t('admin.orders.statusLabels.partialRefunded') },
  ]), [t])

  const [rows, setRows] = React.useState<AdminOrderRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sortKey, setSortKey] = React.useState<SortKey>('created')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')

  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const PAGE_SIZE = 50

  const [status, setStatus] = React.useState('')
  const [fromDate, setFromDate] = React.useState('')
  const [toDate, setToDate] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [debouncedQuery, setDebouncedQuery] = React.useState('')

  const [shipOpen, setShipOpen] = React.useState(false)
  const [shipId, setShipId] = React.useState<string>('')
  const [carrier, setCarrier] = React.useState('')
  const [tracking, setTracking] = React.useState('')
  const [sendEmail, setSendEmail] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [bulkMode, setBulkMode] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [advBulk, setAdvBulk] = React.useState(false)
  const [advRows, setAdvRows] = React.useState<{ id: string; carrier: string; tracking: string }[]>([])

  const [logsOpen, setLogsOpen] = React.useState(false)
  const [logsLoading, setLogsLoading] = React.useState(false)
  const [logsOrderId, setLogsOrderId] = React.useState<string>('')
  const [emailLogs, setEmailLogs] = React.useState<{ subject: string; email_to: string; provider_message_id: string | null; created_at: string; carrier: string | null; tracking_number: string | null }[]>([])

  const [notesOpen, setNotesOpen] = React.useState(false)
  const [notesLoading, setNotesLoading] = React.useState(false)
  const [notesOrderId, setNotesOrderId] = React.useState<string>('')
  const [noteInput, setNoteInput] = React.useState('')
  const [notes, setNotes] = React.useState<{ id: string; note: string; created_at: string; user_id: string | null }[]>([])

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const searchParams = useSearchParams()
  const [presetPendingShipments, setPresetPendingShipments] = React.useState(false)
  const deepLinkAppliedRef = React.useRef(false)

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
    setLoading(true)
    setError(null)
    try {
      let qb = supabase
        .from('view_admin_orders')
        .select('id,status,conversation_id,total_amount,created_at,order_number,customer_name,customer_email,customer_phone', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (presetPendingShipments && !status) {
        qb = qb.in('status', ['confirmed', 'processing']).is('shipped_at', null)
      } else if (status) {
        qb = qb.eq('status', status)
      }

      if (fromDate) qb = qb.gte('created_at', `${fromDate}T00:00:00Z`)
      if (toDate) qb = qb.lte('created_at', `${toDate}T23:59:59Z`)

      if (debouncedQuery) {
        const q = debouncedQuery.trim()
        qb = qb.ilike('search_text', `%${q}%`)
      }

      const offset = (page - 1) * PAGE_SIZE
      qb = qb.range(offset, offset + PAGE_SIZE - 1)

      const { data, count, error: fetchErr } = await qb
      if (fetchErr) throw fetchErr

      setRows(Array.isArray(data) ? (data as AdminOrderRow[]) : [])
      setTotal(count || 0)
    } catch (e) {
      setError((e as Error).message || t('admin.orders.toasts.loadError'))
    } finally {
      setLoading(false)
    }
  }, [status, fromDate, toDate, page, debouncedQuery, presetPendingShipments, t])

  React.useEffect(() => { fetchOrders() }, [fetchOrders])

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
    setLogsOrderId(id)
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
      setEmailLogs(Array.isArray(data) ? (data as any[]) : [])
    } catch (e) {
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
    setNotesLoading(true)
    try {
      const { data, error } = await supabase
        .from('order_notes')
        .select('id,note,created_at,user_id')
        .eq('order_id', id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setNotes(Array.isArray(data) ? (data as any[]) : [])
    } catch (e) {
      toast.error(t('admin.orders.toasts.notesFailed'))
      setNotes([])
    } finally {
      setNotesLoading(false)
    }
  }
  const closeNotesModal = () => setNotesOpen(false)

  async function addNote() {
    if (!notesOrderId || !noteInput.trim()) return
    try {
      setNotesLoading(true)
      const { data, error } = await supabase
        .from('order_notes')
        .insert({ order_id: notesOrderId, note: noteInput.trim() })
        .select('id,note,created_at,user_id')
        .single()
      if (error) throw error
      setNotes(prev => [data as any, ...prev])
      setNoteInput('')
    } catch (e) {
      toast.error(t('admin.orders.toasts.noteAddFailed'))
    } finally {
      setNotesLoading(false)
    }
  }

  async function deleteNote(noteId: string) {
    if (!noteId) return
    try {
      setNotesLoading(true)
      const { error } = await supabase
        .from('order_notes')
        .delete()
        .eq('id', noteId)
      if (error) throw error
      setNotes(prev => prev.filter(n => n.id !== noteId))
      toast.success(t('admin.orders.toasts.noteDeleteSuccess'))
    } catch (e) {
      toast.error(t('admin.orders.toasts.noteDeleteFailed'))
    } finally {
      setNotesLoading(false)
    }
  }

  async function cancelShipping(id: string) {
    if (!id) return
    const ok = window.confirm(t('admin.orders.toasts.shippingCancelConfirm'))
    if (!ok) return
    try {
      setSaving(true)
      const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', {
        body: { order_id: id, cancel: true, send_email: false }
      })
      if (fnErr) throw fnErr
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r))
      toast.success(t('admin.orders.toasts.shippingCancelSuccess'))
    } catch (e) {
      toast.error(t('admin.orders.toasts.shippingCancelFailed'))
    } finally {
      setSaving(false)
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
      setSaving(true)
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
      } catch (e) {
        toast.error(t('admin.orders.toasts.shippingUpdateFailed'))
      } finally {
        setSaving(false)
      }
      return
    }

    const targets = rows.filter(r => selectedIds.includes(r.id) && r.status !== 'shipped').map(r => r.id)
    if (targets.length === 0) { setShipOpen(false); return }
    setSaving(true)
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
          setSaving(false)
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
    } catch (e) {
      toast.error(t('admin.orders.bulk.shippingFailed'))
    } finally {
      setSaving(false)
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
    setSaving(true)
    try {
      const results = await Promise.all(targets.map(async (id) => {
        const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', { body: { order_id: id, cancel: true, send_email: false } })
        return { id, ok: !fnErr }
      }))
      const failed = results.filter(r => !r.ok).map(r => r.id)
      setRows(prev => prev.map(r => targets.includes(r.id) ? { ...r, status: failed.includes(r.id) ? r.status : 'confirmed' } : r))
      setSelectedIds([])
    } finally {
      setSaving(false)
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
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className={adminSectionTitleClass}>{t('admin.titles.orders')}</h1>
      </header>

      <AdminToolbar
        storageKey="toolbar:orders"
        search={{ value: query, onChange: setQuery, placeholder: t('admin.search.orders'), focusShortcut: '/' }}
        select={{ value: status, onChange: setStatus, title: t('admin.orders.filters.status'), options: STATUSES.map(s => ({ value: s.value, label: s.label })) }}
        toggles={[{ key: 'pendingShipments', label: t('admin.orders.filters.pendingShipments'), checked: presetPendingShipments, onChange: (v) => { setPresetPendingShipments(v); if (v) setStatus('') } }]}
        onClear={() => { setPresetPendingShipments(false); setStatus(''); setFromDate(''); setToDate(''); setQuery(''); setPage(1) }}
        recordCount={total}
        rightExtra={(
          <div className="flex items-center gap-2">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-slate-200 rounded-md px-2 md:h-12 h-11 text-sm bg-white" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-slate-200 rounded-md px-2 md:h-12 h-11 text-sm bg-white" />
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
            <button onClick={fetchOrders} disabled={loading} className={`${adminButtonSecondaryClass} md:h-11 h-10`}>{loading ? t('admin.ui.loadingShort') : t('admin.ui.refresh')}</button>
          </div>
        )}
      />

      <div className="flex items-center justify-end gap-3 mt-4 mb-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className={`${adminButtonSecondaryClass} h-10 disabled:opacity-50`}>{t('admin.ui.prev')}</button>
        <span className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">{t('admin.ui.pageLabel', { page: String(page), pages: String(Math.max(1, Math.ceil(total / PAGE_SIZE))) })}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)} className={`${adminButtonSecondaryClass} h-10 disabled:opacity-50`}>{t('admin.ui.next')}</button>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className={`${adminTableHeadCellClass} ${headPad}`}></th>
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
              <tr><td className="px-4 py-6" colSpan={colCount}>{t('admin.orders.states.loading')}</td></tr>
            ) : sorted.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={colCount}>{t('admin.orders.states.noRecords')}</td></tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, r.id] : prev.filter(x => x !== r.id))} /></td>
                  {visibleCols.id && (<td className="px-4 py-3 font-mono text-xs">{r.id}</td>)}
                  {visibleCols.status && (<td className="px-4 py-3"><span className={badgeClass(r.status)}>{prettyStatus(r.status, t)}</span></td>)}
                  {visibleCols.conversation && (<td className="px-4 py-3 text-xs text-slate-500">{r.conversation_id || '-'}</td>)}
                  {visibleCols.amount && (<td className="px-4 py-3">{formatAmount(r.total_amount, lang)}</td>)}
                  {visibleCols.created && (<td className="px-4 py-3">{safeDate(r.created_at, lang)}</td>)}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openShipModal(r.id)} className="text-xs px-2 py-1 rounded bg-primary-navy text-white">{t('admin.orders.actions.shipping')}</button>
                      <button onClick={() => openLogsModal(r.id)} className="text-xs px-2 py-1 rounded bg-amber-500 text-white">{t('admin.orders.actions.logs')}</button>
                      <button onClick={() => openNotesModal(r.id)} className="text-xs px-2 py-1 rounded bg-gray-700 text-white">{t('admin.orders.actions.notes')}</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {shipOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-primary-navy">{t('admin.orders.modals.shipping.title')}</h3>
              <button onClick={closeShipModal} className="p-2 hover:bg-white hover:shadow-sm rounded-full text-slate-400 hover:text-primary-navy transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">{t('admin.orders.modals.shipping.carrierLabel')}</label>
                  <select value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all appearance-none cursor-pointer font-medium text-slate-700">
                    <option value="">{t('admin.orders.modals.shipping.carrierSelect')}</option>
                    <option value="Yurtiçi">Yurtiçi</option>
                    <option value="Aras">Aras</option>
                    <option value="MNG">MNG</option>
                    <option value="PTT">PTT</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">{t('admin.orders.modals.shipping.trackingLabel')}</label>
                  <input value={tracking} onChange={e => setTracking(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all font-mono font-medium text-slate-700" placeholder="Kargo Takip No" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3 backdrop-blur-sm">
              <button onClick={closeShipModal} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200">
                {t('admin.orders.modals.shipping.cancel')}
              </button>
              <button onClick={submitShip} className={`${adminButtonPrimaryClass} px-8 py-2.5 rounded-xl shadow-lg shadow-primary-navy/10 transition-transform active:scale-95`}>
                {t('admin.orders.modals.shipping.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {logsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-primary-navy">{t('admin.orders.modals.logs.title')}</h3>
              <button onClick={closeLogsModal} className="p-2 hover:bg-white hover:shadow-sm rounded-full text-slate-400 hover:text-primary-navy transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/30">
                {logsLoading ? (
                  <div className="p-12 text-center text-slate-400">
                    <div className="animate-spin w-8 h-8 border-2 border-primary-navy/20 border-t-primary-navy rounded-full mx-auto mb-3" />
                    Yükleniyor...
                  </div>
                ) : (
                  <table className="min-w-full text-sm divide-y divide-slate-100">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tarih</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Konu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {emailLogs.map((l, i) => (
                        <tr key={i} className="hover:bg-white transition-colors">
                          <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{safeDate(l.created_at)}</td>
                          <td className="px-4 py-3 text-slate-700">{l.subject}</td>
                        </tr>
                      ))}
                      {emailLogs.length === 0 && !logsLoading && (
                        <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400 italic">Kayıt bulunamadı</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end backdrop-blur-sm">
              <button onClick={closeLogsModal} className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {notesOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-primary-navy">Sipariş Notları</h3>
              <button onClick={closeNotesModal} className="p-2 hover:bg-white hover:shadow-sm rounded-full text-slate-400 hover:text-primary-navy transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-3">
                <input
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Not ekle..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all"
                />
                <button
                  onClick={addNote}
                  className={`${adminButtonPrimaryClass} px-6 rounded-lg transition-transform active:scale-95`}
                >
                  Ekle
                </button>
              </div>
              <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-1">
                {notes.map(n => (
                  <div key={n.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 group">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 text-sm text-slate-700 leading-relaxed font-medium">{n.note}</div>
                      <button
                        onClick={() => deleteNote(n.id)}
                        className="p-1 px-2 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-md opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-rose-100"
                      >
                        SİL
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{safeDate(n.created_at)}</div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-center py-12 text-slate-400 italic text-sm">Henüz bir not eklenmemiş.</div>
                )}
              </div>
            </div>
            <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end backdrop-blur-sm">
              <button onClick={closeNotesModal} className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatAmount(v?: number | null, lang: any = 'tr') {
  if (typeof v === 'number') return formatCurrency(v, lang, { maximumFractionDigits: 0 })
  return '-'
}

function safeDate(iso: string, lang: any = 'tr') {
  try { return formatDateTime(iso, lang) } catch { return iso }
}

function prettyStatus(s: string, t: any) {
  switch (s) {
    case 'paid': return t('admin.orders.statusLabels.paid')
    case 'confirmed': return t('admin.orders.statusLabels.confirmed')
    case 'shipped': return t('admin.orders.statusLabels.shipped')
    case 'cancelled': return t('admin.orders.statusLabels.cancelled')
    default: return s
  }
}

function badgeClass(s: string) {
  const base = 'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full border shadow-sm'
  switch (s) {
    case 'paid':
      return `${base} bg-emerald-50 text-emerald-700 border-emerald-200/50 ring-1 ring-emerald-600/10`
    case 'confirmed':
      return `${base} bg-sky-50 text-sky-700 border-sky-200/50 ring-1 ring-sky-600/10`
    case 'shipped':
      return `${base} bg-indigo-50 text-indigo-700 border-indigo-200/50 ring-1 ring-indigo-600/10`
    case 'cancelled':
      return `${base} bg-rose-50 text-rose-700 border-rose-200/50 ring-1 ring-rose-600/10`
    case 'refunded':
      return `${base} bg-amber-50 text-amber-700 border-amber-200/50 ring-1 ring-amber-600/10`
    default:
      return `${base} bg-slate-50 text-slate-600 border-slate-200/50 ring-1 ring-slate-500/10`
  }
}

function generateTrackingUrl(carrier: string, tracking: string): string | null {
  const c = (carrier || '').toLowerCase()
  if (c.includes('yurtici')) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${tracking}`
  return null
}

export default AdminOrdersPage
