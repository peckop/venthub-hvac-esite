---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\legal\gizlilik-politikasi\page.tsx
skeleton_hash: 7e6f2955bec2f177
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: 4468bf8a0a9088cb
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:34:54Z
---

## Genel Bakış
Bu modül, Venthub HVAC uygulamasının gizlilik politikası sayfasını kullanıcıya sunan tek bir React bileşeni içermektedir. Modülün temel sorumluluğu, yasal metinlerin ve düzenin kullanıcıya doğru ve eksiksiz bir şekilde gösterilmesini sağlamaktır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Gizlilik politikası sayfasının tüm içeriğini, düzenini ve metinsel yapısını oluşturarak kullanıcıya sunmakla yükümlüdür.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir React sayfa bileşeni olup, içeriği tamamen bir alt bileşene (PageComponent) bağlıdır.

[Aksiyom 1]: Eğer PageComponent bileşeni doğru bir şekilde tanımlanmamış veya içe aktarılmamışsa, Page bileşeni render aşamasında hata verir veya istenen içeriği gösteremez.

[Aksiyom 2]: Page bileşeni hiçbir prop almadığından, PageComponent'e aktarılacak veriye ihtiyaç duymaz. Dolayısıyla, PageComponent'in bağımsız çalışabilmesi için kendi içinde tüm gerekli statik içeriği sağlaması gerekir; aksi takdirde sayfa eksik veya bozuk render edilir.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Sayfa bileşeninin ana giriş noktasıdır ve gizlilik politikası sayfasının render edilmesini sağlar. Next.js App Router yapısında `[lang]` parametreli bir rota altında konumlanmış olan bu fonksiyon, dil destekli bir legal sayfanın erişim noktasını temsil eder.

**Nasıl yapar**: Fonksiyon, herhangi bir iş mantığı veya veri işleme gerçekleştirmez.doğrudan `PageComponent` adlı bileşeni döndürerek sunum katmanının sorumluluğunu ilgili bileşene devreder. Bu basit bir wrapper (sarıcı) bileşen modelidir ve sayfa yapısının ayrı tutulmasını sağlar.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz

**Dönüş**: `JSX.Element` — `PageComponent` bileşeninin render ettiği React JSX yapısını döndürür. Bu bileşen, gizlilik politikası sayfasının içeriğini ve düzenini kullanıcıya sunar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `C:\Users\alize\venthub-hvac\src\app\[lang]\legal\gizlilik-politikasi\page.tsx`::Page
- **params**: (parametre yok)
- **ic_degiskenler**:
  - (ic_degisken yok)
- **Dönüş**: `<PageComponent />` JSX ifadesi (React bileşeni)

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\gizlilik-politikasi\page.tsx
  function: src\app\[lang]\legal\gizlilik-politikasi\page.tsx::Page

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