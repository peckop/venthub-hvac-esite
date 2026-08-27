---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\consent\CookiePreferencesButton.tsx
skeleton_hash: 61dce46da54a3d65
entity_hashes:
  func:CookiePreferencesButton: b7fd821936e37c45
  overview: b711f3b17cd72e7a
  style_tokens: f9b2fe95f9e414a2
generated_at: 2026-08-27T08:26:31Z
---

## Genel Bakış
Bu modül, çerez onay/rıza (consent) sisteminin bir parçası olarak kullanıcıya çerez tercihlerini yönetme imkânı sunan bir React bileşeni içerir. `src/components/consent/` dizininde konumlanan bu dosya, çerez tercihleri butonunu temsil eden tek bir bileşen fonksiyonu barındırır.

## Fonksiyon Grupları

### Bileşen
Çerez tercihleri yönetim arayüzüne erişim sağlayan buton bileşenini tanımlar ve render eder.
- CookiePreferencesButton

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmediğinden, yalnızca `CookiePreferencesButton` imzasından (parametresiz, default değer yok) somut bir mimari varsayım üretilememektedir. Kaynakta fonksiyon gövdesi yer almadığı için davranışsal veya bağımlılık temelli aksiyom tanımlanamaz.

---

## FONKSİYON DETAYLARI

### CookiePreferencesButton
**Ne yapar**: KVKK kapsamında kullanıcının daha önce verdiği çerez rızasını geri almasına (withdraw) olanak tanıyan bir düğme bileşeni sunar. Bu bileşen Çerez Politikası sayfasına gömülür; amacının rızanın verildiği kadar kolay geri alınabilmesini sağlamak olduğu belirtilmiştir. Önceki durumda tercihi değiştirmenin tek yolunun tarayıcının site verilerini temizlemek olduğu ve bunun "kolay" sayılmayacağı ifade edilmiştir.

**Nasıl yapar**: Bileşen, `useI18n()` hook'u aracılığıyla uluslararasılaştırma desteğini alır ve düğme metnini `t('cookieConsent.changePreferences')` anahtarıyla yerelleştirir. `useState(false)` ile `hasDecision` adlı bir durum değişkeni tutulur; bu değişken kullanıcının daha önce bir çerez kararı verip vermediğini izler. `useEffect` içinde `readConsent()` fonksiyonu çağrılarak mevcut rıza durumu kontrol edilir ve `onConsentChange` fonksiyonunun dönüş değeri ile rıza değişiklikleri dinlenir; bileşen kaldırıldığında dinleyici temizlenir. Eğer kullanıcı henüz bir karar vermemişse (`hasDecision` false ise) bileşen `null` döndürerek hiçbir şey render etmez; çünkü bu durumda çerez rıza bantının zaten görünür olduğu belirtilmiştir ve ikinci bir giriş noktası gösterilmez. Düğmeye tıklandığında `withdrawConsent()` fonksiyonu çağrılır ve ardından `window.location.reload()` ile sayfa yenilenir. Sayfa yenileme nedeni kaynak metinde kesilmiş durumdadır; tam açıklama bilinmemektedir.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz.

**Dönüş**: Bir React fonksiyonel bileşeni olarak çalışır. `hasDecision` false olduğunda `null` döndürür; aksi takdirde bir `<button>` JSX elementi döndürür. Kesin dönüş tipi kaynakta belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: @/lib/consent::onConsentChange
- import: @/lib/consent::readConsent
- import: @/lib/consent::withdrawConsent
- import: react::React
- import: react::useEffect
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/consent/CookiePreferencesButton.tsx::CookiePreferencesButton
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; buton metnini yerelleştirmek için kullanılır
  - `hasDecision` — `useState(false)` ile oluşturulan boolean state; kullanıcının consent (onay) kararı verip vermediğini tutar
  - `setHasDecision` — `hasDecision` state'ini güncelleyen setter fonksiyonu
- **Dönüş**: `hasDecision` false ise `null`; true ise `<button>` JSX elementi

### [N2_NASIL] AST Pointer: src/components/consent/CookiePreferencesButton.tsx::useEffect callback (anonim)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `sync` — `readConsent()` fonksiyonunun dönüş değerini kontrol eden ve `null` olup olmadığına göre `setHasDecision`'ı çağıran anonim fonksiyon
- **Dönüş**: `onConsentChange(sync)` fonksiyonunun dönüş değeri (cleanup fonksiyonu olarak useEffect'e döner)

### [N3_NASIL] AST Pointer: src/components/consent/CookiePreferencesButton.tsx::onClick handler (anonim)
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: yok (void) — yan etki olarak `withdrawConsent()` çağrılır ve `window.location.reload()` ile sayfa yenilenir

---

## NODE ID STANDARD

  file: src\components\consent\CookiePreferencesButton.tsx
  function: src\components\consent\CookiePreferencesButton.tsx::CookiePreferencesButton

---

## DISA AKTARILANLAR (EXPORTS)
  export: CookiePreferencesButton

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `border-light-gray`, `hover:bg-gray-50`, `text-primary-navy`, `text-sm`
- **Layout:** `inline-flex`, `items-center`
- **Varyant/Responsive:** `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `focus-visible:outline`, `focus-visible:outline-2`, `focus-visible:outline-offset-2`, `focus-visible:outline-primary-navy`, `font-medium`, `px-4`, `py-2`, `rounded-lg`, `transition-colors`