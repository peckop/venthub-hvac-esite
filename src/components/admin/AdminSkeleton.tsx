import React from 'react'


interface AdminSkeletonProps {
    variant: 'table' | 'cards' | 'form'
    rows?: number
    count?: number
    fields?: number
}

export default function AdminSkeleton({ variant, rows = 5, count = 4, fields = 6 }: AdminSkeletonProps) {
    if (variant === 'table') {
        return (
            <div className={`w-full bg-admin-surface rounded-admin-lg border border-admin-border overflow-hidden shadow-admin-lg`}>
                <div className="p-6 border-b border-admin-border flex justify-between items-center bg-admin-surface-2">
                    <div className="h-6 w-32 bg-admin-surface-2 animate-pulse rounded-admin-md border border-admin-border"></div>
                    <div className="h-10 w-48 bg-admin-surface-2 animate-pulse rounded-admin-md border border-admin-border shadow-inner"></div>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left">
                        <thead className="bg-admin-surface-2 border-b border-admin-border">
                            <tr>
                                {[...Array(5)].map((_, i) => (
                                    <th key={i} className="p-5">
                                      <div className="h-3 w-16 bg-admin-surface-3 animate-pulse rounded-full"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {[...Array(rows)].map((_, i) => (
                                <tr key={i} className="bg-transparent">
                                    {[...Array(5)].map((_, j) => (
                                        <td key={j} className="p-5">
                                          <div className="h-4 w-full max-w-120px bg-admin-surface-2 animate-pulse rounded-admin-md"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    if (variant === 'cards') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className={`bg-admin-surface p-8 rounded-admin-lg border border-admin-border shadow-admin-lg flex items-center justify-between group overflow-hidden relative`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="space-y-4 relative z-raised">
                            <div className="h-3 w-20 bg-admin-surface-3 animate-pulse rounded-full"></div>
                            <div className="h-10 w-24 bg-admin-surface-2 animate-pulse rounded-admin-md border border-admin-border"></div>
                        </div>
                        <div className="h-14 w-14 bg-admin-surface-2 animate-pulse rounded-admin-lg border border-admin-border relative z-raised shadow-admin-md shadow-black/20"></div>
                    </div>
                ))}
            </div>
        )
    }

    // form variant
    return (
        <div className={`bg-admin-surface p-8 md:p-10 rounded-admin-lg border border-admin-border shadow-admin-lg space-y-8 max-w-2xl relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-admin-accent-weak blur-3xl rounded-full"></div>
            <div className="h-8 w-48 bg-admin-surface-3 animate-pulse rounded-admin-md border border-admin-border mb-10 relative z-raised"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-raised">
                {[...Array(fields)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <div className="h-3 w-24 bg-admin-surface-3 animate-pulse rounded-full ml-1"></div>
                        <div className="h-12 w-full bg-admin-surface-2 animate-pulse rounded-admin-lg border border-admin-border shadow-inner"></div>
                    </div>
                ))}
            </div>
            <div className="pt-8 flex justify-end gap-4 border-t border-admin-border mt-10 relative z-raised">
                <div className="h-12 w-28 bg-admin-surface-2 animate-pulse rounded-admin-lg border border-admin-border shadow-admin-sm"></div>
                <div className="h-12 w-36 bg-admin-accent-weak animate-pulse rounded-admin-lg border border-admin-accent/30 shadow-admin-md shadow-cyan-400/5"></div>
            </div>
        </div>
    )
}
