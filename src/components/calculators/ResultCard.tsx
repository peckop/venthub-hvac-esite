import { AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react'
import React from 'react'

type ResultStatus = 'optimal' | 'acceptable' | 'warning' | 'critical' | 'info'

interface ResultCardProps {
    title: string
    value: string | number
    unit?: string
    status?: ResultStatus
    description?: string
    icon?: React.ReactNode
    large?: boolean
}

/**
 * Hesaplama sonuç kartı
 * Duruma göre renk kodlu ve animasyonlu
 */
const ResultCard: React.FC<ResultCardProps> = ({
    title,
    value,
    unit,
    status = 'info',
    description,
    icon,
    large = false
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'optimal':
                return {
                    bgColor: 'bg-success-green/10',
                    borderColor: 'border-success-green/30',
                    iconColor: 'text-success-green',
                    icon: <CheckCircle size={20} />
                }
            case 'acceptable':
                return {
                    bgColor: 'bg-secondary-blue/10',
                    borderColor: 'border-secondary-blue/30',
                    iconColor: 'text-secondary-blue',
                    icon: <CheckCircle size={20} />
                }
            case 'warning':
                return {
                    bgColor: 'bg-warning-orange/10',
                    borderColor: 'border-warning-orange/30',
                    iconColor: 'text-warning-orange',
                    icon: <AlertTriangle size={20} />
                }
            case 'critical':
                return {
                    bgColor: 'bg-danger-red/10',
                    borderColor: 'border-danger-red/30',
                    iconColor: 'text-danger-red',
                    icon: <AlertTriangle size={20} />
                }
            default:
                return {
                    bgColor: 'bg-primary-navy/5',
                    borderColor: 'border-primary-navy/20',
                    iconColor: 'text-primary-navy',
                    icon: <Info size={20} />
                }
        }
    }

    const config = getStatusConfig()

    return (
        <div
            className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-xl p-4 transition-shadow duration-300
        hover:shadow-md
        ${large ? 'col-span-full md:col-span-2' : ''}
      `}
        >
            <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-steel-gray">{title}</span>
                <div className={config.iconColor}>
                    {icon || config.icon}
                </div>
            </div>

            <div className="flex items-baseline gap-2">
                <span className={`
          font-bold text-industrial-gray
          ${large ? 'text-3xl' : 'text-2xl'}
        `}>
                    {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
                </span>
                {unit && (
                    <span className="text-sm text-steel-gray">{unit}</span>
                )}
            </div>

            {description && (
                <p className="mt-2 text-xs text-steel-gray leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    )
}

/**
 * Sonuç kartları grubu
 */
interface ResultGridProps {
    children: React.ReactNode
    title?: string
}

export const ResultGrid: React.FC<ResultGridProps> = ({ children, title }) => {
    return (
        <div className="mt-6">
            {title && (
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-primary-navy" size={20} />
                    <h3 className="font-semibold text-industrial-gray">{title}</h3>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </div>
    )
}

/**
 * Öneriler listesi
 */
interface RecommendationsProps {
    items: string[]
    title?: string
}

export const Recommendations: React.FC<RecommendationsProps> = ({
    items,
    title = 'Öneriler'
}) => {
    if (items.length === 0) return null

    return (
        <div className="mt-6 p-4 bg-secondary-blue/5 border border-secondary-blue/20 rounded-xl">
            <h4 className="font-medium text-industrial-gray mb-3 flex items-center gap-2">
                <Info size={18} className="text-secondary-blue" />
                {title}
            </h4>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-steel-gray">
                        <span className="text-secondary-blue mt-1">•</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ResultCard



