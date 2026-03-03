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
            <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="h-6 w-32 bg-slate-200 animate-pulse rounded"></div>
                    <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg"></div>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {[...Array(5)].map((_, i) => (
                                    <th key={i} className="p-4"><div className="h-4 w-20 bg-slate-200 animate-pulse rounded"></div></th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[...Array(rows)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(5)].map((_, j) => (
                                        <td key={j} className="p-4"><div className="h-4 w-full max-w-[120px] bg-slate-100 animate-pulse rounded"></div></td>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                        <div className="space-y-3">
                            <div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
                            <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                        </div>
                        <div className="h-12 w-12 bg-slate-100 animate-pulse rounded-full"></div>
                    </div>
                ))}
            </div>
        )
    }

    // form variant
    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-6 max-w-2xl">
            <div className="h-6 w-40 bg-slate-200 animate-pulse rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(fields)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-slate-100 animate-pulse rounded-lg"></div>
                    </div>
                ))}
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <div className="h-10 w-24 bg-slate-200 animate-pulse rounded-lg"></div>
                <div className="h-10 w-32 bg-primary-navy/20 animate-pulse rounded-lg"></div>
            </div>
        </div>
    )
}
