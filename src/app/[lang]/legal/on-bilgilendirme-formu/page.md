---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\legal\on-bilgilendirme-formu\page.tsx
skeleton_hash: 76556bec65c58e2a
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: 881824b0262b6c42
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:34:48Z
---

## Genel Bakış
Bu modül, uygulamanın yasal bilgilendirme formu sayfasını temsil eden tek bir React bileşenini dışa aktarır. Sayfa, yasal zorunluluklar gereği kullanıcıya ön bilgilendirme içeriğini sunar ve gerekli onay akışını yönetir.

## Fonksiyon Grupları
### Sayfa Oluşturma ve Sunma
Modülün tek sorumluluğu, yasal bilgilendirme formu sayfasının kullanıcı arayüzünü oluşturmaktır. Sayfa, ilgili yasal metinleri, form alanlarını ve onay mekanizmasını bir araya getirerek son kullanıcının karşısına çıkar.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Next.js App Router yapısında çalışan bir sayfa bileşenidir; çalışması için ortam ve rota yapılandırmasına ilişkin aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer Next.js runtime ortağı (App Router) yoksa, bileşen sayfa olarak render edilmez ve istemci tarafında rota eşleştirmesi gerçekleşmez.

[Aksiyom 2]: Eğer dinamik `[lang]` rota parametresi sağlanmazsa (ör. geçersiz bir dil kodu ile çağrılmışsa), bileşen varsayılan dil içeriğini gösteremeyebilir veya hata üretebilir — bileşenin kendi imzasında (`Page()`) bu parametre doğrudan alınmadığından, dil bilgisinin sağlanması bir üst rota katmanının sorumluluğundadır.

[Aksiyom 3]: Eğer modül, yasal bilgilendirme içeriğini harici bir kaynaktan (API, statik dosya, sabit) yüklüyorsa, söz konu kaynağa erişim olmadan sayfa boş veya eksik içerikle görüntülenir — ancak bu kaynağın konumu ve yapısı fonksiyon imzasında belirtilmediğinden, yükleme mekanizması bilinmiyor.

[Aksiyom 4]: Eğer bileşen, tarayıcı tarafında (`"use client"`) render edilmiyor ve sunucu tarafında statik olarak üretiliyorsa, istemci etkileşimine dayalı davranışlar (form gönderimi, etc.) çalışmaz — ancak bileşenin client/server ayrımı imza düzeyinde belirtilmediğinden, hangi tarafta çalıştığı bilinmiyor.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, ilgili sayfanın ana React bileşenini (PageComponent) render ederek kullanıcı arayüzünü oluşturur. Next.js uygulamasında bir sayfa rotasının temel yapısını ve içeriğini tanımlayan üst düzey bir sarmalayıcıdır.

**Nasıl yapar**: Fonksiyon, doğrudan ve yalnızca `<PageComponent />` JSX ifadesini döndürür. Herhangi bir veri işleme, durum yönetimi veya mantık içermez; temelde bir wrapper (sarmalayıcı) bileşeni olarak davranır ve asıl sunumu `PageComponent`'e devreder.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `JSX.Element` (veya `ReactElement`). `PageComponent` bileşeninin oluşturulmuş (render edilmiş) halini döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/legal/on-bilgilendirme-formu/page.tsx::Page
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `JSX.Element` — `PageComponent` bileşenini render eder. Fonksiyonda herhangi bir değişken tanımı veya API çağrısı yoktur; doğrudan import edilen `PageComponent` JSX elemanını döndürür.

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\on-bilgilendirme-formu\page.tsx
  function: src\app\[lang]\legal\on-bilgilendirme-formu\page.tsx::Page

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