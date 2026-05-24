---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\QuickEntryRail.tsx
skeleton_hash: affff31675ac0604
generated_at: 2026-05-23T22:06:53Z
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

## FONKSIYON DETAYLARI

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