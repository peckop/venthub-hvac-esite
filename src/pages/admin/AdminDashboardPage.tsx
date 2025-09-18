import React from 'react'
import { adminSectionTitleClass, adminCardPaddedClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'

const AdminDashboardPage: React.FC = () => {
  const { lang } = useI18n()

  type Range = 'today' | '7d' | '30d'
  const [range, setRange] = React.useState<Range>('today')

  const [ordersCount, setOrdersCount] = React.useState<number | null>(null)
  const [salesTotal, setSalesTotal] = React.useState<number | null>(null)
  const [pendingReturns, setPendingReturns] = React.useState<number | null>(null)
  const [pendingShipments, setPendingShipments] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  const rangeStartISO = React.useMemo(() => {
    const now = new Date()
    if (range === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return start.toISOString()
    }
    const days = range === '7d' ? 7 : 30
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return start.toISOString()
  }, [range])

  const loadKPIs = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Orders count and sales total within range
      const ordersQuery = supabase
        .from('venthub_orders')
        .select('id, total_amount, created_at', { count: 'exact' })
        .gte('created_at', rangeStartISO)

      const [ordersRes, returnsRes, shipRes] = await Promise.all([
        ordersQuery,
        // Pending returns (not time-bound): requested/approved/in_transit/received (refund bekleniyor olabilir)
        supabase
          .from('venthub_returns')
          .select('id', { count: 'exact', head: true })
          .in('status', ['requested', 'approved', 'in_transit', 'received']),
        // Pending shipments: not shipped yet and status confirmed/processing
        supabase
          .from('venthub_orders')
          .select('id', { count: 'exact', head: true })
          .is('shipped_at', null)
          .in('status', ['confirmed', 'processing'])
      ])

      if (ordersRes.error) throw ordersRes.error

      const list = (ordersRes.data || []) as Array<{ id: string; total_amount?: number | string | null }>
      const sum = list.reduce((acc, it) => acc + Number(it.total_amount || 0), 0)
      setOrdersCount(typeof ordersRes.count === 'number' ? ordersRes.count : list.length)
      setSalesTotal(sum)

      if (returnsRes.error) throw returnsRes.error
      if (shipRes.error) throw shipRes.error

      setPendingReturns(returnsRes.count ?? 0)
      setPendingShipments(shipRes.count ?? 0)
    } catch (e) {
      setError((e as Error).message || 'Yüklenemedi')
      setOrdersCount(null)
      setSalesTotal(null)
      setPendingReturns(null)
      setPendingShipments(null)
    } finally {
      setLoading(false)
    }
  }, [rangeStartISO])

  React.useEffect(() => { loadKPIs() }, [loadKPIs])

  const RangeButton: React.FC<{ value: Range; label: string }> = ({ value, label }) => (
    <button
      onClick={() => setRange(value)}
      className={`px-3 py-1.5 rounded border text-sm ${range === value ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-steel-gray border-light-gray hover:border-primary-navy'}`}
    >{label}</button>
  )

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className={adminSectionTitleClass}>Dashboard</h1>
          <p className="text-industrial-gray text-sm">Hızlı bakış ve son hareketler</p>
        </div>
        <div className="flex items-center gap-2">
          <RangeButton value="today" label="Bugün" />
          <RangeButton value="7d" label="7 Gün" />
          <RangeButton value="30d" label="30 Gün" />
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">{error}</div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">Sipariş Adedi</div>
          <div className="text-2xl font-semibold">{loading ? '…' : (ordersCount ?? '-')}</div>
        </div>
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">Satış Toplamı</div>
          <div className="text-2xl font-semibold">{loading ? '…' : (salesTotal != null ? formatCurrency(salesTotal, lang) : '-')}</div>
        </div>
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">Bekleyen İade</div>
          <div className="text-2xl font-semibold">{loading ? '…' : (pendingReturns ?? '-')}</div>
        </div>
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">Bekleyen Kargo</div>
          <div className="text-2xl font-semibold">{loading ? '…' : (pendingShipments ?? '-')}</div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-hvac-md p-4">
        <div className="text-sm text-industrial-gray">Sprint 2: Sipariş istatistikleri ve kısa raporlar bu alanda gösteriliyor.</div>
      </section>
    </div>
  )
}

export default AdminDashboardPage
