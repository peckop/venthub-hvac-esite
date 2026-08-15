'use client'

import { PieChart as PieIcon } from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { useI18n } from '@/i18n/I18nProvider'

import AdminEmptyState from '../AdminEmptyState'

interface AbcPieChartProps {
    data: Array<{ name: string; value: number; color: string }>
    title?: string
}

export default function AbcPieChart({ data, title }: AbcPieChartProps) {
    const { t } = useI18n()

    if (!data || data.length === 0 || data.every(d => d.value === 0)) {
        return (
            <div className="flex flex-col h-full bg-admin-surface-2 rounded-admin-lg border border-admin-border p-10 group/pie">
                <div className="mb-10">
                    <h3 className="text-xs font-semibold text-admin-fg-muted group-hover/pie:text-admin-accent transition-colors">{title || t('admin.dashboard.abcProductClassification')}</h3>
                    <div className="h-0.5 w-12 bg-admin-accent-weak mt-2 rounded-full group-hover/pie:w-20 transition-colors duration-700" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AdminEmptyState 
                        icon={PieIcon} 
                        title={t('admin.dashboard.noAnalysisData')} 
                        description={t('admin.dashboard.insufficientDataForClassification')} 
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
                <h3 className="text-xs font-semibold text-admin-fg-muted group-hover/pie:text-admin-accent transition-colors">{title || t('admin.dashboard.abcProductClassification')}</h3>
                <div className="h-0.5 w-12 bg-admin-accent-weak mt-2 rounded-full group-hover/pie:w-20 transition-colors duration-700" />
            </div>

            <div className="flex-1 w-full min-h-300px relative">
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
                            itemStyle={{ fontSize: '11px', fontWeight: '900', color: '#fff', textTransform: '', letterSpacing: '0.15em' }}
                            formatter={(value: number, name: string) => [
                                t('admin.dashboard.productCount', { count: value }),
                                t('admin.dashboard.productClass', { name })
                            ]}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            align="center"
                            height={40} 
                            iconType="circle" 
                            iconSize={8}
                            formatter={(value) => (
                                <span className="text-xs font-semibold text-admin-fg-muted ml-1">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Merkezdeki Toplam Metni */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 flex flex-col items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-admin-accent-weak blur-3xl rounded-full scale-150 pointer-events-none" />
                    <span className="text-4xl font-semibold text-admin-fg tracking-tighter drop-shadow-pie-chart-glow relative z-10">
                        {totalValue}
                    </span>
                    <span className="text-xs font-semibold text-admin-fg-muted mt-1 relative z-10 italic">
                        {t('admin.dashboard.totalStock')}
                    </span>
                </div>
            </div>
        </div>
    )
}
