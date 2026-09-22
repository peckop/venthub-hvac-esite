// Arama penceresinin ön hazırlığı (arama cetveli §14).
//
// Niçin: arama penceresi `dynamic(..., { ssr: false })` ile İLK TIKLAMADA iner ve ilk aramada
// arama servisi parçası da ayrıca iner (SearchOverlay.tsx içindeki `await import(...)`). Recep
// 2026-09-18'de "ilk arama takılıyor, sonra anlık" dedi; 2026-09-22 ölçümü (üretim paketi, temiz
// tarayıcı ×6): tıklamadan pencereye medyan 0,39 sn. İki parça birlikte ~15 KB (gzip).
//
// Ne yapar: iki parçayı önceden indirir ve Supabase kaynağına bağlantıyı önceden açar. Yeni istek
// ÜRETMEZ (veritabanına çağrı yok) — yalnız ağ ve kod hazırlığı.
import { preconnect } from 'react-dom'

let parcalarIstendi = false
let baglantiAcildi = false

/**
 * Arama penceresi ve arama servisi parçalarını önceden indirir. Tekrar çağrı bedavadır.
 * İndirme düşerse (ağ yok) bayrak geri alınır: bir sonraki niyet yeniden dener, tıklama da
 * zaten kendi indirmesini yapar — ön hazırlık hiçbir yolu KIRMAZ, yalnız hızlandırır.
 */
export function aramaParcalariniOnYukle(): void {
  if (parcalarIstendi) return
  parcalarIstendi = true
  // Belirteçler StickyHeader'daki `dynamic(() => import('./SearchOverlay'))` ve
  // SearchOverlay'deki `import('../lib/services/product.service')` ile AYNI modüle çözülür;
  // böylece aynı parça iner, ikinci kopya oluşmaz (INV-ARAMA-ONHAZIRLIK-1).
  Promise.all([import('./SearchOverlay'), import('../lib/services/product.service')]).catch(() => {
    parcalarIstendi = false
  })
}

/**
 * Kullanıcı arama kutusuna yöneldiğinde (fare üstünde, odak, dokunuş): parçalar + bağlantı.
 * Bağlantı BOŞTA açılmaz — tarayıcı kullanılmayan ön bağlantıyı ~10 sn içinde kapatır, boşta
 * açılan bağlantı arama anına kalmaz.
 */
export function aramaNiyeti(): void {
  aramaParcalariniOnYukle()
  if (baglantiAcildi) return
  const adres = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!adres) return
  try {
    // supabase-js çağrıları kimlik bilgisi taşımayan CORS isteğidir → "anonymous" havuzu.
    preconnect(new URL(adres).origin, { crossOrigin: 'anonymous' })
    baglantiAcildi = true
  } catch {
    // Geçersiz adres: ön bağlantı atlanır, arama kendi bağlantısını kurar.
  }
}

/** Yalnız testler için: bayrakları okur (INV-ARAMA-ONHAZIRLIK-1). */
export function __aramaOnHazirlikDurumu(): { parcalarIstendi: boolean; baglantiAcildi: boolean } {
  return { parcalarIstendi, baglantiAcildi }
}
