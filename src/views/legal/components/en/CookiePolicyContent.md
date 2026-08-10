---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\en\CookiePolicyContent.tsx
skeleton_hash: b953ff96c31b44de
entity_hashes:
  func:CookiePolicyContentEn: 2826dfb8331957d4
  overview: 253c2705d1e569f2
  style_tokens: 6460a848de07bdf3
generated_at: 2026-06-19T20:50:35Z
---

## Genel Bakış
Bu modül, web sitesinin hukuki bölümünde yer alan çerez politikası bilgilendirme metnini İngilizce dilinde sunan bir React bileşenidir. Tek bir stateless fonksiyonel component olarak tasarlanmış olup, dışarıdan alınan dil parametresine göre içeriği render eder.

## Fonksiyon Grupları
### Çerez Politikası İçerik Bileşeni
Modülün tek ve temel sorumluluğu, çerez politikasına ilişkin yasal metni ve bilgilendirme içeriğini, belirtilen dile göre (İngilizce) biçimlendirerek bir React JSX yapısı olarak sunmaktır.
- CookiePolicyContentEn

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi paylaşılmadığı için sadece fonksiyon imzasından türetilebilecek minimal varsayımlar aşağıdadır.

[Aksiyom 1]: Eğer `lang` prop'u sağlanmazsa veya `undefined`/boş string olarak geçilirse, bileşen doğru dilde içerik üretemeyebilir veya geçersiz bir duruma düşebilir.

[Aksiyom 2]: Bileşen `React.FC<{ lang: string }>` tipiyle tanımlandığından, `lang` prop'u çağrımcı tarafından her durumda sağlanmalıdır; opsiyonel (`?`) olarak işaretlenmemiştir.

---

## FONKSİYON DETAYLARI

### CookiePolicyContentEn

**Ne yapar**: Bu fonksiyon, bir React fonksiyonel bileşeni (Functional Component) döndüren bir fabrika fonksiyonudur. VentHub HVAC uygulamasının Ingilizce dilindeki Cookie Policy (Çerez Politikası) sayfasının içeriğini render eden bileşeni üretir.

**Nasıl yapar**: Fonksiyon çağrıldığında, belirli bir dil prop'u kabul eden bir React bileşeni döndürür. Bu yapı sayesinde bileşen, dil parametresine göre Ingilizce çerez politikası içeriğini dinamik olarak gösterebilir. Fonksiyonun dönüş tipi `React.FC<{ lang: string }>` olarak belirtilmiştir; bu, döndürdüğü bileşenin `lang` adında bir string prop'u beklediğini ifade eder.

**Parametreler**:
- Fonksiyonun kendisi parametre almamaktadır.

**Dönüş**: 
- `React.FC<{ lang: string }>` — Döndürülen değer, `lang` prop'unu kabul eden bir React fonksiyonel bileşenidir. Bu bileşen render edildiğinde Ingilizce çerez politikası içeriğini görüntülemektedir. `{ lang: string }` generic tipi, bileşenin props arayüzünü tanımlamakta ve `lang` parametresinin bir string değeri olarak zorunlu olduğunu belirtmektedir.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/en/CookiePolicyContent.tsx::CookiePolicyContentEn
- **params**: () — parametre almaz (React.FC<{ lang: string }> olarak tiplense de fonksiyon gövdesinde lang kullanılmaz)
- **ic_degiskenler**: (yerel değişken yok — sadece import edilen config nesnesinden okuma yapılır)
  - `legalConfig` — `@/config/legal` modülünden import edilen yasal yapılandırma nesnesi; `sellerEmail` ve `lastUpdated` alanları JSX içinde doğrudan referans olarak kullanılır
  - `legalConfig.sellerEmail` — 5. bölüm ("Contact") içinde <strong> etiketiyle render edilen satıcı e-posta adresi
  - `legalConfig.lastUpdated` — 6. bölüm ("Entry into Force") içinde <strong> etiketiyle render edilen güncelleme tarihi
- **Dönüş**: `JSX.Element` — Fragment (`<>...</>`) içinde 6 adet `<section>` barındıran İngilizce Cookie Policy HTML içeriği döner; 1. section Cookie tanımı, 2. section cookie türleri (Essential, Analytical, Functional), 3. section üçüncü parti cookie'ler, 4. section cookie yönetimi talimatları, 5. section iletişim bilgisi (legalConfig.sellerEmail), 6. section yürürlük tarihi (legalConfig.lastUpdated) içerir. Yan etki: state veya hook kullanmaz, saf bir sunucu tarafı render bileşenidir.

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
- **Renkler:** `text-industrial-gray`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `pl-6`, `space-y-1`