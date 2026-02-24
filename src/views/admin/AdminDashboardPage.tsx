import React from 'react'
import { adminSectionTitleClass, adminSubtitleClass, adminCardPaddedClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import Link from 'next/link'
import StatCard from '../../components/admin/dashboard/StatCard'
import SalesChart from '../../components/admin/dashboard/SalesChart'
import RecentOrdersTable from '../../components/admin/dashboard/RecentOrdersTable'
import { ShoppingBag, TrendingUp, HandCoins, PackagePlus, Calculator, AlertCircle, ChevronRight, PackageSearch, Undo2 } from 'lucide-react'

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
  const [shipAges, setShipAges] = React.useState<Array<{ bucket: string; count: number }>>([])
  const [returnsWeekly, setReturnsWeekly] = React.useState<Array<{ week: string; count: number }>>([])

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

      const [ordersRes, returnsRes, shipRes, shipListRes, returnsListRes, shipAgeRes, returnsWeeklyRes] = await Promise.all([
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
          .limit(1000),
        // For age buckets
        supabase
          .from('venthub_orders')
          .select('created_at')
          .is('shipped_at', null)
          .in('status', ['confirmed', 'processing'])
          .limit(2000),
        // For weekly returns trend
        supabase
          .from('venthub_returns')
          .select('requested_at')
          .in('status', ['requested', 'approved', 'in_transit', 'received'])
          .gte('requested_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
          .limit(5000)
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
      if (shipAgeRes.error) throw shipAgeRes.error
      if (returnsWeeklyRes.error) throw returnsWeeklyRes.error

      setPendingReturns(returnsRes.count ?? 0)
      setPendingShipments(shipRes.count ?? 0)

      // Build carrier distribution
      const shipList = (shipListRes.data || []) as Array<{ carrier: string | null; shipping_carrier: string | null }>
      const dist = new Map<string, number>()
      shipList.forEach(s => {
        const key = (s.carrier || s.shipping_carrier || 'Bilinmiyor').toString()
        dist.set(key, (dist.get(key) || 0) + 1)
      })
      setCarrierDist(Array.from(dist.entries()).map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count))

      // Build returns status breakdown
      const rlist = (returnsListRes.data || []) as Array<{ status: string | null }>
      const byStatus = new Map<string, number>()
      rlist.forEach(r => {
        const key = (r.status || 'unknown').toString()
        byStatus.set(key, (byStatus.get(key) || 0) + 1)
      })
      setReturnsByStatus(Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count))

      // Build shipments age buckets (0–1g, 2–3g, 4g+)
      const ageList = (shipAgeRes.data || []) as Array<{ created_at: string }>
      const now = Date.now()
      const ages = { '0–1g': 0, '2–3g': 0, '4g+': 0 }
      ageList.forEach(x => {
        const d = new Date(x.created_at).getTime()
        const diffDays = Math.floor((now - d) / (24 * 60 * 60 * 1000))
        if (diffDays <= 1) ages['0–1g']++
        else if (diffDays <= 3) ages['2–3g']++
        else ages['4g+']++
      })
      setShipAges(Object.entries(ages).map(([bucket, count]) => ({ bucket, count })))

      // Weekly returns trend (by requested_at, last ~8 weeks)
      const rw = (returnsWeeklyRes.data || []) as Array<{ requested_at: string | null }>
      const byWeek = new Map<string, number>()
      const weeks = 8
      for (let i = weeks - 1; i >= 0; i--) {
        const start = new Date()
        start.setUTCDate(start.getUTCDate() - i * 7)
        start.setUTCHours(0, 0, 0, 0)
        const key = start.toISOString().slice(0, 10)
        byWeek.set(key, 0)
      }
      rw.forEach(r => {
        if (!r.requested_at) return
        const d = new Date(r.requested_at)
        d.setUTCDate(d.getUTCDate() - d.getUTCDay()) // hafta başına yuvarla (Pazar)
        d.setUTCHours(0, 0, 0, 0)
        const key = d.toISOString().slice(0, 10)
        if (byWeek.has(key)) byWeek.set(key, (byWeek.get(key) || 0) + 1)
      })
      setReturnsWeekly(Array.from(byWeek.entries()).map(([week, count]) => ({ week, count })))
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
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${range === value ? 'bg-primary-navy text-white shadow-md shadow-primary-navy/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
    >{label}</button>
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={adminSectionTitleClass}>{t('admin.titles.dashboard')}</h1>
          <p className={adminSubtitleClass}>{t('admin.dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
          <RangeButton value="today" label={t('admin.dashboard.rangeToday')} />
          <RangeButton value="7d" label={t('admin.dashboard.range7d')} />
          <RangeButton value="30d" label={t('admin.dashboard.range30d')} />
        </div>
      </header>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm p-4 rounded-xl border border-rose-200/60 shadow-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard title={t('admin.dashboard.kpis.ordersCount')} value={ordersCount} loading={loading} icon={<ShoppingBag size={24} strokeWidth={1.5} />} trend={{ value: 12 }} />
        <StatCard title={t('admin.dashboard.kpis.salesTotal')} value={salesTotal} loading={loading} isCurrency lang={lang} icon={<TrendingUp size={24} strokeWidth={1.5} />} trend={{ value: 8 }} />
        <StatCard title={t('admin.dashboard.kpis.pendingReturns')} value={pendingReturns} loading={loading} href="/admin/returns?status=requested,approved,in_transit,received" icon={<HandCoins size={24} strokeWidth={1.5} />} trend={{ value: -2 }} />
        <StatCard title={t('admin.dashboard.kpis.pendingShipments')} value={pendingShipments} loading={loading} href="/admin/orders?preset=pendingShipments" icon={<PackagePlus size={24} strokeWidth={1.5} />} trend={{ value: 5 }} />
        <StatCard title={t('admin.dashboard.kpis.avgBasket')} value={(ordersCount && ordersCount > 0 && salesTotal != null) ? (salesTotal / ordersCount) : null} loading={loading} isCurrency lang={lang} icon={<Calculator size={24} strokeWidth={1.5} />} trend={{ value: 3 }} />
      </section>

      {/* Primary Chart Area */}
      <section className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 overflow-hidden">
        <SalesChart
          title={t('admin.dashboard.trend', { days: range === 'today' ? '1' : (range === '7d' ? '7' : '30') })}
          data={dailyCounts}
        />
      </section>

      {/* Breakdown sections */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">Kargo Dağılımı</h3>
            <Link href="/admin/orders?preset=pendingShipments" className="text-sm font-medium text-primary-navy hover:text-primary-navy/80 flex items-center gap-1 group">
              Tümü <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {carrierDist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <PackageSearch size={32} className="mb-2 opacity-50" />
                <span className="text-sm">Kayıt Bulunamadı</span>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const max = Math.max(1, ...carrierDist.map(x => x.count)); return carrierDist.map(({ key, count }) => (
                    <div key={key} className="flex items-center gap-4 text-sm">
                      <div className="w-32 font-medium text-slate-700 truncate" title={key}>{key}</div>
                      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                      </div>
                      <div className="w-8 font-semibold text-right text-slate-600">{count}</div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">İade Durum Kırılımı</h3>
            <Link href="/admin/returns?status=requested,approved,in_transit,received" className="text-sm font-medium text-primary-navy hover:text-primary-navy/80 flex items-center gap-1 group">
              Tümü <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {returnsByStatus.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Undo2 size={32} className="mb-2 opacity-50" />
                <span className="text-sm">Kayıt Bulunamadı</span>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const max = Math.max(1, ...returnsByStatus.map(x => x.count)); return returnsByStatus.map(({ status, count }) => (
                    <div key={status} className="flex items-center gap-4 text-sm">
                      <div className="w-32 font-medium text-slate-700 truncate" title={status}>{status}</div>
                      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                      </div>
                      <div className="w-8 font-semibold text-right text-slate-600">{count}</div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Age buckets + weekly returns trend */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">Bekleyen Kargo (Yaş)</h3>
            <Link href="/admin/orders?preset=pendingShipments" className="text-sm font-medium text-primary-navy hover:text-primary-navy/80 flex items-center gap-1 group">
              Tümü <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {shipAges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <PackageSearch size={32} className="mb-2 opacity-50" />
                <span className="text-sm">Kutu Boş</span>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const max = Math.max(1, ...shipAges.map(x => x.count)); return shipAges.map(({ bucket, count }) => (
                    <div key={bucket} className="flex items-center gap-4 text-sm">
                      <div className="w-20 font-medium text-slate-700 truncate" title={bucket}>{bucket}</div>
                      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                      </div>
                      <div className="w-8 font-semibold text-right text-slate-600">{count}</div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">İadeler - Haftalık Trend</h3>
            <Link href="/admin/returns?status=requested,approved,in_transit,received" className="text-sm font-medium text-primary-navy hover:text-primary-navy/80 flex items-center gap-1 group">
              Tümü <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {returnsWeekly.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Undo2 size={32} className="mb-2 opacity-50" />
                <span className="text-sm">Veri Yok</span>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const max = Math.max(1, ...returnsWeekly.map(x => x.count)); return returnsWeekly.map(({ week, count }) => (
                    <div key={week} className="flex items-center gap-4 text-sm">
                      <div className="w-24 font-medium text-slate-700 truncate" title={week}>{week}</div>
                      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                      </div>
                      <div className="w-8 font-semibold text-right text-slate-600">{count}</div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <RecentOrdersTable
          title={t('admin.dashboard.recent.title')}
          orders={recentOrders}
        />
      </section>
    </div>
  )
}

export default AdminDashboardPage



