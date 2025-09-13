import React from 'react'
import { format } from 'date-fns'
import { adminSectionTitleClass, adminButtonPrimaryClass, adminTableHeadCellClass, adminCardPaddedClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ExportMenu from '../../components/admin/ExportMenu'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import { logAdminAction } from '../../lib/audit'
import { useI18n } from '../../i18n/I18nProvider'
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

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'Tümü' },
  { value: 'paid', label: 'Ödendi' },
  { value: 'confirmed', label: 'Onaylı' },
  { value: 'shipped', label: 'Kargolandı' },
  { value: 'cancelled', label: 'İptal' },
  { value: 'refunded', label: 'İade' },
  { value: 'partial_refunded', label: 'Kısmi İade' },
]

const AdminOrdersPage: React.FC = () => {
  const { t } = useI18n()
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

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

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
      params.set('limit', String(PAGE_SIZE))
      params.set('page', String(page))
      const url = `${supabaseUrl}/functions/v1/admin-orders-latest?${params.toString()}`
      const resp = await fetch(url, { method: 'GET' })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = (await resp.json()) as { rows?: AdminOrderRow[]; total?: number }
      const list = Array.isArray(data?.rows) ? data.rows as AdminOrderRow[] : []
      setRows(list)
      setTotal(Number(data?.total || 0))
    } catch (e) {
      const msg = (e as Error).message || 'Yüklenemedi'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [status, fromDate, toDate, debouncedQuery, page])

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

  async function cancelShipping(id: string) {
    if (!id) return
    const ok = window.confirm('Kargo iptal edilsin mi? Bu işlem durumu "Onaylı" yapar ve takip bilgilerini siler.')
    if (!ok) return
    try {
      setSaving(true)
      const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', {
        body: { order_id: id, cancel: true, send_email: false }
      })
      if (fnErr) throw fnErr
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r))
      toast.success('Kargo iptal edildi')
    } catch (e) {
      console.error('cancel ship error', e)
      toast.error('Kargo iptali yapılamadı')
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
        alert('Kargo firması ve takip numarası gerekli')
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
        toast.success(isShipped ? 'Kargo bilgileri kaydedildi' : 'Sipariş kargoya verildi')
      } catch (e) {
        console.error('ship error', e)
        toast.error('Kargo güncellenemedi')
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
      const tracking_url = carrier && tracking ? generateTrackingUrl(carrier, tracking) : null
      // Call edge function per id
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
      // Audit log (bulk)
      await logAdminAction(supabase, targets.map(id => ({
        table_name: 'venthub_orders',
        row_pk: id,
        action: 'UPDATE',
        before: { status: rows.find(r => r.id === id)?.status },
        after: { status: 'shipped', carrier: carrier || undefined, tracking_number: tracking || undefined },
        comment: 'bulk shipment update'
      })))
      setRows(prev => prev.map(r => targets.includes(r.id) ? { ...r, status: 'shipped' } : r))
      setShipOpen(false)
      toast.success(`${targets.length} sipariş kargolandı`)
      setSelectedIds([])
      setBulkMode(false)
    } catch (e) {
      console.error('bulk ship error', e)
      toast.error('Toplu kargo güncellenemedi')
    } finally {
      setSaving(false)
    }
  }

  // Also apply client-side filtering as a fallback (until function is deployed everywhere)
  const filtered = React.useMemo(() => {
    return rows.filter((r) => {
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
  }, [rows, status, fromDate, toDate, debouncedQuery])

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

  // Export helpers
  function exportOrdersCsv() {
    const header = ['Sipariş ID','Durum','Konuşma ID','Tutar','Oluşturulma']
    const lines = filtered.map(r => {
      const cols = [
        r.id,
        r.status,
        r.conversation_id || '',
        formatAmount(r.total_amount),
        safeDate(r.created_at),
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
        `<td>${formatAmount(r.total_amount)}</td>`+
        `<td>${safeDate(r.created_at)}</td>`+
      `</tr>`
    )).join('')
    const table = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr><th>Sipariş ID</th><th>Durum</th><th>Konuşma ID</th><th>Tutar</th><th>Oluşturulma</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`
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
        search={{ value: query, onChange: setQuery, placeholder: 'Order ID veya Conversation ID', focusShortcut: '/' }}
        select={{
          value: status,
          onChange: setStatus,
          title: 'Durum',
          options: STATUSES.map(s => ({ value: s.value, label: s.label }))
        }}
        onClear={()=>{ setStatus(''); setFromDate(''); setToDate(''); setQuery(''); setPage(1) }}
        recordCount={total}
        rightExtra={(
          <div className="flex items-center gap-2">
            <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white" title="Başlangıç" />
            <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white" title="Bitiş" />
            <ExportMenu items={[{ key: 'csv', label: 'CSV (Excel uyumlu UTF‑8 BOM)', onSelect: exportOrdersCsv }, { key: 'xls', label: 'Excel (.xls — HTML tablo)', onSelect: exportOrdersXls }]} />
            <ColumnsMenu
              columns={[
                { key: 'id', label: 'Sipariş ID', checked: visibleCols.id, onChange: (v)=>setVisibleCols(s=>({ ...s, id: v })) },
                { key: 'status', label: 'Durum', checked: visibleCols.status, onChange: (v)=>setVisibleCols(s=>({ ...s, status: v })) },
                { key: 'conversation', label: 'Konuşma ID', checked: visibleCols.conversation, onChange: (v)=>setVisibleCols(s=>({ ...s, conversation: v })) },
                { key: 'amount', label: 'Tutar', checked: visibleCols.amount, onChange: (v)=>setVisibleCols(s=>({ ...s, amount: v })) },
                { key: 'created', label: 'Oluşturulma', checked: visibleCols.created, onChange: (v)=>setVisibleCols(s=>({ ...s, created: v })) },
              ]}
              density={density}
              onDensityChange={setDensity}
            />
            <button onClick={fetchOrders} disabled={loading} className="px-3 md:h-12 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap">{loading ? 'Yükleniyor…' : 'Yenile'}</button>
          </div>
        )}
      />

      {/* Pagination controls */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 md:h-12 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap disabled:opacity-50"
        >Önceki</button>
        <span className="text-sm text-steel-gray">Sayfa {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))}
          className="px-3 md:h-12 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap disabled:opacity-50"
        >Sonraki</button>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className={adminCardPaddedClass + ' flex items-center justify-between'}>
          <div className="text-sm text-industrial-gray">Seçili: {selectedIds.length}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={()=>{ setBulkMode(true); setShipOpen(true) }}
              className={adminButtonPrimaryClass}
            >
              Seçilenleri Kargoya Ver
            </button>
            <button onClick={()=>setSelectedIds([])} className="px-3 py-2 rounded border border-gray-200">Temizle</button>
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
              {visibleCols.id && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('id')}>Sipariş ID {sortIndicator('id')}</button></th>)}
              {visibleCols.status && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('status')}>Durum {sortIndicator('status')}</button></th>)}
              {visibleCols.conversation && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('conversation')}>Konuşma ID {sortIndicator('conversation')}</button></th>)}
              {visibleCols.amount && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('amount')}>Tutar {sortIndicator('amount')}</button></th>)}
              {visibleCols.created && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('created')}>Oluşturma Tarihi {sortIndicator('created')}</button></th>)}
              <th className={`${adminTableHeadCellClass} ${headPad}`}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={colCount}>Yükleniyor...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={colCount}>Kayıt bulunamadı</td></tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e)=>{
                    setSelectedIds(prev => e.target.checked ? [...new Set([...prev, r.id])] : prev.filter(x=>x!==r.id))
                  }} /></td>
                  {visibleCols.id && (<td className={`px-4 ${density==='compact'?'py-2':'py-3'} font-mono text-xs`}>{r.id}</td>)}
                  {visibleCols.status && (<td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}><span className={badgeClass(r.status)}>{prettyStatus(r.status)}</span></td>)}
                  {visibleCols.conversation && (<td className={`px-4 ${density==='compact'?'py-2':'py-3'} text-xs text-industrial-gray`}>{r.conversation_id || '-'}</td>)}
                  {visibleCols.amount && (<td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}>{formatAmount(r.total_amount)}</td>)}
                  {visibleCols.created && (<td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}>{safeDate(r.created_at)}</td>)}
                  <td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openShipModal(r.id)}
                        className="text-xs px-2 py-1 rounded bg-primary-navy text-white hover:opacity-90"
                        title="Kargo bilgisi ekle / düzenle"
                      >
                        Kargo
                      </button>
                      {r.status === 'shipped' && (
                        <button
                          onClick={() => cancelShipping(r.id)}
                          className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                          title="Kargoyu iptal et"
                        >
                          İptal
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
            <h3 className="text-lg font-semibold text-industrial-gray mb-2">{bulkMode ? 'Toplu: Kargoya Ver' : 'Kargoya Ver / Takip No'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-industrial-gray mb-1">Kargo Firması</label>
                <input value={carrier} onChange={e=>setCarrier(e.target.value)} placeholder="Yurtiçi, Aras, MNG..." className="w-full border border-gray-200 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-industrial-gray mb-1">Takip Numarası</label>
                <input value={tracking} onChange={e=>setTracking(e.target.value)} placeholder="Takip numarası" className="w-full border border-gray-200 rounded px-3 py-2" />
              </div>
            </div>
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-steel-gray">
              <input type="checkbox" checked={sendEmail} onChange={e=>setSendEmail(e.target.checked)} />
              Müşteriye e-posta bildirimi gönder
            </label>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={closeShipModal} className="px-3 py-2 rounded border border-gray-200">İptal</button>
              <button onClick={submitShip} disabled={saving || !carrier.trim() || !tracking.trim()} className={adminButtonPrimaryClass}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatAmount(v?: number | null) {
  if (typeof v === 'number') return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v)
  return '-'
}

function safeDate(iso: string) {
  try { return format(new Date(iso), 'dd.MM.yyyy HH:mm') } catch { return iso }
}

function prettyStatus(s: string) {
  switch (s) {
    case 'paid': return 'Ödendi'
    case 'confirmed': return 'Onaylı'
    case 'shipped': return 'Kargolandı'
    case 'cancelled': return 'İptal'
    case 'refunded': return 'İade'
    case 'partial_refunded': return 'Kısmi İade'
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
