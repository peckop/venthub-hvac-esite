import type { Lang } from './I18nContext'

/**
 * Yolun ilk parçasından dili çözer.
 *
 * NİÇİN VAR (REC-210, 2026-09-07 ölçümü):
 * Uygulamada iki `I18nProvider` var. `app/[lang]/layout.tsx` doğru dili veriyor, ama site
 * ÇATISI (Header + Footer, `MainLayout` içinde) o sağlayıcının **dışında** kalıyor: kök
 * `app/layout.tsx` → `Providers` → `MainLayout` → children → `app/[lang]/layout.tsx`.
 * Çatı, kök `Providers`'taki sağlayıcıyı okuyordu ve orada `lang` prop'u HİÇ verilmiyordu;
 * `I18nProvider` de dil verilmeyince `'tr'`ye düşüyor. Sonuç canlıda ölçüldü:
 * `/en/category/axial-industrial-fans` sayfasının görünür metninde **26 tekil Türkçe kelime
 * / 32 geçiş** — hepsi menü ve altbilgi ("İletişim", "Hakkımızda", "Ürünler", "Hesabım",
 * "Mühendislik odaklı havalandırma platformu…"). Yani gövde İngilizce, çatı Türkçe.
 *
 * Bu bir ÇEVİRİ eksiği DEĞİLDİ: karşılıklar sözlükte vardı (`en.ts` → `contact: 'Contact'`,
 * `about: 'About'`) ve `Footer.tsx` sözlüğü kullanıyordu (33 `t()` çağrısı, sabit TR metin 0).
 * Metin doğruydu, **dil bilgisi bileşene ulaşmıyordu**.
 *
 * SESSİZ VARSAYILAN YASAĞI: varsayılan dil bu dosyada, TEK yerde ve ADIYLA durur
 * (`VARSAYILAN_DIL`). Çağıran taraflarda `|| 'tr'` yazılmaz — o kalıp tam da kusurun
 * kendisiydi: dil "yok" olduğunda kimse fark etmeden Türkçe basılıyordu.
 */

/** Uygulamanın desteklediği diller. Sözlükler `DICTS` ile bire bir. */
export const DESTEKLENEN_DILLER: readonly Lang[] = ['tr', 'en'] as const

/**
 * Yol bir dil öneki taşımıyorsa (ör. `/admin`, `/api`, `/`) kullanılacak dil.
 * Tek tanım noktası — başka hiçbir yerde ham `'tr'` varsayılanı yazılmaz.
 */
export const VARSAYILAN_DIL: Lang = 'tr'

/**
 * `/en/category/fans` → `'en'` · `/tr/products/x` → `'tr'` · `/admin` → `VARSAYILAN_DIL`
 *
 * Yol `null`/boş olabilir (istemci gezinmesinin ilk anı); o hâl de varsayılana düşer ve
 * bu bilinçlidir — ama varsayılan görünürdür, gizli değil.
 */
export function yoldanDilCoz(pathname: string | null | undefined): Lang {
  if (!pathname) return VARSAYILAN_DIL

  const ilkParca = pathname.split('/').filter(Boolean)[0]
  if (!ilkParca) return VARSAYILAN_DIL

  const aday = ilkParca.toLowerCase()
  const eslesen = DESTEKLENEN_DILLER.find((dil) => dil === aday)

  return eslesen ?? VARSAYILAN_DIL
}
