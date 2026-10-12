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
 * İSTİSNA (URN-7, ölçüm 2026-10-01): iç içe `/<dil>/category/<üst>/<alt>` yolu önbelleği olmayan 308'dir;
 * üretilmez. SEO-35 B-1 kararıyla o rota açık kipte de yalnız yönlendirir (içerik çizmez, sayfa sınıfı ilan etmez),
 * yani yol hiçbir kipte tazelenmez (kapı: INV-TAZELEME-YOL-3).
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
 * değişir — `getLocalizedCategorySlug`). `ust` verilirse dal nesnesi de sorulur; SEO-35 B-1'den beri iki şemada da
 * kategori adresi TEK segmenttir, dal nesnesi tek segmentli adresin aynısını üretir ve küme tekilleştirir.
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
      // Dal nesnesi ÜST'ü kök alır ama adres dalın kendi slug'ıdır: iki şemada da TEK segment (yeni: `/kategori/<alt>`,
      // EN `/category/<alt>`; bugünkü: `Routes.category` → `/category/<alt>`). Yukarıdaki satırla aynı yol çıkar.
      if (ustSlug) yollar.add(String(adresUret({ tur: 'kategori', kok: ustSlug, dal: own }, dil, yeni)))
    }
    // İç içe `/<dil>/category/<üst>/<alt>` ve `/tr/kategori/<üst>/<alt>` yolları BİLİNÇLİ üretilmez: iki şemada da
    // yalnız 308 yönlendirmesidir, önbelleği yoktur (URN-7 ölçümü 2026-10-01; SEO-35 B-1), tazelemek boş iştir.
    // Kapı: INV-TAZELEME-YOL-2 elle dil önekini yasaklar.
  }
  return [...yollar]
}
