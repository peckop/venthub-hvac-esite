---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\en\TermsOfUseContent.tsx
skeleton_hash: 798add011f73e53a
entity_hashes:
  func:TermsOfUseContentEn: fa6bb0a6f0f85b35
  overview: 964d7e1b007c0dbd
  style_tokens: 6460a848de07bdf3
generated_at: 2026-06-19T20:50:36Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının yasal belgeleri arasındaki "Kullanım Koşulları" (Terms of Use) metninin İngilizce versiyonunu sunan bir React bileşenidir. Tek bir amaca hizmet eder: belirli bir dil parametresiyle (örn. 'en') istenen yasal içeriği tarayıcıda görüntülemek.

## Fonksiyon Grupları
### Yasal İçerik Görüntüleme
Bu grup, uygulamanın yasal metinlerini ve zorunlu koşullarını kullanıcıya sunan temel UI bileşenini barındırır.
- TermsOfUseContentEn

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### TermsOfUseContentEn
**Ne yapar**: Bu fonksiyon, uygulamanın Kullanım Koşulları içeriğini, belirli bir dile göre dinamik olarak render eden bir React işlevsel bileşenini (functional component) tanımlar ve döndürür. Fonksiyon, bir dil kodu parametresi alarak içeriğin farklı dil sürümlerini (örneğin İngilizce) sunmasına olanak tanır.

**Nasıl yapar**: Fonksiyon, React.FC (Functional Component) türünde bir bileşen oluşturur. Bu bileşen, `lang` adında bir string prop'u kabul eder. Alınan dil bilgisini kullanarak, ilgili dildeki Kullanım Koşulları metinlerini, maddelerini ve yapısal düzenlemeleri (örneğin段落 başlıkları, listeler) bir JSX yapısı içinde döndürür. Bileşenin içeriği büyük olasılıkla bir dizeler nesnesi (string object) veya modülden import edilen çeviri dosyalarından beslenir.

**Parametreler**:
- `lang`: `string` — Bileşenin render edeceği içeriğin dilini belirtir (örneğin "en", "tr"). Bu değer, bileşenin hangi dil sürümünü göstereceğini kontrol eden anahtardır.

**Dönüş**: `React.FC<{ lang: string }>` — Bu fonksiyon, `lang` prop'unu alan ve Kullanım Koşullarını ilgili dilde döndüren, React işlevsel bileşeninin kendisini döndürür. Bileşen, bir JSX (ReactElement) yapısı render eder.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\legal\components\en\TermsOfUseContent.tsx::TermsOfUseContentEn
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde herhangi bir değişken tanımı yapılmamıştır)
- **Dönüş**: React JSX fragment — yasal kullanım koşullarını 7 bölüm halinde İngilizce olarak gösteren React bileşeni JSX yapısı. Fonksiyon, `legalConfig` modülünden alınan `websiteUrl`, `sellerTitle` ve `lastUpdated` değerlerini dinamik olarak JSX içinde kullanarak yasal metni render eder.

---

## NODE ID STANDARD

  file: src\views\legal\components\en\TermsOfUseContent.tsx
  function: src\views\legal\components\en\TermsOfUseContent.tsx::TermsOfUseContentEn

---

## DISA AKTARILANLAR (EXPORTS)
  export: TermsOfUseContentEn

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