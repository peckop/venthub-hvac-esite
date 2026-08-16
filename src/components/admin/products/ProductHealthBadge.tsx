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
        'A': 'bg-admin-success text-admin-success border-admin-success ring-admin-success/30',
        'B': 'bg-admin-accent text-admin-accent border-admin-accent ring-admin-accent/30',
        'C': 'bg-admin-warning text-admin-warning border-admin-warning ring-admin-warning/30',
        'D': 'bg-admin-danger text-admin-danger border-admin-danger ring-admin-danger/30',
        'N/A': 'bg-admin-surface-2 text-admin-fg-muted border-admin-border ring-admin-border'
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
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold shadow-admin-sm ring-2 ring-offset-1 ${colors[score]}`}
            title={`Sağlık Skoru: ${score} - ${descriptions[score]}`}
        >
            {score}
        </div>
    )
}

export default ProductHealthBadge
