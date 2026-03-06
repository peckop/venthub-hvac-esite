import React, { ReactNode } from 'react'

/**
 * Belirli bir metin içinde aranan terimi case-insensitive olarak bulur
 * ve <mark> etiketi ile vurgular.
 * 
 * @param text Vurgulama yapılacak ana metin
 * @param query Aranan terim
 * @returns ReactNode Vurgulanmış metin veya orijinal metin
 */
export function highlightMatch(text: string, query: string): ReactNode {
    if (!query.trim()) return text

    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
    }

    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'))

    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-100 text-primary-navy font-semibold rounded-sm px-0.5">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    )
}
