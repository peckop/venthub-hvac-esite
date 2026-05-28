---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\QuickEntryRail.tsx
skeleton_hash: affff31675ac0604
entity_hashes:
  func:QuickEntryRail: 075f03157b98bfeb
  overview: 401a0936bbfac549
  style_tokens: 400b6fdf74ed7abd
generated_at: 2026-05-28T22:35:54Z
---

## Genel Bakış
QuickEntryRail, kullanıcıların hızlı bir şekilde teklif talebi başlatmasını sağlayan bir React bileşenidir. Bileşen, bir buton veya etkileşimli öğe üzerinden `onQuoteClick` geri çağrısını tetikleyerek üst seviye mantık ile iletişim kurar ve kullanıcı deneyimini akıcı tutar.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, modülün tek offentaki işlevini içerir ve kullanıcı arayüzüyle etkileşimi yönetir.
- QuickEntryRail

---

## AXIOMS – Mimari Varsayımlar
Bu modül için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `onQuoteClick` prop'u bir fonksiyon değilse, bileşen içinde `onQuoteClick` çağrıldığında çalışma zamanı hatası oluşur.  
[Aksiyom 2]: Eğer `quickEntryItems` sabiti tanımlı değilse (veya beklenen veri yapısıyla uyuşmuyorsa), `QuickEntryRail` bileşeni giriş öğelerini render edemeyeceğinden kullanıcı arayüzünde beklenen rail öğeleri görünmeyecektir.

---

## FONKSİYON DETAYLARI

### QuickEntryRail
**Ne yapar**: Kullanıcıya hızlı giriş seçenekleri sunan bir rail (çubuk) bileşenini renderlar.  
**Nasıl yapar**: `onQuoteClick` adlı geri çağırım fonksiyonunu prop olarak alır; bir alıntıya tıklandığında bu fonksiyonu çağırarak etkileşimi yönetir ve JSX döndürür.  
**Parametreler**:
- onQuoteClick: (event?: React.MouseEvent) => void — Bir alıntıya tıklandığında çalıştırılacak geri çağırım fonksiyonu.  
**Dönüş**: React.FC<QuickEntryRailProps> — JSX elementi üreten bir React fonksiyonel bileşeni.

---

## INTERFACES

### QuickEntryRailProps
- `onQuoteClick: () => void`

---

## SABİTLER
- **quickEntryItems** (as_expression) — `[
  {
    id: 'category',
    href: '#categories',
    icon: (
      <sv...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\QuickEntryRail.tsx::QuickEntryRail
- **params**: `onQuoteClick` — quote butonuna tıklandığında çağrılan dışarıdan gelen callback fonksiyonu
- **ic_degiskenler**:
  - `onQuoteClick` — prop fonksiyonu, quote butonuna tıklandığında tetiklenir
  - `t` — `useI18n` hookundan dönen çeviri fonksiyonu, i18n anahtarlarına göre yerelleştirilmiş metinleri sağlar
  - `quickEntryItems` — dosya seviyesinde tanımlı sabit dizisi, her öğenin `id`, `href`, `icon`, `title` ve `description` özelliklerini içerir
- **Dönüş**: `React.FC<QuickEntryRailProps>` (JSX elementi döndüren fonksiyon)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\QuickEntryRail.tsx::map callback
- **params**: `item` — `quickEntryItems` dizisindeki her bir öğeyi temsil eden nesne (`id`, `href`, `icon` gibi alanlar içerir)
- **ic_degiskenler**:
  - `item` — şu an işlenen hızlı giriş öğesi, Link’in `key`, `href` ve içeriklerde kullanılır
  - `t` — dış kapsamdaki `useI18n` tarafından sağlanan çeviri fonksiyonu, öğenin başlık ve açıklamasını şablon literal ile alır
- **Dönüş**: `JSX.Element` (Link bileşeni)

---

## NODE ID STANDARD

  file: src\components\home\QuickEntryRail.tsx
  function: src\components\home\QuickEntryRail.tsx::QuickEntryRail

---

## DISA AKTARILANLAR (EXPORTS)
  export: QuickEntryRail

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-lg`, `tracking-hvac-24`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-entry-rail-gradient`, `bg-primary-navy`, `bg-primary-navy/6`, `bg-white`, `bg-white/95`, `border-b`, `border-primary-navy/10`, `border-primary-navy/15`, `border-slate-200`, `border-slate-200/75`, `group-hover:bg-primary-navy/10`, `group-hover:bg-secondary-blue`, `group-hover:border-primary-navy/20`, `hover:border-primary-navy/20`, `hover:border-primary-navy/25`
- **Layout:** `block`, `flex`, `gap-3`, `grid`, `h-11`, `hidden`, `hover:shadow-hvac-rail-2`, `inline-flex`, `items-center`, `items-start`, `justify-between`, `justify-center`, `lg:block`, `max-w-7xl`, `max-w-md`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `border`, `duration-300`, `font-semibold`, `group`, `hover:-translate-y-0.5`, `leading-6`, `lg:px-8`, `lg:py-6`, `mt-1`, `mt-4`, `mx-auto`, `px-4`, `py-4`, `py-5`, `rounded-2xl`