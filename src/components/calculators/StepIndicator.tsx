import { Check } from 'lucide-react'
import React from 'react'

interface Step {
    id: number
    label: string
    description?: string
}

interface StepIndicatorProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (stepId: number) => void
}

/**
 * Wizard adım göstergesi
 * Tamamlanan, aktif ve bekleyen adımları gösterir
 */
const StepIndicator: React.FC<StepIndicatorProps> = ({
    steps,
    currentStep,
    onStepClick
}) => {
    return (
        <div className="mb-8">
            {/* Desktop View */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = step.id < currentStep
                    const isActive = step.id === currentStep
                    const isClickable = onStepClick && step.id <= currentStep

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step Circle */}
                            <button
                                onClick={() => isClickable && onStepClick(step.id)}
                                disabled={!isClickable}
                                className={`flex flex-col items-center group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-colors duration-300
                    ${isCompleted
                                            ? 'bg-success-green text-white'
                                            : isActive
                                                ? 'bg-primary-navy text-white ring-4 ring-primary-navy/20'
                                                : 'bg-gray-200 text-steel-gray'
                                        }
                    ${isClickable ? 'hover:scale-110' : ''}
                  `}
                                >
                                    {isCompleted ? <Check size={18} /> : step.id}
                                </div>
                                <span
                                    className={`
                    mt-2 text-sm font-medium
                    ${isActive ? 'text-primary-navy' : 'text-steel-gray'}
                  `}
                                >
                                    {step.label}
                                </span>
                                {step.description && (
                                    <span className="text-xs text-steel-gray/70 mt-0.5 hidden lg:block">
                                        {step.description}
                                    </span>
                                )}
                            </button>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-4 h-0.5 bg-gray-200 relative">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-success-green transition-colors duration-500"
                                        style={{
                                            width: isCompleted ? '100%' : '0%'
                                        }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-navy">
                        Adım {currentStep} / {steps.length}
                    </span>
                    <span className="text-sm text-steel-gray">
                        {steps.find(s => s.id === currentStep)?.label}
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-navy transition-colors duration-500"
                        style={{
                            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default StepIndicator



