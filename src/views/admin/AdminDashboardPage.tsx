import React from 'react'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { useI18n } from '../../i18n/I18nProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StatCard from '../../components/admin/dashboard/StatCard'
import SalesChart from '../../components/admin/dashboard/SalesChart'
import ActivityHeatmap from '../../components/admin/dashboard/ActivityHeatmap'
import RecentOrdersTable from '../../components/admin/dashboard/RecentOrdersTable'
import AbcPieChart from '../../components/admin/dashboard/AbcPieChart'
import { 
  TrendingUp, 
  ArrowDownRight, 
  ChevronRight, 
  PackageSearch,
  Users,
  AlertCircle,
  Clock,
  BarChart3,
  PieChart,
  ShoppingCart,
  Boxes,
  Truck,
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

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  })

  const [ordersCount, setOrdersCount] = React.useState<number | null>(null)
  const [prevOrdersCount, setPrevOrdersCount] = React.useState<number | null>(null)
  const [salesTotal, setSalesTotal] = React.useState<number | null>(null)
  const [prevSalesTotal, setPrevSalesTotal] = React.useState<number | null>(null)
  const [pendingReturns, setPendingReturns] = React.useState<number | null>(null)
  const [pendingShipments, setPendingShipments] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [dailyCounts, setDailyCounts] = React.useState<Array<{ date: string; orders: number; returns: number }>>([])
  const [recentOrders, setRecentOrders] = React.useState<Array<{ id: string; created_at: string; total_amount: number; status: string; order_number?: string | null }>>([])
  const [carrierDist, setCarrierDist] = React.useState<Array<{ key: string; count: number }>>([])
  const [returnsByStatus, setReturnsByStatus] = React.useState<Array<{ status: string; count: number }>>([])
  const [shipAges, setShipAges] = React.useState<Array<{ bucket: string; count: number }>>([])
  const [returnsWeekly, setReturnsWeekly] = React.useState<Array<{ week: string; count: number }>>([])
  const [activityData, setActivityData] = React.useState<Array<{ day: number; hour: number; count: number }>>([])

  // Yeni Dashboard Kartları
  const [tiedCapital, setTiedCapital] = React.useState<number | null>(null)
  const [abcDist, setAbcDist] = React.useState<Array<{ name: string; value: number; color: string }>>([])
  const [alarmCount, setAlarmCount] = React.useState<number | null>(null)

  const rangeStartISO = React.useMemo(() => {
    return dateRange?.from ? dateRange.from.toISOString() : startOfDay(new Date()).toISOString()
  }, [dateRange])

  const prevRangeISO = React.useMemo(() => {
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

  const loadKPIs = React.useCallback(async () => {
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

      const [ordersRes, prevOrdersRes, returnsRes, shipRes, shipListRes, returnsListRes, shipAgeRes, returnsWeeklyRes] = await Promise.all([
        ordersQuery,
        prevOrdersQuery,
        supabase
          .from('venthub_returns')
          .select('id', { count: 'exact', head: true })
          .in('status', ['requested', 'approved', 'in_transit', 'received']),
        supabase
          .from('venthub_orders')
          .select('id', { count: 'exact', head: true })
          .is('shipped_at', null)
          .in('status', ['confirmed', 'processing']),
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
        supabase
          .from('venthub_orders')
          .select('created_at')
          .is('shipped_at', null)
          .in('status', ['confirmed', 'processing'])
          .limit(2000),
        supabase
          .from('venthub_returns')
          .select('requested_at')
          .in('status', ['requested', 'approved', 'in_transit', 'received'])
          .gte('requested_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
          .limit(5000),
        supabase
          .from('products')
          .select('stock_qty, price, low_stock_threshold')
          .gt('stock_qty', 0)
      ])

      const productsRes = await supabase.from('products').select('stock_qty, price, low_stock_threshold')
      if (!productsRes.error && productsRes.data) {
        const prods = productsRes.data as { stock_qty: number | null, price: number | null, low_stock_threshold: number | null }[]
        const capital = prods.reduce((acc, p) => {
          const stockQty = p.stock_qty ?? 0
          const price = p.price ?? 0
          return acc + (stockQty > 0 ? stockQty * price : 0)
        }, 0)
        setTiedCapital(capital)
        const alarms = prods.filter(p => (p.stock_qty || 0) <= (p.low_stock_threshold || 5)).length
        setAlarmCount(alarms)
        setAbcDist([
          { name: 'A', value: 0, color: '#10b981' },
          { name: 'B', value: 0, color: '#3b82f6' },
          { name: 'C', value: 0, color: '#f59e0b' }
        ])
      }

      if (ordersRes.error) throw ordersRes.error

      const list = (ordersRes.data || []) as Array<{ id: string; total_amount?: number | string | null; created_at: string; status?: string | null; order_number?: string | null }>
      const sum = list.reduce((acc, it) => acc + Number(it.total_amount || 0), 0)
      setOrdersCount(typeof ordersRes.count === 'number' ? ordersRes.count : list.length)
      setSalesTotal(sum)

      const prevList = (prevOrdersRes.data || []) as Array<{ total_amount?: number | string | null }>
      const prevSum = prevList.reduce((acc, it) => acc + Number(it.total_amount || 0), 0)
      setPrevOrdersCount(typeof prevOrdersRes.count === 'number' ? prevOrdersRes.count : prevList.length)
      setPrevSalesTotal(prevSum)

      const r_start = dateRange?.from ? startOfDay(dateRange.from) : startOfDay(new Date())
      const r_end = dateRange?.to ? endOfDay(dateRange.to) : endOfDay(new Date())
      const days = Math.max(1, differenceInDays(r_end, r_start) + 1)
      const dataMap = new Map<string, { date: string; orders: number; returns: number }>()

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        dataMap.set(key, { date: key, orders: 0, returns: 0 })
      }

      list.forEach(o => {
        const key = new Date(o.created_at).toISOString().slice(0, 10)
        if (dataMap.has(key)) {
          const val = dataMap.get(key)!
          val.orders++
        }
      })

      const rlist_all = (returnsWeeklyRes.data || []) as Array<{ requested_at: string | null }>
      rlist_all.forEach(r => {
        if (!r.requested_at) return
        const key = r.requested_at.slice(0, 10)
        if (dataMap.has(key)) {
          const val = dataMap.get(key)!
          val.returns++
        }
      })

      const daily = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date))
      setDailyCounts(daily as unknown as { date: string; orders: number; revenue: number; returns: number }[])

      const heatmapMap = new Map<string, number>()
      list.forEach(o => {
        const d = new Date(o.created_at)
        const day = d.getDay()
        const hour = d.getHours()
        const key = `${day}-${hour}`
        heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1)
      })
      const heatData = Array.from(heatmapMap.entries()).map(([key, count]) => {
        const [dayStr, hourStr] = key.split('-')
        return { day: Number(dayStr), hour: Number(hourStr), count }
      })
      setActivityData(heatData)

      setRecentOrders(list.slice(0, 10).map(o => ({ id: o.id, created_at: o.created_at, total_amount: Number(o.total_amount || 0), status: o.status || 'pending', order_number: o.order_number || null })))

      setPendingReturns(returnsRes.count ?? 0)
      setPendingShipments(shipRes.count ?? 0)

      const shipList = (shipListRes.data || []) as Array<{ carrier: string | null; shipping_carrier: string | null }>
      const dist = new Map<string, number>()
      shipList.forEach(s => {
        const key = (s.carrier || s.shipping_carrier || 'Bilinmiyor').toString()
        dist.set(key, (dist.get(key) || 0) + 1)
      })
      setCarrierDist(Array.from(dist.entries()).map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count))

      const rlist = (returnsListRes.data || []) as Array<{ status: string | null }>
      const byStatus = new Map<string, number>()
      rlist.forEach(r => {
        const key = (r.status || 'unknown').toString()
        byStatus.set(key, (byStatus.get(key) || 0) + 1)
      })
      setReturnsByStatus(Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count))

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
        d.setUTCDate(d.getUTCDate() - d.getUTCDay())
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
  }, [rangeStartISO, prevRangeISO, dateRange, t])

  const pathname = usePathname()
  React.useEffect(() => { loadKPIs() }, [loadKPIs, pathname])

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5 relative">
        {/* Decorative background glow */}
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className={adminSectionTitleClass}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-400 to-blue-500">
              {t('admin.titles.dashboard')}
            </span>
          </h1>
          <p className={adminSubtitleClass}>Sistem genelindeki operasyonel verileri, satış trendlerini ve KPI'ları anlık olarak analiz edin.</p>
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
          trend={(() => {
            const currentAvg = (ordersCount && ordersCount > 0 && salesTotal != null) ? (salesTotal / ordersCount) : 0;
            const prevAvg = (prevOrdersCount && prevOrdersCount > 0 && prevSalesTotal != null) ? (prevSalesTotal / prevOrdersCount) : 0;
            if (currentAvg > 0 && prevAvg > 0) return { value: Math.round(((currentAvg - prevAvg) / prevAvg) * 100) };
            return undefined;
          })()}
        />
        <StatCard
          title="Bağlı Sermaye"
          subtitle="Envanter Değeri"
          value={tiedCapital}
          loading={loading}
          isCurrency
          lang={lang}
          accent="sky"
          icon={<Database />}
        />
        <StatCard
          title="Stok Alarmları"
          subtitle="Kritik Seviye"
          value={alarmCount}
          loading={loading}
          accent="orange"
          href="/admin/inventory"
          icon={<BellRing />}
        />
      </section>

      {/* Primary Chart Area */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 glass-strong border border-white/5 p-8 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] group rounded-[2.5rem]">
          <SalesChart
            title="Sipariş Trendi"
            data={dailyCounts}
          />
        </div>
        <div className="xl:col-span-4 glass-strong border border-white/5 p-8 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] group rounded-[2.5rem]">
          <ActivityHeatmap
            title="Sipariş Yoğunluğu"
            data={activityData}
          />
        </div>
      </section>

      {/* Breakdown sections */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-strong border border-white/5 p-10 flex flex-col h-full group hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10 group/header">
            <div className="flex flex-col gap-2">
              <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover/header:text-cyan-400 transition-colors">Kargo Dağılımı</h3>
              <div className="h-0.5 w-8 bg-cyan-500/30 rounded-full group-hover/header:w-16 transition-all duration-700" />
            </div>
            <TrendingUp className="w-5 h-5 text-slate-600 group-hover/header:text-cyan-400 transition-colors duration-500" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {carrierDist.length === 0 ? (
              <AdminEmptyState
                icon={PackageSearch}
                title="Kayıt Bulunamadı"
                description="Seçili aralıkta kargo verisi bulunmuyor."
                compact
              />
            ) : (
              <div className="space-y-6">
                {(() => {
                  const max = Math.max(1, ...carrierDist.map(x => x.count)); return carrierDist.map(({ key, count }) => (
                    <div key={key} className="flex items-center gap-6 text-sm">
                      <div className="w-32 font-black text-slate-400 uppercase text-[10px] tracking-widest truncate" title={key}>{key}</div>
                      <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                      </div>
                      <div className="w-10 font-black text-right text-white tracking-widest text-[12px]">{count}</div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="glass-strong border border-white/5 p-10 flex flex-col h-full group hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10 group/header">
            <div className="flex flex-col gap-2">
              <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover/header:text-rose-400 transition-colors">İade Durum Kırılımı</h3>
              <div className="h-0.5 w-8 bg-rose-500/30 rounded-full group-hover/header:w-16 transition-all duration-700" />
            </div>
            <PieChart className="w-5 h-5 text-slate-600 group-hover/header:text-rose-400 transition-colors duration-500" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {returnsByStatus.length === 0 ? (
              <AdminEmptyState
                icon={Undo2}
                title="Kayıt Bulunamadı"
                description="Seçili aralıkta iade verisi bulunmuyor."
                compact
              />
            ) : (
              <div className="space-y-6">
                {(() => {
                  const max = Math.max(1, ...returnsByStatus.map(x => x.count)); return returnsByStatus.map(({ status, count }) => (
                    <div key={status} className="flex items-center gap-6 text-sm">
                      <div className="w-32 font-black text-slate-400 uppercase text-[10px] tracking-widest truncate" title={status}>{status}</div>
                      <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.3)]" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                      </div>
                      <div className="w-10 font-black text-right text-white tracking-widest text-[12px]">{count}</div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Age buckets + weekly returns trend */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-strong border border-white/5 p-10 flex flex-col h-full rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10 group/header">
            <div className="flex flex-col gap-2">
              <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover/header:text-violet-400 transition-colors">Bekleyen Kargo (Yaş)</h3>
              <div className="h-0.5 w-8 bg-violet-500/30 rounded-full group-hover/header:w-16 transition-all duration-700" />
            </div>
            <PackageSearch className="w-5 h-5 text-slate-600 group-hover/header:text-violet-400 transition-colors duration-500" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {shipAges.length === 0 ? (
              <AdminEmptyState
                icon={PackageSearch}
                title="Kayıt Bulunamadı"
                description="Bekleyen kargo kaydı bulunmuyor."
                compact
              />
            ) : (
              <div className="space-y-6">
                {(() => {
                  const max = Math.max(1, ...shipAges.map(x => x.count)); return shipAges.map(({ bucket, count }) => (
                    <div key={bucket} className="flex items-center gap-6 text-sm">
                      <div className="w-20 font-black text-slate-400 uppercase text-[10px] tracking-widest truncate" title={bucket}>{bucket}</div>
                      <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-violet-600 to-violet-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(139,92,246,0.3)]" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                      </div>
                      <div className="w-10 font-black text-right text-white tracking-widest text-[12px]">{count}</div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>
        <div className="glass-strong border border-white/5 p-10 flex flex-col h-full rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">İadeler - Haftalık Trend</h3>
            <Link href="/admin/returns?status=requested,approved,in_transit,received" className="text-[11px] font-black text-white uppercase tracking-widest px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 border border-white/5 group">
              Tümü <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {returnsWeekly.length === 0 ? (
              <AdminEmptyState
                icon={Undo2}
                title="Grafik Verisi Yok"
                description="Haftalık trend için yeterli veri bulunmuyor."
                compact
              />
            ) : (
              <div className="space-y-6">
                {(() => {
                  const max = Math.max(1, ...returnsWeekly.map(x => x.count)); return returnsWeekly.map(({ week, count }) => (
                    <div key={week} className="flex items-center gap-6 text-sm">
                      <div className="w-24 font-black text-slate-400 uppercase text-[10px] tracking-widest truncate" title={week}>{week}</div>
                      <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                      </div>
                      <div className="w-10 font-black text-right text-white tracking-widest text-[12px]">{count}</div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ABC Sınıflandırması */}
      <section className="glass-strong border border-white/5 p-10 overflow-hidden rounded-[2.5rem]">
        <AbcPieChart data={abcDist} />
      </section>

      <section className="glass-strong border border-white/5 overflow-hidden rounded-[2.5rem] p-10">
        <RecentOrdersTable
          title={t('admin.dashboard.recent.title')}
          orders={recentOrders}
        />
      </section>
    </div>
  )
}

export default AdminDashboardPage
