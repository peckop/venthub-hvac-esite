---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\destek\merkez\page.tsx
skeleton_hash: 2fe0f85c9cd6d104
generated_at: 2026-05-23T21:49:23Z
---

## Genel Bakış
Bu modül, destek merkezi sayfasının kök bileşenini tanımlar. Tek bir `Page` fonksiyonu sayesinde sayfanın bütün UI yapısını oluşturur, alt bileşenleri bir araya getirir ve layout’u döndürür.

## Fonksiyon Grupları
### Sayfa Oluşturma
Bu grup, destek merkezi sayfasının ana render işlemini yönetir.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### Page

**Ne yapar**: Bu fonksiyon, uygulamanın `destek/merkez` rotası altındaki sayfayı oluşturan ana React bileşenini tanımlar. Bir `PageComponent` döndürerek sayfanın render edilmesini sağlar ve kullanıcılara destek merkezi içeriğini sunar.

**Nasıl yapar**: Fonksiyon herhangi bir parametre almadan doğrudan bir `PageComponent` döndürür. Next.js sayfa yapısı gereği bu bileşen, belirtilen rota için otomatik olarak çağrılır ve döndürülen JSX içeriği tarayıcıya gönderilir. İçerisinde, destek merkezinin alt bileşenlerini ve gerekli sayfa yapısını barındırarak görsel ve işlevsel bütünlüğü sağlar.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `PageComponent` türünde bir React bileşeni döndürür. Bu bileşen, tüm sayfa içeriğini kapsayan üst düzey bir bileşendir ve Next.js tarafından doğrudan sayfa olarak kullanılır.

---

## AST POINTERS

### [N1_VENTHUB_HVAC] AST Pointer: src\app\destek\merkez\page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde değişken kullanılmamıştır)
- **Dönüş**: `JSX.Element` (`<PageComponent />` JSX ifadesini döndürür)

---

## NODE ID STANDARD

  file: src\app\destek\merkez\page.tsx
  function: src\app\destek\merkez\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page