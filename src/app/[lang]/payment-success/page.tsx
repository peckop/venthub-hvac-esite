import { Suspense } from 'react'

import { odemeKarari } from '../../../lib/kip/odemeKapisi'
import { satisKipiOku } from '../../../lib/kip/satisKipi'
import OdemeKapaliBilgi from '../../../views/checkout/OdemeKapaliBilgi'
import PageComponent from '../../../views/PaymentSuccessPage'

/**
 * SİPARİŞ SONUCU EKRANI — SATIŞ KİPİ ANAHTARINA BAĞLI (URN-83).
 * Cetvel: docs/standards/satis-kipi-gecis-standard.md §3 · karar tek yerde: `checkout/page.tsx`.
 *
 * NİÇİN: bu adres elle açılabiliyordu. `/payment-success?status=success` doğrulama yapmadan
 * "Siparişiniz Tamamlandı!" ve `DEMO-ORDER` basıyor, sepeti ve yerel depodaki sepet izlerini siliyordu.
 * Satış kipi kapalıyken sipariş alınamaz; böyle bir ekran olmayan bir siparişi var gösterir, ziyaretçinin
 * sepetini de boşuna siler. Ödeme adımının kapısı (`satisKipiOku` + `odemeKarari`) artık bu ekranı da yönetir.
 *
 * KAPALIYKEN: sipariş sonucu bileşeni HİÇ KURULMAZ — yani doğrulama çağrısı, sepet temizleme ve yerel depo
 * yazımları da çalışmaz. Yerine ödeme sayfasının kapalı-kip kartı (`OdemeKapaliBilgi`: teklif/iletişim yolu) gösterilir.
 * AÇIKKEN: davranış aynen kalır.
 *
 * RSC: istemciye yalnız hangi bileşenin çizildiği gider; anahtarın kendisi, kaynağı ve damgası sızmaz.
 * `useSearchParams` kullanan `PageComponent` Suspense sınırının İÇİNDE kalır (CLAUDE.md kural 5).
 */
export default async function Page() {
  const kip = await satisKipiOku()
  // Checkout ile AYNI karar: anahtar açık olsa bile satıcı bilgisi eksikse ödeme (dolayısıyla sonucu) açılmaz.
  const karar = odemeKarari(kip)

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      {karar.acik ? <PageComponent /> : <OdemeKapaliBilgi />}
    </Suspense>
  )
}
