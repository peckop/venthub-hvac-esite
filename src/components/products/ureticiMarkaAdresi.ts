import { markaBulAdla } from '@/data/brands'
import type { AdresDili } from '@/utils/adresUret'
import { adresRotalari } from '@/utils/yuzeyAdresleri'

/**
 * Aile / model sayfasındaki ÜRETİCİ bloğunun marka sayfası adresi (URN-126).
 *
 * NİÇİN: URN-126 kırıntıdan marka basamağını kaldırdı (kategoriden bir adım geri giden kullanıcı
 * kategoriye inmeli, markanın tüm ürünlerine düşmemeli). Ama arama motoru siteyi `<a href>` ile gezer:
 * aile ve model sayfalarından marka sayfasına giden tek gövde bağlantısı kırıntıydı (URN-21). Bağlantı
 * artık sayfanın üretici bloğunda durur — kırıntının sırasını bozmadan, "bu ürünün üreticisi" anlamıyla.
 *
 * SUNUCUDA ÇÖZÜLÜR: `markaBulAdla` tüm marka kataloğunu (metinler dahil) taşıyan `HVAC_BRANDS`'a bakar;
 * `'use client'` olan `ProductDetailPageView` bunu import ederse katalog istemci demetine girerdi. Bu
 * yüzden sayfa (`aileSayfasi.tsx`, sunucu) adresi çözer ve bileşene hazır dize olarak verir.
 *
 * ÇÖZÜLEMEYEN MARKA → `null` (bağlantı HİÇ çizilmez, ad düz metin kalır). Aile satırı marka SLUG'ı
 * taşımaz, yalnız adı; vitrinde sayfası olmayan bir adı adrese çevirmek 404'e açılan iç bağlantı olurdu.
 *
 * Adres `adresRotalari(...).brand`'den gelir (dil öneki ve şema bayrağı tek kaynakta); burada elle
 * birleştirme yok. `bayrak` verilmezse derleme sabiti (`ADRES_SEMASI_K3B`) kullanılır.
 */
export function ureticiMarkaAdresi(
  markaAdi: string | null | undefined,
  dil: AdresDili,
  bayrak?: boolean,
): string | null {
  const marka = markaBulAdla(markaAdi)
  if (!marka || !marka.slug) return null
  return adresRotalari(dil, bayrak).brand(marka.slug)
}
