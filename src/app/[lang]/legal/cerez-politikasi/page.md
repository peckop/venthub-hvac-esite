---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\legal\cerez-politikasi\page.tsx
skeleton_hash: 7c1f9966add1b144
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: 1c867320b83241d4
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T08:57:36Z
---

## Genel Bakış
Bu modül, VentHUB platformundaki yasal "Çerez Politikası" sayfasının görüntülenmesinden sorumludur. Tek bir React bileşeni ile kullanıcıya çerez kullanımı ve tercihleri hakkında zorunlu yasal bilgilendirmeyi sunar.

## Fonksiyon Grupları
### Sayfa Görüntüleme Grubu
Modülün tek ve temel sorumluluğu olan çerez politikası sayfasının kullanıcı arayüzünü oluşturmaktan ve tarayıcıda göstermekten sorumludur.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**: Çerez politikası sayfasının üst seviye React bileşenini oluşturur ve render eder. Next.js'in sayfa yönlendirme sistemi tarafından otomatik olarak çağrılan varsayılan sayfa bileşenidir.

**Nasıl yapar**: Fonksiyon, doğrudan `PageComponent` adlı alt bileşeni çağırarak JSX olarak döndürür. Herhangi bir durum yönetimi, veri çekme veya mantık işlemi içermez; sadece bir yönlendirici (wrapper) görevi görür. Bu yapı, sayfa içeriğinin modüler olmasını ve bileşen ayrıştırmasını kolaylaştırır.

**Parametreler**:

- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**:

- **Return type**: `JSX.Element` — `PageComponent` bileşeninin render ettiği JSX yapısını döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/legal/cerez-politikasi/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (değişken yok)
- **Dönüş**: `<PageComponent />` — `../../../../views/legal/CookiePolicyPage` yolundan import edilen `PageComponent` JSX bileşeninin render edilmesi; fonksiyon doğrudan bu bileşeni return eder, herhangi bir değişken tanımlamaz veya mantıksal işlem yapmaz.

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\cerez-politikasi\page.tsx
  function: src\app\[lang]\legal\cerez-politikasi\page.tsx::Page

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