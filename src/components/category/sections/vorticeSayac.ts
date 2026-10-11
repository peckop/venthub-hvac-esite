import type { KatalogSayilari } from '@/types/ui-models'

/**
 * VORTICE SAYAÇ KARTLARININ SAYI KAYNAĞI (URN-95, URN-82 devamı).
 *
 * İki bileşen (hava perdesi `VorticeBrand`, sessiz fan `SilentFanVorticeBrand`) dört kartlı sıra taşır; sözlükteki
 * sıra simgeyle birlikte sabittir. 1. kart "Vortice Ürün Ailesi", 2. kart "Vortice Aktif Model" kartıdır ve DEĞERİ
 * sözlükten DEĞİL sunucudan gelen katalog sayısından okunur (marka sayfasındaki "Katalogda" kutusuyla aynı kaynak:
 * `getBrandCatalogSummary`). Kart sırası değişirse BU tablo ve sözlük birlikte değişir; kapı:
 * `vorticeKatalogSayilari.test.tsx`.
 *
 * Sayı yoksa (özet okunamadı, aile ya da model sayısı pozitif tam sayı değil) kart HİÇ çizilmez: etiket tek başına
 * anlamsızdır ve kesik sayı ("12 ürün ailesi, 0 model") yanlıştır.
 */
export const SAYAC_KAYNAGI: Readonly<Record<number, keyof KatalogSayilari>> = { 1: 'aile', 2: 'model' }

/** Karta basılacak sayı; kart sayaç kartı değilse `undefined`, sayı geçersizse `null` (kart çizilmez). */
export function sayacDegeri(katalogSayilari: KatalogSayilari | null | undefined, index: number): string | null | undefined {
  const alan = SAYAC_KAYNAGI[index]
  if (!alan) return undefined
  const sayi = katalogSayilari?.[alan]
  return typeof sayi === 'number' && Number.isInteger(sayi) && sayi >= 1 ? String(sayi) : null
}
