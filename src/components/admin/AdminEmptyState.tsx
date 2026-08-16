import { LucideIcon } from 'lucide-react'
import React from 'react'

interface AdminEmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
    compact?: boolean
}

export default function AdminEmptyState({ icon: Icon, title, description, action, compact }: AdminEmptyStateProps) {
    if (compact) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-14 h-14 bg-admin-surface flex items-center justify-center rounded-admin-lg mb-4 text-admin-accent border border-admin-border">
                    <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xs font-semibold text-admin-fg mb-2">{title}</h3>
                <p className="text-xs text-admin-fg-muted max-w-200px leading-relaxed">{description}</p>
                {action && (
                    <button
                        onClick={action.onClick}
                        className="mt-5 px-5 py-2 rounded-admin-md text-xs font-semibold bg-admin-surface-2 border border-admin-border text-admin-fg hover:bg-admin-surface-3 hover:text-admin-fg transition-colors"
                    >
                        {action.label}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-admin-surface rounded-admin-lg border border-dashed border-admin-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-admin-accent-weak to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="w-20 h-20 bg-admin-surface flex items-center justify-center rounded-admin-lg mb-6 text-admin-accent border border-admin-border relative z-raised transition-transform duration-500 group-hover:scale-110">
                <Icon size={36} strokeWidth={1.5} />
            </div>
            
            <h3 className="text-lg font-semibold text-admin-fg mb-3 relative z-raised">{title}</h3>
            <p className="text-xs text-admin-fg-muted max-w-sm mb-8 leading-relaxed relative z-raised">{description}</p>
            
            {action && (
                <button
                    onClick={action.onClick}
                    className="relative z-raised px-8 py-3 rounded-admin-lg bg-admin-accent text-admin-accent-fg text-xs font-semibold hover:bg-admin-accent-hover transform hover:-translate-y-0.5 transition-transform shadow-admin-sm active:scale-95"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
