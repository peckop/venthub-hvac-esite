---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\en\PreInformationContent.tsx
skeleton_hash: 1e751f03f4af479b
entity_hashes:
  func:PreInformationContentEn: 44e34e2e52c333aa
  overview: e15ed899a460c834
  style_tokens: 5c1748e6c54f7f63
generated_at: 2026-06-16T11:55:32Z
---

## Genel Bakış

Bu modül, VentHub platformunun yasal bilgilendirme sayfası için İngilizce içerik sunan tek bileşenli bir React modülüdür. Kullanıcılara hizmet koşulları, gizlilik politikası veya benzeri yasal metinleri okunabilir formatta sunmayı amaçlar. "en" klasöründe yer alması, modülün çok dilli yapıda olduğunu ve her dil için ayrı bileşenler bulunduğunu gösterir.

## Fonksiyon Grupları

### Yasal İçerik Bileşeni
PreInformation sayfasının İngilizce versiyonunu render eden üst düzey React bileşeni. Sadece dil prop'u alarak ilgili yasal metinleri ekrana yansıtır.
- PreInformationContentEn

---

## AXIOMS – Mimari Varsayımlar

Bu modül, statik yasal bilgilendirme içeriği gösteren sunumsal bir React bileşenidir. Mimari varsayımlar minimal düzeydedir.

[Aksiyom 1]: Eğer bileşenin bulunduğu sayfa kapsamında gerekli CSS stilleri (`src/views/legal/components/en/PreInformationContent.module.css` veya karşılıklı import edilen stil dosyası) yoksa, içerik düzgün biçimlendirilmemiş ve okunaksız görünür.

[Aksiyom 2]: Eğer `lang` prop'u bir üst bileşen tarafından sağlanmazsa, bileşen React tarafında bir hata fırlatır; ancak mevcut gövdede `lang` prop'u kullanılmadığı için işlevsel etkisi bilinmiyor — bileşen yalnızca İngilizce statik içerik döndürür.

[Aksiyom 3]: Eğer bileşen, yasal metnin gösterilmesi gereken bir sayfada (örn: ilan yayınlama akışı) çağrılmazsa, kullanıcıya zorunlu yasal ön bilgilendirme ulaşmaz ve düzenleyici uyumluluk riski doğar — bu, işlevsel değil süreçsel bir varsayımdır.

> **Not:** Bu bileşen tamamen statik JSX içeriği döndüren sunumsal bir bileşendir; durum yönetimi, API çağrısı, koşullu mantık veya hesaplama içermez. Dolayısıyla fonksiyon gövdesinden türetilebilecek ek mimari varsayım bulunmamaktadır.

---

## FONKSİYON DETAYLARI

### PreInformationContentEn

**Ne yapar**: İngilizce dilinde ön bilgilendirme içeriğini render eden bir React fonksiyonel bileşenidir. Kullanıcıya yasal bilgilendirme metinlerini İngilizce olarak sunar.

**Nasıl yapar**: Fonksiyonel bir React bileşeni olarak tanımlanmıştır. `React.FC<{ lang: string }>` generic tipi ile dil parametresi alan bir fonksiyonel bileşen döndürür. Bileşen, `lang` prop'unu alarak İngilizce dil içeriğini koşullu olarak göstermek veya dil seçimine göre içerik render etmek için kullanılır. Dosya yolundaki `en` uzantısı, bu bileşenin İngilizce versiyon olduğunu belirtir.

**Parametreler**:
- `lang`: `string` — Bileşenin hangi dilde içerik göstereceğini belirten dil kodu parametresidir. İngilizce içerik gösterimi için kullanılır.

**Dönüş**: `React.FC<{ lang: string }>` — Dil parametresi alan, React fonksiyonel bileşeni tipinde dönüş sağlar. Bileşen, verilen lang prop değerine göre İngilizce ön bilgilendirme içeriğini JSX olarak render eder.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\legal\components\en\PreInformationContent.tsx::PreInformationContentEn
- **params**: (parametre yok)
- **ic_degiskenler**: 
  (Değişken yok — fonksiyon gövdesinde herhangi bir değişken tanımı yapılmamıştır)
- **Dönüş**: JSX element döndürür (React.FC<{ lang: string }> tipinde, ancak `lang` prop'u fonksiyon gövdesinde kullanılmamıştır)

**Not:** Fonksiyon gövdesinde `legalConfig` import'u kullanılarak şu özelliklere erişilmiştir:
- `legalConfig.sellerTitle` — Satıcı unvanı
- `legalConfig.sellerAddress` — Satıcı adresi
- `legalConfig.sellerEmail` — Satıcı e-posta adresi
- `legalConfig.sellerPhone` — Satıcı telefon numarası
- `legalConfig.taxOffice` — Vergi dairesi
- `legalConfig.taxNumber` — Vergi numarası
- `legalConfig.deliveryTime` — Teslimat süresi
- `legalConfig.shippingFee` — Kargo ücreti
- `legalConfig.returnAddress` — İade adresi
- `legalConfig.lastUpdated` — Son güncelleme tarihi

---

## NODE ID STANDARD

  file: src\views\legal\components\en\PreInformationContent.tsx
  function: src\views\legal\components\en\PreInformationContent.tsx::PreInformationContentEn

---

## DISA AKTARILANLAR (EXPORTS)
  export: PreInformationContentEn

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
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `mt-2`, `pl-6`, `space-y-1`