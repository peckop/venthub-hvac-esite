import React from 'react'
import { LucideIcon } from 'lucide-react'

interface AdminEmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
}

export default function AdminEmptyState({ icon: Icon, title, description, action }: AdminEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl mb-4 text-slate-400">
                <Icon size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-navy transition-colors bg-white shadow-sm"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
