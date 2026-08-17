'use client'

import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'

interface JsonDiffViewerProps {
    before: unknown
    after: unknown
}

const JsonDiffViewer: React.FC<JsonDiffViewerProps> = ({ before, after }) => {
    const { t } = useI18n()
    const bObj = (typeof before === 'object' && before !== null) ? before as Record<string, unknown> : {}
    const aObj = (typeof after === 'object' && after !== null) ? after as Record<string, unknown> : {}

    const allKeys = Array.from(new Set([...Object.keys(bObj), ...Object.keys(aObj)])).sort()

    const safeStringify = (val: unknown) => {
        if (val === undefined || val === null) return 'null'
        if (typeof val === 'string') return `"${val}"`
        if (typeof val === 'object') return JSON.stringify(val)
        return String(val)
    }

    return (
        <div className="w-full bg-admin-surface-3 rounded-admin-md overflow-hidden border border-admin-border">
            <div className="flex text-xs font-semibold text-admin-fg-muted bg-admin-surface-2 border-b border-admin-border">
                <div className="flex-1 p-3 border-r border-admin-border flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-admin-danger"></div>
                    {t('admin.common.oldValueBefore')}
                </div>
                <div className="flex-1 p-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-admin-success"></div>
                    {t('admin.common.newValueAfter')}
                </div>
            </div>
            <div className="p-3 text-xs font-mono leading-relaxed overflow-x-auto max-h-400px">
                {allKeys.map(key => {
                    const valB = bObj[key]
                    const valA = aObj[key]

                    const strB = safeStringify(valB)
                    const strA = safeStringify(valA)

                    const isRemoved = valB !== undefined && valA === undefined
                    const isAdded = valB === undefined && valA !== undefined
                    const isChanged = !isRemoved && !isAdded && strB !== strA

                    if (!isRemoved && !isAdded && !isChanged) {
                        // Unchanged
                        return (
                            <div key={key} className="flex hover:bg-admin-surface-2 transition-colors">
                                <div className="flex-1 px-2 py-1 border-r border-admin-border text-admin-fg-muted truncate" title={`${key}: ${strB}`}>
                                    <span className="text-admin-fg-subtle mr-2">{key}:</span> {strB}
                                </div>
                                <div className="flex-1 px-2 py-1 text-admin-fg-muted truncate" title={`${key}: ${strB}`}>
                                    <span className="text-admin-fg-subtle mr-2">{key}:</span> {strB}
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div key={key} className="flex hover:bg-admin-surface-2 transition-colors">
                            {/* Before Column */}
                            <div className={`flex-1 px-2 py-1 border-r border-admin-border truncate ${isAdded ? 'bg-admin-surface-2' : (isRemoved || isChanged ? 'bg-admin-danger-weak text-admin-danger' : 'text-admin-fg-muted')}`}>
                                <span className="text-admin-fg-muted mr-2 opacity-70">{key}:</span>
                                {isAdded ? <span className="text-admin-fg-subtle italic">{t('admin.common.added')}</span> : <span title={strB}>{strB}</span>}
                            </div>

                            {/* After Column */}
                            <div className={`flex-1 px-2 py-1 truncate ${isRemoved ? 'bg-admin-surface-2' : (isAdded || isChanged ? 'bg-admin-success-weak text-admin-success' : 'text-admin-fg-muted')}`}>
                                <span className="text-admin-fg-muted mr-2 opacity-70">{key}:</span>
                                {isRemoved ? <span className="text-admin-fg-subtle italic">{t('admin.common.deleted')}</span> : <span title={strA}>{strA}</span>}
                            </div>
                        </div>
                    )
                })}
                {allKeys.length === 0 && (
                    <div className="text-center py-4 text-admin-fg-muted italic">{t('admin.common.noChangeDetails')}</div>
                )}
            </div>
        </div>
    )
}

export default JsonDiffViewer
