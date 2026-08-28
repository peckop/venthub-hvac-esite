import React, { Suspense } from 'react'

import OdemeKapaliBilgi from '../../../views/checkout/OdemeKapaliBilgi'
import CheckoutPage from '../../../views/CheckoutPage'

/**
 * ÖDEME BAYRAĞI (Recep talimatı, 2026-08-28).
 *
 * Şirket kuruluşu tamamlanmadan ödeme tamamlanabilirse karşılığında FATURA
 * KESİLEMEZ — hukuki risk. Bu yüzden ödeme yolu bir ENV bayrağının arkasında.
 *
 * VARSAYILAN KAPALI: bayrak tanımsızsa da, boşsa da, '1' dışında bir şeyse de
 * ödeme KAPALIDIR. Güvenli varsayılan bilinçlidir — yeni bir ortam (preview,
 * yeni proje, unutulmuş değişken) yanlışlıkla ödeme AÇMASIN diye.
 *
 * AÇMA PROSEDÜRÜ (kod değişmez): Vercel'de NEXT_PUBLIC_ODEME_ACIK=1 tanımlanır
 * ve yeniden dağıtım yapılır. Kapatma: değişkeni sil ya da değerini değiştir.
 *
 * Fiyatlar ve sepet KASITLI olarak açık kalır — fiyat göstermek ilandır.
 */
const ODEME_ACIK = process.env.NEXT_PUBLIC_ODEME_ACIK === '1'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    }>
      {ODEME_ACIK ? <CheckoutPage /> : <OdemeKapaliBilgi />}
    </Suspense>
  )
}
