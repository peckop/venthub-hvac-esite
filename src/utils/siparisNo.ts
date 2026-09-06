/**
 * SİPARİŞ NUMARASI — MÜŞTERİYE GÖSTERİLEN TEK BİÇİM (REC-156, 2026-09-06).
 *
 * OLAY: numara **14 ayrı yerde** elle kesiliyordu ve **iki çelişen** yöntem vardı:
 *   `order_number.split('-')[1]`   → `VH-20260818-4215` içinden **20260818** = TARİH.
 *                                    Aynı gün sipariş veren HERKES aynı "numarayı" görüyordu.
 *   `order_number.split('-').pop()` → **4215** (sıra parçası)
 *
 * Aynı dosyada ikisi birden vardı (`AccountOverviewPage` satır 233 ↔ 315): kullanıcı bir
 * ekranda `#4215`, diğerinde `#20260818` görüyordu. Destek, "siparişim #20260818" diyen iki
 * müşteriyi **ayırt edemiyordu**.
 *
 * KURAL: müşteri yüzeyinde **TAM NUMARA** gösterilir — `VH-20260818-4215`.
 *   • Tekildir (REC-156 sonrası üretim de tekil: günün sıra sayacı).
 *   • DB'deki değerin AYNISIdır → admin aramasına birebir yapıştırılabilir.
 *   • Parçalamak bilgi kaybıdır; kısaltma "daha temiz" görünür ama kimliği yok eder.
 *
 * ⛔`#` ÖNEKİ YOK: tam numara zaten `VH-` ile başlıyor; başına `#` koymak
 * "#VH-20260818-4215" gibi okunur. Sözlükte `#` gömülü olan anahtarlar bu yüzden
 * güncellendi (`orderHash`, `orderNoSuffix`, `orders.page.orderLabel`).
 */

/**
 * Müşteriye gösterilecek sipariş numarasını döndürür.
 *
 * @param orderNumber DB'deki `venthub_orders.order_number` (NOT NULL — yedek savunma amaçlı).
 * @param yedekId     Numara bir şekilde yoksa kimliğin son 8 hanesi (eski davranışın devamı).
 */
export function siparisNoGoster(
  orderNumber?: string | null,
  yedekId?: string | null,
): string {
  const no = orderNumber?.trim()
  if (no) return no
  // Yedek yol: kolon NOT NULL olduğu için normalde buraya DÜŞÜLMEZ. Yine de boş bir
  // etiket basmaktansa ayırt edici bir şey göstermek, "numara yok" demekten iyidir.
  const id = yedekId?.trim()
  return id ? id.slice(-8).toUpperCase() : ''
}
