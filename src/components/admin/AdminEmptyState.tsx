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
    compact?: boolean
}

export default function AdminEmptyState({ icon: Icon, title, description, action, compact }: AdminEmptyStateProps) {
    if (compact) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-14 h-14 glass-strong flex items-center justify-center rounded-2xl mb-4 text-cyan-400 shadow-glow-md border border-white/10">
                    <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-hvac-normal mb-2">{title}</h3>
                <p className="text-xs text-slate-400 max-w-200px leading-relaxed font-bold uppercase tracking-tight">{description}</p>
                {action && (
                    <button
                        onClick={action.onClick}
                        className="mt-5 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-hvac-normal bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-shadow shadow-xl"
                    >
                        {action.label}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center glass-strong rounded-hvac-2xl border border-dashed border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="w-20 h-20 glass-strong flex items-center justify-center rounded-3xl mb-6 text-cyan-400 shadow-glow-lg border border-white/20 relative z-10 transition-transform duration-500 group-hover:scale-110">
                <Icon size={36} strokeWidth={1.5} />
            </div>
            
            <h3 className="text-lg font-black text-white uppercase tracking-hvac-normal mb-3 relative z-10">{title}</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-8 leading-relaxed font-bold uppercase tracking-widest relative z-10">{description}</p>
            
            {action && (
                <button
                    onClick={action.onClick}
                    className="relative z-10 px-8 py-3 rounded-2xl bg-cyan-400 text-surface-deep text-xs font-black uppercase tracking-hvac-normal hover:bg-cyan-300 transform hover:-translate-y-0.5 transition-transform shadow-xl shadow-cyan-400/20 active:scale-95"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
