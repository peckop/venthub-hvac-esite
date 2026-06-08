---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\__tests__\pdfGeneratorFallback.test.ts
skeleton_hash: e20b2defe8361434
entity_hashes:
  overview: 637a7320dc445949
generated_at: 2026-06-08T10:09:33Z
---

## Genel Bakış
Bu dosya, `pdfGenerator` modülündeki `generateProductDatasheet` fonksiyonunun "fallback" (yedek) mekanizmasını test etmek için yazılmış bir Vitest birim test dosyasıdır. Ana PDF oluşturma yöntemi başarısız olduğunda modülün alternatif bir yola geçiş yapıp yapmadığını doğrular. Testler, PDF oluşturulma sürecindeki temel fonksiyonları taklit ederek modülün dayanıklılığını ve hata yönetimi davranışını doğrulamak için tasarlanmıştır.

## Test Altyapısı ve Mock Fonksiyonları
Bu test dosyası, test edilen asıl PDF generator modülünün dış bağımlılıklarını (jsPDF ve pdfmake kütüphaneleri) simüle eden mock fonksiyonlar tanımlar. Her mock, belirli bir PDF çizim veya yapılandırma işlemini taklit ederek testlerin izole çalışmasını sağlar.

- **Font ve Metin İşlemleri Mock'ları**: PDF belgesine yazı tipi eklemeyi ve metinleri yerleştirmeyi simüle eden `mockAddFont`, `mockSetFont`, `mockSetFontSize` ve `mockText` fonksiyonları.
- **Metin Hizalama ve Boyutlandırma Mock'ları**: Metinlerin PDF sayfasına sığdırılması için gerekli olan `mockSplitTextToSize` fonksiyonu.
- **Dosya İşlemleri ve Kaydetme Mock'ları**: Oluşturulan PDF dosyasının sanal dosya sistemine (VFS) eklenmesini ve son olarak kaydedilmesini simüle eden `mockAddFileToVFS` ve `mockSave` fonksiyonları.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir **test dosyası** olup gerçek fonksiyon imzası içermemektedir. Mevcut modül sabitleri yalnızca test altyapısına ait mock fonksiyonlardır (mockSetFont, mockText, mockSave vb.). Bu mock'lar test amaçlı taklitlerdir ve gerçek modülün mimari gereksinimlerini doğrudan yansıtmaz.

**Gerçek pdfGenerator modülünün fonksiyon gövdesi sağlandığında** aksiyomlar üretilebilecektir.

Şu an için belirlenebilecek tek dolaylı aksiyom:

**[Aksiyom 1]:** Eğer fallback mekanizması devreye giriyorsa, jsPDF veya pdfmake gibi bir PDF kütüphanesinin başarısız olması durumunda alternatif bir yol sunulması gerekir; aksi takdirde PDF oluşturma süreci tamamen başarısız olur.

> **Not:** Bu aksiyom, eski dokümanın genel bakış bölümünden türetilmiştir ancak bu dosyanın test amaçlı yapısı nedeniyle doğrulanabilir fonksiyonel bir aksiyom olarak kesin değildir. Gerçek module ait fonksiyon imzaları ve gövde kodu sağlandığında kapsamlı mimari varsayımlar üretilebilir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **mockSetFont** (call) — `vi.fn()`
- **mockSetFontSize** (call) — `vi.fn()`
- **mockText** (call) — `vi.fn()`
- **mockSave** (call) — `vi.fn()`
- **mockAddFileToVFS** (call) — `vi.fn()`
- **mockAddFont** (call) — `vi.fn()`
- **mockSplitTextToSize** (call) — `vi.fn().mockImplementation((text: string) => [text])`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/__tests__/pdfGeneratorFallback.test.ts::(jsPDF mock factory)
- **params**: ()
- **ic_degiskenler**:
  (iç değişken yok — doğrudan nesne literal return eder)
- **Dönüş**: `{ jsPDF: class }` — jsPDF sınıfının mock'unu içeren nesne. `internal.pageSize.getWidth/getHeight` fonksiyonları 210 ve 297 değerlerini döner. Tüm çizim/metin metodları (`setFont`, `setFontSize`, `text`, `save`, `addFileToVFS`, `addFont`, `splitTextToSize`) ilgili `mock*` sabitlerine bağlanır. Diğer metodlar (`rect`, `roundedRect`, `setTextColor`, `setDrawColor`, `line`, `addImage`, `addPage`, `setPage`, `setFillColor`) boş `vi.fn()` mock'larıdır.

---

## NODE ID STANDARD

  file: src\lib\__tests__\pdfGeneratorFallback.test.ts