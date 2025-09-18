import React from 'react'
import { adminSectionTitleClass, adminCardPaddedClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import { Link } from 'react-router-dom'

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
  const [dailyCounts, setDailyCounts] = React.useState<Array<{ date: string; count: number }>>([])
  const [recentOrders, setRecentOrders] = React.useState<Array<{ id: string; created_at: string; total_amount: number; status: string; order_number?: string | null }>>([])

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
        .select('id, total_amount, created_at, status, order_number', { count: 'exact' })
        .gte('created_at', rangeStartISO)
        .order('created_at', { ascending: false })
        .limit(500)

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

      const list = (ordersRes.data || []) as Array<{ id: string; total_amount?: number | string | null; created_at: string; status?: string | null; order_number?: string | null }>
      const sum = list.reduce((acc, it) => acc + Number(it.total_amount || 0), 0)
      setOrdersCount(typeof ordersRes.count === 'number' ? ordersRes.count : list.length)
      setSalesTotal(sum)

      // build daily counts (last N days depending on range, default 7 for visualization)
      const days = range === 'today' ? 1 : (range === '7d' ? 7 : 30)
      const byDay = new Map<string, number>()
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        byDay.set(key, 0)
      }
      list.forEach(o => {
        const key = new Date(o.created_at).toISOString().slice(0, 10)
        if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + 1)
      })
      const daily = Array.from(byDay.entries()).map(([date, count]) => ({ date, count }))
      setDailyCounts(daily)

      // recent orders (top 10)
      setRecentOrders(list.slice(0, 10).map(o => ({ id: o.id, created_at: o.created_at, total_amount: Number(o.total_amount || 0), status: o.status || 'pending', order_number: o.order_number || null })))

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
  }, [rangeStartISO, range])

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

      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">Ortalama Sepet</div>
          <div className="text-2xl font-semibold">{loading ? '…' : ((ordersCount && ordersCount > 0 && salesTotal != null) ? formatCurrency(salesTotal / ordersCount, lang) : '-')}</div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-hvac-md p-4">
        <div className="text-sm text-industrial-gray mb-3">Son {range === 'today' ? '1' : (range === '7d' ? '7' : '30')} gün sipariş trendi</div>
        <div className="space-y-2">
          {dailyCounts.map(({ date, count }) => {
            const max = Math.max(1, ...dailyCounts.map(d => d.count))
            const width = Math.round((count / max) * 100)
            return (
              <div key={date} className="flex items-center gap-2 text-sm">
                <div className="w-24 text-steel-gray">{date}</div>
                <div className="flex-1 bg-light-gray h-3 rounded">
                  <div className="bg-primary-navy h-3 rounded" style={{ width: `${width}%` }} />
                </div>
                <div className="w-8 text-right text-industrial-gray">{count}</div>
              </div>
            )
          })}
          {dailyCounts.length === 0 && <div className="text-sm text-steel-gray">Kayıt yok.</div>}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-hvac-md p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-industrial-gray">Son Siparişler</div>
          <Link to="/account/orders" className="text-sm text-primary-navy">Tümü</Link>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-industrial-gray">Sipariş</th>
                <th className="px-3 py-2 text-left text-industrial-gray">Tarih</th>
                <th className="px-3 py-2 text-right text-industrial-gray">Tutar</th>
                <th className="px-3 py-2 text-left text-industrial-gray">Durum</th>
                <th className="px-3 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td className="px-3 py-3" colSpan={5}>Kayıt yok</td></tr>
              ) : recentOrders.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">#{(r.order_number || r.id).toString().slice(-8).toUpperCase()}</td>
                  <td className="px-3 py-2 text-steel-gray">{formatDateTime(r.created_at, lang)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(r.total_amount, lang)}</td>
                  <td className="px-3 py-2 text-steel-gray">{r.status}</td>
                  <td className="px-3 py-2"><Link to={`/account/orders/${r.id}`} className="text-primary-navy hover:underline">Detay</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-sm text-industrial-gray">Sprint 2: Sipariş istatistikleri ve kısa raporlar bu alanda gösteriliyor.</div>
      </section>
    </div>
  )
}

export default AdminDashboardPage
