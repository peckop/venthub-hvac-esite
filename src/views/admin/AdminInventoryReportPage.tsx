'use client'

import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from 'date-fns'
import { Activity, ArrowDownRight, ArrowUpRight, Download, MinusCircle, PackageMinus, PlusCircle, TrendingUp } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
import { DateRange } from 'react-day-picker'
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'

import { useI18n } from '@/i18n/I18nProvider'
import { getInventoryMovements, type InventoryMovementRow } from '@/lib/services/inventoryReport.service'
import { useSupabaseClient } from '@/providers/SupabaseProvider'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminToolbar from '../../components/admin/AdminToolbar'
import DateRangePicker from '../../components/admin/DateRangePicker'
import { useDragScroll } from '../../hooks/useDragScroll'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { adminButtonSecondaryClass, adminCardClass, adminSectionTitleClass, adminTableCellClass, adminTableCellTruncate150Class,adminTableHeadCellClass, adminTableScrollAreaClass } from '../../utils/adminUi'

function InventoryReportContent() {
    const { t } = useI18n()
    const { supabase } = useSupabaseClient()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const dragScrollRefIn = useDragScroll<HTMLDivElement>()
    const dragScrollRefOut = useDragScroll<HTMLDivElement>()

    // Read initial values from URL search params
    const urlQuery = searchParams?.get('q') ?? ''
    const urlFrom = searchParams?.get('from')
    const urlTo = searchParams?.get('to')

    const [searchQuery, setSearchQuery] = React.useState(() => urlQuery)
    const [debouncedQuery, setDebouncedQuery] = React.useState(() => urlQuery)

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
        const from = urlFrom ? new Date(urlFrom) : subDays(startOfDay(new Date()), 30)
        const to = urlTo ? endOfDay(new Date(urlTo)) : endOfDay(new Date())
        return { from, to }
    })

    const stateRef = React.useRef({ searchQuery, dateRange })
    React.useEffect(() => {
        stateRef.current = { searchQuery, dateRange }
    }, [searchQuery, dateRange])

    const [loading, setLoading] = React.useState(true)
    const [movementsData, setMovementsData] = React.useState<InventoryMovementRow[]>([])
    const [stats, setStats] = React.useState({ totalIn: 0, totalOut: 0, net: 0 })
    const [reasonData, setReasonData] = React.useState<{ name: string, value: number, color: string }[]>([])
    const [topProducts, setTopProducts] = React.useState<{ name: string, amount: number }[]>([])
    const [trendData, setTrendData] = React.useState<Record<string, unknown>[]>([])

    // Debounce search query
    React.useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim())
        }, 350)
        return () => clearTimeout(t)
    }, [searchQuery])

    // Write state back to URL
    React.useEffect(() => {
        const params = new URLSearchParams()
        if (debouncedQuery) params.set('q', debouncedQuery)
        if (dateRange?.from) params.set('from', dateRange.from.toISOString())
        if (dateRange?.to) params.set('to', dateRange.to.toISOString())

        const currentQs = searchParams?.toString() ?? ''
        const nextQs = params.toString()
        if (currentQs !== nextQs) {
            router.replace(`${pathname}?${nextQs}` as import('next').Route, { scroll: false })
        }
    }, [debouncedQuery, dateRange, pathname, router, searchParams])

    // Sync URL changes to state (e.g. Back/Forward navigation)
    React.useEffect(() => {
        const q = searchParams?.get('q') ?? ''
        const fromStr = searchParams?.get('from')
        const toStr = searchParams?.get('to')

        if (q !== stateRef.current.searchQuery) {
            setSearchQuery(q)
            setDebouncedQuery(q)
        }

        const nextFrom = fromStr ? new Date(fromStr) : subDays(startOfDay(new Date()), 30)
        const nextTo = toStr ? endOfDay(new Date(toStr)) : endOfDay(new Date())

        const currentFromTime = stateRef.current.dateRange?.from?.getTime()
        const currentToTime = stateRef.current.dateRange?.to?.getTime()
        const nextFromTime = nextFrom?.getTime()
        const nextToTime = nextTo?.getTime()

        if (currentFromTime !== nextFromTime || currentToTime !== nextToTime) {
            setDateRange({ from: nextFrom, to: nextTo })
        }
    }, [searchParams])

    const loadData = React.useCallback(async () => {
        try {
            setLoading(true)
            await ensureSessionFresh()

            const data = await getInventoryMovements(supabase, {
                from: dateRange?.from ?? undefined,
                to: dateRange?.to ?? undefined
            })
            setMovementsData(data)

        } catch (err) {
            console.error('Report fetch error:', err)
        } finally {
            setLoading(false)
        }
    }, [dateRange, supabase])

    React.useEffect(() => {
        void loadData()
    }, [loadData, pathname])

    // Process data based on movements and search
    React.useEffect(() => {
        let tIn = 0, tOut = 0
        const reasonMap: Record<string, number> = { sale: 0, return: 0, restock: 0, manual_in: 0, manual_out: 0, adjustment: 0 }
        const productSales: Record<string, { name: string, out: number }> = {}
        const trendMap: Record<string, { date: string, incoming: number, outgoing: number }> = {}

        const term = searchQuery.toLowerCase().trim()
        const filtered = term ? movementsData.filter(m => (((m.products as Record<string, unknown>)?.name as string) || '').toLowerCase().includes(term) || (m.product_id as string).toLowerCase().includes(term)) : movementsData

        // Initialize trend map for the selected interval
        if (dateRange?.from && dateRange?.to) {
            const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
            days.forEach(d => {
                const k = format(d, 'yyyy-MM-dd')
                trendMap[k] = { date: format(d, 'dd MMM'), incoming: 0, outgoing: 0 }
            })
        }

        filtered.forEach(m => {
            const dateKey = format(new Date(m.created_at as string), 'yyyy-MM-dd')
            const deltaAbs = Math.abs(m.delta as number)

            if ((m.delta as number) > 0) {
                tIn += m.delta as number
                if (trendMap[dateKey]) trendMap[dateKey].incoming += m.delta as number
            } else {
                tOut += deltaAbs
                if (trendMap[dateKey]) trendMap[dateKey].outgoing += deltaAbs
            }

            if (reasonMap[m.reason as string] !== undefined) {
                reasonMap[m.reason as string] += deltaAbs
            }

            if ((m.delta as number) < 0 && (m.reason === 'sale' || m.reason === 'manual_out')) {
                const pname = (m.products as Record<string, unknown>)?.name as string || (m.product_id as string)
                if (!productSales[pname]) productSales[pname] = { name: pname, out: 0 }
                productSales[pname].out += deltaAbs
            }
        })

        setStats({ totalIn: tIn, totalOut: tOut, net: tIn - tOut })

        const rData = [
            { name: t('admin.inventory.reasons.sale'), value: reasonMap.sale, color: '#F43F5E' },
            { name: t('admin.inventory.reasons.return'), value: reasonMap.return, color: '#10B981' },
            { name: t('admin.inventory.reasons.restock'), value: reasonMap.restock, color: '#3B82F6' },
            { name: t('admin.inventory.reasons.manualOrAdjustment'), value: reasonMap.manual_in + reasonMap.manual_out + reasonMap.adjustment, color: '#8B5CF6' },
        ].filter(d => d.value > 0)
        setReasonData(rData)

        const sortedProds = Object.values(productSales).sort((a, b) => b.out - a.out).slice(0, 8).map(p => ({
            name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
            amount: p.out
        }))
        setTopProducts(sortedProds)

        setTrendData(Object.values(trendMap))
    }, [movementsData, searchQuery, dateRange, t])

    const exportCsv = () => {
        if (movementsData.length === 0) return
        const header = [
            t('admin.inventory.export.headers.id'),
            t('admin.inventory.export.headers.date'),
            t('admin.inventory.export.headers.product'),
            t('admin.inventory.export.headers.amount'),
            t('admin.inventory.export.headers.reason'),
            t('admin.inventory.export.headers.productId')
        ]
        const csvRows = movementsData.map(m => [
            m.id,
            format(new Date(m.created_at as string), 'yyyy-MM-dd HH:mm'),
            (m.products as Record<string, unknown>)?.name || m.product_id,
            m.delta,
            m.reason,
            m.product_id
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

        const csvString = '\ufeff' + [header.join(','), ...csvRows].join('\n')
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `stok-raporu-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const filteredMovements = React.useMemo(() => {
        const term = searchQuery.toLowerCase().trim()
        return term ? movementsData.filter(m => (((m.products as Record<string, unknown>)?.name as string) || '').toLowerCase().includes(term) || (m.product_id as string).toLowerCase().includes(term)) : movementsData
    }, [movementsData, searchQuery])

    const inboundMovements = filteredMovements.filter(m => (m.delta as number) > 0).slice(0, 50)
    const outboundMovements = filteredMovements.filter(m => (m.delta as number) < 0).slice(0, 50)

    if (loading) return (
        <div className="space-y-6 max-w-page">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="h-8 w-64 bg-admin-surface-2 animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-96 bg-admin-surface-2 animate-pulse rounded"></div>
                </div>
            </div>
            <AdminSkeleton variant="cards" count={3} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 bg-admin-surface-2 animate-pulse rounded-admin-lg border border-admin-border w-full" />
                <div className="h-80 bg-admin-surface-2 animate-pulse rounded-admin-lg border border-admin-border w-full" />
            </div>
        </div>
    )

    return (
        <div className="space-y-6 max-w-page">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className={adminSectionTitleClass}>{t('admin.inventory.reportTitle')}</h1>
                    <p className="text-admin-fg-muted text-sm mt-1">{t('admin.inventory.reportSubtitle')}</p>
                </div>
                <button
                    onClick={exportCsv}
                    className={`${adminButtonSecondaryClass} flex items-center gap-2 !px-4 !py-2.5 !rounded-admin-md shadow-admin-sm`}
                >
                    <Download size={18} />
                    <span>{t('admin.inventory.downloadCsv')}</span>
                </button>
            </div>

            <AdminToolbar
                sticky
                search={{
                    value: searchQuery,
                    onChange: setSearchQuery,
                    placeholder: t('admin.inventory.filterPlaceholder'),
                    focusShortcut: '/'
                }}
                rightExtra={<DateRangePicker value={dateRange} onChange={setDateRange} />}
            />

            <>
                {/* Üst Kartlar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`${adminCardClass} p-6 border-l-4 border-l-emerald-500 !rounded-admin-lg shadow-admin-md relative overflow-hidden group`}>
                        <div className="flex items-center gap-2 text-admin-fg-muted mb-2">
                            <ArrowDownRight className="w-5 h-5 text-admin-success" />
                            <h3 className="font-semibold text-xs text-admin-fg-muted">{t('admin.inventory.totalIn')}</h3>
                        </div>
                        <div className="text-3xl font-semibold text-admin-fg-subtle">{stats.totalIn} <span className="text-xs font-medium text-admin-fg-muted">{t('admin.inventory.pieces')}</span></div>
                    </div>

                    <div className={`${adminCardClass} p-6 border-l-4 border-l-rose-500 !rounded-admin-lg shadow-admin-md relative overflow-hidden group`}>
                        <div className="flex items-center gap-2 text-admin-fg-muted mb-2">
                            <ArrowUpRight className="w-5 h-5 text-admin-danger" />
                            <h3 className="font-semibold text-xs text-admin-fg-muted">{t('admin.inventory.totalOut')}</h3>
                        </div>
                        <div className="text-3xl font-semibold text-admin-fg-subtle">{stats.totalOut} <span className="text-xs font-medium text-admin-fg-muted">{t('admin.inventory.pieces')}</span></div>
                    </div>

                    <div className={`${adminCardClass} p-6 border-l-4 border-l-indigo-500 !rounded-admin-lg shadow-admin-md relative overflow-hidden group`}>
                        <div className="flex items-center gap-2 text-admin-fg-muted mb-2">
                            <Activity className="w-5 h-5 text-admin-accent" />
                            <h3 className="font-semibold text-xs text-admin-fg-muted">{t('admin.inventory.netChange')}</h3>
                        </div>
                        <div className={`text-3xl font-semibold ${stats.net > 0 ? 'text-admin-success' : stats.net < 0 ? 'text-admin-danger' : 'text-admin-fg-subtle'}`}>
                            {stats.net > 0 ? '+' : ''}{stats.net} <span className="text-xs font-medium text-admin-fg-muted">{t('admin.inventory.pieces')}</span>
                        </div>
                    </div>
                </div>

                {/* Ana Grafikler Grid (2 Pencereli Görünüm) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-600 delay-100">
                    <div className={`${adminCardClass} p-6 !rounded-admin-lg shadow-admin-md border-admin-border`}>
                        <h2 className="text-xs font-semibold text-admin-fg-subtle mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-admin-accent" />
                            {t('admin.inventory.stockFlowTrend')}
                        </h2>
                        {movementsData.length > 0 ? (
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="incoming" name={t('admin.inventory.incomingChartLabel')} stroke="#10B981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="outgoing" name={t('admin.inventory.outgoingChartLabel')} stroke="#F43F5E" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-72 flex items-center justify-center">
                                <AdminEmptyState icon={PackageMinus} title={t('admin.inventory.empty.noTrendDataTitle')} description={t('admin.inventory.empty.noTrendDataDesc')} compact />
                            </div>
                        )}
                    </div>

                    <div className={`${adminCardClass} p-6 !rounded-admin-lg shadow-admin-md border-admin-border`}>
                        <h2 className="text-xs font-semibold text-admin-fg-subtle mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-admin-accent" />
                            {t('admin.inventory.actionTypeAnalysis')}
                        </h2>
                        {reasonData.length > 0 ? (
                            <div className="h-72 flex items-center justify-center relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={reasonData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" cornerRadius={4}>
                                            {reasonData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xs text-admin-fg-muted font-bold tracking-tight">{t('admin.ui.total')}</span>
                                    <span className="text-xl font-semibold text-admin-fg-subtle">{movementsData.length}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-72 flex items-center justify-center">
                                <AdminEmptyState icon={Activity} title={t('admin.inventory.empty.noAnalysisDataTitle')} description={t('admin.inventory.empty.noAnalysisDataDesc')} compact />
                            </div>
                        )}
                    </div>
                </div>

                {/* Orta Bölüm: En Çok Hareket Görenler (Geniş Grafik) */}
                <div className={`${adminCardClass} p-6 !rounded-admin-lg shadow-admin-md border-admin-border animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200`}>
                    <h2 className="text-xs font-semibold text-admin-fg-subtle mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-admin-accent" />
                        {t('admin.inventory.topMovingProducts')}
                    </h2>
                    <div className="h-80">
                        {topProducts.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="amount" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <AdminEmptyState icon={PackageMinus} title={t('admin.inventory.empty.noDataTitle')} description={t('admin.inventory.empty.noDataDesc')} compact />
                            </div>
                        )}
                    </div>
                </div>

                {/* Detay Tabloları (2 Pencereli Görünüm: Girişler vs Çıkışlar) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-800 delay-300">
                    {/* Giriş Hareketleri Penceresi */}
                    <div className={`${adminCardClass} overflow-hidden !rounded-admin-lg shadow-admin-lg border-admin-success/30`}>
                        <div className="p-4 bg-admin-success-weak border-b border-admin-success/30 flex items-center justify-between">
                            <h2 className="text-xs font-semibold text-admin-success flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" />
                                {t('admin.inventory.recentIncoming')}
                            </h2>
                            <span className="text-xs font-semibold text-admin-success bg-admin-success-weak px-2 py-0.5 rounded-md border border-admin-success/30 tracking-tighter">{t('admin.inventory.incomingLabel')}</span>
                        </div>
                        <div ref={dragScrollRefIn} className={`overflow-x-auto ${adminTableScrollAreaClass}`}>
                            {inboundMovements.length > 0 ? (
                                <table className="w-full text-xs">
                                    <thead className="bg-admin-surface-2 sticky top-0 z-10">
                                        <tr>
                                            <th className={adminTableHeadCellClass + " py-2"}>{t('admin.inventory.table.date')}</th>
                                            <th className={adminTableHeadCellClass + " py-2"}>{t('admin.inventory.table.product')}</th>
                                            <th className={adminTableHeadCellClass + " py-2"}>{t('admin.inventory.table.amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-admin-border">
                                        {inboundMovements.map((m) => (
                                            <tr key={m.id as string} className="hover:bg-admin-success-weak transition-colors">
                                                <td className={adminTableCellClass + " py-2"}>{format(new Date(m.created_at as string), 'dd.MM HH:mm')}</td>
                                                <td className={`${adminTableCellClass} py-2 font-medium truncate ${adminTableCellTruncate150Class}`}>{(m.products as Record<string, unknown>)?.name as string || m.product_id as string}</td>
                                                <td className={adminTableCellClass + "py-2 font-bold text-admin-success"}>+{m.delta as number}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12">
                                    <AdminEmptyState icon={PackageMinus} title={t('admin.inventory.empty.noIncomingTitle')} description={t('admin.inventory.empty.noIncomingDesc')} compact />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Çıkış Hareketleri Penceresi */}
                    <div className={`${adminCardClass} overflow-hidden !rounded-admin-lg shadow-admin-lg border-admin-danger/30`}>
                        <div className="p-4 bg-admin-danger-weak border-b border-admin-danger/30 flex items-center justify-between">
                            <h2 className="text-xs font-semibold text-admin-danger flex items-center gap-2">
                                <MinusCircle className="w-4 h-4" />
                                {t('admin.inventory.recentOutgoing')}
                            </h2>
                            <span className="text-xs font-semibold text-admin-danger bg-admin-danger-weak px-2 py-0.5 rounded-md border border-admin-danger/30 tracking-tighter">{t('admin.inventory.outgoingLabel')}</span>
                        </div>
                        <div ref={dragScrollRefOut} className={`overflow-x-auto ${adminTableScrollAreaClass}`}>
                            {outboundMovements.length > 0 ? (
                                <table className="w-full text-xs">
                                    <thead className="bg-admin-surface-2 sticky top-0 z-10">
                                        <tr>
                                            <th className={adminTableHeadCellClass + " py-2"}>{t('admin.inventory.table.date')}</th>
                                            <th className={adminTableHeadCellClass + " py-2"}>{t('admin.inventory.table.product')}</th>
                                            <th className={adminTableHeadCellClass + " py-2"}>{t('admin.inventory.table.amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-admin-border">
                                        {outboundMovements.map((m) => (
                                            <tr key={m.id as string} className="hover:bg-admin-danger-weak transition-colors">
                                                <td className={adminTableCellClass + " py-2"}>{format(new Date(m.created_at as string), 'dd.MM HH:mm')}</td>
                                                <td className={`${adminTableCellClass} py-2 font-medium truncate ${adminTableCellTruncate150Class}`}>{(m.products as Record<string, unknown>)?.name as string || m.product_id as string}</td>
                                                <td className={adminTableCellClass + "py-2 font-bold text-admin-danger"}>{m.delta as number}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12">
                                    <AdminEmptyState icon={PackageMinus} title={t('admin.inventory.empty.noOutgoingTitle')} description={t('admin.inventory.empty.noOutgoingDesc')} compact />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        </div>
    )
}

export default function AdminInventoryReportPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6 max-w-page">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="h-8 w-64 bg-admin-surface-2 animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-96 bg-admin-surface-2 animate-pulse rounded"></div>
                    </div>
                </div>
                <AdminSkeleton variant="cards" count={3} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-admin-surface-2 animate-pulse rounded-admin-lg border border-admin-border w-full" />
                    <div className="h-80 bg-admin-surface-2 animate-pulse rounded-admin-lg border border-admin-border w-full" />
                </div>
            </div>
        }>
            <InventoryReportContent />
        </Suspense>
    )
}
