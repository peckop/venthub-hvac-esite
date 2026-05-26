---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\RichTextRenderer.tsx
skeleton_hash: 542bfec2554f9519
generated_at: 2026-05-23T22:26:52Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürünler bölümünde kullanılan, ürün sayfalarındaki zengin metin içeriklerinin görüntülenmesini sağlayan bir React bileşeni barındırır. Sadece dışarıdan aktarılan içerik verisini işleyerek tutarlı bir şekilde ekrana yansıtmak üzere tasarlanmış, ürün sayfalarında metin gösterimini standartlaştıran basit bir yapıya sahiptir.

## Fonksiyon Grupları
### Ana Zengin Metin Render Bileşeni
Modülün tüm sorumluluğunu üstlenen tek ve ana bileşendir, dışarıdan alınan zengin metin içeriğini React arayüzünde uygun şekilde görüntülemekle görevli. Ürün sayfalarındaki tüm zengin metin gösterim ihtiyaçlarını tek merkezden karşılar.
- RichTextRenderer

---

## AXIOMS – Mimari Varsayımlar
React tabanlı bu zengin metin renderlayıcı bileşen, yalnızca üst bileşen tarafından iletilen `content` parametresi ile çalışır, doğru çalışması için bu içeriğin geçerli olması ve bileşenin çalışacağı React çalışma zamanı ortamının mevcut olması zorunludur.

[Aksiyom 1]: Eğer üst bileşen tarafından `content` prop'u iletilmezse, bileşen herhangi bir görünür içerik renderlayamaz, boş bir kapsayıcı döndürür.
[Aksiyom 2]: Eğer `content` parametresi işlenebilir metin/zengin metin formatında değilse, render işlemi başarısız olur veya ham, işlenmemiş içerik kullanıcıya sunulur.
[Aksiyom 3]: Eğer bileşen için gerekli React çalışma zamanı ortamı mevcut değilse, bileşen hiç başlatılamaz, uygulama genelinde çalışma zamanı hatası tetiklenir.
[Aksiyom 4]: Eğer `content` parametresi güvenilmez bir kaynaktan gelip kötü niyetli yürütülebilir kod içeriyorsa, kullanıcı tarafında XSS (Sitenarası Komut Dosyası Çalıştırma) güvenlik riski oluşur.

---

## FONKSIYON DETAYLARI

### RichTextRenderer
**Ne yapar**: VentHub HVAC platformunun ürün modülünde kullanılan, zengin metin içeriklerini React tabanlı arayüzde güvenli ve tutarlı bir şekilde ekrana sunan bir React bileşenidir. Backend veya içerik yönetim sisteminden gelen HTML formatlı metin içeriklerini standart hale getirerek tüm ürün sayfalarında aynı görsel ve işlevsel yapıda sunulmasını garanti eder.
**Nasıl yapar**: Girdi olarak aldığı içerik değerini öncelikle XSS gibi yaygın web güvenlik açıklarına karşı sanitize eder, ardından içeriği React tarafından desteklenen geçerli JSX yapısına dönüştürerek sayfa DOM'ına ekler. Ürün sayfaları başta olmak üzere platformun ihtiyaç duyduğu tüm noktalarda tekrar kullanılabilir şekilde tasarlanmış olup, farklı kullanım senaryolarında zengin metin sunumunda tutarsızlıkları ortadan kaldırır.
**Parametreler**:
- name: content, type: string — RichTextRendererProps tipi altında tanımlanan, render edilecek ham HTML formatlı zengin metin içeriği. Genellikle platformun backend sisteminden veya içerik yönetim sisteminden alınan metin verisini taşır.
**Dönüş**: React.ReactElement — Tüm güvenlik kontrollerinden geçirilmiş, işlenmiş zengin metin içeriğini içeren, doğrudan sayfa içinde görüntülenmeye hazır bir React elemanı döndürür.

---

## INTERFACES

### RichTextRendererProps
- `content: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\RichTextRenderer.tsx::RichTextRenderer
- **params**: {content} — işlenecek ham zengin metin içeriği
- **ic_degiskenler**:
  - `sections` — content değişkenini çift yeni satır `/\n\n+/` regex'i ile bölerek oluşturulan metin bölümleri dizisi
  - `section` — sections dizisi üzerinden map döngüsünde işlenen her bir metin bölümü
  - `idx` — sections.map döngüsündeki mevcut bölümün benzersiz index'i (JSX anahtarı olarak kullanılır)
- **Dönüş**: React JSX elementi (işlenmiş zengin metin arayüzü) veya null (content boş olduğunda)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\RichTextRenderer.tsx::sections_map_callback
- **params**: section, idx — sections döngüsündeki mevcut metin bölümü ve benzersiz index'i
- **ic_degiskenler**:
  - `parts` — normal paragraf içindeki kalın metinleri ayırmak için bölümün `/(\*\*.*?\*\*)/g` regex'i ile bölünmüş parçalar dizisi
  - `items` — liste içeriğini satırlara ayırmak için bölümün `/\n\* |\n- /` regex'i ile bölünmüş liste elemanı adayı dizisi
  - `items[0]` — items dizisinin ilk elemanı, listenin başında liste dışı ilk satır metni olup olmadığını kontrol etmek için kullanılır
  - `firstLine` — listenin başında yer alan liste dışı açıklama metni, boş string ise liste direkt başlar
  - `listItems` — items dizisinden ilk satır çıkarıldıktan sonra kalan gerçek liste elemanlarını içeren dizi
- **Dönüş**: Mevcut bölümün türüne göre `<h4>`, `<p>` veya liste içeren `<div>` sarmalında React JSX elementi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\RichTextRenderer.tsx::parts_map_callback
- **params**: part, pIdx — parts döngüsündeki mevcut metin parçası ve benzersiz index'i
- **ic_degiskenler**: (yok)
- **Dönüş**: Parça kalın metin işaretleriyle sarmalanmışsa `<strong>` JSX elementi, değilse ham metin string'i

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\RichTextRenderer.tsx::listItems_map_callback
- **params**: item, i — listItems döngüsündeki mevcut liste elemanı ve benzersiz index'i
- **ic_degiskenler**:
  - `cleanItem` — liste elemanının başındaki * veya - liste işaretlerini temizlenmiş ham içerik metni
  - `itemParts` — liste elemanı içindeki kalın metinleri ayırmak için cleanItem'ın `/(\*\*.*?\*\*)/g` regex'i ile bölünmüş parçalar dizisi
- **Dönüş**: Check ikonuyla sarmalanmış liste elemanı içeren `<li>` JSX elementi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\RichTextRenderer.tsx::itemParts_map_callback
- **params**: part, partIdx — itemParts döngüsündeki mevcut metin parçası ve benzersiz index'i
- **ic_degiskenler**: (yok)
- **Dönüş**: Parça kalın metin işaretleriyle sarmalanmışsa `<strong>` JSX elementi, değilse ham metin string'i

---

## NODE ID STANDARD

  file: src\components\products\RichTextRenderer.tsx
  function: src\components\products\RichTextRenderer.tsx::RichTextRenderer

---

## DISA AKTARILANLAR (EXPORTS)
  export: RichTextRenderer

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-lg`, `text-steel-gray`, `text-success-green`
- **Layout:** `flex`, `flex-shrink-0`, `items-start`
- **Responsive:** (yok)
