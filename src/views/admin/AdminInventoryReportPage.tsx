import React from 'react'
import { supabase } from '../../lib/supabase'
import { adminSectionTitleClass, adminCardClass } from '../../utils/adminUi'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Activity, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react'

export default function AdminInventoryReportPage() {
    const [loading, setLoading] = React.useState(true)
    const [stats, setStats] = React.useState({ totalIn: 0, totalOut: 0, net: 0 })
    const [reasonData, setReasonData] = React.useState<{ name: string, value: number, color: string }[]>([])
    const [topProducts, setTopProducts] = React.useState<{ name: string, amount: number }[]>([])

    React.useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

                // 1. Son 30 günlük tüm hareketleri çek
                const { data: movements, error: movementsError } = await supabase
                    .from('inventory_movements')
                    .select('delta, reason, product_id, products(name)')
                    .gte('created_at', THIRTY_DAYS_AGO)

                if (movementsError) throw movementsError

                let tIn = 0, tOut = 0
                const reasonMap: Record<string, number> = { sale: 0, return: 0, restock: 0, manual_in: 0, manual_out: 0, adjustment: 0 }
                const productSales: Record<string, { name: string, out: number }> = {}

                movements?.forEach(m => {
                    if (m.delta > 0) tIn += m.delta
                    if (m.delta < 0) tOut += Math.abs(m.delta)

                    if (reasonMap[m.reason] !== undefined) {
                        reasonMap[m.reason] += Math.abs(m.delta)
                    }

                    // Toplu çıkış yapan (satan) ürünleri hesapla
                    if (m.delta < 0 && (m.reason === 'sale' || m.reason === 'manual_out')) {
                        const pname = (m.products as any)?.name || m.product_id
                        if (!productSales[pname]) productSales[pname] = { name: pname, out: 0 }
                        productSales[pname].out += Math.abs(m.delta)
                    }
                })

                setStats({ totalIn: tIn, totalOut: tOut, net: tIn - tOut })

                // Donut Data
                const rData = [
                    { name: 'Satış (Çıkış)', value: reasonMap.sale, color: '#F43F5E' },
                    { name: 'İade (Giriş)', value: reasonMap.return, color: '#10B981' },
                    { name: 'Tedarik (Giriş)', value: reasonMap.restock, color: '#3B82F6' },
                    { name: 'Manuel / Düzeltme', value: reasonMap.manual_in + reasonMap.manual_out + reasonMap.adjustment, color: '#8B5CF6' },
                ].filter(d => d.value > 0)
                setReasonData(rData)

                // Top 10 Products
                const sortedProds = Object.values(productSales).sort((a, b) => b.out - a.out).slice(0, 10).map(p => ({
                    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
                    amount: p.out
                }))
                setTopProducts(sortedProds)

            } catch (err) {
                console.error('Report fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        void loadData()
    }, [])

    if (loading) return <div className="p-8 text-slate-500 animate-pulse">Raporlar hesaplanıyor...</div>

    return (
        <div className="space-y-6 max-w-[1400px]">
            <div>
                <h1 className={adminSectionTitleClass}>📊 Stok Hareket Raporu (Son 30 Gün)</h1>
                <p className="text-slate-500 text-sm mt-1">Depo giriş/çıkış trendleri ve en çok satan ürünlerin özeti.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${adminCardClass} p-6 border-l-4 border-l-emerald-500`}>
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-semibold uppercase tracking-wider text-xs">Toplam Giriş</h3>
                    </div>
                    <div className="text-3xl font-black text-slate-800">{stats.totalIn} <span className="text-sm font-medium text-slate-400">adet</span></div>
                </div>

                <div className={`${adminCardClass} p-6 border-l-4 border-l-rose-500`}>
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <ArrowUpRight className="w-5 h-5 text-rose-500" />
                        <h3 className="font-semibold uppercase tracking-wider text-xs">Toplam Çıkış</h3>
                    </div>
                    <div className="text-3xl font-black text-slate-800">{stats.totalOut} <span className="text-sm font-medium text-slate-400">adet</span></div>
                </div>

                <div className={`${adminCardClass} p-6 border-l-4 border-l-indigo-500`}>
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-semibold uppercase tracking-wider text-xs">Net Değişim</h3>
                    </div>
                    <div className={`text-3xl font-black ${stats.net > 0 ? 'text-emerald-600' : stats.net < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {stats.net > 0 ? '+' : ''}{stats.net} <span className="text-sm font-medium text-slate-400">adet</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${adminCardClass} p-6`}>
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-navy" /> En Çok Satan Top 10 Ürün
                    </h2>
                    <div className="h-80">
                        {topProducts.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="amount" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">Veri bulunamadı</div>
                        )}
                    </div>
                </div>

                <div className={`${adminCardClass} p-6`}>
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary-navy" /> İşlem Türüne Göre Dağılım
                    </h2>
                    <div className="h-80 flex items-center justify-center">
                        {reasonData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={reasonData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {reasonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">Veri bulunamadı</div>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {reasonData.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600 tracking-wide">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                                {d.name} ({d.value})
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
