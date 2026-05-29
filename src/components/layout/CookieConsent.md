---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\CookieConsent.tsx
skeleton_hash: fffd063be9e63817
entity_hashes:
  func:CookieConsent: ab64b95154357198
  overview: 02fd6c06c04c6c38
  style_tokens: 20b5f371d2cf3ccf
generated_at: 2026-05-29T11:37:31Z
---

## Genel Bakış
Bu modül, web sitesinin çerez politikasına ilişkin kullanıcı rızasını yöneten ve gösteren bir React bileşenidir. Kullanıcının çerez tercihlerini kabul etmesini veya reddetmesini sağlayarak gizlilik düzenlemelerine uyumu kolaylaştırır.

## Fonksiyon Grupları
### Çerez Rıza Bileşeni
Bileşen, kullanıcının çerez kullanımına ilişkin tercihlerini almak ve kaydetmek için bir arayüz sağlar.
- CookieConsent

---

## AXIOMS – Mimari Varsayımlar

Bu modül (CookieConsent) için, yalnızca sağlanan fonksiyon imzası (`CookieConsent()`) temelinde, modülün doğru çalışması için aşağıdaki mimari varsayımlar (aksiyomlar) tanımlanabilir. Fonksiyon gövdesi ve modül içeriği bilinmediğinden, bu varsayımlar minimal ve yalnızca imzadan çıkarılabilir niteliktedir:

- **Bu modül için özel aksiyom tanımlanmamıştır.** (Fonksiyon gövdesi bilinmediğinden, yalnızca imzaya dayalı kesin aksiyom üretilemez.)

---

## FONKSİYON DETAYLARI

### CookieConsent

**Ne yapar**: Kullanıcının çerez politikasını kabul edip etmediğini kontrol eden ve gerektiğinde bir izin dialogu gösteren React bileşenidir. İlk etkileşimden sonra belirli bir gecikmeyleظهر olarak kullanıcının çerez tercihini kaydeder.

**Nasıl yapar**: `useEffect` hook'u ile `localStorage`'da `vh_cookie_consent` anahtarını sorgular. Bu anahtar yoksa, LCP ve CLS performans metriklerini olumsuz etkilememek adına 1.5 saniyelik bir gecikme sonrası dialogu görünür hale getirir. `useI18n()` hook'undan alınan dile göre Türkçe veya İngilizce lokalize metinler kullanılır. Kullanıcı "Kabul Et" veya "Reddet" butonlarından birine tıklandığında tercihi `localStorage`'a yazılır ve dialog kapatılır. Tüm `localStorage` işlemleri `try-catch` blokları ile sarılmıştır; böylece gizlilik modu veya depolama engelleri durumunda bile bileşen hata vermeden çalışmaya devam eder.

**Parametreler**:
- Bu bileşen herhangi bir prop almamaktadır. Dil tercihi ve çerez durumu iç bileşen state'leri ve bağlam (context) üzerinden yönetilir.

**Dönüş**: `JSX.Element` veya `null` — `isVisible` state'i `false` olduğunda bileşen `null` döner ve render edilmez; `true` olduğunda ise `role="dialog"` niteliğine sahip, erişilebilirlik (accessibility) destekli bir dialog JSX'i döner. Dialog, `aria-live="polite"` ve `aria-label` nitelikleri ile ekran okuyucu uyumluluğuna sahiptir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::CookieConsent
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `lang` — mevcut dil tercihi, useI18n hook'undan alınır
  - `isVisible` — cookie consent bannerının görünürlüğünü kontrol eden state değişkeni
  - `text` — dile göre yerelleştirilmiş ana açıklama metni
  - `policyText` — dile göre yerelleştirilmiş "Cookie Policy" linki metni
  - `acceptText` — dile göre yerelleştirilmiş "Accept All" butonu metni
  - `rejectText` — dile göre yerelleştirilmiş "Reject" butonu metni
  - `handleAccept` — çerezleri kabul etme işleyicisi
  - `handleReject` — çerezleri reddetme işleyicisi
- **Dönüş**: JSX bileşeni (isVisible true ise cookie consent dialog'u, değilse null)

### [N2_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::useEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `consent` — localStorage'dan alınan cookie consent durumu ('accepted' veya 'rejected' string'i veya null)
  - `timer` — 1.5 saniye sonra isVisible'ı true yapacak timeout ID'si
- **Dönüş**: timeout'u temizleyen cleanup fonksiyonu

### [N3_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::handleAccept
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: localStorage'a 'accepted' yazar ve isVisible'ı false yapar)

### [N4_NASIL] AST Pointer: src/components/layout/CookieConsent.tsx::handleReject
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: localStorage'a 'rejected' yazar ve isVisible'ı false yapar)

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