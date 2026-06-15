---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\CookieConsent.tsx
skeleton_hash: af5e987988010b85
entity_hashes:
  func:CookieConsent: a5f102228e57f333
  overview: a960efeee3d27963
  style_tokens: 20b5f371d2cf3ccf
generated_at: 2026-06-15T17:03:21Z
---

## Genel Bakış
Bu modül, web sitesinin çerez politikasına ilişkin kullanıcı rızasını yöneten ve gösteren bir React bileşenidir. Kullanıcının çerez tercihlerini kabul etmesini veya reddetmesini sağlayarak gizlilik düzenlemelerine uyumu kolaylaştırır.

## Fonksiyon Grupları
### Çerez Rıza Bileşeni
Bileşen, kullanıcının çerez kullanımına ilişkin tercihlerini almak ve kaydetmek için bir arayüz sağlar.
- CookieConsent

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### CookieConsent

**Ne yapar**: Kullanıcının çerez politikasını kabul edip etmediğini kontrol eden ve gerekirse dil bazlı lokalize bir çerez izni iletişim kutusu (dialog) gösteren React fonksiyonel bileşenidir. Kullanıcı daha önce bir tercih belirtmemişse sayfa yüklemesinden 1.5 saniye sonra animasyonlu bir banner gösterir.

**Nasıl yapar**:
- `useI18n()` hook'u ile mevcut dili (`lang`) alarak metinlerin Türkçe veya İngilizce olmasını sağlar.
- `useLocalizedRoutes()` hook'u ile lokalize edilmiş rota nesnesini alarak Çerez Politikası sayfasına yönlendirme bağlantısı oluşturur.
- `useState(false)` ile banner'ın görünürlük durumunu (`isVisible`) yönetir.
- `useEffect(() => {...}, [])` ile bileşen ilk monte edildiğinde `localStorage`'da `vh_cookie_consent` anahtarını kontrol eder. Eğer daha önce bir tercih kaydedilmemişse, LCP ve CLS performans metriklerini olumsuz etkilememek adına 1.5 saniyelik `setTimeout` ile banner'ı gösterir. Timer temizleme fonksiyonu (`clearTimeout`) döndürülerek component unmount olduğunda sızıntı önlenir.
- `handleAccept` ve `handleReject` fonksiyonları kullanıcının tercihini (`'accepted'` veya `'rejected'`) `localStorage`'a yazar ve banner'ı kapatır.
- `localStorage` erişimleri `try-catch` bloklarıyla sarılmıştır; tarayıcı izin vermiyorsa veya depolama doluysa hata yutularak uygulama çökmesi engellenir.
- `isVisible` false ise `null` döndürerek hiçbir UI rendered edilmez (early return paterni).
- JSX içinde `glass-strong`, `animate-fadeInUp`, `cyan-glow` gibi özel Tailwind/CSS sınıfları ile cam efektli, animasyonlu, yarı saydam bir banner oluşturulur. `role="dialog"` ve `aria-live="polite"` erişilebilirlik nitelikleri ile ekran okuyuculara uyumlu hale getirilir.

**Parametreler**:
- Bu fonksiyon hiçbir parametre almaz. Bileşen kendi içindeki React hook'ları ve `localStorage` üzerinden durumunu yönetir.

