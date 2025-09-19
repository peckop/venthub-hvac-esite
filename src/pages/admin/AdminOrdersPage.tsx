import React from 'react'
import { useLocation } from 'react-router-dom'
import { format as _format } from 'date-fns'
import { adminSectionTitleClass, adminButtonPrimaryClass, adminTableHeadCellClass, adminCardPaddedClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ExportMenu from '../../components/admin/ExportMenu'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import { logAdminAction } from '../../lib/audit'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import toast from 'react-hot-toast'

// Minimal order type matching admin-orders-latest edge function response
interface AdminOrderRow {
  id: string
  status: 'pending' | 'paid' | 'confirmed' | 'shipped' | 'cancelled' | 'refunded' | 'partial_refunded' | string
  conversation_id?: string | null
  total_amount?: number | null
  created_at: string
}

type SortKey = 'id' | 'status' | 'conversation' | 'amount' | 'created'


const AdminOrdersPage: React.FC = () => {
  const { t, lang } = useI18n()
  // Localized statuses
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
  // Pagination
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const PAGE_SIZE = 50

  // Filters
  const [status, setStatus] = React.useState('')
  const [fromDate, setFromDate] = React.useState('')
  const [toDate, setToDate] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [debouncedQuery, setDebouncedQuery] = React.useState('')

  // Shipping modal state
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

  // Logs modal
  const [logsOpen, setLogsOpen] = React.useState(false)
  const [logsLoading, setLogsLoading] = React.useState(false)
  const [logsOrderId, setLogsOrderId] = React.useState<string>('')
  const [emailLogs, setEmailLogs] = React.useState<{ subject: string; email_to: string; provider_message_id: string | null; created_at: string; carrier: string | null; tracking_number: string | null }[]>([])

  // Notes modal
  const [notesOpen, setNotesOpen] = React.useState(false)
  const [notesLoading, setNotesLoading] = React.useState(false)
  const [notesOrderId, setNotesOrderId] = React.useState<string>('')
  const [noteInput, setNoteInput] = React.useState('')
  const [notes, setNotes] = React.useState<{ id: string; note: string; created_at: string; user_id: string | null }[]>([])

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  // Dashboard'tan preset uygula (pendingShipments)
  const location = useLocation()
  const [presetPendingShipments, setPresetPendingShipments] = React.useState(false)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const preset = params.get('preset')
    const isPending = preset === 'pendingShipments'
    setPresetPendingShipments(isPending)
    if (isPending) {
      // UI'daki tekli status seçicisini zorlamadan, client-side olarak hem confirmed hem processing'i göstereceğiz
      setStatus('')
    }
  }, [location.search])

  // Fetch orders from edge function with server-side filters
  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabaseUrl = ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || 'https://tnofewwkwlyjsqgwjjga.supabase.co'
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (fromDate) params.set('from', fromDate)
      if (toDate) params.set('to', toDate)
      if (debouncedQuery) params.set('q', debouncedQuery)
      if (presetPendingShipments && !status) params.set('preset', 'pendingShipments')
      params.set('limit', String(PAGE_SIZE))
      params.set('page', String(page))
      const url = `${supabaseUrl}/functions/v1/admin-orders-latest?${params.toString()}`
      // Include user session token so Edge Function (verify_jwt=true) authorizes the request
      const { data: sess } = await supabase.auth.getSession()
      const headers: Record<string, string> = {}
      if (sess?.session?.access_token) headers['Authorization'] = `Bearer ${sess.session.access_token}`
      const resp = await fetch(url, { method: 'GET', headers })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = (await resp.json()) as { rows?: AdminOrderRow[]; total?: number }
      const list = Array.isArray(data?.rows) ? data.rows as AdminOrderRow[] : []
      setRows(list)
      setTotal(Number(data?.total || 0))
    } catch (e) {
      const msg = (e as Error).message || t('admin.orders.toasts.loadError')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [status, fromDate, toDate, debouncedQuery, page, presetPendingShipments, t])

  React.useEffect(() => { fetchOrders() }, [fetchOrders])

  const openShipModal = async (id: string) => {
    setBulkMode(false)
    setShipId(id)
    setCarrier('')
    setTracking('')
    setSendEmail(true)
    // Prefill existing shipping info if exists
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
    } catch {}
    setShipOpen(true)
  }
  const closeShipModal = () => setShipOpen(false)

  React.useEffect(() => {
    if (shipOpen && bulkMode) {
      // Initialize advanced rows with selected ids
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
      setEmailLogs(Array.isArray(data) ? (data as { subject: string; email_to: string; provider_message_id: string | null; created_at: string; carrier: string | null; tracking_number: string | null }[]) : [])
    } catch (e) {
      console.error('load logs error', e)
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
      setNotes(Array.isArray(data) ? (data as { id: string; note: string; created_at: string; user_id: string | null }[]) : [])
    } catch (e) {
      console.error('load notes error', e)
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
      setNotes(prev => [data as { id: string; note: string; created_at: string; user_id: string | null }, ...prev])
      setNoteInput('')
    } catch (e) {
      console.error('add note error', e)
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
      console.error('delete note error', e)
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
      console.error('cancel ship error', e)
      toast.error(t('admin.orders.toasts.shippingCancelFailed'))
    } finally {
      setSaving(false)
    }
  }

  const submitShip = async () => {
    // Single or bulk mode submission
    if (!bulkMode) {
      if (!shipId) return
      const isShipped = rows.find(r => r.id === shipId)?.status === 'shipped'
      if (!isShipped && (!carrier.trim() || !tracking.trim())) {
        alert(t('admin.orders.toasts.missingFields'))
        return
      }
      setSaving(true)
      try {
        const tracking_url = carrier && tracking ? generateTrackingUrl(carrier, tracking) : null
        // Call server-side edge function (no PostgREST schema/cache dependency)
        const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', {
          body: {
            order_id: shipId,
            carrier: carrier.trim(),
            tracking_number: tracking.trim(),
            tracking_url: tracking_url,
            send_email: !!sendEmail
          }
        })
        if (fnErr) throw fnErr
        const _updRows = [{ id: shipId }]
        // Audit log
        await logAdminAction(supabase, {
          table_name: 'venthub_orders',
          row_pk: shipId,
          action: 'UPDATE',
          before: { status: rows.find(r => r.id === shipId)?.status },
          after: { status: isShipped ? rows.find(r => r.id === shipId)?.status : 'shipped', carrier, tracking_number: tracking },
          comment: 'shipment update'
        })
        setRows(prev => prev.map(r => r.id === shipId ? { ...r, status: isShipped ? r.status : 'shipped' } : r))
        setShipOpen(false)
        toast.success(isShipped ? t('admin.orders.toasts.shippingUpdateSuccess') : t('admin.orders.toasts.shippingCreateSuccess'))
      } catch (e) {
        console.error('ship error', e)
        toast.error(t('admin.orders.toasts.shippingUpdateFailed'))
      } finally {
        setSaving(false)
      }
      return
    }

    // Bulk mode
    const targets = rows.filter(r => selectedIds.includes(r.id) && r.status !== 'shipped').map(r => r.id)
    if (targets.length === 0) { setShipOpen(false); return }
    setSaving(true)
    try {
      if (!advBulk) {
        // Simple mode: same carrier/tracking for all
        const tracking_url = carrier && tracking ? generateTrackingUrl(carrier, tracking) : null
        const results = await Promise.all(targets.map(async (id) => {
          const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', {
            body: {
              order_id: id,
              carrier: carrier.trim() || '',
              tracking_number: tracking.trim() || '',
              tracking_url: tracking_url,
              send_email: !!sendEmail
            }
          })
          if (fnErr) return { id, ok: false, error: fnErr }
          return { id, ok: true }
        }))
        const failed = results.filter(r => !r.ok).map(r => r.id)
        if (failed.length > 0) throw new Error('FUNC failed for: ' + failed.join(','))
        await logAdminAction(supabase, targets.map(id => ({
          table_name: 'venthub_orders', row_pk: id, action: 'UPDATE',
          before: { status: rows.find(r => r.id === id)?.status },
          after: { status: 'shipped', carrier: carrier || undefined, tracking_number: tracking || undefined },
          comment: 'bulk shipment update'
        })))
        setRows(prev => prev.map(r => targets.includes(r.id) ? { ...r, status: 'shipped' } : r))
        setShipOpen(false)
        toast.success(t('admin.orders.toasts.bulkShippingSuccess', { count: String(targets.length) }))
        setSelectedIds([])
        setBulkMode(false)
      } else {
        // Advanced mode: per-order values
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
            body: {
              order_id: id,
              carrier: row.carrier.trim(),
              tracking_number: row.tracking.trim(),
              tracking_url: turl,
              send_email: !!sendEmail
            }
          })
          if (fnErr) return { id, ok: false, error: fnErr }
          return { id, ok: true }
        }))
        const failed = results.filter(r => !r.ok).map(r => r.id)
        if (failed.length > 0) throw new Error('FUNC failed for: ' + failed.join(','))
        await logAdminAction(supabase, targets.map(id => ({
          table_name: 'venthub_orders', row_pk: id, action: 'UPDATE',
          before: { status: rows.find(r => r.id === id)?.status },
          after: { status: 'shipped' },
          comment: 'bulk shipment update (advanced)'
        })))
        setRows(prev => prev.map(r => targets.includes(r.id) ? { ...r, status: 'shipped' } : r))
        setShipOpen(false)
        toast.success(t('admin.orders.toasts.bulkShippingSuccess', { count: String(targets.length) }))
        setSelectedIds([])
        setBulkMode(false)
      }
    } catch (e) {
      console.error('bulk ship error', e)
      toast.error(t('admin.orders.toasts.bulkShippingFailed'))
    } finally {
      setSaving(false)
    }
  }

  // Also apply client-side filtering as a fallback (until function is deployed everywhere)
  const filtered = React.useMemo(() => {
    return rows.filter((r) => {
      // Preset: pending shipments -> confirmed veya processing
      if (!status && presetPendingShipments) {
        const ok = r.status === 'confirmed' || r.status === 'processing'
        if (!ok) return false
      }
      // Normal tekli status filtresi
      if (status && r.status !== status) return false
      if (fromDate) {
        const from = new Date(fromDate)
        if (new Date(r.created_at) < from) return false
      }
      if (toDate) {
        const to = new Date(toDate)
        to.setHours(23,59,59,999)
        if (new Date(r.created_at) > to) return false
      }
      if (debouncedQuery) {
        const q = debouncedQuery.toLowerCase()
        const hay = `${r.id} ${r.conversation_id || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, status, fromDate, toDate, debouncedQuery, presetPendingShipments])

  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    arr.sort((a,b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'id':
          return dir * a.id.localeCompare(b.id)
        case 'status':
          return dir * a.status.localeCompare(b.status)
        case 'conversation':
          return dir * String(a.conversation_id||'').localeCompare(String(b.conversation_id||''))
        case 'amount':
          return dir * ((a.total_amount||0) - (b.total_amount||0))
        case 'created':
          return dir * (Date.parse(a.created_at) - Date.parse(b.created_at))
        default:
          return 0
      }
    })
    return arr
  }, [filtered, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key==='created' ? 'desc' : 'asc') }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? '▲' : '▼'
  }

  async function bulkCancelShipping() {
    const targets = rows.filter(r => selectedIds.includes(r.id) && r.status === 'shipped').map(r => r.id)
    if (targets.length === 0) {
      toast(t('admin.orders.bulk.noShippableSelected'), { icon: 'ℹ️' })
      return
    }
    const ok = window.confirm(t('admin.orders.bulk.confirmCancelShipping', { count: String(targets.length) }))
    if (!ok) return
    setSaving(true)
    try {
      const results = await Promise.all(targets.map(async (id) => {
        const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', {
          body: { order_id: id, cancel: true, send_email: false }
        })
        if (fnErr) return { id, ok: false, error: fnErr }
        return { id, ok: true }
      }))
      const failed = results.filter(r => !r.ok).map(r => r.id)
      setRows(prev => prev.map(r => targets.includes(r.id) ? { ...r, status: failed.includes(r.id) ? r.status : 'confirmed' } : r))
      if (failed.length === 0) toast.success(t('admin.orders.bulk.cancelSuccess', { count: String(targets.length) }))
      else toast.error(t('admin.orders.bulk.cancelPartialFail', { failed: failed.join(',') }))
      setSelectedIds([])
    } catch (e) {
      console.error('bulk cancel error', e)
      toast.error(t('admin.orders.bulk.cancelFailed'))
    } finally {
      setSaving(false)
    }
  }

  // Export helpers
  function exportOrdersCsv() {
    const header = [
      t('admin.orders.export.headers.orderId'),
      t('admin.orders.export.headers.status'),
      t('admin.orders.export.headers.conversationId'),
      t('admin.orders.export.headers.amount'),
      t('admin.orders.export.headers.created')
    ]
    const lines = filtered.map(r => {
      const cols = [
        r.id,
        r.status,
        r.conversation_id || '',
        formatAmount(r.total_amount, lang),
        safeDate(r.created_at, lang),
      ]
      return cols.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')
    })
    const bom = '\ufeff'
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportOrdersXls() {
    // Basit HTML tablo ile .xls uyumlu çıktı
    const rowsHtml = filtered.map(r => (
      `<tr>`+
        `<td>${r.id}</td>`+
        `<td>${r.status}</td>`+
        `<td>${r.conversation_id || ''}</td>`+
        `<td>${formatAmount(r.total_amount, lang)}</td>`+
        `<td>${safeDate(r.created_at, lang)}</td>`+
      `</tr>`
    )).join('')
    const table = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr><th>${t('admin.orders.export.headers.orderId')}</th><th>${t('admin.orders.export.headers.status')}</th><th>${t('admin.orders.export.headers.conversationId')}</th><th>${t('admin.orders.export.headers.amount')}</th><th>${t('admin.orders.export.headers.created')}</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`
    const blob = new Blob([table], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xls`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Görünür kolonlar ve yoğunluk
  const STORAGE_KEY = 'toolbar:orders'
  const [visibleCols, setVisibleCols] = React.useState<{ id: boolean; status: boolean; conversation: boolean; amount: boolean; created: boolean }>({ id: true, status: true, conversation: true, amount: true, created: true })
  const [density, setDensity] = React.useState<Density>('comfortable')
  React.useEffect(()=>{
    try {
      const rawCols = localStorage.getItem(`${STORAGE_KEY}:cols`)
      if (rawCols) setVisibleCols(prev=>({ ...prev, ...JSON.parse(rawCols) }))
      const rawDen = localStorage.getItem(`${STORAGE_KEY}:density`)
      if (rawDen === 'compact' || rawDen === 'comfortable') setDensity(rawDen as Density)
    } catch {}
  },[])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch {} }, [visibleCols])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch {} }, [density])
  const colCount = 1 + (visibleCols.id?1:0) + (visibleCols.status?1:0) + (visibleCols.conversation?1:0) + (visibleCols.amount?1:0) + (visibleCols.created?1:0) + 1
  const headPad = density==='compact' ? 'px-2 py-2' : ''

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className={adminSectionTitleClass}>{t('admin.titles.orders')}</h1>
      </header>

      {/* Filters - AdminToolbar */}
      <AdminToolbar
        storageKey="toolbar:orders"
        search={{ value: query, onChange: setQuery, placeholder: t('admin.search.orders'), focusShortcut: '/' }}
        select={{
          value: status,
          onChange: setStatus,
          title: t('admin.orders.filters.status'),
          options: STATUSES.map(s => ({ value: s.value, label: s.label }))
        }}
        toggles={[{ key: 'pendingShipments', label: t('admin.orders.filters.pendingShipments'), checked: presetPendingShipments, onChange: (v: boolean)=>{ setPresetPendingShipments(v); if (v) setStatus('') } }]}
        onClear={()=>{ setPresetPendingShipments(false); setStatus(''); setFromDate(''); setToDate(''); setQuery(''); setPage(1) }}
        recordCount={total}
        rightExtra={(
          <div className="flex items-center gap-2">
            <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white" title={t('admin.ui.startDate')} />
            <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white" title={t('admin.ui.endDate')} />
            <ExportMenu items={[{ key: 'csv', label: t('admin.orders.export.csvLabel'), onSelect: exportOrdersCsv }, { key: 'xls', label: t('admin.orders.export.xlsLabel'), onSelect: exportOrdersXls }]} />
            <ColumnsMenu
              columns={[
                { key: 'id', label: t('admin.orders.columns.orderId'), checked: visibleCols.id, onChange: (v)=>setVisibleCols(s=>({ ...s, id: v })) },
                { key: 'status', label: t('admin.orders.columns.status'), checked: visibleCols.status, onChange: (v)=>setVisibleCols(s=>({ ...s, status: v })) },
                { key: 'conversation', label: t('admin.orders.columns.conversationId'), checked: visibleCols.conversation, onChange: (v)=>setVisibleCols(s=>({ ...s, conversation: v })) },
                { key: 'amount', label: t('admin.orders.columns.amount'), checked: visibleCols.amount, onChange: (v)=>setVisibleCols(s=>({ ...s, amount: v })) },
                { key: 'created', label: t('admin.orders.columns.created'), checked: visibleCols.created, onChange: (v)=>setVisibleCols(s=>({ ...s, created: v })) },
              ]}
              density={density}
              onDensityChange={setDensity}
            />
            <button onClick={fetchOrders} disabled={loading} className="px-3 md:h-12 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap">{loading ? t('admin.ui.loadingShort') : t('admin.ui.refresh')}</button>
          </div>
        )}
      />

      {/* Pagination controls */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 md:h-12 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap disabled:opacity-50"
>{t('admin.ui.prev')}</button>
        <span className="text-sm text-steel-gray">{t('admin.ui.pageLabel', { page: String(page), pages: String(Math.max(1, Math.ceil(total / PAGE_SIZE))) })}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))}
          className="px-3 md:h-12 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap disabled:opacity-50"
>{t('admin.ui.next')}</button>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className={adminCardPaddedClass + ' flex items-center justify-between'}>
          <div className="text-sm text-industrial-gray">{t('admin.orders.bulk.selected', { count: String(selectedIds.length) })}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={()=>{ setBulkMode(true); setShipOpen(true) }}
              className={adminButtonPrimaryClass}
            >
              {t('admin.orders.bulk.shipSelected')}
            </button>
            <button
              onClick={bulkCancelShipping}
              className="px-3 md:h-12 h-11 rounded-md border border-red-200 bg-red-50 hover:border-red-400 text-sm whitespace-nowrap text-red-700"
              title={t('admin.orders.tooltips.cancelBulkShipping')}
            >
              {t('admin.orders.bulk.cancelShipping')}
            </button>
            <button onClick={()=>setSelectedIds([])} className="px-3 py-2 rounded border border-gray-200">{t('admin.orders.bulk.clearSelection')}</button>
          </div>
        </div>
      )}

      {/* Table */}
      <section className="bg-white rounded-lg shadow-hvac-md overflow-auto">
        {error && (
          <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>
        )}
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className={`${adminTableHeadCellClass} ${headPad}`}></th>
              {visibleCols.id && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('id')}>{t('admin.orders.table.orderId')} {sortIndicator('id')}</button></th>)}
              {visibleCols.status && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('status')}>{t('admin.orders.table.status')} {sortIndicator('status')}</button></th>)}
              {visibleCols.conversation && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('conversation')}>{t('admin.orders.table.conversationId')} {sortIndicator('conversation')}</button></th>)}
              {visibleCols.amount && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('amount')}>{t('admin.orders.table.amount')} {sortIndicator('amount')}</button></th>)}
              {visibleCols.created && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('created')}>{t('admin.orders.table.created')} {sortIndicator('created')}</button></th>)}
              <th className={`${adminTableHeadCellClass} ${headPad}`}>{t('admin.orders.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={colCount}>{t('admin.orders.states.loading')}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={colCount}>{t('admin.orders.states.noRecords')}</td></tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e)=>{
                    setSelectedIds(prev => e.target.checked ? [...new Set([...prev, r.id])] : prev.filter(x=>x!==r.id))
                  }} /></td>
                  {visibleCols.id && (<td className={`px-4 ${density==='compact'?'py-2':'py-3'} font-mono text-xs`}>{r.id}</td>)}
                  {visibleCols.status && (<td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}><span className={badgeClass(r.status)}>{prettyStatus(r.status, t)}</span></td>)}
                  {visibleCols.conversation && (<td className={`px-4 ${density==='compact'?'py-2':'py-3'} text-xs text-industrial-gray`}>{r.conversation_id || '-'}</td>)}
                  {visibleCols.amount && (<td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}>{formatAmount(r.total_amount, lang)}</td>)}
                  {visibleCols.created && (<td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}>{safeDate(r.created_at, lang)}</td>)}
                  <td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}>
                        <div className="flex gap-2">
                      <button
                        onClick={() => openShipModal(r.id)}
                        className="text-xs px-2 py-1 rounded bg-primary-navy text-white hover:opacity-90"
                        title={t('admin.orders.tooltips.shipping')}
                      >
                        {t('admin.orders.actions.shipping')}
                      </button>
                      <button
                        onClick={() => openLogsModal(r.id)}
                        className="text-xs px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600"
                        title={t('admin.orders.tooltips.logs')}
                      >
                        {t('admin.orders.actions.logs')}
                      </button>
                      <button
                        onClick={() => openNotesModal(r.id)}
                        className="text-xs px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-800"
                        title={t('admin.orders.tooltips.notes')}
                      >
                        {t('admin.orders.actions.notes')}
                      </button>
                      {r.status === 'shipped' && (
                        <button
                          onClick={() => cancelShipping(r.id)}
                          className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                          title={t('admin.orders.tooltips.cancelShipping')}
                        >
                          {t('admin.orders.actions.cancel')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {shipOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className={adminCardPaddedClass + ' w-full max-w-lg'}>
            <h3 className="text-lg font-semibold text-industrial-gray mb-2">{bulkMode ? t('admin.orders.modals.shipping.bulkTitle') : t('admin.orders.modals.shipping.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-industrial-gray mb-1">{t('admin.orders.modals.shipping.carrierLabel')}</label>
                <select value={carrier} onChange={e=>setCarrier(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2">
                  <option value="">{t('admin.orders.modals.shipping.carrierSelect')}</option>
                  <option value="Yurtiçi">{t('admin.orders.modals.shipping.carriers.yurtici')}</option>
                  <option value="Aras">{t('admin.orders.modals.shipping.carriers.aras')}</option>
                  <option value="MNG">{t('admin.orders.modals.shipping.carriers.mng')}</option>
                  <option value="PTT">{t('admin.orders.modals.shipping.carriers.ptt')}</option>
                  <option value="UPS">{t('admin.orders.modals.shipping.carriers.ups')}</option>
                  <option value="FedEx">{t('admin.orders.modals.shipping.carriers.fedex')}</option>
                  <option value="DHL">{t('admin.orders.modals.shipping.carriers.dhl')}</option>
                  <option value="Diğer">{t('admin.orders.modals.shipping.carriers.other')}</option>
                </select>
                {carrier === 'Diğer' && (
                  <input onChange={e=>setCarrier(e.target.value)} placeholder={t('admin.orders.modals.shipping.otherPlaceholder')} className="w-full border border-gray-200 rounded px-3 py-2 mt-2" />
                )}
              </div>
              <div>
                <label className="block text-xs text-industrial-gray mb-1">{t('admin.orders.modals.shipping.trackingLabel')}</label>
                <input value={tracking} onChange={e=>setTracking(e.target.value)} placeholder={t('admin.orders.modals.shipping.trackingPlaceholder')} className="w-full border border-gray-200 rounded px-3 py-2" />
              </div>
            </div>
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-steel-gray">
              <input type="checkbox" checked={sendEmail} onChange={e=>setSendEmail(e.target.checked)} />
              {t('admin.orders.modals.shipping.sendEmailLabel')}
            </label>
            {bulkMode && (
              <div className="mt-3">
                <label className="inline-flex items-center gap-2 text-sm text-steel-gray">
                  <input type="checkbox" checked={advBulk} onChange={e=>setAdvBulk(e.target.checked)} />
                  {t('admin.orders.modals.shipping.advancedLabel')}
                </label>
                {advBulk && (
                  <div className="mt-3 border border-gray-100 rounded overflow-auto max-h-[40vh]">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left">{t('admin.orders.modals.shipping.advancedTable.orderId')}</th>
                          <th className="px-2 py-2 text-left">{t('admin.orders.modals.shipping.advancedTable.carrier')}</th>
                          <th className="px-2 py-2 text-left">{t('admin.orders.modals.shipping.advancedTable.tracking')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {advRows.map((r,i)=>(
                          <tr key={r.id} className="border-t">
                            <td className="px-2 py-1 font-mono">{r.id}</td>
                            <td className="px-2 py-1"><input value={r.carrier} onChange={e=>setAdvRows(rows=>{ const c=[...rows]; c[i]={...c[i], carrier:e.target.value}; return c })} className="w-full border border-gray-200 rounded px-2 py-1" /></td>
                            <td className="px-2 py-1"><input value={r.tracking} onChange={e=>setAdvRows(rows=>{ const c=[...rows]; c[i]={...c[i], tracking:e.target.value}; return c })} className="w-full border border-gray-200 rounded px-2 py-1" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={closeShipModal} className="px-3 py-2 rounded border border-gray-200">{t('admin.orders.modals.shipping.cancel')}</button>
              <button onClick={submitShip} disabled={saving || (!bulkMode && (!carrier.trim() || !tracking.trim()))} className={adminButtonPrimaryClass}>{saving ? t('admin.orders.modals.shipping.saving') : t('admin.orders.modals.shipping.save')}</button>
            </div>
          </div>
        </div>
      )}

      {logsOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className={adminCardPaddedClass + ' w-full max-w-2xl'}>
            <h3 className="text-lg font-semibold text-industrial-gray mb-2">{t('admin.orders.modals.logs.title')}</h3>
            <div className="text-xs text-industrial-gray mb-3">{t('admin.orders.modals.logs.orderLabel')} <span className="font-mono">{logsOrderId}</span></div>
            <div className="max-h-[60vh] overflow-auto border border-gray-100 rounded">
              {logsLoading ? (
                <div className="p-4 text-sm text-steel-gray">{t('admin.ui.loadingShort')}</div>
              ) : (emailLogs.length === 0 ? (
                <div className="p-4 text-sm text-steel-gray">{t('admin.orders.modals.logs.noRecords')}</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className={`${adminTableHeadCellClass}`}>{t('admin.orders.modals.logs.table.date')}</th>
                      <th className={`${adminTableHeadCellClass}`}>{t('admin.orders.modals.logs.table.to')}</th>
                      <th className={`${adminTableHeadCellClass}`}>{t('admin.orders.modals.logs.table.subject')}</th>
                      <th className={`${adminTableHeadCellClass}`}>{t('admin.orders.modals.logs.table.carrier')}</th>
                      <th className={`${adminTableHeadCellClass}`}>{t('admin.orders.modals.logs.table.tracking')}</th>
                      <th className={`${adminTableHeadCellClass}`}>{t('admin.orders.modals.logs.table.messageId')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailLogs.map((l, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-3 py-2 whitespace-nowrap">{safeDate(l.created_at)}</td>
                        <td className="px-3 py-2">{l.email_to}</td>
                        <td className="px-3 py-2">{l.subject}</td>
                        <td className="px-3 py-2">{l.carrier || '-'}</td>
                        <td className="px-3 py-2">{l.tracking_number || '-'}</td>
                        <td className="px-3 py-2 text-xs text-industrial-gray">{l.provider_message_id || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={closeLogsModal} className="px-3 py-2 rounded border border-gray-200">{t('admin.orders.modals.logs.close')}</button>
            </div>
          </div>
        </div>
      )}

      {notesOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className={adminCardPaddedClass + ' w-full max-w-xl'}>
            <h3 className="text-lg font-semibold text-industrial-gray mb-2">{t('admin.orders.modals.notes.title')}</h3>
            <div className="flex items-center gap-2 mb-3">
              <input value={noteInput} onChange={e=>setNoteInput(e.target.value)} placeholder={t('admin.orders.modals.notes.inputPlaceholder')} className="flex-1 border border-gray-200 rounded px-3 py-2" />
              <button onClick={addNote} disabled={notesLoading || !noteInput.trim()} className={adminButtonPrimaryClass}>{notesLoading ? t('admin.orders.modals.notes.adding') : t('admin.orders.modals.notes.add')}</button>
            </div>
            <div className="max-h-[50vh] overflow-auto border border-gray-100 rounded">
              {notesLoading ? (
                <div className="p-4 text-sm text-steel-gray">{t('admin.ui.loadingShort')}</div>
              ) : (notes.length === 0 ? (
                <div className="p-4 text-sm text-steel-gray">{t('admin.orders.modals.notes.noRecords')}</div>
              ) : (
                <ul className="divide-y">
                  {notes.map((n) => (
                    <li key={n.id} className="px-3 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm text-industrial-gray">{n.note}</div>
                        <button onClick={() => deleteNote(n.id)} className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">{t('admin.orders.modals.notes.delete')}</button>
                      </div>
                      <div className="text-xs text-steel-gray">{safeDate(n.created_at)}</div>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={closeNotesModal} className="px-3 py-2 rounded border border-gray-200">{t('admin.orders.modals.notes.close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatAmount(v?: number | null, lang: 'tr' | 'en' = 'tr') {
  if (typeof v === 'number') return formatCurrency(v, lang, { maximumFractionDigits: 0 })
  return '-'
}

function safeDate(iso: string, lang: 'tr' | 'en' = 'tr') {
  try { return formatDateTime(iso, lang) } catch { return iso }
}

function prettyStatus(s: string, t: (key: string, params?: Record<string, string>) => string) {
  switch (s) {
    case 'paid': return t('admin.orders.statusLabels.paid')
    case 'confirmed': return t('admin.orders.statusLabels.confirmed')
    case 'shipped': return t('admin.orders.statusLabels.shipped')
    case 'cancelled': return t('admin.orders.statusLabels.cancelled')
    case 'refunded': return t('admin.orders.statusLabels.refunded')
    case 'partial_refunded': return t('admin.orders.statusLabels.partialRefunded')
    default: return s
  }
}

function badgeClass(s: string) {
  const base = 'inline-block text-xs px-2 py-1 rounded'
  switch (s) {
    case 'paid': return `${base} bg-green-100 text-green-700`
    case 'confirmed': return `${base} bg-blue-100 text-blue-700`
    case 'shipped': return `${base} bg-indigo-100 text-indigo-700`
    case 'cancelled': return `${base} bg-gray-200 text-gray-700`
    case 'refunded': return `${base} bg-red-100 text-red-700`
    case 'partial_refunded': return `${base} bg-amber-100 text-amber-700`
    default: return `${base} bg-gray-100 text-gray-700`
  }
}

// Shipping modal state and handlers
function generateTrackingUrl(carrier: string, tracking: string): string | null {
  const c = (carrier || '').toLowerCase()
  if (c.includes('yurtiçi') || c.includes('yurtici')) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${tracking}`
  if (c.includes('aras')) return `https://kargotakip.araskargo.com.tr/tarama.aspx?code=${tracking}`
  if (c.includes('mng')) return `https://www.mngkargo.com.tr/kargotakip?kargono=${tracking}`
  if (c.includes('ptt')) return `https://gonderitakip.ptt.gov.tr/?kargonumarasi=${tracking}`
  if (c.includes('ups')) return `https://www.ups.com/track?tracknum=${tracking}`
  if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?tracknumbers=${tracking}`
  if (c.includes('dhl')) return `https://www.dhl.com.tr/tr/express/takip.html?brand=DHL&AWB=${tracking}`
  return null
}

export default AdminOrdersPage
