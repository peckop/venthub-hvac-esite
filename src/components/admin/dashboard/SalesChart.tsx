'use client'

import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Brush
} from 'recharts'

interface SalesChartProps {
    data: Array<{ date: string; orders: number; returns: number }>
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
                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94A3B8' }}
                                dy={10}
                                minTickGap={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94A3B8' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)' }}
                                labelStyle={{ fontWeight: '700', color: '#0F172A', marginBottom: '8px', fontSize: '12px' }}
                                itemStyle={{ fontSize: '12px', padding: '2px 0' }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#64748B' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="orders"
                                name="Siparişler"
                                stroke="#1E3A8A"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorOrders)"
                                activeDot={{ r: 5, fill: '#1E3A8A', stroke: '#fff', strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="returns"
                                name="İadeler"
                                stroke="#E11D48"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorReturns)"
                                activeDot={{ r: 4, fill: '#E11D48', stroke: '#fff', strokeWidth: 2 }}
                            />
                            {data.length > 20 && (
                                <Brush
                                    dataKey="date"
                                    height={30}
                                    stroke="#CBD5E1"
                                    fill="#F8FAFC"
                                    travellerWidth={10}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}

export default SalesChart
