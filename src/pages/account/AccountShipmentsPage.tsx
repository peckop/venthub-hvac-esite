import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { useNavigate } from 'react-router-dom'
import { Package, Link as LinkIcon, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShipmentRow {
  id: string
  created_at: string
  order_number?: string | null
  total_amount: number | string
  status: string
  carrier?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
  shipped_at?: string | null
  delivered_at?: string | null
}

export default function AccountShipmentsPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [rows, setRows] = useState<ShipmentRow[]>([])
  const [loading, setLoading] = useState(true)

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
        if (error && (((error as any).code === 'PGRST100') || ((error as any).status === 400))) {
          const fallback = await supabase
            .from('venthub_orders')
            .select('id, created_at, total_amount, status, order_number')
            .eq('user_id', user?.id || '')
            .order('created_at', { ascending: false })
          data = fallback.data as any
          error = fallback.error as any
        }
        if (error) throw error
        const items = (data || []) as ShipmentRow[]
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
    return new Date(d).toLocaleString('tr-TR')
  }

  const formatPrice = (price: number | string) => {
    const n = Number(price) || 0
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)
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

  if (loading) {
    return (
      <div className="min-h-[30vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy"/>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-industrial-gray mb-4">{t('orders.shippingInfo') || 'Kargo Takibi'}</h2>
      {rows.length === 0 ? (
        <div className="text-sm text-steel-gray">{t('orders.noShippingInfo') || 'Kargo bilgisi bulunmuyor.'}</div>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => (
            <div key={o.id} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-navy text-white rounded-full w-10 h-10 flex items-center justify-center">
                    <Package size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-industrial-gray">
                      {o.order_number ? `#${o.order_number.split('-')[1]}` : `#${o.id.slice(-8).toUpperCase()}`}
                    </div>
                    <div className="text-xs text-steel-gray">{new Date(o.created_at).toLocaleDateString('tr-TR')} • {formatPrice(o.total_amount)}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/account/orders?open=${o.id}&tab=shipping`)}
                  className="text-sm text-primary-navy hover:underline"
                >
                  {t('orders.details')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
                <div>
                  <div className="text-steel-gray">{t('orders.carrier')}</div>
                  <div className="font-medium text-industrial-gray">{o.carrier || '-'}</div>
                </div>
                <div>
                  <div className="text-steel-gray">{t('orders.trackingNumber')}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-industrial-gray break-all">{o.tracking_number || '-'}</span>
                    {o.tracking_number && (
                      <button onClick={() => handleCopy(o.tracking_number)} className="text-xs text-primary-navy hover:underline flex items-center gap-1"><Copy size={12}/>{t('orders.copy')}</button>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-steel-gray">{t('orders.trackingLink')}</div>
                  {o.tracking_url ? (
                    <a href={o.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary-navy hover:underline break-all inline-flex items-center gap-1"><LinkIcon size={14}/>{t('orders.openLink')}</a>
                  ) : (
                    <div className="text-industrial-gray">-</div>
                  )}
                </div>
                <div>
                  <div className="text-steel-gray">{t('orders.shippedAt')}</div>
                  <div className="font-medium text-industrial-gray">{formatDate(o.shipped_at)}</div>
                </div>
                <div>
                  <div className="text-steel-gray">{t('orders.deliveredAt')}</div>
                  <div className="font-medium text-industrial-gray">{formatDate(o.delivered_at)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

