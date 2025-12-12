import React from 'react'
import { Sun, Wind, CheckCircle2 } from 'lucide-react'

interface EducationalGuideProps {
    categorySlug: string
}

const EducationalGuide: React.FC<EducationalGuideProps> = ({ categorySlug }) => {
    if (!categorySlug.includes('hava-perde')) return null

    return (
        <div className="bg-gray-50 py-12 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h3 className="text-2xl font-bold text-industrial-gray mb-2">Hangi Hava Perdesini Seçmelisiniz?</h3>
                    <p className="text-steel-gray">İhtiyacınıza en uygun çözümü belirlemenize yardımcı olalım.</p>
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
                            <h4 className="text-xl font-bold text-industrial-gray">Ortam Havası (Isıtıcısız)</h4>
                        </div>

                        <p className="text-gray-600 mb-6 relative z-10 min-h-[48px]">
                            İç ve dış ortam sıcaklık farkının az olduğu bölgeler veya sadece hava izolasyonu gereken durumlar için idealdir.
                        </p>

                        <ul className="space-y-3 relative z-10">
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>Minimum enerji tüketimi sağlar.</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>Soğuk hava depoları için en doğru tercihtir.</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>Yazın serin, kışın ılık bölgelerde kullanılır.</span>
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
                            <h4 className="text-xl font-bold text-industrial-gray">Elektrikli Isıtıcılı</h4>
                        </div>

                        <p className="text-gray-600 mb-6 relative z-10 min-h-[48px]">
                            Kış aylarında dışarıdan gelen soğuk havayı kırarken, içeriye sıcak hava üfleyerek konforu artırır.
                        </p>

                        <ul className="space-y-3 relative z-10">
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>Giriş kapısında "Sıcak Karşılama" etkisi yaratır.</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>Ek ısıtma kaynağı olarak mekana destek olur.</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <CheckCircle2 size={18} className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>AVM, Mağaza ve Restoran girişleri için önerilir.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EducationalGuide
