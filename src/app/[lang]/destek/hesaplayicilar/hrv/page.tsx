'use client'

/**
 * SAYFA-BOYU SUSPENSE KALDIRILDI (REC-150 PR-0, 2026-09-05).
 *
 * ESKİDEN: `<Suspense><PageComponent/></Suspense>` — sınır sayfanın TAMAMINI sarıyordu.
 * Görünüm `useSearchParams()` çağırdığı için o sınırın kapsadığı ağaç sunucuda HİÇ render
 * edilmiyordu (CSR bailout) ve sonuç canlıda ölçüldü: bu sayfa arama motoruna **0 kelime**
 * gövde ve sitenin **jenerik** açıklamasıyla görünüyordu (karşılaştırma: `kanal` 422 kelime
 * ve kendi açıklaması).
 *
 * ŞİMDİ: sınır görünümün içinde, yalnız parametreyi okuyan uç bileşeni sarıyor
 * (`UrlParametreOkuyucu`). Sayfa `kanal`/`jet-fan` ile aynı kalıba döndü.
 *
 * CLAUDE.md kural 5 lafzen sağlanıyordu ama sarılan şey SAYFAYDI; kural bileşeni söylüyor.
 */
import PageComponent from '../../../../../views/calculators/HRVCalcPage'

export default function Page() {
  return <PageComponent />
}
