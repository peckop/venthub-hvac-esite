---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\app\[lang]\account\quotes\page.tsx
skeleton_hash: d5157148ab3205af
entity_hashes:
  func:Page: c99a16a89d219fd2
  overview: 4368adee0b81e32b
  style_tokens: 9144ece4bffe7964
generated_at: 2026-08-16T10:19:33Z
---

## Genel Bakış
Bu modül, kullanıcının hesabına ait fiyat tekliflerini (quotations) listeleyen bir Next.js sayfasıdır. Router segmentinden dinamik olarak dil parametresini alarak çok dilli destek sağlar. Sayfa, kullanıcı oturum açmış hesabından tekliflerini görüntüleyebileceği bir arayüz sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Kullanıcının tekliflerini (quotes) gösteren asıl sayfa bileşenidir. Dil parametresini URL'den alarak uluslararasılaştırma (i18n) desteğini sağlar.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu Next.js sayfa bileşeni için temel mimari varsayımlar şunlardır:

[Aksiyom 1]: Eğer `Page` bileşeni geçerli bir React JSX/TSX döndürmezse, Next.js sayfa yönlendirmesi düzgün çalışamaz ve kullanıcı hatası oluşur.

[Aksiyom 2]: Eğer sayfa bileşeni `[lang]` parametresini kullanıyorsa ve bu parametre geçerli bir dil kodu (örn: "tr", "en")

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, bir Next.js sayfa bileşenidir ve hesapQuotes sayfasının üst düzey bileşenini temsil eder. Sayfa yükleme sürecinde kullanıcıya görsel bir geri bildirim sağlamak için Suspense sarmalayıcısı kullanır.

**Nasıl yapar**: Fonksiyon, React'in `Suspense` bileşenini kullanarak asenkron yükleme durumlarını yönetir. `Suspense` bileşeni, iç bileşen olan `PageComponent` henüz yüklenmediğinde (süspansiyon durumunda) `fallback` prop'u olarak tanımlanan yükleme animasyonunu render eder. Bu animasyon, merkezi konumlandırılmış dönen bir daire şeklindedir ve `animate-spin` sınıfı ile sürekli döner. `PageComponent` yüklendiğinde ise Suspense bileşeni çocuğu olan `PageComponent`'i render eder.

**Parametreler**:
- Parametre almaz

**Dönüş**: JSX element return eder. Suspense ile sarmalanmış `PageComponent` bileşenini veya yükleme durumunda fallback UI'ı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/account/quotes/AccountQuotesPage::PageComponent
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/account/quotes/page.tsx::Page
- **params**: () — parametre yok
- **ic_degiskenler**: yok
  - Fonksiyon gövdesinde değişken tanımlanmamıştır, doğrudan JSX döndürülür
- **Dönüş**: JSX element — `<Suspense>` ile sarılmış `<PageComponent />` bileşenini döndürür; fallback olarak loading spinner gösterir

---

**Notlar:**

| Öğe | Kullanım |
|-----|----------|
| `Suspense` | React.lazy loading için sarıcı bileşen |
| `fallback` prop | Yüklenme sırasında gösterilecek spinner UI |
| `PageComponent` | `../../../../views/account/quotes/AccountQuotesPage` import'undan gelen asıl sayfa bileşeni |
| Spinner div | `min-h-screen flex items-center justify-center` ile ortalanmış, `animate-spin` ile dönen `rounded-full` loading indicator |

---

## NODE ID STANDARD

  file: src\app\[lang]\account\quotes\page.tsx
  function: src\app\[lang]\account\quotes\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `border-b-2`, `border-primary-navy`
- **Layout:** `flex`, `h-12`, `items-center`, `justify-center`, `min-h-screen`, `w-12`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-spin`, `rounded-full`