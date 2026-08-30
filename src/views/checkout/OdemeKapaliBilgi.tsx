'use client'

import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'
import { getSupportLink } from '../../utils/whatsapp'

/**
 * ÖDEME YOLU KAPALIYKEN GÖSTERİLEN BİLGİ KARTI (Recep talimatı, 2026-08-28).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN VAR
 * ─────────────────────────────────────────────────────────────────────────────
 * Şirket kuruluşu henüz tamamlanmadı. Ödeme tamamlanabilir durumdayken bir
 * sipariş gelirse karşılığında FATURA KESİLEMEZ — bu ticari bir kusur değil,
 * hukuki risktir. O yüzden ödeme yolu kapatıldı.
 *
 * Fiyatlar ve sepet KASITLI olarak açık kaldı: fiyat göstermek ilandır, satış
 * değildir. Kapanan tek şey ödemenin TAMAMLANABİLMESİ.
 *
 * Müşteriyi boş bir duvara çarptırmıyoruz: buradan teklif isteyebiliyor.
 * WhatsApp düğmesi ENV yoksa HİÇ ÜRETİLMEZ (uydurma numara basmama kuralı,
 * bkz. getWhatsAppNumber) — e-posta yolu her hâlükârda açık.
 */
const OdemeKapaliBilgi: React.FC = () => {
  const { t, lang } = useI18n()
  const whatsappLink = getSupportLink(t('checkout.kapali.baslik'), lang)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center bg-white border border-light-gray rounded-hvac-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-primary-navy mb-3">
          {t('checkout.kapali.baslik')}
        </h1>
        <p className="text-steel-gray mb-8">
          {t('checkout.kapali.aciklama')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-hvac-lg bg-primary-navy text-white font-semibold transition-colors hover:bg-secondary-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-blue"
            >
              {t('checkout.kapali.whatsappCta')}
            </a>
          ) : null}

          <a
            href="mailto:info@venthub.com.tr"
            className="inline-flex items-center justify-center px-6 py-3 rounded-hvac-lg border border-primary-navy text-primary-navy font-semibold transition-colors hover:bg-air-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-blue"
          >
            {t('checkout.kapali.emailCta')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default OdemeKapaliBilgi
