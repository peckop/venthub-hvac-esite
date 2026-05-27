---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\LanguageSwitcher.tsx
skeleton_hash: 8a850a2b7d984e21
entity_hashes:
  func:LanguageSwitcher: e20e68a6d834aa54
  overview: 7882320662f1fa31
  style_tokens: 93059c02fd156e45
generated_at: 2026-05-27T18:07:01Z
---

## Genel Bakış
LanguageSwitcher modülü, uygulamanın dil seçimini sağlayan basit bir React bileşenidir. Kullanıcıya mevcut dillerden birini seçme ve bu seçimi uygulama genelinde güncelleme imkanı sunar.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, dil değiştirme işlevselliğini tek bir fonksiyonda toplar.
- LanguageSwitcher

---

## AXIOMS – Mimari Varsayımlar
Dil değiştirme işlevini yerine getiren bu React bileşeninin çalışması için uygulama içi dil yönetimi altyapısının ve React çalışma ortamının erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer uygulama genelinde paylaşılan global dil durumu (dil state'i) bileşen tarafından erişilebilir değilse, kullanıcının seçtiği dil uygulama genelindeki hiçbir içeriği etkilemez, bileşen tamamen işlevsiz kalır.
[Aksiyom 2]: Eğer desteklenen dillerin listesi bileşen tarafından erişilebilir değilse, kullanıcıya seçim yapabileceği hiçbir dil seçeneği sunulamaz, bileşen boş olarak render edilir.
[Aksiyom 3]: Eğer dil değişikliğini uygulama genelinde uygulayacak global callback fonksiyonu tanımlı ve erişilebilir değilse, kullanıcı herhangi bir dil seçse bile dil değişikliği işlemi gerçekleştirilemez, uygulama mevcut dilinde kalır.
[Aksiyom 4]: Eğer React kütüphanesi bileşenin çalıştığı istemci ortamında erişilebilir değilse, bileşen hiçbir şekilde render edilemez, çalışmaz.

---

## FONKSİYON DETAYLARI

### LanguageSwitcher
**Ne yapar**: LanguageSwitcher fonksiyonu, uygulama içinde dil seçimini sağlayan bir React bileşeni döndürür.  
**Nasıl yapar**: Fonksiyon, React.FC arayüzünü uygulayarak JSX döndürür; içeriğinde dil seçeneklerini gösteren öğeler ve kullanıcı etkileşimini yöneten mantık bulunur (örneğin, bir buton veya açılır menü).  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: React.FC türünde bir fonksiyon; bu fonksiyon render edildiğinde dil değiştirme kullanıcı arayüzünü gösterir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\LanguageSwitcher.tsx::LanguageSwitcher
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `lang` — Mevcut aktif uygulama dili kodu, useI18n kancası aracılığıyla alındı
  - `setLang` — Uygulamanın aktif dilini güncellemek için kullanılan fonksiyon, useI18n kancası tarafından sağlandı
  - `t` — Yerelleştirilmiş metin dizelerini almak için kullanılan çeviri fonksiyonu, useI18n kancası tarafından sağlandı
- **Dönüş**: React.FC

---

## NODE ID STANDARD

  file: src\components\LanguageSwitcher.tsx
  function: src\components\LanguageSwitcher.tsx::LanguageSwitcher

---

## DISA AKTARILANLAR (EXPORTS)
  export: LanguageSwitcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-white/90`, `border-light-gray`, `hover:bg-light-gray`, `text-industrial-gray`, `text-sm`, `text-white`
- **Layout:** `backdrop-blur`, `bottom-4`, `fixed`, `flex`, `gap-1`, `items-center`, `p-1`, `right-4`, `shadow-sm`, `z-50`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${lang`, `:`, `===`, `border`, `en`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy`, `outline-none`, `px-3`, `py-1`, `rounded-full`, `tr`