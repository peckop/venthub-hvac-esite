/**
 * Kök seviyedeki `.txt` / `.xml` adresleri için middleware kararı (URN-15, GEO-SEO bulgusu SEO-5).
 *
 * NİÇİN VAR (2026-10-02, canlıda ölçüldü): `/ai.txt`, `/llms-full.txt`, `/humans.txt`, `/ads.txt`,
 * `/security.txt`, `/news-sitemap.xml` ve uydurma `/xyz.txt` 404 yerine **500** veriyordu. Sebep,
 * REC-127'de eklenen "kök seviyedeki HER `.txt` dil yönlendirmesinden muaf" kuralıydı: dosyası
 * olmayan ad `[lang]` rotasına dil değeri (`"ai.txt"`) olarak düşüyor, `Intl.Collator` geçersiz yerel
 * ayarla `RangeError` fırlatıyordu. Muafiyetin tek meşru işi, dosyası GERÇEKTEN var olan adresleri
 * dil önekinden korumaktır; var olmayan ad muaf olamaz.
 *
 * KURAL: yalnız AD LİSTESİ ve ad biçimi — middleware'de DB sorgusu yasak (CLAUDE.md kural 12).
 * Listeye ad eklemek gerekiyorsa dosya `public/` altına konduğunda eklenir; `INV-KOK-DOSYA-1`
 * (`src/__tests__/middlewareKokDosya.test.ts`) `public/` kökündeki her `.txt`'nin muaf olduğunu ölçer,
 * yani unutulan ad testte kırmızı verir, canlıda sessiz 404 olmaz.
 */

/** Dosyası `public/` altında duran ya da Next rotasıyla (`app/robots.ts`) üretilen kök `.txt` adları. */
export const BILINEN_KOK_METIN_DOSYALARI: ReadonlySet<string> = new Set([
  'robots.txt', // src/app/robots.ts
  'llms.txt', // public/llms.txt
  'use.txt', // public/use.txt (var olan dosya; kaldırılırsa buradan da kalkar)
])

/**
 * IndexNow doğrulama dosyası: `public/<anahtar>.txt`. Adı ANAHTARIN KENDİSİ olduğu için önceden
 * yazılamaz (REC-127); anahtar 32 karakterlik küçük harfli onaltılık dizi (`INDEXNOW_ANAHTARI`,
 * REC-405). Biçim bu kadar dar tutuldu ki `llms-full.txt`, `security.txt` gibi adlar buna UYMASIN.
 */
const INDEXNOW_ANAHTAR_DOSYASI = /^[0-9a-f]{32}\.txt$/

/** Sitemap tek rota: `src/app/sitemap.ts` yalnız `/sitemap.xml` üretir (`generateSitemaps` yok). */
const BILINEN_KOK_XML_YOLU = '/sitemap.xml'

export type KokDosyaKarari =
  /** Kök dosya değil: dil yönlendirmesi normal akar. */
  | 'dosya-degil'
  /** Bilinen kök dosya: dil önekinden muaf, olduğu gibi servis edilir. */
  | 'bilinen'
  /** Kök seviyede `.txt`/`.xml` ama bilinen değil: doğrudan 404. */
  | 'bilinmeyen'

/** `segments` = `pathname.split('/').filter(Boolean)`. Yalnız DİL ÖNEKSİZ yollar için çağrılır. */
export function kokDosyaKarari(pathname: string, segments: readonly string[]): KokDosyaKarari {
  // `sitemap.xml` eskiden HER derinlikte muaftı (`endsWith`); artık yalnız kökteki tek rota.
  if (pathname === BILINEN_KOK_XML_YOLU) return 'bilinen'

  if (segments.length !== 1) return 'dosya-degil'
  const ad = segments[0]
  if (!/\.(txt|xml)$/.test(ad)) return 'dosya-degil'

  if (BILINEN_KOK_METIN_DOSYALARI.has(ad) || INDEXNOW_ANAHTAR_DOSYASI.test(ad)) return 'bilinen'
  return 'bilinmeyen'
}
