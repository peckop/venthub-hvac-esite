/**
 * Kanonik kök adres — SUNUCUDA da İSTEMCİDE de doğru olan TEK kaynak.
 *
 * NİÇİN VAR (REC-100, 2026-08-31): `src/config/siteUrl.ts`'nin kendi başlığı şunu
 * açıkça yazıyor: "yalnız sunucu tarafında kullanılır... İstemci bileşenlerinde
 * kullanılırsa `NEXT_PUBLIC_` önekli olmayan değişkenler paketlenmez ve `localhost`'a
 * düşülür — o yüzden istemcide kullanma."
 *
 * Kural YAZILIYDI, kapı YOKTU. `src/components/Seo.tsx` bir `'use client'` bileşeni
 * olduğu hâlde `SITE_URL` kullanıyordu ve CANLIDA ölçüldü: her ürün/marka sayfasında
 * ikinci bir `<link rel="canonical">` + `og:url` + `og:image` **http://localhost:3000**
 * gösteriyordu (marka sayfasında ÜÇ canonical). Kategori sayfaları temizdi — çünkü
 * `Seo` bileşenini kullanmıyorlar.
 *
 * Etkisi ölçülerek sınırlandırıldı: SSR HTML'de değerler DOĞRU olduğu için paylaşım
 * botları doğru kartı görüyor. Risk, JS çalıştıran tarayıcı/botların gördüğü ÇELİŞKİLİ
 * kanonik bildirimidir — arama motoru çelişen canonical'da ikisini de yok sayabilir.
 *
 * ÇÖZÜM ŞEKLİ NEDEN BÖYLE: `'use client'` bileşenleri Next.js'te SUNUCUDA da render
 * edilir (ilk HTML). Yani "istemcide `window.location.origin` kullan" tek başına yetmez,
 * sunucu geçişinde `window` yoktur. Bu yüzden iki ortam için iki kaynak:
 *   · sunucuda  → `SITE_URL` (env'den gelir, doğrudur)
 *   · tarayıcıda → `window.location.origin` (paket değişkenine hiç bağlı değildir)
 * Prod'da ikisi aynı adresi verir, bu yüzden hidrasyon farkı doğmaz.
 *
 * Bekçi: INV-KANONIK-KOK-1 — `'use client'` dosyalarda `config/siteUrl` DOĞRUDAN
 * import edilemez; bu yardımcı kullanılır.
 */
import { SITE_URL } from '@/config/siteUrl'

export const canonicalOrigin = (): string =>
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : SITE_URL
