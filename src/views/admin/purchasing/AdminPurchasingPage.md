---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\views\admin\purchasing\AdminPurchasingPage.tsx
skeleton_hash: 91a682b2c9d93083
entity_hashes:
  func:AdminPurchasingPage: 9714eca190dab271
  overview: b5f9808e4fe14a3a
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-17T11:05:22Z
---

## Genel Bakış

Bu modül, admin panelinde satın alma yönetimi sayfasını sunan bir React sayfa bileşenidir. Satın alma süreçlerinin görüntülenmesi ve yönetilmesi için gerekli arayüzü sağlar. Yönetim panelinin purchasing (satın alma) bölümüne erişim noktası olarak görev yapar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Modülün tek ana bileşeni olup, satın alma yönetim sayfasının tüm arayüzünü ve iş mantığını barındırır. Admin kullanıcıların satın alma işlemlerini görüntüleyebileceği ve yönetebileceği bir sayfa sunar.

- AdminPurchasingPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen fonksiyon gövdesinden çıkarılabilecek mimari varsayımlar tanımlanamamıştır.

[Aksiyom 1]: Eğer React çalışma ortamı (React kütüphanesi ve React DOM) yoksa, bileşen render edilemez ve uygulama çalışamaz.

[Aksiyom 2]: Eğer AdminPurchasingPage bileşeni React functional component olarak tanımlanmıyorsa, React Component Singer tarafından geçerli bir bileşen olarak kabul edilmez ve hata fırlatır.

---

## FONKSİYON DETAYLARI

### AdminPurchasingPage

**Ne yapar**: Uygulamanın satınalma (purchasing) yönetim sayfasını render eden üst düzey React fonksiyonel bileşendir. Sayfa yapısı olarak başlık ve Suspense ile sarılmış bir ana içerik bölgesi oluşturur ve tüm tablo verilerinin yönetimi alt bileşene devredilir.

**Nasıl yapar**: Bileşen, sayfa düzenini (layout) tanımlar ve veri yönetimi sorumluluğunu doğrudan `PurchasingTableBody` alt bileşenine aktarır. `useSearchParams` hook'u doğrudan bileşen içinde çağrılmaz; bunun yerine `<Suspense>` boundary içine yerleştirilmiş `PurchasingTableBody` içinde tüketilir. Bu yapı, Next.js/React Suspense ile uyumlu URL senkronizasyonu sağlar ve CLAUDE.md Kural 5 / K2 gerekliliklerine uygun olarak Suspense sarımını garanti altına alır. URL parametreleri, filtre state'i ve tablo verisi gibi tüm durum yönetimi `useAdminTable` custom hook'u tarafından merkezi olarak ele alınır.

**Parametreler**:

- Bu bileşen props almaz (parametresiz fonksiyonel bileşendir)

**Dönüş**: `React.FC` — Sayfa başlığını ve `<Suspense>` ile sarılmış `PurchasingTableBody` içeren JSX yapısı döndürür. Return tipi olarak `React.FC` (Functional Component) belirtilmiştir; bu, bileşenin props almadığını ve React void return type'a sahip olduğunu ifade eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../../i18n/I18nProvider::useI18n
- import: ../../../utils/adminUi::adminSectionTitleClass
- import: ../../../utils/adminUi::adminSubtitleClass
- import: ./PurchasingTableBody::PurchasingTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\admin\purchasing\AdminPurchasingPage.tsx::AdminPurchasingPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu, sayfadaki metinlerin çevrilmesi için kullanılır
- **Dönüş**: JSX Element (React fonksiyonel bileşeni)

---

## NODE ID STANDARD

  file: src\views\admin\purchasing\AdminPurchasingPage.tsx
  function: src\views\admin\purchasing\AdminPurchasingPage.tsx::AdminPurchasingPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminPurchasingPage

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
- **Yardımcı Sınıflar:** `pb-20`, `space-y-6`