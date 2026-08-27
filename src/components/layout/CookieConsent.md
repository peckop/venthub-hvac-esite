---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\layout\CookieConsent.tsx
skeleton_hash: 1a656857c4b01b30
entity_hashes:
  func:CookieConsent: a98941af7804591f
  overview: af56f8b739dda456
  style_tokens: 22a5292b65783726
generated_at: 2026-08-27T08:29:53Z
---

## Genel Bakış
Bu modül, web sitesinin çerez politikasına ilişkin kullanıcı rızasını yöneten ve gösteren bir React bileşenidir. Kullanıcının çerez tercihlerini kabul etmesini veya reddetmesini sağlayarak gizlilik düzenlemelerine uyumu kolaylaştırır. Bileşen, dil duyarlı bir banner arayüzü sunar ve tercihleri yerel depoda (`localStorage`) saklar.

## Fonksiyon Grupları
### Çerez Rıza Bileşeni
Kullanıcının çerez kullanımına ilişkin tercihlerini toplayan, dil bazlı lokalize metinlerle bir iletişim kutusu gösteren ve tercih kalıcılığını sağlayan tek bileşen grubudur. Daha önce tercih belirtilmemişse sayfa yüklemesinden 1.5 saniye sonra animasyonlu bir banner görüntüler.
- CookieConsent

## Bağımlılıklar ve Mimari Notlar
- **Dış bağımlılıklar**: `useI18n()` hook'u ile mevcut dil (`lang`) alınır; `useLocalizedRoutes()` hook'u ile Çerez Politikası sayfasına yönlendirme bağlantısı oluşturulur.
- **Durum yönetimi**: `useState(false)` ile banner görünürlüğü (`isVisible`) yönetilir; `useEffect` ile bileşen monte edildiğinde `localStorage` içindeki `vh_cookie_consent` anahtarı kontrol edilir.
- **Yapısal sözleşme**: Modülün dışa açtığı yapı bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler. Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından (`CookieConsent` yalnızca imzasıyla verilmiştir), gövde tabanlı çıkarım yapılamamaktadır.

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
- import: react::useCallback
- import: react::useEffect
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::CookieConsent
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan destructure edilen çeviri fonksiyonu; JSX içinde metinleri yerelleştirmek için kullanılır
  - `routes` — useLocalizedRoutes() hook'undan gelen rotalar objesi; Link bileşeninde `routes.legal.cerez()` ile href oluşturmak için kullanılır
  - `isVisible` — useState(false) ile tanımlı boolean state; bileşenin görünürlük durumunu tutar
  - `setIsVisible` — isVisible state'ini güncelleyen setter fonksiyonu
  - `showDetails` — useState(false) ile tanımlı boolean state; çerez kategori detaylarının açık/kapalı durumunu tutar
  - `setShowDetails` — showDetails state'ini güncelleyen setter fonksiyonu
  - `draft` — useState({functional: false, analytics: false, marketing: false}) ile tanımlı obje state; kullanıcının çerez tercihlerinin taslağını tutar
  - `setDraft` — draft state'ini güncelleyen setter fonksiyonu
  - `syncVisibility` — useCallback ile tanımlı fonksiyon; consent durumunu kontrol eder ve isVisible state'ini günceller
  - `handleAcceptAll` — acceptAll() çağırır ve isVisible'ı false yaparak bileşeni gizler
  - `handleRejectOptional` — rejectOptional() çağırır ve isVisible'ı false yaparak bileşeni gizler
  - `handleSaveSelection` — setConsent(draft) çağırır ve isVisible'ı false yaparak bileşeni gizler
- **Dönüş**: isVisible false ise null, aksi halde JSX elementi

### [N2_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::syncVisibility
- **params**: (parametre yok)
- **ic_degiskenler**: (gövdede tanımlı değişken yok)
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `timer` — setTimeout ile syncVisibility fonksiyonunu 1500ms gecikmeli çalıştırmak için oluşturulan zamanlayıcı kimliği
  - `off` — onConsentChange ile oluşturulan dinleyici aboneliğini kaldıran fonksiyon
- **Dönüş**: cleanup fonksiyonu

### [N4_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::useEffect cleanup
- **params**: (parametre yok)
- **ic_degiskenler**: (gövdede tanımlı değişken yok)
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::handleAcceptAll
- **params**: (parametre yok)
- **ic_degiskenler**: (gövdede tanımlı değişken yok)
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::handleRejectOptional
- **params**: (parametre yok)
- **ic_degiskenler**: (gövdede tanımlı değişken yok)
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::handleSaveSelection
- **params**: (parametre yok)
- **ic_degiskenler**: (gövdede tanımlı değişken yok)
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::map callback (category)
- **params**: `category` — OPTIONAL_CATEGORIES dizisinden gelen çerez kategori adı
- **ic_degiskenler**:
  - `e` — onChange event objesi; `e.target.checked` ile checkbox durumunu almak için kullanılır
- **Dönüş**: JSX elementi (label)

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
- **Renkler:** `accent-cyan-500`, `bg-cyan-500/10`, `bg-gradient-to-r`, `border-t`, `border-white/10`, `border-white/5`, `from-cyan-500`, `hover:bg-white/5`, `hover:from-cyan-400`, `hover:text-cyan-400`, `hover:text-white`, `hover:to-blue-500`, `text-cyan-400`, `text-slate-300`, `text-slate-400`
- **Layout:** `bottom-6`, `fixed`, `flex`, `flex-col`, `flex-wrap`, `from-cyan-500`, `gap-1`, `gap-2`, `gap-3`, `gap-4`, `h-5`, `hover:from-cyan-400`, `hover:shadow-lg`, `items-center`, `items-start`
- **Varyant/Responsive:** `active:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `active:scale-95`, `animate-fadeInUp`, `border`, `cursor-not-allowed`, `cursor-pointer`, `cyan-glow`, `duration-200`, `duration-300`, `font-bold`, `font-medium`, `glass-strong`, `hover:scale-105`, `leading-relaxed`, `mt-1`, `opacity-60`