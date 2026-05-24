---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\LanguageSwitcher.tsx
skeleton_hash: 8a850a2b7d984e21
generated_at: 2026-05-23T22:08:35Z
---

## Genel Bakış
LanguageSwitcher, uygulamanın dil seçimini sağlayan bir React bileşenidir. Kullanıcıya mevcut dillerden birini seçme ve seçimi uygulama durumu yönetimiyle güncelleme imkanı sunar.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, dil değiştirme işlevselliğini tek bir fonksiyonda toplar.
- LanguageSwitcher

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### LanguageSwitcher
**Ne yapar**: Uygulamada dil değiştirme seçeneği sunan bir React bileşeni render eder.  
**Nasıl yapar**: Kullanıcıya mevcut dillerin listesi gösterir ve bir dil seçildiğinde içerik dilini güncelleyen bir callback fonksiyonunu tetikler.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: `React.FC` türünde bir bileşen döndürür; bu bileşen render edildiğinde dil seçiciyi içeren JSX elemanı üretir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/LanguageSwitcher.tsx::LanguageSwitcher
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `lang` — current locale string ('tr' or 'en') obtained from the `useI18n` hook; determines which language button is active and is passed to the translation function.
  - `setLang` — function returned by `useI18n` to update the locale; invoked when the TR or EN button is clicked.
  - `t` — translation function from `useI18n`; used to retrieve localized strings for `aria-label` attributes and button labels.
- **Dönüş**: JSX element (React.FC) rendering the language switcher UI with TR/EN buttons.

---

## NODE ID STANDARD

  file: src\components\LanguageSwitcher.tsx
  function: src\components\LanguageSwitcher.tsx::LanguageSwitcher

---

## DISA AKTARILANLAR (EXPORTS)
  export: LanguageSwitcher