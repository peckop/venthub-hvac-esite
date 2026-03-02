import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { adminCardPaddedClass } from '../../../utils/adminUi'

interface AbcPieChartProps {
    data: Array<{ name: string; value: number; color: string }>
}

export default function AbcPieChart({ data }: AbcPieChartProps) {
    // Veri yoksa veya hepsi 0 ise
    if (!data || data.length === 0 || data.every(d => d.value === 0)) {
        return (
            <div className={adminCardPaddedClass + " flex flex-col h-full"}>
                <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest mb-6">ABC Ürün Sınıflandırması</h3>
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400">
                    <span className="text-sm">Analiz Verisi Yok</span>
                </div>
            </div>
        )
    }

    return (
        <div className={adminCardPaddedClass + " flex flex-col h-full"}>
            <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest mb-6">ABC Ürün Sınıflandırması</h3>
            <div className="flex-1 w-full min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                            formatter={(value: number, name: string) => [`${value} Ürün`, `${name} Sınıfı`]}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>

                {/* Merkezdeki Toplam Metni */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-2xl font-bold text-slate-800">
                        {data.reduce((acc, curr) => acc + curr.value, 0)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ürün</span>
                </div>
            </div>
        </div>
    )
}
