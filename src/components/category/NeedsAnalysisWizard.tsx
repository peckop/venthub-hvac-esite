import { Filter, Ruler, Settings,ThermometerSun } from 'lucide-react'
import React, { useState } from 'react'

import { useI18n } from '../../i18n/I18nProvider'

interface NeedsAnalysisWizardProps {
    onFilterChange: (filters: { maxHeight?: number; heating?: string; type?: string }) => void
}

const NeedsAnalysisWizard: React.FC<NeedsAnalysisWizardProps> = ({ onFilterChange }) => {
    const { t } = useI18n()
    const [step, setStep] = useState(1)
    const [selections, setSelections] = useState({
        maxHeight: 0,
        heating: '',
        type: ''
    })
    const [isOpen, setIsOpen] = useState(false)

    const handleSelection = (key: string, value: string | number) => {
        const valStr = String(value)
        const newSelections = { ...selections, [key]: valStr }
        setSelections(newSelections)

        if (key === 'maxHeight') setStep(2)
        if (key === 'heating') setStep(3)
        if (key === 'type') {
            onFilterChange({
                maxHeight: selections.maxHeight ? parseInt(String(selections.maxHeight)) : undefined,
                heating: selections.heating === 'none' ? undefined : selections.heating,
                type: valStr
            })
            setIsOpen(false)
            setStep(1) // Reset for next time
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="focus-ring w-full md:w-auto bg-gradient-to-r from-primary-navy to-secondary-blue text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between hover:scale-105 transition-transform"
            >
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Filter size={24} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold">{t('needsWizard.findSuitable')}</div>
                        <div className="text-xs text-blue-100">{t('needsWizard.threeSteps')}</div>
                    </div>
                </div>
                <div className="bg-white text-secondary-blue px-3 py-1 rounded-full text-sm font-bold ml-4">{t('needsWizard.start')}</div>
            </button>
        )
    }

    return (
        <div className="bg-white border-2 border-primary-navy/10 rounded-xl p-6 shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-primary-navy">{t('needsWizard.wizardTitle')}</h3>
                <button onClick={() => setIsOpen(false)} className="focus-ring text-gray-400 hover:text-gray-600">{t('needsWizard.close')}</button>
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-secondary-blue mb-2">
                        <Ruler size={20} />
                        <span className="font-medium">{t('needsWizard.doorHeight')}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[2.5, 3, 3.5, 4, 5].map(h => (
                            <button
                                key={h}
                                onClick={() => handleSelection('maxHeight', h)}
                                className="focus-ring py-3 px-4 border rounded-lg hover:border-secondary-blue hover:bg-blue-50 transition-colors font-medium text-gray-700"
                            >
                                {h} {t('needsWizard.meter')}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-secondary-blue mb-2">
                        <ThermometerSun size={20} />
                        <span className="font-medium">{t('needsWizard.heatingNeed')}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            onClick={() => handleSelection('heating', 'electric')}
                            className="focus-ring py-3 px-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-left"
                        >
                            <div className="font-bold text-gray-800">{t('needsWizard.electricHeater')}</div>
                            <div className="text-xs text-gray-500">{t('needsWizard.winterComfort')}</div>
                        </button>
                        <button
                            onClick={() => handleSelection('heating', 'none')}
                            className="focus-ring py-3 px-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                        >
                            <div className="font-bold text-gray-800">{t('needsWizard.ambient')}</div>
                            <div className="text-xs text-gray-500">{t('needsWizard.insulation')}</div>
                        </button>
                        <button
                            onClick={() => handleSelection('heating', 'water')}
                            className="focus-ring py-3 px-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                        >
                            <div className="font-bold text-gray-800">{t('needsWizard.waterHeater')}</div>
                            <div className="text-xs text-gray-500">{t('needsWizard.centralSystem')}</div>
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-secondary-blue mb-2">
                        <Settings size={20} />
                        <span className="font-medium">{t('needsWizard.mountType')}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            onClick={() => handleSelection('type', 'standard')}
                            className="focus-ring py-3 px-4 border rounded-lg hover:border-secondary-blue hover:bg-blue-50 transition-colors font-medium text-gray-700"
                        >
                            {t('needsWizard.standardMount')}
                        </button>
                        <button
                            onClick={() => handleSelection('type', 'recessed')}
                            className="focus-ring py-3 px-4 border rounded-lg hover:border-secondary-blue hover:bg-blue-50 transition-colors font-medium text-gray-700"
                        >
                            {t('needsWizard.recessedMount')}
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-between items-center text-xs text-gray-400">
                <span>{t('needsWizard.step')} {step} {t('needsWizard.stepOf', { total: 3 })}</span>
                {step > 1 && <button onClick={() => setStep(step - 1)} className="focus-ring hover:text-gray-600 underline">{t('needsWizard.goBack')}</button>}
            </div>
        </div>
    )
}

export default NeedsAnalysisWizard



