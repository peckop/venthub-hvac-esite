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
 * AÇIKKEN: gerçek (doğrulanmış) ödeme akışı aynen çalışır. İKİNCİ KAPI sonuç bileşenindedir (`PaymentSuccessPage`):
 * `status=success` URL parametresi tek başına kanıt değildir; başarı ekranı, sipariş numarası ve sepet temizliği yalnız
 * sipariş kimliği VARSA ve sipariş veritabanında ödenmiş görünüyorsa çıkar (elle yazılmış adres "Siparişiniz Tamamlandı" basamaz).
 *
 * DÖNÜŞ İSTİSNASI (güvenlik incelemesi 10-10, bulgu 2): kip kapalıyken de URL'de GEÇERLİ BİÇİMLİ bir `orderId`
 * (UUID) varsa sonuç bileşeni kurulur. Ödemesini kip AÇIKKEN yapmış müşteri, anahtar kapanınca banka dönüşünde
 * "satış kapalı" kartına düşüyor ve kendi ödemesinin sonucunu göremiyordu. Bu istisna KAPI 2'yi gevşetmez:
 * bileşen yine yalnız veritabanında ödenmiş görünen siparişte başarı basar ve sepeti siler; kimliği uydurma ya da
 * siparişi bulunamayan adres "kontrol ediliyor" ekranı alır, hiçbir yazım yapılmaz. Kimliği HİÇ olmayan ya da
 * biçimi bozuk adres kapalı kipte kapalı-kip kartını görmeye devam eder.
 *
 * RSC: istemciye yalnız hangi bileşenin çizildiği gider; anahtarın kendisi, kaynağı ve damgası sızmaz.
 * `useSearchParams` kullanan `PageComponent` Suspense sınırının İÇİNDE kalır (CLAUDE.md kural 5).
 */
const SIPARIS_KIMLIGI_BICIMI = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  const kip = await satisKipiOku()
  // Checkout ile AYNI karar: anahtar açık olsa bile satıcı bilgisi eksikse ödeme (dolayısıyla sonucu) açılmaz.
  const karar = odemeKarari(kip)

  const sorgu = (await searchParams) ?? {}
  const orderId = typeof sorgu.orderId === 'string' ? sorgu.orderId : undefined
  const donusYolu = Boolean(orderId && SIPARIS_KIMLIGI_BICIMI.test(orderId))

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      {karar.acik || donusYolu ? <PageComponent /> : <OdemeKapaliBilgi />}
    </Suspense>
  )
}
