---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\destek\hesaplayicilar\hava-perdesi\page.tsx
skeleton_hash: 12863f418bab1f43
entity_hashes:
  func:Page: 3f2298054a9d2ba4
  overview: 286959abaf4b75d1
  style_tokens: 9144ece4bffe7964
generated_at: 2026-06-19T20:46:14Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasındaki "hava perdesi" hesaplayıcı aracının ana sayfa yapısını tanımlayan bir React/Next.js sayfa bileşenidir. Modül, ilgili alt bileşenleri bir araya getirerek hesaplama arayüzünü sunar ve sayfanın kullanıcıya gösterilmesinden sorumludur.

## Fonksiyon Grupları
### Sayfa Oluşturma ve Düzenleme
Bu grup, hava perdesi hesaplama sayfasının tüm kullanıcı arayüzünü oluşturarak ilgili hesaplama araçlarını ve bileşenleri bir sayfa içinde düzenler.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

> **Not:** `Page()` fonksiyonunun gövdesi (içeriği) paylaşılmadığı için, fonksiyonun hangi bileşenleri çağırdığı, hangi hesaplamaları yaptığı veya hangi veri akışını izlediği bilinmemektedir. Dolayısıyla sadece fonksiyon gövdesinden türetilebilecek aksiyom üretilememektedir. Fonksiyon gövdesi sağlandığında aksiyomlar oluşturulabilir.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, bir React functional component olup sayfanın Suspense ile sarılmış halini döndürür. Temel amacı, asıl sayfa bileşeninin (PageComponent) yüklenme sürecini yönetmek ve kullanıcıya yükleme durumunda görsel bir geri bildirim sunmaktır.

**Nasıl yapar**: Fonksiyon, React Suspense bileşenini kullanarak asıl içerik olan `PageComponent`'i sarmalar. `fallback` prop'u aracılığıyla, `PageComponent` yüklenene kadar ekranda bir loading animasyonu (dönen bir daire) gösterir. Bu animasyon, Tailwind CSS sınıfları (`animate-spin`, `rounded-full`, `border-b-2 border-primary-navy`) ile stillendirilmiş, ekranın ortasında yer alan ve minimum ekran yüksekliğinde (`min-h-screen`) konumlandırılmış bir div içinde render edilir.

**Parametreler**: Yok

**Dönüş**: React JSX elementi (Suspense içinde `PageComponent`'i barındıran bir yapı)

---

## İTHALATLAR (IMPORTS)
- import: ../../../../../views/calculators/AirCurtainCalcPage::PageComponent
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `[lang]/destek/hesaplayicilar/hava-perdesi/page.tsx`::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde değişken tanımlanmamış)
- **Cagrilar**: 
  - `Suspense` — React Suspense bileşeni, fallback olarak spinner gösterir
  - `PageComponent` — AirCurtainCalcPage bileşeni, Suspense içinde render edilir
- **Dönüş**: JSX (Suspense ile sarılmış `<PageComponent />` bileşeni)

---

## NODE ID STANDARD

  file: src\app\[lang]\destek\hesaplayicilar\hava-perdesi\page.tsx
  function: src\app\[lang]\destek\hesaplayicilar\hava-perdesi\page.tsx::Page

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
- **Renkler:** `border-b-2`, `border-primary-navy`
- **Layout:** `flex`, `h-12`, `items-center`, `justify-center`, `min-h-screen`, `w-12`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-spin`, `rounded-full`