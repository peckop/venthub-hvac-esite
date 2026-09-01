/**
 * AİLE ADININ DİL ÇÖZÜMÜ — TEK GİRİŞ NOKTASI (REC-108 Faz 1).
 *
 * NİÇİN VAR (ölçülmüş olay, 2026-09-01):
 * İngilizce ürün sayfasının kırıntı yolu `HOME › AIR TREATMENT › ELECTRIC DUCT HEATERS ›
 * AVENS ELEKTRIKLI KANAL ISITICILARI` görünüyordu — ilk üç basamak İngilizce, dördüncü
 * Türkçe. Dördüncü basamak AİLE adı. Kök: `get_family_detail` RPC'si `p_lang`'ı çözüp
 * AÇIKLAMA için kullanıyor ama ad için ham kolonu (`'name', f.name`) döndürüyordu.
 * `product_families.name_i18n` kolonu ise iki migration ile açılıp 40 ailenin 31'inde
 * DOLDURULMUŞ, buna karşılık okuyan kod SIFIRDI. Veri inmiş, istemci hiç bağlanmamıştı.
 *
 * ⭐NİÇİN BURADA, SERVİSTE DEĞİL (plan-challenger B2):
 * Kategori liste verisi `unstable_cache` içinde tutuluyor. Çözümü servis katmanına
 * koysaydık önbelleğe GİREN veri dile bağımlı hale gelir ve `getFamiliesEnriched`
 * imzası `lang` almak zorunda kalırdı. Bu yüzden kural şudur:
 *   · servis katmanı `name_i18n`'i yalnız **TAŞIR**,
 *   · dil çözümü **render anında** burada yapılır.
 * Böylece tek önbellek girdisi iki dile birden hizmet eder.
 *
 * Kardeşi: `getCategoryDisplayName` (kategori adı, `src/utils/categoryHelpers.ts`).
 * Cetvel: `docs/plans/rec108-aile-adi-dil-zinciri-2026-09-01.md`
 * Kapı: `INV-AILE-ADI-1` → `src/__tests__/conformance/aile-adi-tek-kaynak.test.ts`
 */

/** `product_families.name_i18n` JSONB şekli — `description` alanıyla aynı desen. */
export interface AileAdiCevirileri {
  tr?: string | null
  en?: string | null
}

/**
 * Ad çözebilmek için gereken EN AZ alan kümesi. Bilerek dar: `FamilyDetail['family']`,
 * `FamilyListItem` ve `SeriesLanding['series']` üçü de bu şekle uyar, dolayısıyla üç
 * yüzey de cast'siz çağırabilir.
 */
export interface AileAdiKaynagi {
  name: string
  name_i18n?: AileAdiCevirileri | null
}

/**
 * Görünen aile adı. `name_i18n[lang]` DOLUYSA o, değilse ham `name`.
 *
 * ⭐Boş dize DOLU SAYILMAZ: `name_i18n` toplu bir betikle dolduruldu ve boş hücre
 * bırakması mümkün. Boşu "çeviri var" saymak, adı görünmez yapardı — sessiz kayıp.
 * Fallback'in TR ada düşmesi kusur değil, bilinen davranıştır: 40 ailenin 9'unda EN ad
 * henüz yok (REC-109 içerik işi).
 */
export function familyName(
  family: AileAdiKaynagi | null | undefined,
  lang: string
): string {
  if (!family) return ''
  const ceviriler = family.name_i18n
  const secilen = lang === 'en' ? ceviriler?.en : ceviriler?.tr
  if (typeof secilen === 'string' && secilen.trim() !== '') return secilen
  return family.name ?? ''
}
