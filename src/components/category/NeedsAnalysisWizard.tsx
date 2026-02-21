import React, { useState } from 'react'
import { Filter, Ruler, ThermometerSun, Settings } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

interface NeedsAnalysisWizardProps {
    onFilterChange: (filters: { maxHeight?: number; heating?: string; type?: string }) => void
}

const NeedsAnalysisWizard: React.FC<NeedsAnalysisWizardProps> = ({ onFilterChange }) => {
    const { t: _t } = useI18n()
    const [step, setStep] = useState(1)
    const [selections, setSelections] = useState({
        maxHeight: 0,
        heating: '',
        type: ''
    })
    const [isOpen, setIsOpen] = useState(false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelection = (key: string, value: any) => {
        const newSelections = { ...selections, [key]: value }
        setSelections(newSelections)

        // Auto advance or finish
        if (key === 'maxHeight') setStep(2)
        if (key === 'heating') setStep(3)
        if (key === 'type') {
            onFilterChange({
                maxHeight: newSelections.maxHeight,
                heating: newSelections.heating === 'none' ? undefined : newSelections.heating,
                type: value
            })
            setIsOpen(false)
            setStep(1) // Reset for next time
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full md:w-auto bg-gradient-to-r from-primary-navy to-secondary-blue text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between hover:scale-105 transition-transform"
            >
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Filter size={24} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold">Bana Uygun Olanı Bul</div>
                        <div className="text-xs text-blue-100">3 adımda size özel ürün önerisi</div>
                    </div>
                </div>
                <div className="bg-white text-secondary-blue px-3 py-1 rounded-full text-sm font-bold ml-4">Başla</div>
            </button>
        )
    }

    return (
        <div className="bg-white border-2 border-primary-navy/10 rounded-xl p-6 shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-primary-navy">İhtiyaç Analizi Sihirbazı</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">Kapat</button>
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-secondary-blue mb-2">
                        <Ruler size={20} />
                        <span className="font-medium">Kapı Yüksekliğiniz Nedir?</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[2.5, 3, 3.5, 4, 5].map(h => (
                            <button
                                key={h}
                                onClick={() => handleSelection('maxHeight', h)}
                                className="py-3 px-4 border rounded-lg hover:border-secondary-blue hover:bg-blue-50 transition-all font-medium text-gray-700"
                            >
                                {h} Metre
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-secondary-blue mb-2">
                        <ThermometerSun size={20} />
                        <span className="font-medium">Isıtma İhtiyacı Var mı?</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            onClick={() => handleSelection('heating', 'electric')}
                            className="py-3 px-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                        >
                            <div className="font-bold text-gray-800">Elektrikli Isıtıcı</div>
                            <div className="text-xs text-gray-500">Kış konforu için</div>
                        </button>
                        <button
                            onClick={() => handleSelection('heating', 'none')}
                            className="py-3 px-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                        >
                            <div className="font-bold text-gray-800">Isıtıcısız (Ortam)</div>
                            <div className="text-xs text-gray-500">İzolasyon ve tasarruf için</div>
                        </button>
                        <button
                            onClick={() => handleSelection('heating', 'water')}
                            className="py-3 px-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                        >
                            <div className="font-bold text-gray-800">Sıcak Su Bataryalı</div>
                            <div className="text-xs text-gray-500">Merkezi sistem varsa</div>
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-secondary-blue mb-2">
                        <Settings size={20} />
                        <span className="font-medium">Montaj Tipi Nasıl Olmalı?</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            onClick={() => handleSelection('type', 'standard')}
                            className="py-3 px-4 border rounded-lg hover:border-secondary-blue hover:bg-blue-50 transition-all font-medium text-gray-700"
                        >
                            Standart (Duvar/Tavan Asılı)
                        </button>
                        <button
                            onClick={() => handleSelection('type', 'recessed')}
                            className="py-3 px-4 border rounded-lg hover:border-secondary-blue hover:bg-blue-50 transition-all font-medium text-gray-700"
                        >
                            Ankastre (Asma Tavan İçi)
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-between items-center text-xs text-gray-400">
                <span>Adım {step} / 3</span>
                {step > 1 && <button onClick={() => setStep(step - 1)} className="hover:text-gray-600 underline">Geri Dön</button>}
            </div>
        </div>
    )
}

export default NeedsAnalysisWizard