**Dönüş**: `JSX.Element | null` — Çerez tercihi daha önce yapılmışsa `null`, yapılmamışsa localized dialog içeren bir JSX ağacı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: next/link::Link
- import: react::React
- import: react::useEffect
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::CookieConsent
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `lang` — `useI18n()` hook'undan dönen mevcut dil kodu (ör. `'en'`, `'tr'`), lokalize metinlerin seçiminde kullanılır
  - `routes` — `useLocalizedRoutes()` hook'undan dönen lokalize rota fonksiyonları nesnesi; `routes.legal.cerez()` çağrısıyla çerez politikası sayfasının URL'sini üretir
  - `isVisible` — boolean state, çerez izni bannerının görünür olup olmadığını kontrol eder; `false` ise bileşen `null` döner (gizlenir)
  - `setIsVisible` — `isVisible` state'ini güncelleyen setter fonksiyonu, bannerın gösterilmesini/gizlenmesini tetikler
  - `consent` — `localStorage.getItem('vh_cookie_consent')` çağrısından dönen string değer; daha önce çerez onayı verilip verilmediğini tutar (`'accepted'`, `'rejected'` veya `null`)
  - `timer` — `setTimeout` dönüşü, 1500ms sonra `setIsVisible(true)` çağrısını tetikler; cleanup fonksiyonunda `clearTimeout(timer)` ile temizlenir
  - `text` — `lang` değerine göre seçilen lokalize çerez politikası açıklama metni (`'en'` veya `'tr'`)
  - `policyText` — `lang` değerine göre seçilen lokalize `"Cookie Policy"` / `"Çerez Politikası"` buton metni
  - `acceptText` — `lang` değerine göre seçilen lokalize `"Accept All"` / `"Tümünü Kabul Et"` buton metni
  - `rejectText` — `lang` değerine göre seçilen lokalize `"Reject"` / `"Reddet"` buton metni
  - `handleAccept` — arrow fonksiyon; `localStorage.setItem('vh_cookie_consent', 'accepted')` yazarak çerez onayını kalıcı olarak kaydeder, ardından `setIsVisible(false)` ile bannerı gizler
  - `handleReject` — arrow fonksiyon; `localStorage.setItem('vh_cookie_consent', 'rejected')` yazarak çerez reddini kalıcı olarak kaydeder, ardından `setIsVisible(false)` ile bannerı gizler
- **Dönüş**: `JSX.Element | null` — `isVisible` false ise `null`, true ise çerez izni banner JSX'i döner

### [N2_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::useEffect_callback
- **params**: (parametre yok) — `useEffect` callback fonksiyonu
- **ic_degiskenler**:
  - `consent` — `localStorage.getItem('vh_cookie_consent')` çağrısından dönen `string | null`; daha önce kullanıcı çerez tercihini kaydedip kaydetmediğini belirler
  - `timer` — `setTimeout(() => setIsVisible(true), 1500)` dönüşü; 1.5 saniye gecikme ile bannerın gösterilmesini sağlar, LCP/CLS optimizasyonu için kullanılır
- **Dönüş**: temizleme fonksiyonu `() => clearTimeout(timer)` — timer'ı iptal eder, bileşen unmount olduğunda sızıntıyı önler

### [N3_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::handleAccept
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `localStorage.setItem('vh_cookie_consent', 'accepted')` — tarayıcı localStorage'ına çerez onay durumunu `'accepted'` değeriyle yazar
  - `setIsVisible(false)` — state'i `false` yaparak bannerı DOM'dan kaldırır
- **Dönüş**: yok (void) — yan etki olarak localStorage'a yazar ve bannerı gizler

### [N4_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::handleReject
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `localStorage.setItem('vh_cookie_consent', 'rejected')` — tarayıcı localStorage'ına çerez onay durumunu `'rejected'` değeriyle yazar
  - `setIsVisible(false)` — state'i `false` yaparak bannerı DOM'dan kaldırır
- **Dönüş**: yok (void) — yan etki olarak localStorage'a yazar ve bannerı gizler

---

## NODE ID STANDARD

  file: src\components\layout\CookieConsent.tsx
  function: src\components\layout\CookieConsent.tsx::CookieConsent

---

## DISA AKTARILANLAR (EXPORTS)
  export: CookieConsent

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500/10`, `bg-gradient-to-r`, `border-t`, `border-white/10`, `border-white/5`, `from-cyan-500`, `hover:bg-white/5`, `hover:from-cyan-400`, `hover:text-cyan-400`, `hover:text-white`, `hover:to-blue-500`, `text-cyan-400`, `text-slate-300`, `text-slate-400`, `text-sm`
- **Layout:** `bottom-6`, `fixed`, `flex`, `flex-col`, `from-cyan-500`, `gap-1`, `gap-2`, `gap-3`, `gap-4`, `h-5`, `hover:from-cyan-400`, `hover:shadow-lg`, `items-center`, `items-start`, `justify-between`
- **Varyant/Responsive:** `active:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `active:scale-95`, `animate-fadeInUp`, `border`, `cyan-glow`, `duration-200`, `duration-300`, `font-bold`, `font-medium`, `glass-strong`, `hover:scale-105`, `leading-relaxed`, `pt-2`, `px-3`, `px-4`, `py-1.5`