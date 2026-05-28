---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\PreInformationPage.tsx
skeleton_hash: 47f4bda80ce59bb6
entity_hashes:
  func:PreInformationPage: 3746fdd57fa8f528
  overview: 9f7c71a3d1be24be
  style_tokens: f624520e4dc7da19
generated_at: 2026-05-28T22:40:07Z
---

## Genel Bakış
Bu modül, kullanıcıya yasal ön bilgilendirme metnini sunan `PreInformationPage` adlı React bileşenini tanımlar. Bileşen, kullanıcı onayı veya bilgilendirme gerektiren durumlar için kullanılır ve sayfanın görünümünü ve etkileşimlerini yönetir.

## Fonksiyon Grupları
### Sayfa Bileşeni
Ana sayfa bileşenini oluşturur. Bileşen içinde JSX yapısı, state yönetimi ve olası alt bileşenler birleştirilerek eksiksiz bir ön bilgilendirme sayfası sunulur.
- PreInformationPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### PreInformationPage
**Ne yapar**: `PreInformationPage` fonksiyonu, bir React fonksiyonel bileşeni (React.FC) tanımlayarak ön bilgi sayfasının UI yapısını oluşturur.  

**Nasıl yapar**: Fonksiyon, JSX içinde gerekli HTML elemanlarını ve stil sınıflarını düzenleyerek, sayfanın başlık, açıklama ve ilgili yasal metin bölümlerini render eder.  

**Parametreler**:  
- *Yok* — Bu fonksiyon herhangi bir dış parametre almaz; bileşen içindeki sabit içerik ve stil tanımlarıyla çalışır.  

**Dönüş**: React.FC — Fonksiyon, bir React fonksiyonel bileşeni döndürür; bu bileşen, uygulama içinde `<PreInformationPage />` şeklinde kullanılabilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\legal\PreInformationPage.tsx::PreInformationPage
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - *hiç yok* — fonksiyon içinde tanımlı yerel değişken bulunmamaktadır; sadece `legalConfig` importu üzerinden değerler okunmaktadır.
- **Dönüş**: `React.ReactElement` – fonksiyon, JSX içinde tanımlı bir React bileşen ağacını döndürür.

---

## NODE ID STANDARD

  file: src\views\legal\PreInformationPage.tsx
  function: src\views\legal\PreInformationPage.tsx::PreInformationPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: PreInformationPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `bg-yellow-50`, `border-light-gray`, `border-yellow-200`, `text-3xl`, `text-industrial-gray`, `text-sm`, `text-steel-gray`, `text-xl`, `text-xs`, `text-yellow-800`
- **Layout:** `bg-yellow-50`, `border-yellow-200`, `max-w-4xl`, `max-w-prose`, `p-4`, `p-6`, `shadow-sm`, `text-yellow-800`
- **Varyant/Responsive:** `dark:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `dark:prose-invert`, `font-bold`, `font-semibold`, `lg:px-8`, `list-disc`, `mb-3`, `mb-6`, `mt-2`, `mt-4`, `mx-auto`, `pl-6`, `prose`, `px-4`, `py-10`