---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\legal\on-bilgilendirme-formu\page.tsx
skeleton_hash: 2d14316ae3c6f110
generated_at: 2026-05-23T21:49:52Z
---

## Genel Bakış
Bu modül, uygulamanın yasal bilgilendirme formu sayfasını (**on‑bilgilendirme‑formu**) temsil eden tek bir React bileşenini (`Page`) dışa aktarır. Sayfa, gerekli içeriği görüntüler ve kullanıcı etkileşimlerini yönetir; uygulamadaki karşılığı, yönlendirme sisteminde bu yol ile eşlenir.

## Fonksiyon Grupları
### Sayfa Render ve İşlevselliği  
Sayfanın tüm UI öğelerini bir araya getirir, içerik gösterimi ve form davranışlarını kapsar.  
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tan

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: Bu Next.js sayfa bileşeni, Türkiye'deki uzaktan satış sözleşmeleri veya tüketici kredisi gibi durumlarda yasal olarak zorunlu olan "Ön Bilgilendirme Formu" sayfasını oluşturur. Kullanıcıya ilgili yasal bilgileri sunar ve onay almayı sağlar.

**Nasıl yapar**: Fonksiyonel bir React bileşeni olarak, JSX ve React hooks (örn. useState, useEffect) kullanarak sayfanın kullanıcı arayüzünü kurar. Projedeki ortak UI kütüphanesinden form elemanlarını, butonları ve metin bileşenlerini içe aktarır; gerekirse form durumu yönetimi ve gönderme mantığını da barındırır.

**Parametreler**: Yok (bileşen herhangi bir prop almaz).

**Dönüş**: Sayfanın tamamını temsil eden bir React JSX ögesi döndürür. Çıktı, tipik olarak bir `<div>` veya `<main>` etiketi içinde başlık, form alanları, yasal metinler ve bir onay butonu gibi alt bileşenleri içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\app\legal\on-bilgilendirme-formu\page.tsx::Page
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (PageComponent)

---

## NODE ID STANDARD

  file: src\app\legal\on-bilgilendirme-formu\page.tsx
  function: src\app\legal\on-bilgilendirme-formu\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page