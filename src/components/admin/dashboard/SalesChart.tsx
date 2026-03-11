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
    Brush
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import AdminEmptyState from '../AdminEmptyState'

interface SalesChartProps {
    data: Array<{ date: string; orders: number; returns: number }>
    title: string
}

const SalesChart: React.FC<SalesChartProps> = ({ data, title }) => {
    return (
        <div className="flex flex-col h-[400px] w-full group/chart">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-none group-hover/chart:text-cyan-400 transition-colors">{title}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic opacity-60">Operasyonel Performans Trendi</p>
                </div>
                <div className="flex items-center gap-4 glass p-1.5 rounded-2xl border border-white/5 backdrop-blur-2xl shadow-2xl">
                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sipariş</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 border-l border-white/10 hover:bg-white/5 rounded-xl transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">İade</span>
                    </div>
                </div>
            </div>
            
            {data.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <AdminEmptyState 
                        icon={TrendingUp} 
                        title="Veri Bulunamadı" 
                        description="Seçili aralıkta satış verisi bulunmuyor." 
                        compact 
                    />
                </div>
            ) : (
                <div className="flex-1 min-h-0 -ml-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#ffffff" opacity={0.03} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: '#64748B', fontWeight: 900 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 900, fill: '#475569' }}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ 
                                    borderRadius: '24px', 
                                    border: '1px solid rgba(255, 255, 255, 0.05)', 
                                    boxShadow: '0 30px_60px_-12px_rgba(0,_0,_0,_0.6)', 
                                    padding: '24px', 
                                    backgroundColor: 'rgba(10, 15, 30, 0.95)', 
                                    backdropFilter: 'blur(20px)',
                                    color: '#fff'
                                }}
                                labelStyle={{ fontWeight: 'black', color: '#fff', marginBottom: '16px', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                                itemStyle={{ fontSize: '11px', fontWeight: '900', padding: '8px 0', textTransform: 'uppercase', letterSpacing: '0.15em' }}
                                cursor={{ stroke: '#22d3ee', strokeWidth: 1.5, strokeDasharray: '4 4', opacity: 0.4 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="orders"
                                stroke="#22d3ee"
                                strokeWidth={5}
                                fillOpacity={1}
                                fill="url(#colorOrders)"
                                activeDot={{ r: 9, fill: '#22d3ee', stroke: '#0A0F1E', strokeWidth: 4 }}
                                animationDuration={2000}
                                isAnimationActive={true}
                            />
                            <Area
                                type="monotone"
                                dataKey="returns"
                                stroke="#F43F5E"
                                strokeWidth={3}
                                strokeDasharray="6 4"
                                fillOpacity={1}
                                fill="url(#colorReturns)"
                                activeDot={{ r: 7, fill: '#F43F5E', stroke: '#0A0F1E', strokeWidth: 3 }}
                                animationDuration={2500}
                            />
                            {data.length > 20 && (
                                <Brush
                                    dataKey="date"
                                    height={35}
                                    stroke="#ffffff10"
                                    fill="rgba(10, 15, 30, 0.5)"
                                    travellerWidth={10}
                                    gap={5}
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
