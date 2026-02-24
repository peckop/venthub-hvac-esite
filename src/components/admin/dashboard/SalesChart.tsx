'use client'

import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

interface SalesChartProps {
    data: Array<{ date: string; count: number }>
    title: string
}

const SalesChart: React.FC<SalesChartProps> = ({ data, title }) => {
    return (
        <div className="bg-white rounded-lg shadow-hvac-md p-4 w-full h-[300px] flex flex-col">
            <div className="text-sm font-semibold text-industrial-gray mb-4">{title}</div>
            {data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-steel-gray">
                    Veri bulunamadı.
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#1F2937', marginBottom: '4px' }}
                                itemStyle={{ color: '#1E3A8A' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                name="Sipariş / Teklif"
                                stroke="#1E3A8A"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                                activeDot={{ r: 6, fill: '#1E3A8A', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}

export default SalesChart
