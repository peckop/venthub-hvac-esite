import React, { useCallback,useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface EditableCellProps {
    /** Gösterilecek mevcut değer */
    value: string | number
    /** Kaydetme fonksiyonu — async olmalı, hata fırlatırsa rollback yapılır */
    onSave: (newValue: string) => Promise<void>
    /** Input tipi */
    type?: 'text' | 'number'
    /** Değer boşken gösterilecek yer tutucu */
    placeholder?: string
    /** Ek CSS sınıfı (span/input etrafındaki wrapper'a uygulanır) */
    className?: string
    /** Düzenleme engeli */
    disabled?: boolean
    /** Input genişliği CSS sınıfı */
    inputWidth?: string
}

const EditableCell: React.FC<EditableCellProps> = ({
    value,
    onSave,
    type = 'text',
    placeholder = '-',
    className = '',
    disabled = false,
    inputWidth = 'w-24',
}) => {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(String(value ?? ''))
    const [saving, setSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Dış değer değişince draft senkronize et
    useEffect(() => {
        if (!editing) {
            setDraft(String(value ?? ''))
        }
    }, [value, editing])

    // Düzenleme moduna girince input'a odaklan
    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [editing])

    const startEdit = useCallback(() => {
        if (disabled || saving) return
        setDraft(String(value ?? ''))
        setEditing(true)
    }, [disabled, saving, value])

    const cancel = useCallback(() => {
        setDraft(String(value ?? ''))
        setEditing(false)
    }, [value])

    const save = useCallback(async () => {
        const trimmed = draft.trim()
        const original = String(value ?? '')

        // Değişiklik yoksa çık
        if (trimmed === original) {
            setEditing(false)
            return
        }

        setSaving(true)
        try {
            await onSave(trimmed)
            setEditing(false)
        } catch {
            // Hata olursa eski değere dön
            setDraft(original)
            toast.error('Güncelleme başarısız')
            setEditing(false)
        } finally {
            setSaving(false)
        }
    }, [draft, value, onSave])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                void save()
            } else if (e.key === 'Escape') {
                e.preventDefault()
                cancel()
            }
        },
        [save, cancel]
    )

    if (editing) {
        return (
            <div 
                className={`inline-flex items-center gap-1 ${className}`} 
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
            >
                <input
                    ref={inputRef}
                    type={type}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => void save()}
                    disabled={saving}
                    className={`${inputWidth} px-1.5 py-0.5 text-sm border border-primary-navy rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-navy/50 disabled:opacity-50`}
                />
                {saving && (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-primary-navy/30 border-t-primary-navy rounded-full animate-spin" />
                )}
            </div>
        )
    }

    return (
        <button
            type="button"
            disabled={disabled}
            className={`cursor-pointer border-b border-dashed border-slate-300 hover:border-primary-navy hover:text-primary-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left bg-transparent p-0 ${className}`}
            onClick={(e) => {
                e.stopPropagation()
                startEdit()
            }}
        >
            {String(value ?? '') || <span className="text-slate-400">{placeholder}</span>}
        </button>
    )
}

export default EditableCell
