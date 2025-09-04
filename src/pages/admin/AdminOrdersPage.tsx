import React from 'react'
import { format } from 'date-fns'
import { adminSectionTitleClass, adminButtonPrimaryClass, adminTableHeadCellClass, adminCardPaddedClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'

// Minimal order type matching admin-orders-latest edge function response
interface AdminOrderRow {
  id: string
  status: 'pending' | 'paid' | 'confirmed' | 'shipped' | 'cancelled' | 'refunded' | 'partial_refunded' | string
  conversation_id?: string | null
  total_amount?: number | null
  created_at: string
}

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
  const [rows, setRows] = React.useState<AdminOrderRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

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
      params.set('limit', '50')
      const url = `${supabaseUrl}/functions/v1/admin-orders-latest?${params.toString()}`
      const resp = await fetch(url, { method: 'GET' })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data: unknown = await resp.json()
      const list = Array.isArray((data as { rows?: unknown })?.rows) ? ((data as { rows?: AdminOrderRow[] }).rows as AdminOrderRow[]) : []
      setRows(list)
    } catch (e) {
      const msg = (e as Error).message || 'Yüklenemedi'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [status, fromDate, toDate, debouncedQuery])

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

  const submitShip = async () => {
    // Single or bulk mode submission
    if (!bulkMode) {
      if (!shipId) return
      const isShipped = rows.find(r => r.id === shipId)?.status === 'shipped'
      if (!isShipped && (!carrier.trim() || !tracking.trim())) return
      setSaving(true)
      try {
        const tracking_url = carrier && tracking ? generateTrackingUrl(carrier, tracking) : null
        type PartialOrderUpdate = { carrier?: string; tracking_number?: string; tracking_url?: string | null; shipped_at?: string; status?: string }
        const base: PartialOrderUpdate = { carrier: carrier.trim(), tracking_number: tracking.trim(), tracking_url }
        const updateData: PartialOrderUpdate = isShipped ? base : { ...base, shipped_at: new Date().toISOString(), status: 'shipped' }
        const { error } = await supabase
          .from('venthub_orders')
          .update(updateData)
          .eq('id', shipId)
        if (error) throw error
        setRows(prev => prev.map(r => r.id === shipId ? { ...r, status: isShipped ? r.status : 'shipped' } : r))
        if (sendEmail && carrier && tracking) {
          try {
            const supabaseUrl = ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || 'https://tnofewwkwlyjsqgwjjga.supabase.co'
            await fetch(`${supabaseUrl}/functions/v1/shipping-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_id: shipId, customer_email: '', customer_name: '', order_number: '', carrier: carrier.trim(), tracking_number: tracking.trim(), tracking_url })
            })
          } catch {}
        }
        setShipOpen(false)
      } catch (e) {
        console.error('ship error', e)
        alert('Kargo güncellenemedi')
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
      type PartialOrderUpdate = { carrier?: string; tracking_number?: string; tracking_url?: string | null; shipped_at?: string; status?: string }
      const base: PartialOrderUpdate = {}
      if (carrier.trim()) base.carrier = carrier.trim()
      if (tracking.trim()) base.tracking_number = tracking.trim()
      if (tracking_url) base.tracking_url = tracking_url
      const updateData: PartialOrderUpdate = { ...base, shipped_at: new Date().toISOString(), status: 'shipped' }
      const { error } = await supabase
        .from('venthub_orders')
        .update(updateData)
        .in('id', targets)
      if (error) throw error
      setRows(prev => prev.map(r => targets.includes(r.id) ? { ...r, status: 'shipped' } : r))
      if (sendEmail && carrier && tracking) {
        try {
          const supabaseUrl = ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || 'https://tnofewwkwlyjsqgwjjga.supabase.co'
          await Promise.all(targets.map(id => fetch(`${supabaseUrl}/functions/v1/shipping-notification`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: id, customer_email: '', customer_name: '', order_number: '', carrier: carrier.trim(), tracking_number: tracking.trim(), tracking_url })
          })))
        } catch {}
      }
      setShipOpen(false)
      setSelectedIds([])
      setBulkMode(false)
    } catch (e) {
      console.error('bulk ship error', e)
      alert('Toplu kargo güncellenemedi')
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

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className={adminSectionTitleClass}>Siparişler</h1>
        <button
          onClick={fetchOrders}
          className={adminButtonPrimaryClass}
          disabled={loading}
        >
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </header>

      {/* Filters */}
      <section className="bg-white rounded-lg shadow-hvac-md p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-industrial-gray mb-1">Durum</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2"
          >
            {STATUSES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-industrial-gray mb-1">Başlangıç</label>
          <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-industrial-gray mb-1">Bitiş</label>
          <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-industrial-gray mb-1">Arama</label>
          <input
            placeholder="Order ID veya Conversation ID"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2"
          />
        </div>
      </section>

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
              <th className={adminTableHeadCellClass}></th>
              <th className={adminTableHeadCellClass}>Order ID</th>
              <th className={adminTableHeadCellClass}>Durum</th>
              <th className={adminTableHeadCellClass}>Conversation</th>
              <th className={adminTableHeadCellClass}>Tutar</th>
              <th className={adminTableHeadCellClass}>Oluşturma</th>
              <th className={adminTableHeadCellClass}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={5}>Yükleniyor...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={5}>Kayıt bulunamadı</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e)=>{
                    setSelectedIds(prev => e.target.checked ? [...new Set([...prev, r.id])] : prev.filter(x=>x!==r.id))
                  }} /></td>
                  <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                  <td className="px-4 py-3">
                    <span className={badgeClass(r.status)}>{prettyStatus(r.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-industrial-gray">{r.conversation_id || '-'}</td>
                  <td className="px-4 py-3">{formatAmount(r.total_amount)}</td>
                  <td className="px-4 py-3">{safeDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openShipModal(r.id)}
                      className="text-xs px-2 py-1 rounded bg-primary-navy text-white hover:opacity-90"
                    >
                      Kargo
                    </button>
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
