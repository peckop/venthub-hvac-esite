---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\legal\gizlilik-politikasi\page.tsx
skeleton_hash: 9bd6ed6a6fa608c9
entity_hashes:
  func:Page: 851f6a31795db41b
  overview: 28f1a50675cb6f01
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:46:30Z
---

## Genel Bakış
Bu modül, Venthub HVAC uygulamasının çok dilli yasal sayfaları için temel bir Next.js App Router sayfa bileşenidir. Modülün ana sorumluluğu, dinamik dil parametrelerini alarak uygun yasal içeriğin (gizlilik politikası) sunulması için bir üst düzey bileşeni sarmalamak ve render etmektir.

## Fonksiyon Grupları
### Dil Desteği ve Yönlendirme
Sayfa yönlendirmesinde dil parametrelerini alıp ilgili bileşene aktarmaktan ve temel Next.js sayfa yapısını oluşturmaktan sorumludur.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Next.js App Router yapısında çalışan asenkron bir sayfa bileşenidir; dil parametresine bağımlıdır veParams nesnesi üzerinden uluslararasılaştırma (i18n) yapılandırması bekler.

[Aksiyom 1]: Eğer `params.lang` değeri geçerli bir `string` türünde sağlanmamışsa (örn: `undefined`, `null`, boş string), sayfa içeriğinin hangi dilde sunulacağı belirsizleşir ve varsayılan bir dil davranışı oluşmaz — hata fırlatılabilir veya boş/eksik içerik gösterilebilir.

[Aksiyom 2]: Eğer `params` Promise'i başarıyla çözümlenemezse (resolve edilemezse), asenkron sayfa render süreci tamamlanamaz ve Next.js sunucu tarafında bir render hatası oluşur.

[Aksiyom 3]: Eğer `lang` değeri uygulamanın desteklediği dil listesinde yer almayan geçersiz bir değer olarak gelirse (örn: `"xx"`, `"jp"` yerine `"ja"` bekleniyorsa), sayfa için çeviri metinleri eşleştirilemeyebilir — fallback mekanizması tanımlı değilse eksik içerik gösterilir.

---

**Not:** Bu sayfa modülü tamamen bir üst bileşene (PageComponent vb.) bağımlı olduğu için, sayfa içeriğinin doğru render edilmesi o bağımlı bileşenin varlığına ve doğruluğuna da bağlıdır — ancak bu durum fonksiyon imzasından çıkarılamadığı için aksiyom olarak değil, not olarak belirtilmiştir.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Next.js uygulamasının gizlilik politikası sayfasını render eden asenkron React Server Component'tir. Sayfa, URL'den alınan dil parametresine göre ilgili dilde içerik sunan PageComponent'i döndürür.

**Nasıl yapar**: Fonksiyon, Next.js 15+ sürümüyle birlikte gelen yeni yapıyı kullanır. `params` nesnesi artık doğrudan bir değer değil, `Promise<{ lang: string }>` türünde bir asenkron nesnedir. Fonksiyon gövdesinde `await params` ifadesiyle bu promise çözümlenir ve `lang` değeri extrakte edilir. Elde edilen dil kodu, child bileşen olan `PageComponent`'e prop olarak geçirilerek sayfanın doğru dilde render edilmesi sağlanır. Bu yapı, Next.js'in statik ve dinamik render stratejileriyle uyumlu çalışır.

**Parametreler**:
- `params`: `Promise<{ lang: string }>` — Next.js router tarafından otomatik olarak enjekte edilen ve sayfa yolundaki dinamik segmentlerin değerlerini içeren Promise nesnesi. `lang` alanı, kullanıcının tercih ettiği veya URL'de belirtilen dil kodunu (örn: "tr", "en", "de") temsil eder.

**Dönüş**: `JSX.Element` — `PageComponent` bileşeninin `lang` prop'uyla birlikte render edilmiş halini döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/legal/PrivacyPolicyPage::PageComponent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/app/[lang]/legal/gizlilik-politikasi/page.tsx`::Page
- **params**: `{ params }: { params: Promise<{ lang: string }> }` — Next.js tarafından otomatik enjekte edilen route parametreleri; `lang` dil kodunu (ör. "tr", "en") tutan bir Promise
- **ic_degiskenler**:
  - `lang` — `params` Promise'ının await ile çözülmesinden elde edilen dil kodu string'i; `PageComponent`'e prop olarak iletilir
- **Dönüş**: JSX — `<PageComponent lang={lang} />` ifadesi; gizlilik politikası sayfasının React bileşenini render eder

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\gizlilik-politikasi\page.tsx
  function: src\app\[lang]\legal\gizlilik-politikasi\page.tsx::Page

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
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)