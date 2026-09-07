import React, { Suspense } from 'react'

import { satisKipiOku } from '../../../lib/kip/satisKipi'
import OdemeKapaliBilgi from '../../../views/checkout/OdemeKapaliBilgi'
import CheckoutPage from '../../../views/CheckoutPage'

/**
 * ÖDEME YOLU — SATIŞ KİPİ ANAHTARINA BAĞLI (REC-168).
 * Cetvel: docs/standards/satis-kipi-gecis-standard.md §3 (arayüz), §5 (hide_price + K39).
 *
 * ÖNCEKİ HÂLİ VE NİÇİN DEĞİŞTİ (ölçüldü 2026-09-06): burada
 * `process.env.NEXT_PUBLIC_ODEME_ACIK === '1'` vardı. Recep'in talimatı "tek anahtarla satış
 * kipine geç" idi ve bu env İLE MÜMKÜN DEĞİLDİ: `NEXT_PUBLIC_*` derleme anında GÖMÜLÜR,
 * vitrin sayfaları `generateStaticParams` ile statik üretilir. Yani env'i çevirmek YENİDEN
 * YAYIN ister — "tek tuş" değil, "tuş + yayın + bekleme"dir. Üstelik anahtar iki yerde
 * yaşardı (env burada, `hide_price` kategorilerde) ve ikisi ayrı ayrı çevrilirdi.
 *
 * ŞİMDİ: kaynak `site_settings.satis_kipi` satırı; okuma tek yerde (`satisKipiOku`), tazeleme
 * DB tetiği → webhook → `revalidateTag(SATIS_KIPI_TAG)` zinciriyle.
 *
 * ⭐DAVRANIŞ BUGÜN DEĞİŞMEZ: migration inmeden RPC yoktur, `satisKipiOku` fail-closed olarak
 * KAPALI döner — yani bu satır bugün de `OdemeKapaliBilgi` gösterir, tıpkı env'in tanımsız
 * hâli gibi. Kod migration'dan ÖNCE inebilsin diye böyle kuruldu (cetvel §7, K8 provası).
 *
 * ⚠ENV ARTIK OKUNMUYOR. `NEXT_PUBLIC_ODEME_ACIK` Vercel'de tanımlı KALSA BİLE ödeme AÇMAZ;
 * iki kaynaklı bir anahtar, "hangisi kazandı" sorusunu her seferinde yeniden doğurur ve o
 * soru üretimde sorulmaz — sessizce yanlış cevaplanır. Değişkenin silinmesi ayrı bir iş
 * (cetvel §8 açılış günü listesi); kod onu okumadığı için silinmesi ACELE değildir.
 *
 * RSC: bu sayfa Server Component'tir, `satisKipiOku()` sunucuda koşar ve istemciye YALNIZ
 * hangi bileşenin render edildiği gider — anahtarın kendisi, kaynağı ve damgası sızmaz.
 */
export default async function Page() {
  const kip = await satisKipiOku()

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    }>
      {kip.acik ? <CheckoutPage /> : <OdemeKapaliBilgi />}
    </Suspense>
  )
}
