---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\contact\page.tsx
skeleton_hash: ec76b7a76e7ee380
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: a07fce05e4917c91
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:46:14Z
---

## Genel Bakış
Bu modül, çok dilli bir web uygulamasının iletişim sayfasının ana giriş noktasıdır. Tek bir bileşen ile sayfanın tüm içeriğini, iletişim formunu ve dil destekli yapısını render eder.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
İletişim sayfasının tüm kullanıcı arayüzünü ve dil entegrasyonunu oluşturan temel bileşeni barındırır.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**:
Sayfa bileşenidir ve Next.js'in App Router yapısında `/contact` rotasının üst düzey React bileşenini temsil eder. İletişim sayfasının tüm görünümünü ve işlevselliğini barındıran `PageComponent` bileşenini render eder. Bu fonksiyon, Next.js'in varsayılan sayfa bileşeni sözleşmesine uygun olarak sunucu tarafında veya istemci tarafında çağrılabilir.

**Nasıl yapar**:
Next.js App Router yapısında tanımlanmış bir sayfa bileşenidir. Fonksiyon gövdesinde herhangi bir mantıksal işlem, durum yönetimi veya veri getirme yapılmamıştır. Doğrudan `PageComponent` adlı alt bileşeni JSX olarak döndürür. Tüm sayfa mantığı, layout bileşenleri ve alt bileşenler aracılığıyla gerçekleştirilir.

**Parametreler**:
- Parametre almamaktadır.

**Dönüş**:
- `JSX.Element` — İletişim sayfasının tüm içeriğini temsil eden `PageComponent` bileşeninin JSX çıktısıdır.

---

## İTHALATLAR (IMPORTS)
- import: ../../../views/ContactPage::PageComponent

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\app\[lang]\contact\page.tsx::Page
- **params**: (yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde herhangi bir değişken tanımlanmamıştır)
- **Dönüş**: `<PageComponent />` JSX elemanı — `../../../views/ContactPage` yolundan import edilen `PageComponent` doğrudan render edilir. Fonksiyon içinde herhangi bir değişken tanımlama, mantıksal işlem veya API çağrısı bulunmamaktadır; saf bir wrapper/sarmalayıcı bileşendir.

---

## NODE ID STANDARD

  file: src\app\[lang]\contact\page.tsx
  function: src\app\[lang]\contact\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page

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