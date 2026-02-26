import React from 'react'

export type HealthScore = 'A' | 'B' | 'C' | 'D' | 'N/A'

interface ProductHealthProps {
    stockQty: number
    threshold: number
    status: string
    isFeatured: boolean
}

const ProductHealthBadge: React.FC<ProductHealthProps> = ({ stockQty, threshold, status, isFeatured }) => {
    // Determine score
    let score: HealthScore = 'N/A'

    if (status !== 'active' || stockQty === 0) {
        score = 'D'
    } else if (stockQty < threshold) {
        score = 'C'
    } else if (stockQty >= threshold * 2 && isFeatured) {
        score = 'A'
    } else if (stockQty >= threshold) {
        score = 'B'
    }

    // Color mapping
    const colors = {
        'A': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
        'B': 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
        'C': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
        'D': 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
        'N/A': 'bg-slate-50 text-slate-500 border-slate-200 ring-slate-500/20'
    }

    const descriptions = {
        'A': 'Yüksek Performans (A-Tier)',
        'B': 'Stabil Satış (B-Tier)',
        'C': 'Kritik Stok Uyarı (C-Tier)',
        'D': 'Pasif veya Tükendi (D-Tier)',
        'N/A': 'Hesaplanamıyor'
    }

    return (
        <div
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-[11px] font-bold shadow-sm ring-2 ring-offset-1 ${colors[score]}`}
            title={`Sağlık Skoru: ${score} - ${descriptions[score]}`}
        >
            {score}
        </div>
    )
}

export default ProductHealthBadge
