import React from 'react'
import { Sun, Wind, CheckCircle2 } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

interface EducationalGuideProps {
    categorySlug: string
}

const EducationalGuide: React.FC<EducationalGuideProps> = ({ categorySlug }) => {
    const { t } = useI18n()
    if (!categorySlug.includes('hava-perde')) return null

    return (
        <div className="bg-gray-50 py-12 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h3 className="text-2xl font-bold text-industrial-gray mb-2">{t('category.whichAirCurtain')}</h3>
                    <p className="text-steel-gray">{t('category.airCurtainHelper')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Ambient (Ortam Havası) Card */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-secondary-blue/50 transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wind size={120} />
                        </div>

                        <div className="flex items-center space-x-4 mb-6 relative z-10">
                            <div className="p-3 bg-blue-50 rounded-lg text-secondary-blue">
                                <Wind size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-industrial-gray">{t('category.ambientAir')}</h4>
                        </div>

                        <p className="text-gray-600 mb-6 relative z-10 min-h-[48px]">
                            {t('category.ambientAirDesc')}
                        </p>

                        <ul className="space-y-3 relative z-10">
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{t('category.ambientPoint1')}</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{t('category.ambientPoint2')}</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{t('category.ambientPoint3')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Electric (Elektrikli Isıtıcılı) Card */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-orange-500/50 transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-orange-500">
                            <Sun size={120} />
                        </div>

                        <div className="flex items-center space-x-4 mb-6 relative z-10">
                            <div className="p-3 bg-orange-50 rounded-lg text-orange-500">
                                <Sun size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-industrial-gray">{t('category.electricHeated')}</h4>
                        </div>

                        <p className="text-gray-600 mb-6 relative z-10 min-h-[48px]">
                            {t('category.electricHeatedDesc')}
                        </p>

                        <ul className="space-y-3 relative z-10">
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{t('category.electricPoint1')}</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{t('category.electricPoint2')}</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{t('category.electricPoint3')}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EducationalGuide



