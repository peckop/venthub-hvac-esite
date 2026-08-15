import 'react-day-picker/dist/style.css' // react-day-picker v8 CSS (önemli!)

import * as Popover from '@radix-ui/react-popover'
import { endOfDay,endOfMonth, endOfWeek, endOfYear, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths } from 'date-fns'
import { enUS,tr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Check,ChevronDown } from 'lucide-react'
import React, { useState } from 'react'
import { DateRange,DayPicker } from 'react-day-picker'

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

    // Geriye dönük senkronizasyon (value dışarıdan değişirse)
    React.useEffect(() => {
        if (value?.from !== selectedRange?.from || value?.to !== selectedRange?.to) {
            setSelectedRange(value)
        }
    }, [value, selectedRange?.from, selectedRange?.to])

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

    // Tailwind CSS override for react-day-picker
    const dayPickerClassNames = {
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 text-admin-fg-subtle",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-bold text-admin-fg-subtle",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-admin-surface-2 rounded-md transition-colors flex items-center justify-center text-admin-fg-subtle",
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-admin-fg-muted rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-admin-surface-2 [&:has([aria-selected])]:bg-admin-surface-2 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal hover:bg-admin-surface-2 hover:text-admin-fg-subtle rounded-md transition-colors aria-selected:opacity-100",
        day_range_end: "day-range-end",
        day_selected: "bg-admin-accent text-admin-accent-fg hover:bg-admin-accent hover:text-admin-accent-fg focus-visible:bg-admin-accent focus-visible:text-admin-accent-fg",
        day_today: "bg-admin-surface-2 font-bold text-admin-fg-subtle",
        day_outside: "day-outside text-admin-fg-muted opacity-50 aria-selected:bg-admin-surface-2 aria-selected:text-admin-fg-muted aria-selected:opacity-30",
        day_disabled: "text-admin-fg-muted opacity-50",
        day_range_middle: "aria-selected:bg-admin-surface-2 aria-selected:text-admin-fg-subtle aria-selected:rounded-none",
        day_hidden: "invisible",
    }

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <button
                    className={`inline-flex items-center gap-2 justify-between bg-admin-surface border border-admin-border shadow-admin-sm px-4 py-2.5 rounded-admin-md text-sm font-medium hover:bg-admin-surface-2 hover:border-admin-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 transition-shadow w-full sm:w-auto max-w-full ${className}`}
                >
                    <div className="flex items-center gap-2 text-admin-fg-subtle">
                        <CalendarIcon size={16} className={value?.from ? 'text-primary-navy' : 'text-admin-fg-muted'} />
                        <span className={value?.from ? 'font-bold text-admin-fg-subtle' : 'text-admin-fg-muted'}>
                            {triggerLabel}
                        </span>
                    </div>
                    <ChevronDown size={16} className={`text-admin-fg-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="z-toast mt-2 bg-admin-surface border border-admin-border rounded-admin-lg shadow-admin-lg p-0 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-85vh md:max-h-none overflow-y-auto md:w-auto"
                    style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'auto' : 'calc(100vw - 32px)' }}
                    align="center"
                    sideOffset={5}
                    collisionPadding={16}
                >

                    {/* Preset Buttons - Left Sidebar */}
                    <div className="md:w-48 bg-admin-surface-2 border-b md:border-b-0 md:border-r border-admin-border p-3 overflow-y-auto max-h-60vh">
                        <div className="text-xs font-bold text-admin-fg-muted mb-3 px-2">{t('admin.common.quickSelect')}</div>
                        <div className="flex flex-col gap-1">
                            {presets.map((preset, idx) => {
                                const isSelected =
                                    selectedRange?.from?.getTime() === preset.getRange().from.getTime() &&
                                    selectedRange?.to?.getTime() === preset.getRange().to.getTime()

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelect(preset.getRange())}
                                        className={`text-left px-3 py-2 rounded-admin-md text-sm transition-colors flex items-center justify-between ${isSelected ? 'bg-admin-accent text-admin-accent-fg font-bold shadow-admin-md' : 'text-admin-fg-subtle hover:bg-admin-surface-2 hover:text-admin-fg-subtle'}`}
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
                                <button onClick={cancelSelection} className="px-5 py-2 text-sm font-bold text-admin-fg-muted hover:bg-admin-surface-2 rounded-admin-md transition-colors">
                                    {t('admin.common.discard')}
                                </button>
                                <button
                                    onClick={applySelection}
                                    disabled={!selectedRange?.from}
                                    className="px-6 py-2 text-sm font-bold bg-admin-accent text-admin-accent-fg hover:bg-primary-navy/90 rounded-admin-md shadow-admin-md shadow-primary-navy/20 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
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
