import React from 'react'
import { HelpCircle } from 'lucide-react'

interface InputFieldProps {
    label: string
    value: string | number
    onChange: (value: string) => void
    type?: 'text' | 'number'
    placeholder?: string
    unit?: string
    min?: number
    max?: number
    step?: number
    tooltip?: string
    error?: string
    disabled?: boolean
}

/**
 * Premium input alanı
 * Tooltip, birim, hata gösterimi içerir
 */
const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChange,
    type = 'number',
    placeholder,
    unit,
    min,
    max,
    step = 0.1,
    tooltip,
    error,
    disabled = false
}) => {
    const id = React.useId()

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <label htmlFor={id} className="text-sm font-medium text-industrial-gray">
                    {label}
                </label>
                {tooltip && (
                    <div className="group relative">
                        <HelpCircle size={14} className="text-steel-gray cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-industrial-gray text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 max-w-xs">
                            {tooltip}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-industrial-gray" />
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    className={`
            w-full px-4 py-3 rounded-xl border transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20
            ${error
                            ? 'border-danger-red bg-danger-red/5'
                            : 'border-light-gray hover:border-steel-gray focus-visible:border-primary-navy'
                        }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${unit ? 'pr-12' : ''}
          `}
                />
                {unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-steel-gray">
                        {unit}
                    </span>
                )}
            </div>

            {error && (
                <p className="text-xs text-danger-red">{error}</p>
            )}
        </div>
    )
}

interface RadioGroupProps {
    label: string
    value: string
    onChange: (value: string) => void
    options: { label: string; value: string; description?: string; icon?: React.ReactNode }[]
    error?: string
    columns?: number
    tooltip?: string
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
    label,
    value,
    onChange,
    options,
    error,
    columns = 2,
    tooltip
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-industrial-gray">{label}</label>
                {tooltip && (
                    <div className="group relative">
                        <HelpCircle size={14} className="text-steel-gray cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-industrial-gray text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 max-w-xs">
                            {tooltip}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-industrial-gray" />
                        </div>
                    </div>
                )}
            </div>
            <div className={`grid gap-3 sm:grid-cols-${columns}`}>
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`
              p-4 rounded-xl border text-left transition-colors
              ${value === option.value
                                ? 'border-primary-navy bg-primary-navy/5'
                                : 'border-light-gray hover:border-steel-gray'
                            }
            `}
                    >
                        <div className="flex items-center gap-2">
                            {option.icon && <div className="text-primary-navy">{option.icon}</div>}
                            <div className="font-medium text-industrial-gray">
                                {option.label}
                            </div>
                        </div>
                        {option.description && (
                            <div className="text-xs text-steel-gray mt-1">
                                {option.description}
                            </div>
                        )}
                    </button>
                ))}
            </div>
            {error && <p className="text-xs text-danger-red">{error}</p>}
        </div>
    )
}

export default InputField
