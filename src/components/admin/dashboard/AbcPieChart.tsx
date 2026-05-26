import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import AdminEmptyState from '../AdminEmptyState'
import { PieChart as PieIcon } from 'lucide-react'

interface AbcPieChartProps {
    data: Array<{ name: string; value: number; color: string }>
    title?: string
}

export default function AbcPieChart({ data, title }: AbcPieChartProps) {
    if (!data || data.length === 0 || data.every(d => d.value === 0)) {
        return (
            <div className="flex flex-col h-full bg-slate-900/40 rounded-hvac-2xl border border-white/5 p-10 group/pie">
                <div className="mb-10">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] group-hover/pie:text-cyan-400 transition-colors uppercase">{title || "ABC Ürün Sınıflandırması"}</h3>
                    <div className="h-0.5 w-12 bg-cyan-500/30 mt-2 rounded-full group-hover/pie:w-20 transition-colors duration-700" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AdminEmptyState 
                        icon={PieIcon} 
                        title="Analiz Verisi Yok" 
                        description="Stok sınıflandırması için yeterli veri bulunmuyor." 
                        compact 
                    />
                </div>
            </div>
        )
    }

    const totalValue = data.reduce((acc, curr) => acc + curr.value, 0)

    return (
        <div className="flex flex-col h-full group/pie">
            <div className="mb-10">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] group-hover/pie:text-cyan-400 transition-colors uppercase">{title || "ABC Ürün Sınıflandırması"}</h3>
                <div className="h-0.5 w-12 bg-cyan-500/30 mt-2 rounded-full group-hover/pie:w-20 transition-colors duration-700" />
            </div>

            <div className="flex-1 w-full min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="#0A0F1E"
                            strokeWidth={6}
                            animationBegin={0}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color}
                                    className="transition-opacity duration-500 hover:opacity-80 cursor-pointer outline-none"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ 
                                borderRadius: '24px', 
                                border: '1px solid rgba(255, 255, 255, 0.05)', 
                                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)', 
                                padding: '16px 20px', 
                                backgroundColor: 'rgba(10, 15, 30, 0.9)', 
                                backdropFilter: 'blur(16px)' 
                            }}
                            itemStyle={{ fontSize: '11px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em' }}
                            formatter={(value: number, name: string) => [`${value} Ürün`, `${name} Sınıfı`]}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            align="center"
                            height={40} 
                            iconType="circle" 
                            iconSize={8}
                            formatter={(value) => (
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Merkezdeki Toplam Metni */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 flex flex-col items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full scale-150 pointer-events-none" />
                    <span className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10">
                        {totalValue}
                    </span>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mt-1 relative z-10 italic">Toplam Stok</span>
                </div>
            </div>
        </div>
    )
}
