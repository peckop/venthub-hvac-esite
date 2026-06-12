---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\error-groups\page.tsx
skeleton_hash: 6a47267efde97431
entity_hashes:
  func:Page: b47a5eb18beb6937
  overview: c697ddf7c92cfa4f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-06T21:53:47Z
---

## Genel Bakış
Bu modül, yönetim panelindeki "Hata Grupları" sayfasının kök bileşenini tanımlar. Tek bir `Page` fonksiyonu, dinamik olarak yüklenecek `AdminErrorGroupsPage` bileşenini render ederek ilgili arayüzün oluşturulmasını sağlar.

## Fonksiyon Grupları
### Sayfa Render ve UI Oluşturma
Sayfanın temel yapısını kurar; dinamik import edilen `AdminErrorGroupsPage` bileşenini JSX olarak döndürerek hata gruplarının listelenmesi ve yönetilmesi arayüzünü sunar.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül, `Page` fonksiyonunu dışa aktaran ve `AdminErrorGroupsPage` bileşenini dinamik olarak import eden basit bir sayfa kök bileşenidir. Fonksiyon gövdesinde herhangi bir koşul kontrolü, veri bağımlılığı veya iş mantığı bulunmamaktadır; sadece JSX döndürmektedir. Dolayısıyla, bu modülün doğru çalışması için ek bir mimari varsayım (aksiyom) gerekmemektedir.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: `Page` fonksiyonu, yönetici arayüzünde hata gruplarını görüntülemek için kullanılan `AdminErrorGroupsPage` bileşenini döndürür.  
**Nasıl yapar**: Fonksiyon, React bileşeni olarak tanımlanmış olup, JSX içinde `<AdminErrorGroupsPage />` etiketini render eder. Bu sayede sayfa, hata gruplarının yönetim ekranını sunar.  
**Parametreler**:
- *None*  
**Dönüş**: `<AdminErrorGroupsPage />` bileşeni (React element)

---

## SABİTLER
- **AdminErrorGroupsPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminErrorGroupsPage'),
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/error-groups/page.tsx::Page
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `<AdminErrorGroupsPage />` — `nextDynamic` ile import edilen `AdminErrorGroupsPage` bileşeninin render edilmiş karşılığı; fonksiyon gövdesinde herhangi bir değişken tanımlanmaz, doğrudan JSX elemanı döndürülür

---

## NODE ID STANDARD

  file: src\app\admin\error-groups\page.tsx
  function: src\app\admin\error-groups\page.tsx::Page

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
- **Renkler:** `text-center`, `text-slate-400`
- **Layout:** `p-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`