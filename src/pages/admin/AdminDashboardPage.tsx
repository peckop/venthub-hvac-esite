import React from 'react'
import { adminSectionTitleClass, adminCardPaddedClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import { Link } from 'react-router-dom'

const AdminDashboardPage: React.FC = () => {
  const { t, lang } = useI18n()

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
  const [carrierDist, setCarrierDist] = React.useState<Array<{ key: string; count: number }>>([])
  const [returnsByStatus, setReturnsByStatus] = React.useState<Array<{ status: string; count: number }>>([])

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

      const [ordersRes, returnsRes, shipRes, shipListRes, returnsListRes] = await Promise.all([
        ordersQuery,
        // Pending returns (not time-bound): requested/approved/in_transit/received
        supabase
          .from('venthub_returns')
          .select('id', { count: 'exact', head: true })
          .in('status', ['requested', 'approved', 'in_transit', 'received']),
        // Pending shipments: not shipped yet and status confirmed/processing
        supabase
          .from('venthub_orders')
          .select('id', { count: 'exact', head: true })
          .is('shipped_at', null)
          .in('status', ['confirmed', 'processing']),
        // Lists for breakdowns
        supabase
          .from('venthub_orders')
          .select('carrier, shipping_carrier')
          .is('shipped_at', null)
          .in('status', ['confirmed', 'processing'])
          .limit(1000),
        supabase
          .from('venthub_returns')
          .select('status')
          .in('status', ['requested', 'approved', 'in_transit', 'received'])
          .limit(1000)
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
      if (shipListRes.error) throw shipListRes.error
      if (returnsListRes.error) throw returnsListRes.error

      setPendingReturns(returnsRes.count ?? 0)
      setPendingShipments(shipRes.count ?? 0)

      // Build carrier distribution
      const shipList = (shipListRes.data || []) as Array<{ carrier: string | null; shipping_carrier: string | null }>
      const dist = new Map<string, number>()
      shipList.forEach(s => {
        const key = (s.carrier || s.shipping_carrier || 'Bilinmiyor').toString()
        dist.set(key, (dist.get(key) || 0) + 1)
      })
      setCarrierDist(Array.from(dist.entries()).map(([key, count]) => ({ key, count })).sort((a,b)=>b.count-a.count))

      // Build returns status breakdown
      const rlist = (returnsListRes.data || []) as Array<{ status: string | null }>
      const byStatus = new Map<string, number>()
      rlist.forEach(r => {
        const key = (r.status || 'unknown').toString()
        byStatus.set(key, (byStatus.get(key) || 0) + 1)
      })
      setReturnsByStatus(Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })).sort((a,b)=>b.count-a.count))
    } catch (e) {
      setError((e as Error).message || t('admin.ui.failed'))
      setOrdersCount(null)
      setSalesTotal(null)
      setPendingReturns(null)
      setPendingShipments(null)
    } finally {
      setLoading(false)
    }
  }, [rangeStartISO, range, t])

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
          <h1 className={adminSectionTitleClass}>{t('admin.titles.dashboard')}</h1>
          <p className="text-industrial-gray text-sm">{t('admin.dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <RangeButton value="today" label={t('admin.dashboard.rangeToday')} />
          <RangeButton value="7d" label={t('admin.dashboard.range7d')} />
          <RangeButton value="30d" label={t('admin.dashboard.range30d')} />
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">{error}</div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">{t('admin.dashboard.kpis.ordersCount')}</div>
          <div className="text-2xl font-semibold">{loading ? '…' : (ordersCount ?? '-')}</div>
        </div>
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">{t('admin.dashboard.kpis.salesTotal')}</div>
          <div className="text-2xl font-semibold">{loading ? '…' : (salesTotal != null ? formatCurrency(salesTotal, lang) : '-')}</div>
        </div>
        <Link to="/account/AdminReturnsPage?status=requested,approved,in_transit,received" className={adminCardPaddedClass + ' block hover:shadow-md transition-shadow'}>
          <div className="text-xs text-industrial-gray">{t('admin.dashboard.kpis.pendingReturns')}</div>
          <div className="text-2xl font-semibold">{loading ? '…' : (pendingReturns ?? '-')}</div>
        </Link>
        <Link to="/admin/orders?preset=pendingShipments" className={adminCardPaddedClass + ' block hover:shadow-md transition-shadow'}>
          <div className="text-xs text-industrial-gray">{t('admin.dashboard.kpis.pendingShipments')}</div>
          <div className="text-2xl font-semibold">{loading ? '…' : (pendingShipments ?? '-')}</div>
        </Link>
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">{t('admin.dashboard.kpis.avgBasket')}</div>
          <div className="text-2xl font-semibold">{loading ? '…' : ((ordersCount && ordersCount > 0 && salesTotal != null) ? formatCurrency(salesTotal / ordersCount, lang) : '-')}</div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-hvac-md p-4">
        <div className="text-sm text-industrial-gray mb-3">{t('admin.dashboard.trend', { days: range === 'today' ? '1' : (range === '7d' ? '7' : '30') })}</div>
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
          {dailyCounts.length === 0 && <div className="text-sm text-steel-gray">{t('admin.ui.noRecords')}</div>}
        </div>
      </section>

      {/* Breakdown sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-hvac-md p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-industrial-gray">Bekleyen Kargo - Kargo Dağılımı</div>
            <Link to="/admin/orders?preset=pendingShipments" className="text-sm text-primary-navy">Tümü</Link>
          </div>
          {carrierDist.length === 0 ? (
            <div className="text-sm text-steel-gray">Kayıt yok.</div>
          ) : (
            <div className="space-y-2">
              {(() => { const max = Math.max(1, ...carrierDist.map(x => x.count)); return carrierDist.map(({ key, count }) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div className="w-32 text-steel-gray truncate" title={key}>{key}</div>
                  <div className="flex-1 bg-light-gray h-3 rounded">
                    <div className="bg-primary-navy h-3 rounded" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                  </div>
                  <div className="w-10 text-right text-industrial-gray">{count}</div>
                </div>
              )) })()}
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-hvac-md p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-industrial-gray">Bekleyen İade - Durum Kırılımı</div>
            <Link to="/account/AdminReturnsPage?status=requested,approved,in_transit,received" className="text-sm text-primary-navy">Tümü</Link>
          </div>
          {returnsByStatus.length === 0 ? (
            <div className="text-sm text-steel-gray">Kayıt yok.</div>
          ) : (
            <div className="space-y-2">
              {(() => { const max = Math.max(1, ...returnsByStatus.map(x => x.count)); return returnsByStatus.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-2 text-sm">
                  <div className="w-32 text-steel-gray truncate" title={status}>{status}</div>
                  <div className="flex-1 bg-light-gray h-3 rounded">
                    <div className="bg-warning-orange h-3 rounded" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                  </div>
                  <div className="w-10 text-right text-industrial-gray">{count}</div>
                </div>
              )) })()}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-hvac-md p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-industrial-gray">{t('admin.dashboard.recent.title')}</div>
          <Link to="/account/orders" className="text-sm text-primary-navy">{t('common.viewAll')}</Link>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-industrial-gray">{t('admin.dashboard.table.order')}</th>
                <th className="px-3 py-2 text-left text-industrial-gray">{t('admin.dashboard.table.date')}</th>
                <th className="px-3 py-2 text-right text-industrial-gray">{t('admin.dashboard.table.amount')}</th>
                <th className="px-3 py-2 text-left text-industrial-gray">{t('admin.dashboard.table.status')}</th>
                <th className="px-3 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td className="px-3 py-3" colSpan={5}>{t('admin.ui.noRecords')}</td></tr>
              ) : recentOrders.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">#{(r.order_number || r.id).toString().slice(-8).toUpperCase()}</td>
                  <td className="px-3 py-2 text-steel-gray">{formatDateTime(r.created_at, lang)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(r.total_amount, lang)}</td>
                  <td className="px-3 py-2 text-steel-gray">{r.status}</td>
                  <td className="px-3 py-2"><Link to={`/account/orders/${r.id}`} className="text-primary-navy hover:underline">{t('admin.ui.details')}</Link></td>
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
