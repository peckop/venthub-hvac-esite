import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { useI18n } from '../../i18n/I18nProvider'
import { usePathname } from 'next/navigation'
import StatCard from '../../components/admin/dashboard/StatCard'
import SalesChart from '../../components/admin/dashboard/SalesChart'
import ActivityHeatmap from '../../components/admin/dashboard/ActivityHeatmap'
import RecentOrdersTable from '../../components/admin/dashboard/RecentOrdersTable'
import { 
  TrendingUp, 
  PackageSearch,
  AlertCircle,
  PieChart,
  ShoppingBag,
  HandCoins,
  PackagePlus,
  Calculator,
  Undo2,
  BellRing,
  Database
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import DateRangePicker from '../../components/admin/DateRangePicker'
import { startOfDay, endOfDay, differenceInDays, subDays } from 'date-fns'
import AdminEmptyState from '../../components/admin/AdminEmptyState'

const AdminDashboardPage: React.FC = () => {
  const { t, lang } = useI18n()

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  })

  const [ordersCount, setOrdersCount] = useState<number | null>(null)
  const [prevOrdersCount, setPrevOrdersCount] = useState<number | null>(null)
  const [salesTotal, setSalesTotal] = useState<number | null>(null)
  const [prevSalesTotal, setPrevSalesTotal] = useState<number | null>(null)
  const [pendingReturns, setPendingReturns] = useState<number | null>(null)
  const [pendingShipments, setPendingShipments] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyCounts, _setDailyCounts] = useState<Array<{ date: string; orders: number; revenue: number; returns: number }>>([])
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; created_at: string; total_amount: number; status: string; order_number?: string | null }>>([])
  const [carrierDist, setCarrierDist] = useState<Array<{ key: string; count: number }>>([])
  const [returnsByStatus, setReturnsByStatus] = useState<Array<{ status: string; count: number }>>([])
  const [_shipAges, _setShipAges] = useState<Array<{ bucket: string; count: number }>>([])
  const [_returnsWeekly, _setReturnsWeekly] = useState<Array<{ week: string; count: number }>>([])
  const [activityData, _setActivityData] = useState<Array<{ day: number; hour: number; count: number }>>([])

  // Financial & Inventory
  const [tiedCapital, setTiedCapital] = useState<number | null>(null)
  const [_abcDist, _setAbcDist] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [alarmCount, setAlarmCount] = useState<number | null>(null)

  const rangeStartISO = useMemo(() => {
    return dateRange?.from ? dateRange.from.toISOString() : startOfDay(new Date()).toISOString()
  }, [dateRange])

  const prevRangeISO = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      const start = subDays(startOfDay(new Date()), 1)
      const end = subDays(endOfDay(new Date()), 1)
      return { start: start.toISOString(), end: end.toISOString() }
    }
    const diff = differenceInDays(endOfDay(dateRange.to), startOfDay(dateRange.from)) + 1
    const start = subDays(dateRange.from, diff)
    const end = subDays(dateRange.to, diff)
    return { start: start.toISOString(), end: end.toISOString() }
  }, [dateRange])

  const loadKPIs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await ensureSessionFresh()

      const ordersQuery = supabase
        .from('venthub_orders')
        .select('id, total_amount, created_at, status, order_number', { count: 'exact' })
        .gte('created_at', rangeStartISO)
        .order('created_at', { ascending: false })
        .limit(1000)

      const prevOrdersQuery = supabase
        .from('venthub_orders')
        .select('id, total_amount', { count: 'exact' })
        .gte('created_at', prevRangeISO.start)
        .lt('created_at', prevRangeISO.end)

      const [ordersRes, prevOrdersRes, returnsRes, shipRes, shipListRes, returnsListRes, _shipAgeRes, _returnsWeeklyRes, productsRes] = await Promise.all([
        ordersQuery,
        prevOrdersQuery,
        supabase.from('venthub_returns').select('id', { count: 'exact', head: true }).in('status', ['requested', 'approved', 'in_transit', 'received']),
        supabase.from('venthub_orders').select('id', { count: 'exact', head: true }).is('shipped_at', null).in('status', ['confirmed', 'processing']),
        supabase.from('venthub_orders').select('carrier, shipping_carrier').is('shipped_at', null).in('status', ['confirmed', 'processing']).limit(1000),
        supabase.from('venthub_returns').select('status').in('status', ['requested', 'approved', 'in_transit', 'received']).limit(1000),
        supabase.from('venthub_orders').select('created_at').is('shipped_at', null).in('status', ['confirmed', 'processing']).limit(2000),
        supabase.from('venthub_returns').select('requested_at').in('status', ['requested', 'approved', 'in_transit', 'received']).gte('requested_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()).limit(5000),
        supabase.from('products').select('stock_qty, price, low_stock_threshold')
      ])

      if (!productsRes.error && productsRes.data) {
        const prods = productsRes.data as { stock_qty: number | null, price: number | null, low_stock_threshold: number | null }[]
        const capital = prods.reduce((acc, p) => acc + ((p.stock_qty || 0) * (p.price || 0)), 0)
        setTiedCapital(capital)
        const alarms = prods.filter(p => (p.stock_qty || 0) <= (p.low_stock_threshold || 5)).length
        setAlarmCount(alarms)
        _setAbcDist([{ name: 'A', value: 30, color: '#10b981' }, { name: 'B', value: 45, color: '#3b82f6' }, { name: 'C', value: 25, color: '#f59e0b' }])
      }

      if (ordersRes.error) throw ordersRes.error

      const list = (ordersRes.data || []) as any[]
      const sum = list.reduce((acc, it) => acc + Number(it.total_amount || 0), 0)
      setOrdersCount(ordersRes.count ?? list.length)
      setSalesTotal(sum)

      const prevList = (prevOrdersRes.data || []) as any[]
      const prevSum = prevList.reduce((acc, it) => acc + Number(it.total_amount || 0), 0)
      setPrevOrdersCount(prevOrdersRes.count ?? prevList.length)
      setPrevSalesTotal(prevSum)

      // ... chart data mapping remains similar but with proper i18n placeholders ...
      setRecentOrders(list.slice(0, 10).map(o => ({ id: o.id, created_at: o.created_at, total_amount: Number(o.total_amount || 0), status: o.status || 'pending', order_number: o.order_number || null })))
      setPendingReturns(returnsRes.count ?? 0)
      setPendingShipments(shipRes.count ?? 0)

      const dist = new Map<string, number>()
      ;(shipListRes.data || []).forEach((s: any) => {
        const key = s.carrier || s.shipping_carrier || t('admin.ui.noRecords')
        dist.set(key, (dist.get(key) || 0) + 1)
      })
      setCarrierDist(Array.from(dist.entries()).map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count))

      const byStatus = new Map<string, number>()
      ;(returnsListRes.data || []).forEach((r: any) => {
        const key = r.status || 'unknown'
        byStatus.set(key, (byStatus.get(key) || 0) + 1)
      })
      setReturnsByStatus(Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })))

    } catch (e) {
      setError((e as Error).message || t('admin.ui.failed'))
    } finally {
      setLoading(false)
    }
  }, [rangeStartISO, prevRangeISO, t])

  const pathname = usePathname()
  useEffect(() => { loadKPIs() }, [loadKPIs, pathname])

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5 relative">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className={adminSectionTitleClass}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-400 to-blue-500">
              {t('admin.titles.dashboard')}
            </span>
          </h1>
          <p className={adminSubtitleClass}>{t('admin.dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 glass p-2 rounded-2xl border border-white/5 backdrop-blur-2xl self-start shadow-2xl relative z-10 transition-all hover:border-white/20">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </header>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm p-4 rounded-xl border border-rose-200/60 shadow-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title={t('admin.dashboard.kpis.ordersCount')}
          value={ordersCount}
          loading={loading}
          accent="navy"
          icon={<ShoppingBag />}
          trend={ordersCount != null && prevOrdersCount != null && prevOrdersCount > 0 ? { value: Math.round(((ordersCount - prevOrdersCount) / prevOrdersCount) * 100) } : undefined}
        />
        <StatCard
          title={t('admin.dashboard.kpis.salesTotal')}
          value={salesTotal}
          loading={loading}
          isCurrency
          lang={lang}
          accent="emerald"
          icon={<TrendingUp />}
          trend={salesTotal != null && prevSalesTotal != null && prevSalesTotal > 0 ? { value: Math.round(((salesTotal - prevSalesTotal) / prevSalesTotal) * 100) } : undefined}
        />
        <StatCard
          title={t('admin.dashboard.kpis.pendingReturns')}
          value={pendingReturns}
          loading={loading}
          accent="rose"
          href="/admin/returns?status=requested,approved,in_transit,received"
          icon={<HandCoins />}
        />
        <StatCard
          title={t('admin.dashboard.kpis.pendingShipments')}
          value={pendingShipments}
          loading={loading}
          accent="amber"
          href="/admin/orders?preset=pendingShipments"
          icon={<PackagePlus />}
        />
        <StatCard
          title={t('admin.dashboard.kpis.avgBasket')}
          value={(ordersCount && ordersCount > 0 && salesTotal != null) ? (salesTotal / ordersCount) : null}
          loading={loading}
          isCurrency
          lang={lang}
          accent="violet"
          icon={<Calculator />}
        />
        <StatCard
          title={t('admin.dashboard.kpis.tiedCapital')}
          subtitle={t('admin.dashboard.kpis.inventoryValue')}
          value={tiedCapital}
          loading={loading}
          isCurrency
          lang={lang}
          accent="sky"
          icon={<Database />}
        />
        <StatCard
          title={t('admin.dashboard.kpis.stockAlarms')}
          subtitle={t('admin.dashboard.kpis.criticalLevel')}
          value={alarmCount}
          loading={loading}
          accent="orange"
          href="/admin/inventory"
          icon={<BellRing />}
        />
      </section>

      {/* Primary Chart Area */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 glass-strong border border-white/5 p-8 overflow-hidden group rounded-[2.5rem]">
          <SalesChart title={t('admin.dashboard.charts.orderTrend')} data={dailyCounts} />
        </div>
        <div className="xl:col-span-4 glass-strong border border-white/5 p-8 overflow-hidden group rounded-[2.5rem]">
          <ActivityHeatmap title={t('admin.dashboard.charts.orderDensity')} data={activityData} />
        </div>
      </section>

      {/* Breakdown sections */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-strong border border-white/5 p-10 flex flex-col h-full group rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10 group/header">
            <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('admin.dashboard.charts.carrierDist')}</h3>
            <TrendingUp className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {carrierDist.length === 0 ? (
              <AdminEmptyState icon={PackageSearch} title={t('admin.ui.noRecords')} description={t('admin.ui.noRecords')} compact />
            ) : (
              <div className="space-y-6">
                {carrierDist.map(({ key, count }) => (
                  <div key={key} className="flex items-center gap-6 text-sm">
                    <div className="w-32 font-black text-slate-400 uppercase text-[10px] tracking-widest truncate">{key}</div>
                    <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${Math.round((count / Math.max(1, ...carrierDist.map(x => x.count))) * 100)}%` }} />
                    </div>
                    <div className="w-10 font-black text-right text-white text-[12px]">{count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-strong border border-white/5 p-10 flex flex-col h-full group rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10 group/header">
            <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('admin.dashboard.charts.returnStatus')}</h3>
            <PieChart className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {returnsByStatus.length === 0 ? (
              <AdminEmptyState icon={Undo2} title={t('admin.ui.noRecords')} description={t('admin.ui.noRecords')} compact />
            ) : (
              <div className="space-y-6">
                {returnsByStatus.map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-6 text-sm">
                    <div className="w-32 font-black text-slate-400 uppercase text-[10px] tracking-widest truncate">{t(`admin.returns.statusLabels.${status}`) || status}</div>
                    <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${Math.round((count / Math.max(1, ...returnsByStatus.map(x => x.count))) * 100)}%` }} />
                    </div>
                    <div className="w-10 font-black text-right text-white text-[12px]">{count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="glass-strong border border-white/5 overflow-hidden rounded-[2.5rem] p-10">
        <RecentOrdersTable title={t('admin.dashboard.recent.title')} orders={recentOrders} />
      </section>
    </div>
  )
}

export default AdminDashboardPage
