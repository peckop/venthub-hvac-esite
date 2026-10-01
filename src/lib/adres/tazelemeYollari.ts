import { type AdresDili, adresUret } from '@/utils/adresUret'

/**
 * TAZELEME YOLLARI — webhook'un `revalidatePath` listesi (REC-300 Faz 3g, ana plan m.9).
 *
 * NİÇİN: webhook aile/kategori sayfalarını `/tr/products/<slug>` gibi SABİT yollarla tazeliyordu. Adres şeması
 * bayrağı (`ADRES_SEMASI_K3B`) açılınca canlı adres `/tr/urun/<slug>` olur; sabit yol yanlış sayfayı vurur,
 * veri değişir, vitrin eski hâlinde donar ve hiçbir test görmez (rendering-cache-standard: "statik vitrinde
 * görünen her tablonun webhook dalı olmalı" — dal vardı, YOLU eskiydi).
 *
 * KURAL: yollar HER İKİ şemada (bugünkü + yeni) ve HER İKİ dilde üretilir; bayrağa BAKILMAZ. Sebep: bayrak derleme
 * sabiti — açılış anında önceki derlemenin önbelleğinde eski adresli sayfalar da durur (eski adres 308 verir ama
 * önbellekli 308 de bayatlayabilir: ana plan v4 O2), ve geri alma (bayrak `false`) da aynı listeyle güvenlidir.
 * Var olmayan bir yolu geçersiz kılmanın maliyeti yok; eksik bırakmanın maliyeti bayat vitrin.
 *
 * Saf yardımcı: `next/cache` ya da DB'ye dokunmaz; çağıran `revalidatePath` yapar (route handler tek koşullu
 * `if (table === 'x')` dallarını korur — INV-RENDER-2).
 */
const DILLER: readonly AdresDili[] = ['tr', 'en']
const SEMALAR: readonly boolean[] = [false, true]

/** Bir ailenin (ya da serisinin) sayfa yolları: iki dil × iki şema, tekilleştirilmiş. */
export function aileYollari(slug: string): string[] {
  const yollar = new Set<string>()
  for (const dil of DILLER) {
    for (const yeni of SEMALAR) yollar.add(String(adresUret({ tur: 'aile', slug }, dil, yeni)))
  }
  return [...yollar]
}

/**
 * Bir kategori sayfasının yolları. `kok(dil)` çağıranın o dildeki slug'ını verir (kategori slug'ı dile göre
 * değişir — `getLocalizedCategorySlug`); `ust` varsa dal adresi (üst/alt) de üretilir, tek segmentli adres HER
 * ZAMAN da üretilir (alt kategori eski şemada tek segmentle de yayınlanmıştı — REC-205).
 */
export function kategoriYollari(
  kok: (dil: AdresDili) => string,
  ust?: ((dil: AdresDili) => string) | null,
): string[] {
  const yollar = new Set<string>()
  for (const dil of DILLER) {
    const own = kok(dil)
    if (!own) continue
    const ustSlug = ust?.(dil)
    for (const yeni of SEMALAR) {
      yollar.add(String(adresUret({ tur: 'kategori', kok: own }, dil, yeni)))
      // Dal adresi ÜST'ü kök alır: yeni şemada `/kategori/<üst>/<alt>` (EN: `/category/<üst>/<alt>`); bugünkü şemada
      // `adresUret` `Routes.category` çağırır ve TEK segment (`/category/<alt>`) üretir.
      if (ustSlug) yollar.add(String(adresUret({ tur: 'kategori', kok: ustSlug, dal: own }, dil, yeni)))
    }
    // Bugünkü şemanın iki segmentli `/<dil>/category/<üst>/<alt>` yolu BİLİNÇLİ üretilmez: bayrak kapalıyken yalnız
    // 308 yönlendirmesidir, önbelleği yoktur (URN-7 ölçümü 2026-10-01), tazelemek boş iştir. Bayrak açılınca iki
    // segmentli sayfa yolu yukarıdaki yeni-şema dalından gelir (kapı: INV-TAZELEME-YOL-2 elle dil önekini yasaklar).
  }
  return [...yollar]
}
