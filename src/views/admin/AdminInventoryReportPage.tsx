import React from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { adminSectionTitleClass, adminCardClass } from '../../utils/adminUi'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { Activity, ArrowDownRight, ArrowUpRight, TrendingUp, PackageMinus, SearchX } from 'lucide-react'
import DateRangePicker from '../../components/admin/DateRangePicker'
import { DateRange } from 'react-day-picker'
import { endOfDay, startOfDay, subDays } from 'date-fns'

export default function AdminInventoryReportPage() {
    const pathname = usePathname()
    const [loading, setLoading] = React.useState(true)
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: subDays(startOfDay(new Date()), 30),
        to: endOfDay(new Date())
    })
    const [searchQuery, setSearchQuery] = React.useState('')
    const [movementsData, setMovementsData] = React.useState<any[]>([])
    const [stats, setStats] = React.useState({ totalIn: 0, totalOut: 0, net: 0 })
    const [reasonData, setReasonData] = React.useState<{ name: string, value: number, color: string }[]>([])
    const [topProducts, setTopProducts] = React.useState<{ name: string, amount: number }[]>([])

    const loadData = React.useCallback(async () => {
        try {
            setLoading(true)
            await ensureSessionFresh()

            let query = supabase
                .from('inventory_movements')
                .select('delta, reason, product_id, products(name)')

            if (dateRange?.from) query = query.gte('created_at', dateRange.from.toISOString())
            if (dateRange?.to) query = query.lte('created_at', endOfDay(dateRange.to).toISOString())

            const { data: movements, error: movementsError } = await query
            if (movementsError) throw movementsError
            setMovementsData(movements || [])

        } catch (err) {
            console.error('Report fetch error:', err)
        } finally {
            setLoading(false)
        }
    }, [dateRange])

    React.useEffect(() => {
        void loadData()
    }, [loadData, pathname])

    // Process data based on movements and search
    React.useEffect(() => {
        let tIn = 0, tOut = 0
        const reasonMap: Record<string, number> = { sale: 0, return: 0, restock: 0, manual_in: 0, manual_out: 0, adjustment: 0 }
        const productSales: Record<string, { name: string, out: number }> = {}

        const term = searchQuery.toLowerCase().trim()
        const filtered = term ? movementsData.filter(m => (m.products?.name || '').toLowerCase().includes(term) || m.product_id.toLowerCase().includes(term)) : movementsData

        filtered.forEach(m => {
            if (m.delta > 0) tIn += m.delta
            if (m.delta < 0) tOut += Math.abs(m.delta)

            if (reasonMap[m.reason] !== undefined) {
                reasonMap[m.reason] += Math.abs(m.delta)
            }

            if (m.delta < 0 && (m.reason === 'sale' || m.reason === 'manual_out')) {
                const pname = (m.products as any)?.name || m.product_id
                if (!productSales[pname]) productSales[pname] = { name: pname, out: 0 }
                productSales[pname].out += Math.abs(m.delta)
            }
        })

        setStats({ totalIn: tIn, totalOut: tOut, net: tIn - tOut })

        const rData = [
            { name: 'Satış (Çıkış)', value: reasonMap.sale, color: '#F43F5E' },
            { name: 'İade (Giriş)', value: reasonMap.return, color: '#10B981' },
            { name: 'Tedarik (Giriş)', value: reasonMap.restock, color: '#3B82F6' },
            { name: 'Manuel / Düzeltme', value: reasonMap.manual_in + reasonMap.manual_out + reasonMap.adjustment, color: '#8B5CF6' },
        ].filter(d => d.value > 0)
        setReasonData(rData)

        const sortedProds = Object.values(productSales).sort((a, b) => b.out - a.out).slice(0, 10).map(p => ({
            name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
            amount: p.out
        }))
        setTopProducts(sortedProds)
    }, [movementsData, searchQuery])

    if (loading) return (
        <div className="space-y-6 max-w-[1400px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="h-8 w-64 bg-slate-200 animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-96 bg-slate-100 animate-pulse rounded"></div>
                </div>
            </div>
            <AdminSkeleton variant="cards" count={3} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 bg-slate-100 animate-pulse rounded-2xl border border-slate-200/60 w-full" />
                <div className="h-80 bg-slate-100 animate-pulse rounded-2xl border border-slate-200/60 w-full" />
            </div>
        </div>
    )

    return (
        <div className="space-y-6 max-w-[1400px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className={adminSectionTitleClass}>📊 Stok Hareket Raporu</h1>
                    <p className="text-slate-500 text-sm mt-1">Depo giriş/çıkış trendleri ve ürün bazlı analizler.</p>
                </div>
            </div>

            <AdminToolbar
                sticky
                search={{
                    value: searchQuery,
                    onChange: setSearchQuery,
                    placeholder: 'Ürün adına göre filtrele...',
                    focusShortcut: '/'
                }}
                rightExtra={<DateRangePicker value={dateRange} onChange={setDateRange} />}
            />

            {movementsData.length === 0 ? (
                <div className="py-24 bg-white rounded-3xl shadow-sm border border-slate-200/60">
                    <AdminEmptyState
                        icon={PackageMinus}
                        title="Tarih Aralığında Veri Yok"
                        description="Seçilen tarih aralığında herhangi bir stok hareketi kaydedilmemiş. Farklı bir tarih aralığı seçmeyi deneyin."
                    />
                </div>
            ) : stats.totalIn === 0 && stats.totalOut === 0 && searchQuery ? (
                <div className="py-24 bg-white rounded-3xl shadow-sm border border-slate-200/60">
                    <AdminEmptyState
                        icon={SearchX}
                        title="Eşleşen Veri Yok"
                        description={`"${searchQuery}" araması için bu tarih aralığında herhangi bir stok hareketi bulunamadı.`}
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className={`${adminCardClass} p-6 border-l-4 border-l-emerald-500 !rounded-2xl shadow-md`}>
                            <div className="flex items-center gap-2 text-slate-500 mb-2">
                                <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Toplam Giriş</h3>
                            </div>
                            <div className="text-3xl font-black text-slate-800">{stats.totalIn} <span className="text-xs font-medium text-slate-400">adet</span></div>
                        </div>

                        <div className={`${adminCardClass} p-6 border-l-4 border-l-rose-500 !rounded-2xl shadow-md`}>
                            <div className="flex items-center gap-2 text-slate-500 mb-2">
                                <ArrowUpRight className="w-5 h-5 text-rose-500" />
                                <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Toplam Çıkış</h3>
                            </div>
                            <div className="text-3xl font-black text-slate-800">{stats.totalOut} <span className="text-xs font-medium text-slate-400">adet</span></div>
                        </div>

                        <div className={`${adminCardClass} p-6 border-l-4 border-l-indigo-500 !rounded-2xl shadow-md`}>
                            <div className="flex items-center gap-2 text-slate-500 mb-2">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Net Değişim</h3>
                            </div>
                            <div className={`text-3xl font-black ${stats.net > 0 ? 'text-emerald-600' : stats.net < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                                {stats.net > 0 ? '+' : ''}{stats.net} <span className="text-xs font-medium text-slate-400">adet</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        <div className={`${adminCardClass} p-6 !rounded-3xl shadow-lg border-slate-100`}>
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary-navy" /> En Çok Hareket Gören Ürünler
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
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                        <PackageMinus size={40} className="opacity-20" />
                                        <span className="text-sm">Yeterli veri yok</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`${adminCardClass} p-6 !rounded-3xl shadow-lg border-slate-100`}>
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary-navy" /> İşlem Türü Analizi
                            </h2>
                            <div className="h-80 flex items-center justify-center">
                                {reasonData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={reasonData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={8}
                                                dataKey="value"
                                                cornerRadius={4}
                                            >
                                                {reasonData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                        <Activity size={40} className="opacity-20" />
                                        <span className="text-sm">Analiz için yeterli veri yok</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4">
                                {reasonData.map((d, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600 tracking-tight">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                                        {d.name} <span className="text-slate-400 font-medium">({d.value})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
