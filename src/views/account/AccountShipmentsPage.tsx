import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDate as formatOnlyDate } from '../../i18n/datetime'
import { useRouter } from 'next/navigation'
import { Truck, Package, Copy, ExternalLink, CheckCircle, Clock, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShipmentRow {
  id: string
  created_at: string
  order_number: string
  total_amount: number | string
  status: string
  carrier: string | null
  tracking_number: string | null
  tracking_url: string | null
  shipped_at: string | null
  delivered_at: string | null
}

interface SupabaseError {
  code?: string
  status?: number
  message?: string
}

type ShipFilter = 'all' | 'shipped' | 'delivered'

export default function AccountShipmentsPage() {
  const { user } = useAuth()
  const { t, lang } = useI18n()
  const router = useRouter()
  const [rows, setRows] = useState<ShipmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ShipFilter>('all')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const baseSelect = 'id, created_at, total_amount, status, order_number, carrier, tracking_number, tracking_url, shipped_at, delivered_at'
        let { data, error } = await supabase
          .from('venthub_orders')
          .select(baseSelect)
          .eq('user_id', user?.id || '')
          .order('created_at', { ascending: false })
        // Fallback: prod DB henüz shipping kolonları yoksa 400 dönebilir
        if (error && (((error as SupabaseError).code === 'PGRST100') || ((error as SupabaseError).status === 400))) {
          const fallback = await supabase
            .from('venthub_orders')
            .select('id, created_at, total_amount, status, order_number')
            .eq('user_id', user?.id || '')
            .order('created_at', { ascending: false })
          if (fallback.data) {
            data = fallback.data.map(item => ({
              ...item,
              carrier: null,
              tracking_number: null,
              tracking_url: null,
              shipped_at: null,
              delivered_at: null
            })) as typeof data
          }
          error = fallback.error
        }
        if (error) throw error
        const items = (data || []).map(item => ({
          ...item,
          order_number: item.order_number || item.id,
        })) as ShipmentRow[]
        // Only ones with any shipping info
        const filtered = items.filter(it => it.carrier || it.tracking_number || it.tracking_url || it.shipped_at || it.delivered_at)
        if (mounted) setRows(filtered)
      } catch (e) {
        console.error('Shipments load error:', e)
        toast.error(t('orders.unexpectedError'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (user) load()
    return () => { mounted = false }
  }, [user, t])

  const formatDate = (d?: string | null) => {
    if (!d) return '-'
    return formatOnlyDate(d, lang)
  }

  const formatPrice = (price: number | string) => {
    const n = Number(price) || 0
    return formatCurrency(n, lang, { maximumFractionDigits: 0 })
  }

  const handleCopy = async (text?: string | null) => {
    try {
      if (!text) return
      await navigator.clipboard.writeText(text)
      toast.success(t('orders.copied'))
    } catch {
      toast.error(t('orders.copyFailed'))
    }
  }

  const getShipStatus = (row: ShipmentRow): 'delivered' | 'shipped' | 'preparing' => {
    if (row.delivered_at) return 'delivered'
    if (row.shipped_at || row.tracking_number) return 'shipped'
    return 'preparing'
  }

  const getShipStatusBadge = (status: 'delivered' | 'shipped' | 'preparing') => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5" /> Teslim Edildi
          </span>
        )
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
            <Truck className="w-3.5 h-3.5" /> Kargoda
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
            <Clock className="w-3.5 h-3.5" /> Hazırlanıyor
          </span>
        )
    }
  }

  const shipSteps = [
    { key: 'preparing', label: 'Hazırlandı', icon: Package },
    { key: 'shipped', label: 'Kargoya Verildi', icon: Truck },
    { key: 'delivered', label: 'Teslim Edildi', icon: MapPin },
  ]

  const getStepIndex = (status: 'delivered' | 'shipped' | 'preparing') => {
    if (status === 'delivered') return 2
    if (status === 'shipped') return 1
    return 0
  }

  // Filtered
  const displayed = rows.filter(r => {
    if (filter === 'all') return true
    const s = getShipStatus(r)
    return s === filter
  })

  if (loading) {
    return (
      <div className="min-h-[30vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-navy/5 flex items-center justify-center text-primary-navy">
              <Truck size={20} />
            </div>
            {t('orders.shippingInfo') || 'Kargo Takibi'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Siparişlerinizin kargo durumunu ve takip bilgilerini buradan izleyebilirsiniz.</p>
        </div>
      </div>

      {/* Filter Bar */}
      {rows.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Durum:</span>
            {[
              { value: 'all' as ShipFilter, label: `Tümü (${rows.length})` },
              { value: 'shipped' as ShipFilter, label: `Kargoda (${rows.filter(r => getShipStatus(r) === 'shipped').length})` },
              { value: 'delivered' as ShipFilter, label: `Teslim Edildi (${rows.filter(r => getShipStatus(r) === 'delivered').length})` },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`h-8 px-4 rounded-lg text-xs font-bold transition-all border ${filter === opt.value
                  ? 'bg-primary-navy text-white border-primary-navy shadow-sm shadow-primary-navy/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-navy hover:text-primary-navy'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Henüz kargo bilgisi yok</h3>
          <p className="text-sm text-slate-500 mb-6">{t('orders.noShippingInfo') || 'Siparişlerinize kargo bilgisi eklendiğinde burada görünecektir.'}</p>
          <button
            onClick={() => router.push('/account/orders')}
            className="h-10 px-6 bg-primary-navy hover:bg-industrial-gray text-white font-bold rounded-lg shadow-sm shadow-primary-navy/20 transition-all hover:scale-[1.02] inline-flex items-center gap-2"
          >
            <Package size={16} /> Siparişlerime Git
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
          <p className="text-sm text-slate-500">Bu filtreye uygun kargo bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {displayed.map((o) => {
            const shipStatus = getShipStatus(o)
            const activeStepIdx = getStepIndex(shipStatus)
            const orderCode = o.order_number ? `#${o.order_number.split('-').pop()}` : `#${o.id.slice(-8).toUpperCase()}`

            return (
              <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary-navy/5 flex items-center justify-center text-primary-navy">
                        <Package size={20} />
                      </div>
                      <div>
                        <button
                          onClick={() => router.push(`/account/orders/detail?id=${o.id}`)}
                          className="text-base font-bold text-slate-900 hover:text-primary-navy transition-colors"
                        >
                          Sipariş {orderCode}
                        </button>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">{formatDate(o.created_at)} · {formatPrice(o.total_amount)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getShipStatusBadge(shipStatus)}
                      <button
                        onClick={() => router.push(`/account/orders/detail?id=${o.id}`)}
                        className="h-8 px-3 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:border-primary-navy hover:text-primary-navy rounded-lg transition-all shadow-sm"
                      >
                        Detay
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shipping Progress Stepper */}
                <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center justify-between max-w-lg mx-auto">
                    {shipSteps.map((step, idx) => {
                      const active = idx <= activeStepIdx
                      const StepIcon = step.icon
                      return (
                        <React.Fragment key={step.key}>
                          <div className="flex flex-col items-center min-w-[80px]">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${active ? 'bg-primary-navy text-white' : 'bg-white border border-slate-200 text-slate-400'
                              }`}>
                              <StepIcon size={14} />
                            </div>
                            <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${active ? 'text-primary-navy' : 'text-slate-400'}`}>
                              {step.label}
                            </span>
                          </div>
                          {idx < shipSteps.length - 1 && (
                            <div className={`flex-1 h-1 rounded-full mx-2 ${activeStepIdx >= idx + 1 ? 'bg-primary-navy' : 'bg-slate-200'}`} />
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Kargo Firması */}
                    <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-3.5">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('orders.carrier') || 'Kargo Firması'}</span>
                      <span className="text-sm font-bold text-slate-900">{o.carrier || '-'}</span>
                    </div>

                    {/* Takip Numarası */}
                    <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-3.5">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('orders.trackingNumber') || 'Takip No'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 break-all">{o.tracking_number || '-'}</span>
                        {o.tracking_number && (
                          <button onClick={() => handleCopy(o.tracking_number)} className="p-1 text-slate-400 hover:text-primary-navy transition-colors rounded" title="Kopyala">
                            <Copy size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Takip Linki */}
                    <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-3.5">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('orders.trackingLink') || 'Takip Bağlantısı'}</span>
                      {o.tracking_url ? (
                        <a href={o.tracking_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-navy hover:underline">
                          <ExternalLink size={13} /> Kargoyu Takip Et
                        </a>
                      ) : (
                        <span className="text-sm font-bold text-slate-400">-</span>
                      )}
                    </div>

                    {/* Kargoya Verilme */}
                    <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-3.5">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('orders.shippedAt') || 'Kargoya Verildi'}</span>
                      <span className="text-sm font-bold text-slate-900">{formatDate(o.shipped_at)}</span>
                    </div>

                    {/* Teslim Tarihi */}
                    <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-3.5">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('orders.deliveredAt') || 'Teslim Edildi'}</span>
                      <span className="text-sm font-bold text-slate-900">{formatDate(o.delivered_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
