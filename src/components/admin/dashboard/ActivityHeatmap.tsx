import React from 'react'
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

interface HeatmapData {
    day: number // 0: Sun, 1: Mon, ..., 6: Sat
    hour: number // 0-23
    count: number
}

interface ActivityHeatmapProps {
    data: HeatmapData[]
    title?: string
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data, title }) => {
    // Transform data for the chart
    // JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Our chart Y axis: 0=Mon, 1=Tue, ..., 6=Sun (to keep Monday on top or bottom)

    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

    // Transform data for the chart
    const chartData = data.map(d => {
        // Convert JS day to our 0-6 index (0=Mon, ..., 6=Sun)
        const ourDayIndex = d.day === 0 ? 6 : d.day - 1
        // We want Monday at the top, so we can invert the Y axis or map 0=Sun, 6=Mon.
        // Let's keep 0=Pzt, YAxis will be type="category" or type="number" with tick formatter.
        return {
            hour: d.hour,
            dayIndex: ourDayIndex, // 0 = Pzt, 6 = Paz
            // Invert for display so 0 is at bottom, 6 is at top. Wait, if we invert, we just use reversed domain.
            dayName: dayNames[ourDayIndex],
            count: d.count
        }
    })

    // Fill in empty spots with 0 to make the tooltip cleaner if needed, or just let them be empty
    // Tooltip content
    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: HeatmapData & { dayName: string } }[] }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-white/95 backdrop-blur shadow-xl border border-slate-200 p-3 rounded-xl z-50">
                    <p className="text-sm font-bold text-slate-800 mb-1">{data.dayName}, {String(data.hour).padStart(2, '0')}:00</p>
                    <p className="text-xs text-slate-500">
                        Sipariş: <span className="font-semibold text-primary-navy">{data.count}</span>
                    </p>
                </div>
            )
        }
        return null
    }

    // Find max count for Z axis scaling
    const maxCount = Math.max(...chartData.map(d => d.count), 1)
    // zRange determines pixel size of bubbles [minArea, maxArea]
    const zRange = [20, 400]

    return (
        <div className="flex flex-col h-full w-full">
            {title && <h3 className="text-sm font-bold text-slate-700 mb-6">{title}</h3>}

            {chartData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <p className="text-sm">Bu aralıkta henüz aktivite yok.</p>
                </div>
            ) : (
                <div className="w-full flex-1 min-h-[300px] -ml-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                            <XAxis
                                type="number"
                                dataKey="hour"
                                name="Saat"
                                domain={[0, 23]}
                                tickCount={24}
                                tick={{ fontSize: 11, fill: '#94A3B8' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => String(val).padStart(2, '0') + ':00'}
                                interval="preserveStartEnd"
                                minTickGap={20}
                            />
                            <YAxis
                                type="number"
                                dataKey="dayIndex"
                                name="Gün"
                                domain={[0, 6]}
                                tickCount={7}
                                tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => dayNames[val]}
                                reversed // Monday at the top
                            />
                            <ZAxis
                                type="number"
                                dataKey="count"
                                range={zRange}
                                domain={[0, maxCount]}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ strokeDasharray: '3 3', stroke: '#E2E8F0', strokeWidth: 1 }}
                            />
                            <Scatter data={chartData} fill="#1E3A8A">
                                {chartData.map((entry, index) => {
                                    // Color intensity based on count relative to max
                                    const intensity = entry.count / maxCount
                                    // Use primary-navy (1E3A8A) with varying opacity, or a color scale
                                    const opacity = Math.max(0.3, intensity)
                                    return (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill="#1E3A8A"
                                            fillOpacity={opacity}
                                            className="transition-all duration-300 hover:fill-blue-500"
                                        />
                                    )
                                })}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            )}

            {chartData.length > 0 && (
                <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-slate-400 font-medium px-4">
                    <span>Az Yoğun</span>
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] opacity-30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] opacity-60"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] opacity-100"></div>
                    </div>
                    <span>Çok Yoğun</span>
                </div>
            )}
        </div>
    )
}

export default ActivityHeatmap
