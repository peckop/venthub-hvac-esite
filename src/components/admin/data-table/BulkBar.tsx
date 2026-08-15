'use client'

import React from 'react'

import {
    adminTableActionClass,
    adminTableActionDangerClass,
    adminTableActionWarningClass,
} from '../../../utils/adminUi'

export interface BulkAction {
    key: string
    label: string
    tone?: 'default' | 'danger' | 'warning'
    panel?: (close: () => void) => React.ReactNode
    onRun?: () => Promise<void>
}

export interface BulkBarProps {
    selectedCount: number
    selectedLabel: string
    clearLabel: string
    actions: BulkAction[]
    onClear: () => void
}

const toneClassMap: Record<NonNullable<BulkAction['tone']>, string> = {
    default: adminTableActionClass,
    danger: adminTableActionDangerClass,
    warning: adminTableActionWarningClass,
}

export function BulkBar({
    selectedCount,
    selectedLabel,
    clearLabel,
    actions,
    onClear,
}: BulkBarProps): React.ReactNode {
    const [openKey, setOpenKey] = React.useState<string | null>(null)

    if (selectedCount === 0) return null

    const closePanel = (): void => setOpenKey(null)

    return (
        <div className="sticky bottom-4 z-40 mx-auto max-w-4xl">
            <div className={`bg-admin-surface rounded-admin-lg px-5 py-3 flex items-center justify-between gap-4 flex-wrap`}>
                {/* Left: selection info */}
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-admin-accent text-admin-accent-fg text-sm font-semibold">
                        {selectedCount}
                    </span>
                    <span className="text-sm font-bold text-admin-fg">{selectedLabel}</span>
                    <button
                        type="button"
                        onClick={onClear}
                        aria-label={clearLabel}
                        className="text-xs font-semibold text-admin-fg-muted hover:text-admin-fg transition-colors underline"
                    >
                        {clearLabel}
                    </button>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    {actions.map((action) => {
                        const toneClass = toneClassMap[action.tone ?? 'default']
                        const hasPanel = typeof action.panel === 'function'
                        const isOpen = openKey === action.key

                        return (
                            <div key={action.key} className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (hasPanel) {
                                            setOpenKey(isOpen ? null : action.key)
                                        } else if (action.onRun) {
                                            void action.onRun()
                                        }
                                    }}
                                    aria-label={action.label}
                                    aria-expanded={hasPanel ? isOpen : undefined}
                                    className={toneClass}
                                >
                                    {action.label}
                                </button>
                                {hasPanel && isOpen && action.panel ? (
                                    <div className="absolute bottom-full mb-2 right-0 z-50">
                                        {action.panel(closePanel)}
                                    </div>
                                ) : null}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default BulkBar
