---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\analytics\ConsentGatedAnalytics.tsx
skeleton_hash: 74e2f92e69474c6f
entity_hashes:
  func:ConsentGatedAnalytics: 9b16ee63b631e51c
  overview: a8de5e3a277277bd
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T08:24:01Z
---

## Genel Bakış

ConsentGatedAnalytics, kullanıcının analitik izleme onayını kontrol ederek analitik bileşenlerin yalnızca onay verildiğinde render edilmesini sağlayan bir React bileşenidir. Kullanıcı onayı durumuna göre analitik içeriği gösterip gizleyerek gizlilik düzenlemelerine uyum sağlar. Modül tek bir bileşen fonksiyonundan oluşur.

## Fonksiyon Grupları

### Ana Bileşen

Kullanıcı onayı (consent) durumunu değerlendirir ve onay verilmişse çocuk bileşenleri (analitik içerik) render eder; onay verilmemişse bu içeriği kullanıcıya göstermez.

- ConsentGatedAnalytics

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmemiştir; yalnızca `ConsentGatedAnalytics()` imzası mevcuttur. Modül sabitleri yoktur, eski doküman bulunmamaktadır. Fonksiyon gövdesi olmadan çalışması için gerekli koşulları belirlemek mümkün değildir.

---

## FONKSİYON DETAYLARI

### ConsentGatedAnalytics

**Ne yapar**: GA4/GTM (Google Analytics 4 / Google Tag Manager) izleme etiketini yalnızca kullanıcının analitik çerez rızası verdiği durumda sayfaya yükleyen bir React bileşenidir. Rıza yoksa veya GA kimlik tanımlayıcısı (`NEXT_PUBLIC_GA_ID`) tanımlanmamışsa hiçbir şey render etmez. Bileşen olmasının nedeni şudur: GA/GTM etiketi sayfaya yüklendiği anda kendi çerezlerini (`_ga`, `_gid` vb.) yazar ve sayfa görüntüleme gönderir — kullanıcı tek bir olay tetiklemese bile. Bu nedenle sadece `trackEvent` kapısıyla olayı bastırmak yetmez; etiketin kendisinin yüklenmesi engellenmelidir.

**Nasıl yapar**: Bileşen, `useState` ile `allowed` adlı bir boolean durum takip eder. `useEffect` içinde `hasConsent('analytics')` fonksiyonu çağrılarak mevcut rıza durumu kontrol edilir ve `onConsentChange` fonksiyonu ile rıza değişikliklerini dinleyen bir abonelik kurulur. `onConsentChange` aboneliği, `useEffect` temizleme (cleanup) fonksiyonu olarak döndürülür; böylece bileşen kaldırıldığında dinleyici temizlenir. Eğer `gaId` değeri yoksa ya da `allowed` false ise bileşen `null` döndürerek hiçbir DOM öğesi oluşturmaz. Rıza mevcut olduğunda ise Next.js'in `Script` bileşeni kullanılarak iki script etiketi render edilir: birincisi `gtag.js` kütüphanesini harici kaynaktan yükler, ikincisi ise `window.dataLayer` dizisini başlatır, `gtag` fonksiyonunu tanımlar ve GA kimliğiyle `config` çağrısı yapar. Her iki script de `strategy="afterInteractive"` ile yüklenir; bu, sayfa etkileşimli hale geldikten sonra script yüklemesinin gerçekleşmesini sağlar.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: Bileşen, rıza durumuna bağlı olarak `null` veya GA/GTM script etiketlerini içeren bir React Fragment (`<>...</>`) döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/consent::hasConsent
- import: @/lib/consent::onConsentChange
- import: next/script::Script
- import: react::React
- import: react::useEffect
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/analytics/ConsentGatedAnalytics.tsx::ConsentGatedAnalytics
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `gaId` — `process.env.NEXT_PUBLIC_GA_ID` ortam değişkeninden okunan Google Analytics ölçüm kimliği; tanımsız olabilir
  - `allowed` — `useState(false)` ile oluşturulan boolean state; kullanıcının analytics rızası verip vermediğini tutar, başlangıç değeri `false`
  - `setAllowed` — `allowed` state'ini güncelleyen React setter fonksiyonu; `hasConsent('analytics')` sonucuyla çağrılır
  - `useEffect` içindeki anonim fonksiyon — bileşen mount edildiğinde bir kez çalışır; `setAllowed(hasConsent('analytics'))` çağrısıyla ilk rıza durumunu okur, ardından `onConsentChange(() => setAllowed(hasConsent('analytics')))` ile rıza değişikliklerini dinlemeye başlar; cleanup olarak `onConsentChange` dönüş değerini döndürür
  - `Script` (bileşen) — Next.js `next/script` modülünden gelen Script bileşeni; Google Analytics gtag kütüphanesini yüklemek ve başlatmak için kullanılır
- **Dönüş**: `gaId` tanımsızsa veya `allowed` `false` ise `null`; aksi halde iki `<Script>` bileşeni içeren React fragment (`<>...</>`). İlk Script gtag kütüphanesini yükler (`src` olarak `https://www.googletagmanager.com/gtag/js?id=${gaId}`), ikinci Script `window.dataLayer` dizisini başlatır ve `gtag('config', '${gaId}')` çağrısı yapar; her ikisi de `strategy="afterInteractive"` kullanır.

---

## NODE ID STANDARD

  file: src\components\analytics\ConsentGatedAnalytics.tsx
  function: src\components\analytics\ConsentGatedAnalytics.tsx::ConsentGatedAnalytics

---

## DISA AKTARILANLAR (EXPORTS)
  export: ConsentGatedAnalytics

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