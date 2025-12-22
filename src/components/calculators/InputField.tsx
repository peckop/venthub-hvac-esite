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
            w-full px-4 py-3 rounded-xl border transition-all
            focus:outline-none focus:ring-2 focus:ring-primary-navy/20
            ${error
                            ? 'border-danger-red bg-danger-red/5'
                            : 'border-light-gray hover:border-steel-gray focus:border-primary-navy'
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

/**
 * Select dropdown
 */
interface SelectOption {
    value: string
    label: string
    description?: string
}

interface SelectFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    tooltip?: string
    disabled?: boolean
}

export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    value,
    onChange,
    options,
    tooltip,
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
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-industrial-gray text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>

            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`
          w-full px-4 py-3 rounded-xl border transition-all appearance-none
          focus:outline-none focus:ring-2 focus:ring-primary-navy/20
          border-light-gray hover:border-steel-gray focus:border-primary-navy
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          bg-[url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="%236B7280" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>')] bg-no-repeat bg-[right_1rem_center]
        `}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

/**
 * Radio button grup
 */
interface RadioOption {
    value: string
    label: string
    description?: string
    icon?: React.ReactNode
}

interface RadioGroupProps {
    label: string
    value: string
    onChange: (value: string) => void
    options: RadioOption[]
    tooltip?: string
    columns?: 2 | 3 | 4
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
    label,
    value,
    onChange,
    options,
    tooltip,
    columns = 3
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-industrial-gray">{label}</span>
                {tooltip && (
                    <div className="group relative">
                        <HelpCircle size={14} className="text-steel-gray cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-industrial-gray text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>

            <div className={`grid gap-3 grid-cols-${columns}`}>
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`
              p-4 rounded-xl border-2 transition-all text-left
              ${value === opt.value
                                ? 'border-primary-navy bg-primary-navy/5'
                                : 'border-light-gray hover:border-steel-gray bg-white'
                            }
            `}
                    >
                        <div className="flex items-center gap-3">
                            {opt.icon && (
                                <div className={value === opt.value ? 'text-primary-navy' : 'text-steel-gray'}>
                                    {opt.icon}
                                </div>
                            )}
                            <div>
                                <div className={`font-medium ${value === opt.value ? 'text-primary-navy' : 'text-industrial-gray'}`}>
                                    {opt.label}
                                </div>
                                {opt.description && (
                                    <div className="text-xs text-steel-gray mt-0.5">
                                        {opt.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default InputField
