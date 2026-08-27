---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\components\en\CookiePolicyContent.tsx
skeleton_hash: 90d9cc9143ee82d7
entity_hashes:
  func:CookiePolicyContentEn: 64ceff3b3db53c10
  overview: d2ac6a35885f1fc4
  style_tokens: 88353204d6ac1f19
generated_at: 2026-08-27T07:36:39Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının hukuki sayfaları arasında yer alan çerez politikası bilgilendirme metnini İngilizce dilinde sunan bir React bileşenidir. Tek bir fonksiyonel bileşen olarak tasarlanmış olup, dışarıdan aldığı `lang` parametresine göre içeriği render eder. Modül, yasal uyumluluk kapsamında kullanıcıları çerez kullanımı hakkında bilgilendirme amacı taşır.

## Fonksiyon Grupları
### Çerez Politikası İçerik Bileşeni
Modülün tek sorumluluğu, İngilizce dilindeki çerez politikası metnini bir React JSX yapısı olarak sunmaktır. Bileşen stateless olarak tasarlanmış olup, `lang` prop'u çağrımcı tarafından sağlanmalıdır.
- CookiePolicyContentEn

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi paylaşılmadığından, yalnızca fonksiyon imzasından çıkarılabilen varsayımlar listelenmektedir.

[Aksiyom 1]: Eğer `lang` prop'u sağlanmazsa, `lang` değeri `undefined` olur; çünkü imzada bir default değer tanımlanmamıştır.

[Aksiyom 2]: Eğer `lang` prop'u `string` tipinde değilse, bileşenin beklenen davranışı bilinmiyor; çünkü fonksiyon gövdesinde tip kontrolü yapılıp yapılmadığı bilinmemektedir.

---

## FONKSİYON DETAYLARI

### CookiePolicyContentEn
**Ne yapar**: İngilizce dilinde çerez politikası içeriğini görüntülemek için kullanılan bir React fonksiyonel bileşenidir. Bileşen, `lang` parametresini alarak dil bazlı içerik gösterimi sağlar.

**Nasıl yapar**: Fonksiyon, aldığı `lang` parametresini kullanarak çerez politikası metinlerini render eder. İç mantık hakkında docstring boş olduğu için detaylı bilgi mevcut değildir. Dosya yapısı (`src/views/legal/components/en/`) incelendiğinde, yasal sayfalar altında İngilizce diline özel bir bileşen olarak konumlandığı görülmektedir.

**Parametreler**:
- lang: `{ lang }` (destructuring ile alınır) — Bileşenin hangi dilde içerik göstereceğini belirten dil kodu. Bileşen.fromFunction tipi `React.FC<{ lang: string }>` olarak tanımlandığından, bu parametre `string` tipindedir.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` parametresi alan bir React fonksiyonel bileşeni döndürür. Bu, bileşenin kendisinin de `lang` prop'u ile çağrılabilen bir bileşen olduğunu gösterir.

---

## İTHALATLAR (IMPORTS)
- import: @/components/consent/CookiePreferencesButton::CookiePreferencesButton
- import: @/config/legal::legalConfigEn
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/en/CookiePolicyContent.tsx::CookiePolicyContentEn
- **params**: `lang` — dil kodu (string), bileşen prop'u olarak destructured alınır
- **ic_degiskenler**:
  - `lang` — `localizedHref(Routes.legal.kvkk(), lang)` çağrısında KVKK bağlantısının dil-bağımlı URL'ini üretmek için kullanılır; ayrıca bileşen prop tipi `React.FC<{ lang: string }>` olarak tanımlıdır
  - `legalConfig.sellerEmail` — 7. section "Contact" başlığının altında satıcı e-posta adresini metin olarak render eder
  - `legalConfig.lastUpdated` — 8. section "Effective Date" başlığının altında politikanın son güncelleme tarihini metin olarak render eder
  - `Routes.legal.kvkk()` — 6. section'daki `<Link>` bileşeninin `href` prop'unda KVKK sayfasının yolunu üretmek için çağrılır
  - `localizedHref` — `Routes.legal.kvkk()` sonucunu ve `lang` parametresini alarak dil-bağımlı tam URL döndüren yardımcı fonksiyon; `<Link href={localizedHref(Routes.legal.kvkk(), lang)}>` şeklinde kullanılır
  - `Link` — Next.js link bileşeni; 6. section "Relationship With Your Personal Data" içinde KVKK bildirgesine yönlendiren `<Link>` olarak render edilir; `className="text-primary-navy underline"` ve `href` propları alır
  - `CookiePreferencesButton` — 5. section "Managing Your Preferences" içinde `<CookiePreferencesButton />` olarak render edilen, kullanıcıya çerez tercihlerini yönetme butonu sunan bileşen
- **Dönüş**: `React.ReactNode` — bir React Fragment (`<>...</>`) içinde sekiz adet `<section>` elementi döndürür; her section çerez politikasının bir maddesini (tanım, kullanılan çerezler, yasal dayanak, üçüncü taraf hizmetleri, tercih yönetimi, kişisel veri ilişkisi, iletişim, yürürlük tarihi) içerir

---

## NODE ID STANDARD

  file: src\views\legal\components\en\CookiePolicyContent.tsx
  function: src\views\legal\components\en\CookiePolicyContent.tsx::CookiePolicyContentEn

---

## DISA AKTARILANLAR (EXPORTS)
  export: CookiePolicyContentEn

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-50`, `border-b`, `border-light-gray`, `text-industrial-gray`, `text-left`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-xl`, `text-xs`
- **Layout:** `min-w-full`, `overflow-x-auto`, `p-2`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `border`, `font-semibold`, `list-disc`, `mb-3`, `mt-2`, `mt-3`, `mt-4`, `pl-6`, `space-y-1`, `underline`