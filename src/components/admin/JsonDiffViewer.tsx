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
        <div className="w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
            <div className="flex text-xs font-semibold text-slate-400 bg-slate-800/80 border-b border-slate-700">
                <div className="flex-1 p-3 border-r border-slate-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    {t('admin.common.oldValueBefore')}
                </div>
                <div className="flex-1 p-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
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
                            <div key={key} className="flex hover:bg-slate-800/50 transition-colors">
                                <div className="flex-1 px-2 py-1 border-r border-slate-800 text-slate-500 truncate" title={`${key}: ${strB}`}>
                                    <span className="text-slate-600 mr-2">{key}:</span> {strB}
                                </div>
                                <div className="flex-1 px-2 py-1 text-slate-500 truncate" title={`${key}: ${strB}`}>
                                    <span className="text-slate-600 mr-2">{key}:</span> {strB}
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div key={key} className="flex hover:bg-slate-800/50 transition-colors">
                            {/* Before Column */}
                            <div className={`flex-1 px-2 py-1 border-r border-slate-800 truncate ${isAdded ? 'bg-slate-800/30' : (isRemoved || isChanged ? 'bg-rose-500/10 text-rose-300' : 'text-slate-500')}`}>
                                <span className="text-slate-500 mr-2 opacity-70">{key}:</span>
                                {isAdded ? <span className="text-slate-600 italic">{t('admin.common.added')}</span> : <span title={strB}>{strB}</span>}
                            </div>

                            {/* After Column */}
                            <div className={`flex-1 px-2 py-1 truncate ${isRemoved ? 'bg-slate-800/30' : (isAdded || isChanged ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-500')}`}>
                                <span className="text-slate-500 mr-2 opacity-70">{key}:</span>
                                {isRemoved ? <span className="text-slate-600 italic">{t('admin.common.deleted')}</span> : <span title={strA}>{strA}</span>}
                            </div>
                        </div>
                    )
                })}
                {allKeys.length === 0 && (
                    <div className="text-center py-4 text-slate-500 italic">{t('admin.common.noChangeDetails')}</div>
                )}
            </div>
        </div>
    )
}

export default JsonDiffViewer
