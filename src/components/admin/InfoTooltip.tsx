'use client'

import { Info } from 'lucide-react'
import React, { useCallback, useEffect, useId, useState } from 'react'

import { useI18n } from '@/i18n/I18nProvider'

/**
 * KOLON AÇIKLAMASI (tooltip).
 *
 * `e1018e46` ile tablo başlıklarına eklenmiş, sonraki kit göçünde importer'ı kaybolmuştu;
 * bileşen de sözlükteki `admin.inventory.tooltip.*` anahtarları da yetim kaldı. Geri
 * bağlandı — SİLİNMEDİ, çünkü "Fiziksel / Rezerve / Müsait / Eşik / ABC / Tükenme"
 * kolonları isimlerinden anlaşılmıyor ve cetvel §4.1 tam bu durum için tooltip diyor
 * ("ikonun/kolonun ne yaptığını söylemek").
 *
 * ESKİ HÂLİ WCAG 2.2 SC 1.4.13'ün ÜÇ ŞARTINI DA İHLAL EDİYORDU (cetvel §4.5):
 *  · **Dismissible değildi** — kapatmanın hiçbir yolu yoktu (ESC dahil).
 *  · **Hoverable değildi** — `pointer-events-none` yüzünden imleç içeriğe giremiyordu;
 *    büyütmeli kullanıcı metni okumak için üzerine gidemez.
 *  · **Klavyeyle erişilemiyordu** — tetikleyici odaklanabilir bir öğe değildi (`<div>` +
 *    `group-hover`), yani içerik SADECE fareyle vardı.
 * Ayrıca ham `z-50` (§4.9 yasak) ve `bottom-full` konumu vardı; başlık satırı yatay
 * kaydırma konteynerinin EN ÜSTÜNDE olduğu için yukarı açılan kutu kırpılıyordu →
 * aşağı açılıyor.
 */

interface InfoTooltipProps {
    /** Gösterilecek açıklama — çağıran taraf `t()` ile çözer. */
    text: string
    size?: number
    className?: string
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, size = 14, className = '' }) => {
    const { t } = useI18n()
    const [open, setOpen] = useState(false)
    const tooltipId = useId()

    // SC 1.4.13 "Dismissible": imleci veya odağı OYNATMADAN kapatılabilmeli.
    // Belge seviyesinde dinlenir — tetikleyici odakta olmasa da (salt hover) çalışsın.
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open])

    const show = useCallback(() => setOpen(true), [])
    const hide = useCallback(() => setOpen(false), [])

    return (
        // SC 1.4.13 "Hoverable": kutu bu sarmalayıcının İÇİNDE → imleç tetikleyiciden
        // içeriğe geçerken `mouseleave` tetiklenmez, içerik kaybolmaz.
        <span
            className={`relative group inline-flex items-center justify-center ml-1 align-middle ${className}`}
            onMouseEnter={show}
            onMouseLeave={hide}
        >
            <button
                type="button"
                aria-label={t('admin.ui.moreInfo')}
                aria-describedby={open ? tooltipId : undefined}
                onFocus={show}
                onBlur={hide}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
            >
                <Info size={size} aria-hidden="true" className="text-slate-400 hover:text-primary-navy cursor-help transition-colors" />
            </button>

            {/* SC 1.4.13 "Persistent": zamanlayıcı YOK — tetikleyici bırakılana veya ESC'e kadar durur. */}
            {open && (
                <span
                    role="tooltip"
                    id={tooltipId}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 px-3 py-2 bg-slate-800 text-white text-xs leading-relaxed rounded-md z-popover shadow-xl whitespace-normal normal-case font-normal text-left"
                >
                    {text}
                    {/* Ok (Triangle) */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></span>
                </span>
            )}
        </span>
    )
}

export default InfoTooltip
