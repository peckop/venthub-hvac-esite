'use client'

/**
 * SAYFA-BOYU SUSPENSE KALDIRILDI (REC-150 PR-0, 2026-09-05).
 *
 * Gerekçe kardeş rotada (`hrv/page.tsx`) yazılı; özet: sınır sayfanın tamamını sarınca
 * `useSearchParams` bailout'u tüm sayfayı kapsıyor ve sayfa sunucuda hiç render edilmiyordu.
 * Sınır artık görünümün içinde, yalnız parametreyi okuyan uç bileşende.
 */
import PageComponent from '../../../../../views/calculators/AirCurtainCalcPage'

export default function Page() {
  return <PageComponent />
}
