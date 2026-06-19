import { 
  BellRing,
  Database,
  HandCoins,
  PackagePlus,
  ShoppingBag,
  TrendingUp, 
  Undo2} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import RecentOrdersTable from '../../components/admin/dashboard/RecentOrdersTable'
import SalesChart from '../../components/admin/dashboard/SalesChart'
import StatCard from '../../components/admin/dashboard/StatCard'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import type { DbOrder } from '../../types/db-rows'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'

interface DashboardChartData {
  date: string
  orders: number
  returns: number
}

const AdminDashboardPage: React.FC = () => {
  const { t } = useI18n()

  const [ordersCount, setOrdersCount] = useState<number | null>(null)
  const [salesTotal, setSalesTotal] = useState<number | null>(null)
  const [pendingReturns, setPendingReturns] = useState<number | null>(null)
  const [pendingShipments, setPendingShipments] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [recentOrders, setRecentOrders] = useState<DbOrder[]>([])
  const [chartData, setChartData] = useState<DashboardChartData[]>([])

  const [tiedCapital, setTiedCapital] = useState<number | null>(null)
  const [alarmCount, setAlarmCount] = useState<number | null>(null)

  const loadKPIs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await ensureSessionFresh()

      const { data: ordersData, count: oCount, error: oErr } = await supabase
        .from('venthub_orders')
        .select('id, created_at, total_amount, status, order_number', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(1000)

      if (oErr) throw oErr

      setOrdersCount(oCount)
      setSalesTotal(ordersData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0)
      setRecentOrders((ordersData as DbOrder[] | null)?.slice(0, 5) || [])

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)
      const sevenDaysAgoISO = sevenDaysAgo.toISOString()

      const [returnsRes, shipRes, productsRes, chartReturnsRes] = await Promise.all([
        supabase.from('venthub_returns').select('id', { count: 'exact', head: true }).in('status', ['requested', 'approved']),
        supabase.from('venthub_orders').select('id', { count: 'exact', head: true }).is('shipped_at', null).in('status', ['confirmed', 'processing']),
        supabase.from('products').select('purchase_price, price, stock_qty, low_stock_threshold'),
        supabase.from('venthub_returns').select('id, created_at').gte('created_at', sevenDaysAgoISO)
      ])

      if (returnsRes.error) throw returnsRes.error
      if (shipRes.error) throw shipRes.error
      if (productsRes.error) throw productsRes.error
      if (chartReturnsRes.error) throw chartReturnsRes.error

      setPendingReturns(returnsRes.count)
      setPendingShipments(shipRes.count)

      const chartDays: { dateString: string; label: string; orders: number; returns: number }[] = []
      const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const dateString = `${year}-${month}-${day}`

        const dayOfWeekIndex = d.getDay()
        const dayOfWeekKey = weekdayKeys[dayOfWeekIndex]
        const label = t(`admin.dashboard.days.${dayOfWeekKey}` as never)

        chartDays.push({
          dateString,
          label,
          orders: 0,
          returns: 0
        })
      }

      if (ordersData) {
        for (let i = 0; i < ordersData.length; i++) {
          const order = ordersData[i]
          const orderDate = new Date(order.created_at)
          const oYear = orderDate.getFullYear()
          const oMonth = String(orderDate.getMonth() + 1).padStart(2, '0')
          const oDay = String(orderDate.getDate()).padStart(2, '0')
          const oDateString = `${oYear}-${oMonth}-${oDay}`

          const dayObj = chartDays.find((cd) => cd.dateString === oDateString)
          if (dayObj) {
            dayObj.orders++
          }
        }
      }

      if (chartReturnsRes.data) {
        const returnsData = chartReturnsRes.data as { id: string; created_at: string }[]
        for (let i = 0; i < returnsData.length; i++) {
          const ret = returnsData[i]
          const retDate = new Date(ret.created_at)
          const rYear = retDate.getFullYear()
          const rMonth = String(retDate.getMonth() + 1).padStart(2, '0')
          const rDay = String(retDate.getDate()).padStart(2, '0')
          const rDateString = `${rYear}-${rMonth}-${rDay}`

          const dayObj = chartDays.find((cd) => cd.dateString === rDateString)
          if (dayObj) {
            dayObj.returns++
          }
        }
      }

      setChartData(
        chartDays.map((cd) => ({
          date: cd.label,
          orders: cd.orders,
          returns: cd.returns
        }))
      )

      if (productsRes.data) {
        const rawProducts = productsRes.data as import('../../types/db-rows').DbProduct[]

        // Use a single O(n) loop to calculate both tiedCapital and alarmCount
        let capital = 0
        let alarms = 0

        for (let i = 0; i < rawProducts.length; i++) {
          const p = rawProducts[i]
          const stockQty = typeof p.stock_qty === 'number' ? p.stock_qty : 0
          const purchasePrice = typeof p.purchase_price === 'number' ? p.purchase_price : 0
          const lowStockThreshold = typeof p.low_stock_threshold === 'number' ? p.low_stock_threshold : 5

          capital += purchasePrice * stockQty
          if (stockQty <= lowStockThreshold) {
            alarms++
          }
        }

        setTiedCapital(capital)
        setAlarmCount(alarms)
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadKPIs()
  }, [loadKPIs])

  return (
    <div className="space-y-10" data-testid="admin-dashboard">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.titles.dashboard')}</h1>
        <p className={adminSubtitleClass}>{t('admin.dashboard.subtitle')}</p>
      </header>

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('admin.dashboard.kpis.ordersCount')}
          value={ordersCount}
          icon={<ShoppingBag />}
          loading={loading}
        />
        <StatCard 
          title={t('admin.dashboard.kpis.salesTotal')}
          value={salesTotal}
          icon={<HandCoins />}
          isCurrency
          loading={loading}
        />
        <StatCard 
          title={t('admin.dashboard.kpis.pendingReturns')}
          value={pendingReturns}
          icon={<Undo2 />}
          loading={loading}
        />
        <StatCard 
          title={t('admin.dashboard.kpis.pendingShipments')}
          value={pendingShipments}
          icon={<PackagePlus />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title={t('admin.dashboard.kpis.tiedCapital')}
          value={tiedCapital}
          icon={<Database />}
          isCurrency
          loading={loading}
        />
        <StatCard 
          title={t('admin.dashboard.kpis.stockAlarms')}
          value={alarmCount}
          icon={<BellRing />}
          loading={loading}
        />
        <StatCard 
          title={t('admin.dashboard.charts.systemHealth')}
          value={100}
          icon={<TrendingUp />}
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-hvac-2xl border border-white/5 bg-surface-deep/40">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8">{t('admin.dashboard.charts.recentOrders')}</h3>
          <RecentOrdersTable orders={recentOrders} title={t('admin.dashboard.charts.recentOrders')} />
        </div>
        <div className="glass-card p-8 rounded-hvac-2xl border border-white/5 bg-surface-deep/40">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8">{t('admin.dashboard.charts.orderFlow')}</h3>
          <SalesChart data={chartData} title={t('admin.dashboard.charts.salesTrend')} />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
