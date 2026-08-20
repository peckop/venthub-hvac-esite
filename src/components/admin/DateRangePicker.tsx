import 'react-day-picker/style.css' // react-day-picker v9 CSS (önemli!)

import * as Popover from '@radix-ui/react-popover'
import { endOfDay,endOfMonth, endOfWeek, endOfYear, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths } from 'date-fns'
import { enUS,tr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Check,ChevronDown } from 'lucide-react'
import React, { useState } from 'react'
import { ClassNames,DateRange,DayPicker } from 'react-day-picker'

import { useI18n } from '../../i18n/I18nProvider'

interface DateRangePickerProps {
    value?: DateRange
    onChange?: (range?: DateRange) => void
    placeholder?: string
    className?: string
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, placeholder, className = '' }) => {
    const { lang, t } = useI18n()
    const locale = lang === 'en' ? enUS : tr

    const [isOpen, setIsOpen] = useState(false)
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(value)
    const [months, setMonths] = useState(2)

    React.useEffect(() => {
        const checkMobile = () => setMonths(window.innerWidth < 768 ? 1 : 2)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Geriye dönük senkronizasyon: YALNIZ `value` dışarıdan değişirse.
    //
    // ⚠ ESKİ HÂLİ SEÇİMİ ANINDA SİLİYORDU. Bağımlılıklarda `selectedRange`
    // vardı ve gövde `value !== selectedRange` ise `setSelectedRange(value)`
    // diyordu; yani kullanıcı bir aralık seçer seçmez efekt tetikleniyor,
    // yerel seçimi görüp "farklı" sayıyor ve `value`'ya (çoğu zaman
    // `undefined`) geri döndürüyordu. Sonuç: seçim hiç tutmuyor, "uygula"
    // düğmesi hep disabled kalıyor, tarih filtresi HİÇ ÇALIŞMIYORDU.
    //
    // Ölçüldü (2026-08-19, T113-VH): hazır aralık düğmesine de takvimde bir
    // güne de basıldıktan sonra "uygula" hâlâ disabled=true. Kusur v9 ile
    // ilgili DEĞİL, önceden de oradaydı — v9 geçişinin K13 kanıtı ("filtre
    // gerçekten filtreliyor mu") aramasaydı görünmeyecekti; ekranda takvim
    // açılıyordu ve "çalışıyor" sanılıyordu.
    React.useEffect(() => {
        setSelectedRange(value)
    }, [value])

    const presets = [
        {
            label: t('admin.common.today'),
            getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) })
        },
        {
            label: t('admin.common.yesterday'),
            getRange: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) })
        },
        {
            label: t('admin.common.last7Days'),
            getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) })
        },
        {
            label: t('admin.common.last30Days'),
            getRange: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) })
        },
        {
            label: t('admin.common.thisWeek'),
            getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) })
        },
        {
            label: t('admin.common.thisMonth'),
            getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
        },
        {
            label: t('admin.common.lastMonth'),
            getRange: () => {
                const lp = subMonths(new Date(), 1)
                return { from: startOfMonth(lp), to: endOfMonth(lp) }
            }
        },
        {
            label: t('admin.common.thisYear'),
            getRange: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) })
        }
    ]

    const handleSelect = (r: DateRange | undefined) => {
        setSelectedRange(r)
    }

    const applySelection = () => {
        if (onChange) onChange(selectedRange)
        setIsOpen(false)
    }

    const cancelSelection = () => {
        setSelectedRange(value)
        setIsOpen(false)
    }

    const triggerLabel = value?.from
        ? `${format(value.from, 'dd MMM yyyy', { locale })} ${value.to ? `- ${format(value.to, 'dd MMM yyyy', { locale })}` : ''}`
        : (placeholder || t('admin.common.selectDateRange'))

    // Tailwind CSS override for react-day-picker (v9 anahtarları)
    //
    // TİP ZORUNLU (`Partial<ClassNames>`): tipsiz bırakılırsa bu harita çıplak
    // bir `const` olur, fazla-özellik denetimi HİÇ çalışmaz ve tanınmayan bir
    // anahtar — v8 kalıntısı ya da yazım hatası — sessizce yok sayılır; takvim
    // çıplak render olurken `tsc` tertemiz geçer. Ölçüldü (2026-08-19): v9
    // kuruluyken harita v8 anahtarlarıyla dururken `pnpm type-check` hiçbir
    // hata vermedi. İkinci kapı: INV-ADMIN-DAYPICKER-CLASS-1.
    const navButton = "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-admin-surface-2 rounded-md transition-colors flex items-center justify-center text-admin-fg-subtle"
    const dayPickerClassNames: Partial<ClassNames> = {
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 text-admin-fg-subtle",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-admin-fg-subtle",
        nav: "space-x-1 flex items-center",
        button_previous: `${navButton} absolute left-2`,
        button_next: `${navButton} absolute right-2`,
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-admin-fg-muted rounded-md w-9 font-normal text-xs",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-admin-surface-2 [&:has([aria-selected])]:bg-admin-surface-2 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-raised",
        day_button: "h-9 w-9 p-0 font-normal hover:bg-admin-surface-2 hover:text-admin-fg-subtle rounded-md transition-colors aria-selected:opacity-100",
        range_end: "day-range-end",
        selected: "bg-admin-accent text-admin-accent-fg hover:bg-admin-accent hover:text-admin-accent-fg focus-visible:bg-admin-accent focus-visible:text-admin-accent-fg",
        today: "bg-admin-surface-2 font-semibold text-admin-fg-subtle",
        outside: "day-outside text-admin-fg-muted opacity-50 aria-selected:bg-admin-surface-2 aria-selected:text-admin-fg-muted aria-selected:opacity-30",
        disabled: "text-admin-fg-muted opacity-50",
        range_middle: "aria-selected:bg-admin-surface-2 aria-selected:text-admin-fg-subtle aria-selected:rounded-none",
        hidden: "invisible",
    }

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <button
                    className={`inline-flex items-center gap-2 justify-between bg-admin-surface border border-admin-border shadow-admin-sm px-4 py-2.5 rounded-admin-md text-sm font-medium hover:bg-admin-surface-2 hover:border-admin-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring transition-shadow w-full sm:w-auto max-w-full ${className}`}
                >
                    <div className="flex items-center gap-2 text-admin-fg-subtle">
                        <CalendarIcon size={16} className={value?.from ? 'text-admin-accent' : 'text-admin-fg-muted'} />
                        <span className={value?.from ? 'font-medium text-admin-fg-subtle' : 'text-admin-fg-muted'}>
                            {triggerLabel}
                        </span>
                    </div>
                    <ChevronDown size={16} className={`text-admin-fg-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    /* D15 düzeltmesi: popover z-toast (9999) İLE modalların üstüne değil,
                       kendi katmanına (z-popover) oturur — cetvel §4.9. */
                    className="z-popover mt-2 bg-admin-surface border border-admin-border rounded-admin-lg shadow-admin-overlay p-0 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-admin-popover md:max-h-none overflow-y-auto md:w-auto"
                    style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'auto' : 'calc(100vw - 32px)' }}
                    align="center"
                    sideOffset={5}
                    collisionPadding={16}
                >

                    {/* Preset Buttons - Left Sidebar */}
                    <div className="md:w-48 bg-admin-surface-2 border-b md:border-b-0 md:border-r border-admin-border p-3 overflow-y-auto max-h-admin-popover-section">
                        <div className="text-xs font-semibold text-admin-fg-muted mb-3 px-2">{t('admin.common.quickSelect')}</div>
                        <div className="flex flex-col gap-1">
                            {presets.map((preset, idx) => {
                                const isSelected =
                                    selectedRange?.from?.getTime() === preset.getRange().from.getTime() &&
                                    selectedRange?.to?.getTime() === preset.getRange().to.getTime()

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelect(preset.getRange())}
                                        className={`text-left px-3 py-2 rounded-admin-md text-sm transition-colors flex items-center justify-between ${isSelected ? 'bg-admin-accent text-admin-accent-fg font-semibold shadow-admin-md' : 'text-admin-fg-subtle hover:bg-admin-surface-2 hover:text-admin-fg-subtle'}`}
                                    >
                                        {preset.label}
                                        {isSelected && <Check size={14} className="opacity-80" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Calendar - Right Canvas */}
                    <div className="p-4 flex flex-col">
                        <DayPicker
                            mode="range"
                            defaultMonth={selectedRange?.from || new Date()}
                            selected={selectedRange}
                            onSelect={handleSelect}
                            numberOfMonths={months}
                            locale={locale}
                            showOutsideDays
                            classNames={dayPickerClassNames}
                            modifiersClassNames={{
                                selected: 'bg-admin-accent text-admin-accent-fg'
                            }}
                        />

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4 border-t border-admin-border pt-4">
                            <span className="text-xs text-admin-fg-muted font-medium">
                                {selectedRange?.from ? (
                                    <>
                                        {t('admin.common.range')}: <b className="text-admin-fg-subtle">{format(selectedRange.from, 'dd MMM', { locale })}</b>
                                        {selectedRange.to ? (
                                            <>
                                                {' '} - <b className="text-admin-fg-subtle">{format(selectedRange.to, 'dd MMM', { locale })}</b>
                                            </>
                                        ) : ' - '}
                                    </>
                                ) : t('admin.common.selectDateRange')}
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={cancelSelection} className="px-5 py-2 text-sm font-semibold text-admin-fg-muted hover:bg-admin-surface-2 rounded-admin-md transition-colors">
                                    {t('admin.common.discard')}
                                </button>
                                <button
                                    onClick={applySelection}
                                    disabled={!selectedRange?.from}
                                    className="px-6 py-2 text-sm font-semibold bg-admin-accent text-admin-accent-fg hover:bg-admin-accent-hover rounded-admin-md shadow-admin-sm active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {t('admin.common.apply')}
                                </button>
                            </div>
                        </div>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}

export default DateRangePicker
