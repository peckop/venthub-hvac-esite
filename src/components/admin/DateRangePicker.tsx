import React, { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css' // react-day-picker v8 CSS (önemli!)
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

interface DateRangePickerProps {
    value?: DateRange
    onChange?: (range?: DateRange) => void
    placeholder?: string
    className?: string
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, placeholder, className = '' }) => {
    const { lang } = useI18n()
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
            label: 'Bugün',
            getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) })
        },
        {
            label: 'Dün',
            getRange: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) })
        },
        {
            label: 'Son 7 Gün',
            getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) })
        },
        {
            label: 'Son 30 Gün',
            getRange: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) })
        },
        {
            label: 'Bu Hafta',
            getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) })
        },
        {
            label: 'Bu Ay',
            getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
        },
        {
            label: 'Geçen Ay',
            getRange: () => {
                const lp = subMonths(new Date(), 1)
                return { from: startOfMonth(lp), to: endOfMonth(lp) }
            }
        },
        {
            label: 'Bu Yıl',
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
        : (placeholder || 'Tarih Aralığı Seçiniz')

    // Tailwind CSS override for react-day-picker
    const dayPickerClassNames = {
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 text-slate-700",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-bold text-slate-800",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-slate-100 rounded-md transition-colors flex items-center justify-center text-slate-600",
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem] uppercase tracking-wider",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors aria-selected:opacity-100",
        day_range_end: "day-range-end",
        day_selected: "bg-primary-navy text-white hover:bg-primary-navy hover:text-white focus:bg-primary-navy focus:text-white",
        day_today: "bg-slate-100 font-bold text-slate-900",
        day_outside: "day-outside text-slate-400 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30",
        day_disabled: "text-slate-400 opacity-50",
        day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900 aria-selected:rounded-none",
        day_hidden: "invisible",
    }

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <button
                    className={`inline-flex items-center gap-2 justify-between bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 transition-shadow w-full sm:w-auto max-w-full ${className}`}
                >
                    <div className="flex items-center gap-2 text-slate-600">
                        <CalendarIcon size={16} className={value?.from ? 'text-primary-navy' : 'text-slate-400'} />
                        <span className={value?.from ? 'font-bold text-slate-800' : 'text-slate-500'}>
                            {triggerLabel}
                        </span>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="z-toast mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-0 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-85vh md:max-h-none overflow-y-auto md:w-auto"
                    style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'auto' : 'calc(100vw - 32px)' }}
                    align="center"
                    sideOffset={5}
                    collisionPadding={16}
                >

                    {/* Preset Buttons - Left Sidebar */}
                    <div className="md:w-48 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200/60 p-3 overflow-y-auto max-h-60vh">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Hızlı Seçim</div>
                        <div className="flex flex-col gap-1">
                            {presets.map((preset, idx) => {
                                const isSelected =
                                    selectedRange?.from?.getTime() === preset.getRange().from.getTime() &&
                                    selectedRange?.to?.getTime() === preset.getRange().to.getTime()

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelect(preset.getRange())}
                                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${isSelected ? 'bg-primary-navy text-white font-bold shadow-md' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-800'}`}
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
                                selected: 'bg-primary-navy text-white'
                            }}
                        />

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
                            <span className="text-xs text-slate-500 font-medium">
                                {selectedRange?.from ? (
                                    <>
                                        Aralık: <b className="text-slate-700">{format(selectedRange.from, 'dd MMM', { locale })}</b>
                                        {selectedRange.to ? (
                                            <>
                                                {' '} - <b className="text-slate-700">{format(selectedRange.to, 'dd MMM', { locale })}</b>
                                            </>
                                        ) : ' - '}
                                    </>
                                ) : 'Tarih aralığı seçin'}
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={cancelSelection} className="px-5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                                    Vazgeç
                                </button>
                                <button
                                    onClick={applySelection}
                                    disabled={!selectedRange?.from}
                                    className="px-6 py-2 text-sm font-bold bg-primary-navy text-white hover:bg-primary-navy/90 rounded-lg shadow-md shadow-primary-navy/20 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                                >
                                    Uygula
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
