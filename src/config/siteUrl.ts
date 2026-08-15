/**
 * Sitenin kanonik kök adresi.
 *
 * Sıralama ÖNEMLİ. Canlı arıza (2026-08-15, LAUNCH denetimi): `NEXT_PUBLIC_SITE_URL` prod'da
 * set edilmediği için `VERCEL_URL`'e düşülüyordu — ama o değer **deploy'a özeldir**
 * (`...-m8cog5tbe-peckops-projects.vercel.app`) ve her deploy'da DEĞİŞİR. Sonucu:
 *   · `robots.txt` her deploy'da başka bir `Sitemap:` adresi gösteriyordu,
 *   · `sitemap.xml` ve hreflang alternatifleri geçici URL'ler üretiyordu (SEO kökten bozuk),
 *   · canonical/OG metadata'sı geçici URL gösteriyordu,
 *   · hukuki metinler (`config/legal.ts` → `websiteUrl`) satıcının sitesi olarak o rastgele
 *     deploy adresini yazıyordu — Mesafeli Satış Sözleşmesinde hukuken anlamsız bir adres.
 *
 * `VERCEL_PROJECT_PRODUCTION_URL` ise projenin **kalıcı** production alan adıdır ve özel alan
 * adı bağlandığı an kendiliğinden ona döner. Bu yüzden `VERCEL_URL`'den ÖNCE denenir.
 *
 * Doğrusu yine de `NEXT_PUBLIC_SITE_URL`'i açıkça set etmektir (özel alan adı, `https://` ile,
 * sondaki `/` olmadan); bu merdiven yalnızca sessiz bozulmayı önleyen emniyet ağıdır.
 *
 * Not: yalnız sunucu tarafında kullanılır (layout metadata, robots, sitemap, sayfa metadata'sı).
 * İstemci bileşenlerinde kullanılırsa `NEXT_PUBLIC_` önekli olmayan değişkenler paketlenmez ve
 * `localhost`'a düşülür — o yüzden istemcide kullanma.
 */
const stripTrailingSlash = (url: string) => url.replace(/\/+$/, '')

const getSiteUrl = () => {
    if (typeof process !== 'undefined') {
        // 1) Açık yapılandırma — her zaman kazanır.
        if (process.env.NEXT_PUBLIC_SITE_URL) {
            return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL)
        }
        // 2) Vercel'in KALICI production alan adı (özel alan adı bağlanınca o olur).
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            return `https://${stripTrailingSlash(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`
        }
        // 3) Son çare: deploy'a ÖZEL adres. Preview'da doğru, production'da kararsızdır.
        if (process.env.VERCEL_URL) {
            return `https://${stripTrailingSlash(process.env.VERCEL_URL)}`
        }
    }
    return 'http://localhost:3000'
}

export const SITE_URL = getSiteUrl()
