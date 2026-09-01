import { Award, Phone,Shield } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'

/**
 * TrustSignals - Güven sinyalleri bölümü
 * Yeni site için Vortice itibarını ön plana çıkarır
 *
 * REC-104 (2026-09-01): Bu şerit "Güvenli Ödeme / SSL şifreli işlem", "Hızlı Kargo /
 * Stoktan teslimat" ve "Taksit İmkanı / 12 aya varan taksit" rozetlerini basıyordu.
 * ÖLÇÜLDÜ: 23 aktif kategorinin 23'ünde `hide_price=true`, çevrimiçi ödeme
 * `NEXT_PUBLIC_ODEME_ACIK` ile kapalı ve canlı /checkout "Ödeme yakında açılıyor"
 * diyor. Yani site bir yüzeyde ödemenin kapalı olduğunu söylerken bu şerit 12 aylık
 * taksit vaat ediyordu. Üç rozet de kaldırıldı; kalan üçü (marka güvencesi, garanti,
 * teknik destek) sınır-vaka olarak Recep'in hükmünü bekliyor.
 * Cetvel: docs/standards/vaat-butunlugu-standard.md · kapı: INV-VAAT-SIZINTI-1.
 *
 * ⭐IZGARA: kalem sayısı 6'dan 3'e indi, `lg:grid-cols-6` bu yüzden `lg:grid-cols-3`
 * oldu. Kalemi silip sütun sayısına dokunmamak yarısı boş bir satır bırakırdı —
 * 2026-08-31'de ana sayfada ölçülmüş sessiz düzen bozulması sınıfı.
 */
const TrustSignals: React.FC = () => {
    const { t } = useI18n()
    const signals = [
        {
            icon: Award,
            title: t('category.trustSignals.authorizedDealerTitle'),
            description: t('category.trustSignals.authorizedDealerDesc')
        },
        {
            icon: Shield,
            title: t('category.trustSignals.warrantyTitle'),
            description: t('category.trustSignals.warrantyDesc')
        },
        {
            icon: Phone,
            title: t('category.trustSignals.techSupportTitle'),
            description: t('category.trustSignals.techSupportDesc')
        }
    ]

    return (
        <section className="py-12 bg-gray-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {signals.map((signal, index) => {
                        const Icon = signal.icon
                        return (
                            <div
                                key={index}
                                className="text-center"
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-200">
                                    <Icon className="text-blue-600" size={24} />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm">{signal.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{signal.description}</p>
                            </div>
                        )
                    })}
                </div>

                {/*
                  REC-104 (Recep hükmü): CE · ISO 9001 · Compasso d'Oro satırı KALDIRILDI.
                  Bunlar tek markanın sertifika/ödülleriydi ama TÜM kategori iniş
                  sayfalarında basılıyordu — kategoriye değil markaya ait bir iddia.
                  15A'da marka sayfasında ele alınacak; buraya taşınmadı, kaldırıldı.
                */}
            </div>
        </section>
    )
}

export default TrustSignals



