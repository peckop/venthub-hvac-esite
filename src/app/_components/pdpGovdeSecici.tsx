import React, { Suspense } from 'react'

/**
 * URN-59 — ürün (aile) sayfası gövdesini ham HTML'e BİR kez basan seçici.
 *
 * KUSUR (ölçüldü 2026-10-06): aile sayfası `useSearchParams` köprüsünü, fallback'i TAM gövde olan bir Suspense ile
 * sarıyordu; rota `force-static` olduğundan Next istemci-render'a düşer ve ham HTML'de gövde (H1, model listesi,
 * teknik tablo) iki kez geçer (ikincisi footer sonrası gizli blokta): H1=2. JS çalıştırmayan AI tarayıcıları
 * tekrar eden metni ve iki H1'i görür.
 *
 * ÇÖZÜM (Yol A, OPS hükmü 10-06, bayrağa bağlı): `ADRES_SEMASI_K3B` AÇIKKEN `?sku=` zaten tek 308 ile model
 * adresine gider (eslestirici.ts), aile sayfasına `?sku=` ile hiç ulaşılmaz → köprü ve Suspense GEREKMEZ, gövde
 * `selectedSku=null` ile bir kez basılır. Bayrak KAPALIYKEN yapı bugünküyle BİREBİR (köprü + Suspense), yani 3-C
 * kayarsa canlıda hiçbir şey değişmez ve `?sku=` seçimi kaybolmaz.
 *
 * Seçici bilerek `useSearchParams` İÇERMEZ (kural 5: arama parametresi okuyan her bileşen Suspense'le sarılır; o
 * bileşen `SkuKoprusu` olarak DIŞARIDAN verilir ve yalnız bayrak kapalıyken render edilir).
 */
export interface PdpGovdeSeciciProps {
  /** Model rotasında sunucunun seçtiği SKU (varsa seçim sunucuda yapılmıştır). */
  sunucuSku?: string | null
  /** `ADRES_SEMASI_K3B`. Açıkken `?sku=` adres katmanında 308'lenir; köprü kullanılmaz. */
  adresSemasiAcik: boolean
  /** Gövdeyi verilen SKU ile çizer (`null` = varsayılan model). */
  govde: (secili: string | null) => React.ReactNode
  /** `?sku=` değerini okuyup `govde(değer)` çağıran istemci köprüsü (yalnız bayrak kapalıyken kullanılır). */
  SkuKoprusu: React.ComponentType<{ govde: (secili: string | null) => React.ReactNode }>
}

export const PdpGovdeSecici: React.FC<PdpGovdeSeciciProps> = ({ sunucuSku, adresSemasiAcik, govde, SkuKoprusu }) => {
  // Model rotası seçimi sunucuda yaptı: köprü ve Suspense GEREKMEZ.
  if (sunucuSku) return <>{govde(sunucuSku)}</>
  // Bayrak açık: `?sku=` adres katmanında model adresine gider → gövde bir kez, varsayılan modelle.
  if (adresSemasiAcik) return <>{govde(null)}</>
  // Bayrak kapalı (bugün): eski yapı AYNEN. Fallback bilinçli olarak VARSAYILAN varyantla çizilmiş tam gövdedir
  // (statik ön-render'da HTML gerçek ürün içeriğiyle çıkar); istemci hidrasyonunda ?sku= seçimi devralır.
  return (
    <Suspense fallback={govde(null)}>
      <SkuKoprusu govde={govde} />
    </Suspense>
  )
}
