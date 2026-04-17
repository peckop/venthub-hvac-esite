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
import { Activity } from 'lucide-react'
import AdminEmptyState from '../AdminEmptyState'

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
                <div className="glass-strong border border-white/5 py-3 px-5 rounded-2xl z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[13px] font-black text-white mb-2 uppercase tracking-wider">{data.dayName}, {String(data.hour).padStart(2, '0')}:00</p>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                        Sipariş: <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">{data.count}</span>
                    </p>
                </div>
            )
        }
        return null
    }

    // Find max count for Z axis scaling
    let maxCount = 1;
    for (let i = 0; i < chartData.length; i++) {
        if (chartData[i].count > maxCount) {
            maxCount = chartData[i].count;
        }
    }
    // zRange determines pixel size of bubbles [minArea, maxArea]
    const zRange = [20, 400]

    return (
        <div className="flex flex-col h-full w-full group/heatmap">
            {title && (
                <div className="mb-10">
                    <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover/heatmap:text-cyan-400 transition-colors uppercase">{title}</h3>
                    <div className="h-0.5 w-12 bg-cyan-500/30 mt-2 rounded-full group-hover/heatmap:w-20 transition-all duration-700" />
                </div>
            )}

            {chartData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AdminEmptyState 
                        icon={Activity} 
                        title="Aktivite Bulunamadı" 
                        description="Seçili aralıkta henüz aktivite kaydı bulunmuyor." 
                        compact 
                    />
                </div>
            ) : (
                <div className="w-full flex-1 min-h-[300px] -ml-6 relative">
                    {/* Background decorative glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
                    
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 30 }}>
                            <XAxis
                                type="number"
                                dataKey="hour"
                                name="Saat"
                                domain={[0, 23]}
                                tickCount={24}
                                tick={{ fontSize: 9, fill: '#64748B', fontWeight: 900 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => String(val).padStart(2, '0')}
                                interval="preserveStartEnd"
                                minTickGap={15}
                            />
                            <YAxis
                                type="number"
                                dataKey="dayIndex"
                                name="Gün"
                                domain={[0, 6]}
                                tickCount={7}
                                tick={{ fontSize: 10, fill: '#64748B', fontWeight: 900 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => dayNames[val].toUpperCase()}
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
                                cursor={{ strokeDasharray: '4 4', stroke: '#22d3ee', strokeWidth: 1.5, opacity: 0.3 }}
                                isAnimationActive={false}
                            />
                            <Scatter data={chartData} fill="#22d3ee">
                                {chartData.map((entry, index) => {
                                    const intensity = entry.count / maxCount
                                    const opacity = Math.max(0.15, intensity)
                                    return (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill="#22d3ee"
                                            fillOpacity={opacity}
                                            stroke="#22d3ee"
                                            strokeWidth={intensity > 0.7 ? 2 : 0}
                                            strokeOpacity={intensity}
                                            className="transition-all duration-700 hover:fill-white cursor-pointer origin-center"
                                            style={{ filter: intensity > 0.5 ? `drop-shadow(0 0 ${8 * intensity}px rgba(34,211,238,${0.5 * intensity}))` : 'none' }}
                                        />
                                    )
                                })}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            )}

            {chartData.length > 0 && (
                <div className="mt-8 flex items-center justify-end gap-4 px-6 relative z-10">
                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] italic">Yoğunluk Skalası</span>
                    <div className="flex items-center gap-2 p-1.5 glass rounded-full border border-white/5">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 opacity-20 border border-white/10"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 opacity-50 border border-white/10"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 opacity-100 shadow-[0_0_15px_rgba(34,211,238,0.7)] border border-cyan-400/20"></div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ActivityHeatmap
